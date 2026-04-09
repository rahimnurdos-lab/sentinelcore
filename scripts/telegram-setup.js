import fs from 'node:fs';
import path from 'node:path';

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

const token = process.env.TELEGRAM_BOT_TOKEN;
const botTitle = process.env.BOT_TITLE || 'Sentinel Cyber Bot';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN жоқ. .env ішіне токен қойыңыз.');
  process.exit(1);
}

const base = `https://api.telegram.org/bot${token}`;

async function api(method, payload = {}) {
  const res = await fetch(`${base}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(`${method} failed: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const commands = [
    { command: 'start', description: 'Ботты бастау' },
    { command: 'help', description: 'Командалар тізімі' },
    { command: 'status', description: 'Жүйе күйі' },
    { command: 'tip', description: 'Киберқауіпсіздік кеңесі' },
    { command: 'scan', description: 'Телефон тексеруді ашу' },
    { command: 'check', description: 'Мәтін/сілтемені тексеру' },
    { command: 'report', description: 'Күдікті жағдайды хабарлау' },
    { command: 'appeal', description: 'Өшірілген хабарламаға шағым' },
    { command: 'guard_on', description: 'Топ модерациясын қосу (admin)' },
    { command: 'guard_off', description: 'Топ модерациясын өшіру (admin)' },
    { command: 'mode', description: 'strict/balanced/lenient (admin)' },
    { command: 'action', description: 'warn/delete/mute (admin)' },
    { command: 'mute_minutes', description: 'Mute уақыты (admin)' },
    { command: 'whitelist_add', description: 'Whitelist домен қосу (admin)' },
    { command: 'whitelist_remove', description: 'Whitelist домен өшіру (admin)' },
    { command: 'whitelist_list', description: 'Whitelist тізімі' },
    { command: 'allow_user', description: 'User allowlist (admin)' },
    { command: 'deny_user', description: 'User allowlist-тен өшіру (admin)' },
    { command: 'settings', description: 'Топ guard баптауы' },
    { command: 'stats', description: 'Топ статистикасы' },
    { command: 'recent', description: 'Соңғы инциденттер' },
  ];

  await api('setMyCommands', { commands });
  await api('setMyDescription', {
    description: `${botTitle} — сайттағыдай қауіп талдау жасайды, топта күдікті/заңсыз хабарламаны өшіріп себебін түсіндіреді.`,
  });
  await api('setMyShortDescription', {
    short_description: 'Киберқауіпсіздік көмекшісі',
  });

  const me = await api('getMe');
  console.log(`Telegram setup дайын: @${me.result.username}`);
}

main().catch((err) => {
  console.error('[telegram-setup] қате:', err.message);
  process.exit(1);
});
