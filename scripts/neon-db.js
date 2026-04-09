import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

const DATABASE_URL = process.env.DATABASE_URL || '';
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export function isNeonEnabled() {
  return Boolean(sql);
}

export async function dbQuery(strings, ...values) {
  if (!sql) throw new Error('DATABASE_URL орнатылмаған');
  return sql(strings, ...values);
}

export async function initNeonSchema() {
  if (!sql) throw new Error('DATABASE_URL орнатылмаған');
  await sql`
    CREATE TABLE IF NOT EXISTS tg_incidents (
      id BIGSERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      user_id TEXT,
      status TEXT NOT NULL,
      score INT NOT NULL,
      findings TEXT[] NOT NULL DEFAULT '{}',
      text_preview TEXT,
      action_taken TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_tg_incidents_chat_created ON tg_incidents (chat_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tg_incidents_status ON tg_incidents (status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS tg_chat_config (
      chat_id TEXT PRIMARY KEY,
      moderation BOOLEAN NOT NULL DEFAULT true,
      mode TEXT NOT NULL DEFAULT 'strict',
      action TEXT NOT NULL DEFAULT 'delete_explain',
      mute_minutes INT NOT NULL DEFAULT 30,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tg_user_strikes (
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      strikes INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (chat_id, user_id)
    )
  `;
}

export async function insertIncident({
  chatId,
  userId,
  status,
  score,
  findings,
  textPreview,
  actionTaken,
}) {
  if (!sql) return null;
  const rows = await sql`
    INSERT INTO tg_incidents (chat_id, user_id, status, score, findings, text_preview, action_taken)
    VALUES (${String(chatId)}, ${userId ? String(userId) : null}, ${status}, ${score}, ${findings || []}, ${textPreview || null}, ${actionTaken || null})
    RETURNING id, created_at
  `;
  return rows[0] || null;
}

export async function getRecentIncidents(chatId, limit = 10) {
  if (!sql) return [];
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  return sql`
    SELECT id, chat_id, user_id, status, score, findings, text_preview, action_taken, created_at
    FROM tg_incidents
    WHERE chat_id = ${String(chatId)}
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `;
}

export async function getChatStats(chatId) {
  if (!sql) return null;
  const rows = await sql`
    SELECT
      COUNT(*)::INT AS moderated,
      COUNT(*) FILTER (WHERE status = 'blocked')::INT AS blocked,
      COUNT(*) FILTER (WHERE status = 'suspicious')::INT AS suspicious,
      COUNT(*) FILTER (WHERE action_taken LIKE 'delete%')::INT AS deleted,
      COUNT(*) FILTER (WHERE action_taken = 'mute')::INT AS muted
    FROM tg_incidents
    WHERE chat_id = ${String(chatId)}
  `;
  return rows[0] || { moderated: 0, blocked: 0, suspicious: 0, deleted: 0, muted: 0 };
}

export async function getChatConfig(chatId) {
  if (!sql) return null;
  const rows = await sql`
    SELECT chat_id, moderation, mode, action, mute_minutes
    FROM tg_chat_config
    WHERE chat_id = ${String(chatId)}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function upsertChatConfig(chatId, patch) {
  if (!sql) return null;
  const curr = (await getChatConfig(chatId)) || {
    moderation: true,
    mode: 'strict',
    action: 'delete_explain',
    mute_minutes: 30,
  };
  const next = {
    moderation: typeof patch.moderation === 'boolean' ? patch.moderation : curr.moderation,
    mode: patch.mode || curr.mode,
    action: patch.action || curr.action,
    mute_minutes: Number.isFinite(patch.mute_minutes) ? patch.mute_minutes : curr.mute_minutes,
  };

  const rows = await sql`
    INSERT INTO tg_chat_config (chat_id, moderation, mode, action, mute_minutes, updated_at)
    VALUES (${String(chatId)}, ${next.moderation}, ${next.mode}, ${next.action}, ${next.mute_minutes}, NOW())
    ON CONFLICT (chat_id) DO UPDATE SET
      moderation = EXCLUDED.moderation,
      mode = EXCLUDED.mode,
      action = EXCLUDED.action,
      mute_minutes = EXCLUDED.mute_minutes,
      updated_at = NOW()
    RETURNING chat_id, moderation, mode, action, mute_minutes
  `;
  return rows[0] || null;
}

export async function incrementStrike(chatId, userId) {
  if (!sql) return 0;
  const rows = await sql`
    INSERT INTO tg_user_strikes (chat_id, user_id, strikes, updated_at)
    VALUES (${String(chatId)}, ${String(userId)}, 1, NOW())
    ON CONFLICT (chat_id, user_id) DO UPDATE SET
      strikes = tg_user_strikes.strikes + 1,
      updated_at = NOW()
    RETURNING strikes
  `;
  return rows[0]?.strikes || 0;
}
