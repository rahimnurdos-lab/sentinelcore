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
const baseUrl = process.env.VERCEL_PUBLIC_URL || process.env.SENTINEL_APP_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || '';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN жоқ');
  process.exit(1);
}
if (!baseUrl || !/^https:\/\//.test(baseUrl)) {
  console.error('VERCEL_PUBLIC_URL немесе SENTINEL_APP_URL https://... болу керек');
  process.exit(1);
}

const webhookUrl = `${baseUrl.replace(/\/+$/, '')}/api/telegram-webhook`;

const resp = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: secret || undefined,
    drop_pending_updates: true,
    allowed_updates: ['message', 'edited_message'],
  }),
});

const json = await resp.json();
if (!resp.ok || !json.ok) {
  console.error('setWebhook қате:', json);
  process.exit(1);
}

console.log('Webhook орнатылды:', webhookUrl);
