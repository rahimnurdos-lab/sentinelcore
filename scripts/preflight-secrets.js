import fs from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('.env табылмады');
  process.exit(1);
}

const raw = fs.readFileSync(envPath, 'utf8');
const lines = raw.split(/\r?\n/);
const map = Object.fromEntries(
  lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const required = [
  'TELEGRAM_BOT_TOKEN',
  'DATABASE_URL',
  'SENTINEL_APP_URL',
  'VITE_TELEGRAM_BOT_URL',
  'TELEGRAM_WEBHOOK_SECRET',
];

const missing = required.filter((key) => !map[key]);
if (missing.length) {
  console.error(`Missing env keys: ${missing.join(', ')}`);
  process.exit(1);
}

if (/PASTE_YOUR_|your_real_telegram_bot_token/i.test(map.TELEGRAM_BOT_TOKEN)) {
  console.error('TELEGRAM_BOT_TOKEN placeholder күйінде тұр.');
  process.exit(1);
}

if (!/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(map.VITE_TELEGRAM_BOT_URL)) {
  console.error('VITE_TELEGRAM_BOT_URL форматы қате. Мысал: https://t.me/sentine1_core_bot');
  process.exit(1);
}

if (!/^https?:\/\//.test(map.SENTINEL_APP_URL)) {
  console.error('SENTINEL_APP_URL толық URL болу керек.');
  process.exit(1);
}

console.log('Preflight OK: secrets/runtime env толтырылған.');
