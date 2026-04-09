import fs from 'node:fs';
import path from 'node:path';
import { getChatStats, getRecentIncidents, initNeonSchema, insertIncident, isNeonEnabled } from './neon-db.js';

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

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.SENTINEL_APP_URL || 'https://example.com';
const BOT_TITLE = process.env.BOT_TITLE || 'Sentinel Cyber Bot';
const MODERATION_DEFAULT = (process.env.TELEGRAM_GROUP_MODERATION_DEFAULT || 'true') === 'true';
const DEFAULT_MODE = (process.env.TELEGRAM_DEFAULT_MODE || 'balanced').toLowerCase();
const DEFAULT_ACTION = (process.env.TELEGRAM_DEFAULT_ACTION || 'delete_explain').toLowerCase();
const MUTE_MINUTES = Number(process.env.TELEGRAM_MUTE_MINUTES || 15);
const MAX_RECENT_INCIDENTS = Number(process.env.TELEGRAM_MAX_RECENT_INCIDENTS || 50);
const allowedChatIds = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN табылмады. .env ішінде токенді орнатыңыз.');
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const STATE_PATH = path.join(process.cwd(), 'scripts', '.telegram-state.json');
const LEGACY_STATE_PATH = path.join(process.cwd(), 'scripts', '.telegram-state-legacy.json');

let offset = 0;
let isRunning = true;
let botUsername = '';

/**
 * @typedef {'strict'|'balanced'|'lenient'} GuardMode
 * @typedef {'warn'|'delete'|'delete_explain'|'mute'} GuardAction
 */

const DEFAULT_CONFIG = Object.freeze({
  moderation: MODERATION_DEFAULT,
  mode: ['strict', 'balanced', 'lenient'].includes(DEFAULT_MODE) ? DEFAULT_MODE : 'balanced',
  action: ['warn', 'delete', 'delete_explain', 'mute'].includes(DEFAULT_ACTION) ? DEFAULT_ACTION : 'delete_explain',
  muteMinutes: Number.isFinite(MUTE_MINUTES) && MUTE_MINUTES > 0 ? MUTE_MINUTES : 15,
});

const state = loadState();
const pendingAppeals = new Map();
const lastNoticeAtByChat = new Map();
const NEON_ENABLED = isNeonEnabled();

const tips = [
  'Күдікті сілтемені ашпас бұрын доменді тексеріңіз.',
  '2FA қосыңыз және SMS орнына authenticator қолданған дұрыс.',
  'APK орнатқанда тек ресми дүкеннен жүктеңіз.',
  'Бір парольді бірнеше сервисте қайталамаңыз.',
  'Бейтаныс файлды ашпас бұрын сканерден өткізіңіз.',
];

function emptyState() {
  return {
    version: 2,
    global: {
      incidentsSeq: 0,
      totalModerated: 0,
      totalDeleted: 0,
      totalMuted: 0,
    },
    chats: {},
  };
}

function migrateLegacy(raw) {
  const migrated = emptyState();
  if (!raw || typeof raw !== 'object') return migrated;
  for (const [chatId, value] of Object.entries(raw)) {
    migrated.chats[chatId] = {
      config: { ...DEFAULT_CONFIG, moderation: value === 'on' },
      whitelistDomains: [],
      allowUsers: [],
      strikes: {},
      stats: { moderated: 0, deleted: 0, muted: 0, suspiciousSeen: 0 },
      recentIncidents: [],
      pendingAppeals: [],
    };
  }
  return migrated;
}

function loadState() {
  try {
    if (!fs.existsSync(STATE_PATH)) {
      if (fs.existsSync(path.join(process.cwd(), 'scripts', '.telegram-state.json'))) {
        const raw = fs.readFileSync(path.join(process.cwd(), 'scripts', '.telegram-state.json'), 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.version === 2) return parsed;
        const migrated = migrateLegacy(parsed);
        fs.renameSync(path.join(process.cwd(), 'scripts', '.telegram-state.json'), LEGACY_STATE_PATH);
        fs.writeFileSync(STATE_PATH, JSON.stringify(migrated, null, 2), 'utf8');
        return migrated;
      }
      return emptyState();
    }
    const parsed = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    if (parsed?.version === 2) return parsed;
    const migrated = migrateLegacy(parsed);
    fs.writeFileSync(STATE_PATH, JSON.stringify(migrated, null, 2), 'utf8');
    return migrated;
  } catch {
    return emptyState();
  }
}

function saveState() {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function getChatState(chatId) {
  const key = String(chatId);
  if (!state.chats[key]) {
    state.chats[key] = {
      config: { ...DEFAULT_CONFIG },
      whitelistDomains: [],
      allowUsers: [],
      strikes: {},
      stats: { moderated: 0, deleted: 0, muted: 0, suspiciousSeen: 0 },
      recentIncidents: [],
      pendingAppeals: [],
    };
  }
  return state.chats[key];
}

function isAllowedChat(chatId) {
  if (allowedChatIds.length === 0) return true;
  return allowedChatIds.includes(String(chatId));
}

function isGroup(chat) {
  return chat?.type === 'group' || chat?.type === 'supergroup';
}

function nowIso() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

async function api(method, payload = {}) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (!json.ok) throw new Error(`${method} failed: ${JSON.stringify(json)}`);
  return json;
}

async function sendMessage(chatId, text, extra = {}) {
  return api('sendMessage', {
    chat_id: chatId,
    text,
    ...extra,
  });
}

async function deleteMessage(chatId, messageId) {
  return api('deleteMessage', {
    chat_id: chatId,
    message_id: messageId,
  });
}

async function restrictUser(chatId, userId, untilUnix) {
  return api('restrictChatMember', {
    chat_id: chatId,
    user_id: userId,
    permissions: {
      can_send_messages: false,
      can_send_audios: false,
      can_send_documents: false,
      can_send_photos: false,
      can_send_videos: false,
      can_send_video_notes: false,
      can_send_voice_notes: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_manage_topics: false,
    },
    until_date: untilUnix,
  });
}

async function isAdmin(chatId, userId) {
  try {
    const r = await api('getChatMember', { chat_id: chatId, user_id: userId });
    return ['administrator', 'creator'].includes(r.result?.status);
  } catch {
    return false;
  }
}

function extractUrls(text) {
  return text.match(/\bhttps?:\/\/[^\s<>"']+/gi) || [];
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function modeThreshold(mode) {
  if (mode === 'strict') return { suspicious: 20, blocked: 45 };
  if (mode === 'lenient') return { suspicious: 35, blocked: 70 };
  return { suspicious: 28, blocked: 60 };
}

function analyzeWithSiteHeuristics(rawText, chatState) {
  const text = rawText || '';
  const lower = text.toLowerCase();
  const findings = [];
  let score = 0;
  const whitelist = new Set((chatState?.whitelistDomains || []).map((x) => x.toLowerCase()));

  const urls = extractUrls(text);
  for (const url of urls) {
    const u = url.toLowerCase();
    const domain = extractDomain(url);
    if (domain && whitelist.has(domain)) continue;

    if (/\.(xyz|tk|ml|ga|cf|gq|pw|top|click|download|win|loan)\b/.test(u)) {
      findings.push(`Күдікті домен аймағы: ${url}`);
      score += 35;
    }
    if (/login|verify|secure|update|confirm|alert|suspend|wallet|payment/.test(u) && !/kaspi|egov|gov\.kz|halyk|sberbank/.test(u)) {
      findings.push(`Фишинг кілт сөзі бар URL: ${url}`);
      score += 30;
    }
    if (/\d{1,3}(\.\d{1,3}){3}/.test(u)) {
      findings.push(`IP-мекенжаймен берілген сілтеме: ${url}`);
      score += 25;
    }
    if (/bit\.ly|tinyurl|t\.co|cutt\.ly|goo\.gl/.test(u)) {
      findings.push(`Қысқартылған сілтеме байқалды: ${url}`);
      score += 16;
    }
  }

  if (/urgent|immediately|verify now|account suspended|срочно|немедленно|шұғыл|бұғатталды/.test(lower)) {
    findings.push('Шұғылдыққа итермелеу (social engineering) анықталды');
    score += 20;
  }

  if (/enter your password|confirm your credentials|otp|one-time code|кодты жібер|sms код|cvv|картаның арты/.test(lower)) {
    findings.push('Құпия дерек/код сұрау үлгісі анықталды');
    score += 30;
  }

  if (/\.exe|\.vbs|\.bat|\.sh|\.ps1|\.scr|\.apk|\.msi/.test(lower)) {
    findings.push('Орындалатын файл тарату белгісі бар');
    score += 30;
  }

  const illegalPatterns = [
    /куплю\s*базу|database dump|leak(ed)? database|combo list/i,
    /carding|cc fullz|cvv dump|дамп карт/i,
    /drugs?\s*for sale|есірткі сату|закладка|наркотик/i,
    /оружие\s*продам|қару сату|weapon for sale/i,
    /фейк\s*документ|fake id|поддельн(ый|ые)\s*документ/i,
    /скам схема|обнал|cashout|crypto scam|пирамида/i,
  ];
  for (const pattern of illegalPatterns) {
    if (pattern.test(lower)) {
      findings.push('Заңсыз тауар/қызмет немесе қылмыстық белсенділік белгісі байқалды');
      score += 50;
      break;
    }
  }

  const thresholds = modeThreshold(chatState.config.mode);
  const status = score >= thresholds.blocked ? 'blocked' : score >= thresholds.suspicious ? 'suspicious' : 'safe';
  if (findings.length === 0) findings.push('Қауіпті паттерн табылмады');
  return { status, score: Math.min(100, score), findings };
}

function commandName(text) {
  const first = (text || '').trim().split(/\s+/)[0].toLowerCase();
  if (!first.startsWith('/')) return '';
  if (!botUsername) return first;
  return first.replace(`@${botUsername.toLowerCase()}`, '');
}

function parseArgs(text) {
  return text.replace(/^\S+/, '').trim();
}

function formatAnalysis(a) {
  const emoji = a.status === 'blocked' ? '⛔' : a.status === 'suspicious' ? '⚠️' : '✅';
  const label = a.status === 'blocked' ? 'BLOCKED' : a.status === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';
  const reasons = a.findings.slice(0, 4).map((x, i) => `${i + 1}. ${x}`).join('\n');
  return `${emoji} Нәтиже: ${label}\nRisk: ${a.score}%\n${reasons}`;
}

function modeLabel(mode) {
  if (mode === 'strict') return 'STRICT';
  if (mode === 'lenient') return 'LENIENT';
  return 'BALANCED';
}

function buildHelpText() {
  return [
    `${BOT_TITLE}`,
    '',
    'Негізгі командалар:',
    '/start, /help, /status, /tip, /scan',
    '/check <мәтін/URL> - сайттағыдай тәуекел талдау',
    '/report - күдікті оқиға үлгісі',
    '/appeal <incident_id> <себеп> - аппеляция',
    '',
    'Group Admin командалары:',
    '/guard_on, /guard_off',
    '/mode <strict|balanced|lenient>',
    '/action <warn|delete|delete_explain|mute>',
    '/mute_minutes <минут>',
    '/whitelist_add <domain>',
    '/whitelist_remove <domain>',
    '/whitelist_list',
    '/allow_user <user_id> (немесе reply)',
    '/deny_user <user_id> (немесе reply)',
    '/settings',
    '/stats',
    '/recent',
  ].join('\n');
}

function pushIncident(chatState, incident) {
  chatState.recentIncidents.unshift(incident);
  if (chatState.recentIncidents.length > MAX_RECENT_INCIDENTS) {
    chatState.recentIncidents.length = MAX_RECENT_INCIDENTS;
  }
}

function incStrike(chatState, userId) {
  const key = String(userId);
  chatState.strikes[key] = (chatState.strikes[key] || 0) + 1;
  return chatState.strikes[key];
}

function shouldNotice(chatId) {
  const now = Date.now();
  const prev = lastNoticeAtByChat.get(String(chatId)) || 0;
  if (now - prev < 3500) return false;
  lastNoticeAtByChat.set(String(chatId), now);
  return true;
}

async function ensureGroupAdmin(message) {
  if (!isGroup(message.chat)) return { ok: false, reason: 'Бұл команда тек топта қолданылады.' };
  const ok = await isAdmin(message.chat.id, message.from?.id);
  if (!ok) return { ok: false, reason: 'Бұл команданы тек топ админы орындай алады.' };
  return { ok: true };
}

function parseUserIdFromMessage(message, args) {
  if (message.reply_to_message?.from?.id) return message.reply_to_message.from.id;
  const parsed = Number(args.trim());
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return null;
}

async function handleCommand(message) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const cmd = commandName(text);
  const args = parseArgs(text);
  const chatState = getChatState(chatId);
  const now = nowIso();

  if (!isAllowedChat(chatId)) {
    await sendMessage(chatId, 'Бұл ботқа қолжетімділік шектелген.');
    return;
  }

  if (cmd === '/start') {
    await sendMessage(
      chatId,
      [
        `Сәлем! Бұл ${BOT_TITLE}.`,
        'Сайттағыдай контент тәуекелін тексереді және топта авто-модерация жасайды.',
        'Көмек: /help',
      ].join('\n')
    );
    return;
  }

  if (cmd === '/help') {
    await sendMessage(chatId, buildHelpText());
    return;
  }

  if (cmd === '/status') {
    const mode = isGroup(message.chat) ? (chatState.config.moderation ? 'ON' : 'OFF') : 'DM';
    await sendMessage(
      chatId,
      `Жүйе: белсенді\nУақыт: ${now}\nGuard: ${mode}\nMode: ${modeLabel(chatState.config.mode)}\nAction: ${chatState.config.action}\nStorage: ${NEON_ENABLED ? 'Neon' : 'Local'}`
    );
    return;
  }

  if (cmd === '/tip') {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    await sendMessage(chatId, `Киберкеңес:\n${tip}`);
    return;
  }

  if (cmd === '/scan') {
    await sendMessage(chatId, `Телефон тексеруді ашу: ${APP_URL}`);
    return;
  }

  if (cmd === '/check') {
    if (!args) {
      await sendMessage(chatId, 'Пайдалану: /check <мәтін немесе URL>');
      return;
    }
    const analysis = analyzeWithSiteHeuristics(args, chatState);
    await sendMessage(chatId, formatAnalysis(analysis));
    return;
  }

  if (cmd === '/report') {
    await sendMessage(
      chatId,
      [
        'Күдікті оқиға форматы:',
        '1) Қай арна (Email/SMS/Telegram)',
        '2) Не сұралды (пароль, код, төлем)',
        '3) Қай сілтеме немесе файл',
      ].join('\n')
    );
    return;
  }

  if (cmd === '/appeal') {
    const parts = args.split(/\s+/);
    const incidentId = Number(parts[0]);
    const reason = parts.slice(1).join(' ').trim();
    if (!Number.isFinite(incidentId) || !reason) {
      await sendMessage(chatId, 'Пайдалану: /appeal <incident_id> <себеп>');
      return;
    }
    const target = pendingAppeals.get(incidentId);
    if (!target) {
      await sendMessage(chatId, 'Бұл incident_id табылмады немесе мерзімі өткен.');
      return;
    }
    if (target.userId !== message.from?.id) {
      await sendMessage(chatId, 'Тек сол incident иесі ғана appeal жібере алады.');
      return;
    }
    await sendMessage(
      target.chatId,
      `Appeal келді #${incidentId} (${message.from?.first_name || 'user'}): ${reason}`
    );
    pendingAppeals.delete(incidentId);
    await sendMessage(chatId, 'Appeal жіберілді. Админ қарайды.');
    return;
  }

  if (cmd === '/guard_on' || cmd === '/guard_off') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    chatState.config.moderation = cmd === '/guard_on';
    saveState();
    await sendMessage(chatId, `Топ модерациясы: ${chatState.config.moderation ? 'ON' : 'OFF'}`);
    return;
  }

  if (cmd === '/mode') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const next = args.toLowerCase();
    if (!['strict', 'balanced', 'lenient'].includes(next)) {
      await sendMessage(chatId, 'Пайдалану: /mode <strict|balanced|lenient>');
      return;
    }
    chatState.config.mode = next;
    saveState();
    await sendMessage(chatId, `Guard mode: ${modeLabel(next)}`);
    return;
  }

  if (cmd === '/action') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const next = args.toLowerCase();
    if (!['warn', 'delete', 'delete_explain', 'mute'].includes(next)) {
      await sendMessage(chatId, 'Пайдалану: /action <warn|delete|delete_explain|mute>');
      return;
    }
    chatState.config.action = next;
    saveState();
    await sendMessage(chatId, `Guard action: ${next.toUpperCase()}`);
    return;
  }

  if (cmd === '/mute_minutes') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const minutes = Number(args);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
      await sendMessage(chatId, 'Пайдалану: /mute_minutes <1..1440>');
      return;
    }
    chatState.config.muteMinutes = Math.floor(minutes);
    saveState();
    await sendMessage(chatId, `Mute уақыты: ${chatState.config.muteMinutes} минут`);
    return;
  }

  if (cmd === '/whitelist_add') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const domain = args.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      await sendMessage(chatId, 'Пайдалану: /whitelist_add <domain>');
      return;
    }
    if (!chatState.whitelistDomains.includes(domain)) chatState.whitelistDomains.push(domain);
    saveState();
    await sendMessage(chatId, `Whitelist-ке қосылды: ${domain}`);
    return;
  }

  if (cmd === '/whitelist_remove') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const domain = args.toLowerCase().trim();
    chatState.whitelistDomains = chatState.whitelistDomains.filter((d) => d !== domain);
    saveState();
    await sendMessage(chatId, `Whitelist-тен алынды: ${domain}`);
    return;
  }

  if (cmd === '/whitelist_list') {
    const list = chatState.whitelistDomains;
    await sendMessage(chatId, list.length ? `Whitelist домендер:\n- ${list.join('\n- ')}` : 'Whitelist бос.');
    return;
  }

  if (cmd === '/allow_user' || cmd === '/deny_user') {
    const guard = await ensureGroupAdmin(message);
    if (!guard.ok) {
      await sendMessage(chatId, guard.reason);
      return;
    }
    const userId = parseUserIdFromMessage(message, args);
    if (!userId) {
      await sendMessage(chatId, `Пайдалану: ${cmd} <user_id> (немесе reply)`);
      return;
    }
    const idStr = String(userId);
    if (cmd === '/allow_user') {
      if (!chatState.allowUsers.includes(idStr)) chatState.allowUsers.push(idStr);
      saveState();
      await sendMessage(chatId, `Allowlist user қосылды: ${idStr}`);
    } else {
      chatState.allowUsers = chatState.allowUsers.filter((x) => x !== idStr);
      saveState();
      await sendMessage(chatId, `Allowlist user алынды: ${idStr}`);
    }
    return;
  }

  if (cmd === '/settings') {
    await sendMessage(
      chatId,
      [
        `Guard: ${chatState.config.moderation ? 'ON' : 'OFF'}`,
        `Mode: ${modeLabel(chatState.config.mode)}`,
        `Action: ${chatState.config.action.toUpperCase()}`,
        `Mute: ${chatState.config.muteMinutes} min`,
        `Whitelist domains: ${chatState.whitelistDomains.length}`,
        `Allow users: ${chatState.allowUsers.length}`,
      ].join('\n')
    );
    return;
  }

  if (cmd === '/stats') {
    const s = chatState.stats;
    const dbStats = NEON_ENABLED ? await getChatStats(chatId) : null;
    await sendMessage(
      chatId,
      [
        `Chat Stats`,
        `Moderated: ${dbStats?.moderated ?? s.moderated}`,
        `Deleted: ${dbStats?.deleted ?? s.deleted}`,
        `Muted: ${dbStats?.muted ?? s.muted}`,
        `Suspicious seen: ${dbStats?.suspicious ?? s.suspiciousSeen}`,
        `Blocked: ${dbStats?.blocked ?? 'n/a'}`,
        `Global moderated: ${state.global.totalModerated}`,
      ].join('\n')
    );
    return;
  }

  if (cmd === '/recent') {
    const dbRecent = NEON_ENABLED ? await getRecentIncidents(chatId, 10) : [];
    const recent = dbRecent.length > 0
      ? dbRecent.map((row) => ({
          id: row.id,
          status: row.status,
          score: row.score,
          at: String(row.created_at).slice(0, 19).replace('T', ' '),
          userId: row.user_id || '-',
        }))
      : chatState.recentIncidents.slice(0, 10);
    if (recent.length === 0) {
      await sendMessage(chatId, 'Соңғы инциденттер жоқ.');
      return;
    }
    const lines = recent.map((x) => `#${x.id} ${x.status.toUpperCase()} ${x.score}% ${x.at} (${x.userId})`);
    await sendMessage(chatId, `Соңғы инциденттер:\n${lines.join('\n')}`);
    return;
  }

  if (cmd) {
    await sendMessage(chatId, 'Команда танылмады. /help жазыңыз.');
  }
}

function extractMessageText(message) {
  const parts = [];
  if (message.text) parts.push(message.text);
  if (message.caption) parts.push(message.caption);
  if (message.document?.file_name) parts.push(message.document.file_name);
  if (message.video?.file_name) parts.push(message.video.file_name);
  return parts.join('\n').trim();
}

async function applyGuardAction(message, analysis, chatState) {
  const chatId = message.chat.id;
  const userId = String(message.from?.id || '');
  const displayName = message.from?.first_name || 'Қолданушы';

  chatState.stats.moderated += 1;
  state.global.totalModerated += 1;

  state.global.incidentsSeq += 1;
  const incidentId = state.global.incidentsSeq;
  const incident = {
    id: incidentId,
    at: nowIso(),
    userId,
    status: analysis.status,
    score: analysis.score,
    findings: analysis.findings.slice(0, 4),
    textPreview: extractMessageText(message).slice(0, 180),
  };
  pushIncident(chatState, incident);

  if (analysis.status === 'suspicious') {
    chatState.stats.suspiciousSeen += 1;
  }

  const action = chatState.config.action;
  const explain = `Себеп: ${analysis.findings.slice(0, 2).join('; ')}`;
  let actionTaken = 'none';

  if (analysis.status !== 'blocked') {
    saveState();
    return;
  }

  if (action === 'warn') {
    actionTaken = 'warn';
    if (shouldNotice(chatId)) {
      await sendMessage(chatId, `Ескерту (${displayName}): ${explain}`);
    }
    await insertIncident({
      chatId,
      userId,
      status: analysis.status,
      score: analysis.score,
      findings: analysis.findings.slice(0, 4),
      textPreview: extractMessageText(message).slice(0, 180),
      actionTaken,
    });
    saveState();
    return;
  }

  if (action === 'delete' || action === 'delete_explain' || action === 'mute') {
    try {
      await deleteMessage(chatId, message.message_id);
      chatState.stats.deleted += 1;
      state.global.totalDeleted += 1;
      actionTaken = 'delete';
    } catch (error) {
      if (shouldNotice(chatId)) {
        await sendMessage(chatId, 'Қауіпті хабар анықталды, бірақ өшіру мүмкін болмады. Delete permission беріңіз.');
      }
      saveState();
      return;
    }
  }

  const strikes = incStrike(chatState, userId);
  const autoMute = action === 'mute' || strikes >= 3;

  if (autoMute && message.from?.id) {
    try {
      const until = Math.floor(Date.now() / 1000) + chatState.config.muteMinutes * 60;
      await restrictUser(chatId, message.from.id, until);
      chatState.stats.muted += 1;
      state.global.totalMuted += 1;
      actionTaken = 'mute';
      if (shouldNotice(chatId)) {
        await sendMessage(chatId, `Пайдаланушы уақытша mute (${chatState.config.muteMinutes} мин): ${displayName}. ${explain}`);
      }
    } catch (error) {
      if (shouldNotice(chatId)) {
        await sendMessage(chatId, `Хабарлама өшірілді (${displayName}), бірақ mute қолданылмады. Admin құқықтарын тексеріңіз.`);
      }
    }
  } else if (action === 'delete_explain' && shouldNotice(chatId)) {
    actionTaken = 'delete_explain';
    await sendMessage(chatId, `Хабарлама өшірілді (${displayName}). ${explain}. Appeal: /appeal ${incidentId} <себеп>`);
  }

  pendingAppeals.set(incidentId, {
    chatId,
    userId: message.from?.id,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });

  await insertIncident({
    chatId,
    userId,
    status: analysis.status,
    score: analysis.score,
    findings: analysis.findings.slice(0, 4),
    textPreview: extractMessageText(message).slice(0, 180),
    actionTaken,
  });

  saveState();
}

function cleanupAppeals() {
  const now = Date.now();
  for (const [id, val] of pendingAppeals.entries()) {
    if (val.expiresAt <= now) pendingAppeals.delete(id);
  }
}

async function moderateMessage(message) {
  if (!message || !isGroup(message.chat)) return;
  if (message.from?.is_bot) return;
  if (!isAllowedChat(message.chat.id)) return;

  const chatState = getChatState(message.chat.id);
  if (!chatState.config.moderation) return;
  if (chatState.allowUsers.includes(String(message.from?.id || ''))) return;

  const text = extractMessageText(message);
  if (!text) return;
  if ((message.text || '').trim().startsWith('/')) return;

  const analysis = analyzeWithSiteHeuristics(text, chatState);
  if (analysis.status === 'safe') return;

  await applyGuardAction(message, analysis, chatState);
}

async function processUpdate(update) {
  const message = update.message || update.edited_message;
  if (!message) return;

  const text = (message.text || '').trim();
  if (text.startsWith('/')) {
    await handleCommand(message);
    return;
  }
  await moderateMessage(message);
}

async function poll() {
  while (isRunning) {
    try {
      cleanupAppeals();
      const result = await api('getUpdates', {
        timeout: 30,
        offset,
        allowed_updates: ['message', 'edited_message'],
      });
      for (const update of result.result || []) {
        offset = update.update_id + 1;
        await processUpdate(update);
      }
    } catch (error) {
      console.error('[telegram-bot] polling error:', error.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

process.on('SIGINT', () => {
  isRunning = false;
  console.log('\nTelegram bot тоқтатылды (SIGINT).');
});

process.on('SIGTERM', () => {
  isRunning = false;
  console.log('\nTelegram bot тоқтатылды (SIGTERM).');
});

const me = await api('getMe');
botUsername = me.result?.username || '';
if (NEON_ENABLED) {
  try {
    await initNeonSchema();
    console.log('Neon storage: connected');
  } catch (error) {
    console.error('[neon] init failed:', error.message);
  }
}
console.log(`${BOT_TITLE} іске қосылды (@${botUsername}). Polling басталды...`);
poll();
