import {
  getChatConfig,
  getChatStats,
  getRecentIncidents,
  incrementStrike,
  initNeonSchema,
  insertIncident,
  upsertChatConfig,
} from '../scripts/neon-db.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.SENTINEL_APP_URL || 'https://example.com';
const BOT_TITLE = process.env.BOT_TITLE || 'Sentinel Cyber Bot';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const DEFAULT_MODE = (process.env.TELEGRAM_DEFAULT_MODE || 'strict').toLowerCase();
const DEFAULT_ACTION = (process.env.TELEGRAM_DEFAULT_ACTION || 'delete_explain').toLowerCase();
const DEFAULT_MUTE_MINUTES = Number(process.env.TELEGRAM_MUTE_MINUTES || 30);

let schemaReady = false;

function tgApi(method, payload = {}) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(`${method}: ${JSON.stringify(json)}`);
    return json;
  });
}

async function sendMessage(chatId, text) {
  return tgApi('sendMessage', { chat_id: chatId, text });
}

function isGroup(chat) {
  return chat?.type === 'group' || chat?.type === 'supergroup';
}

function commandName(text) {
  const first = (text || '').trim().split(/\s+/)[0].toLowerCase();
  if (!first.startsWith('/')) return '';
  return first.replace(/@[\w_]+$/, '');
}

function parseArgs(text) {
  return (text || '').replace(/^\S+/, '').trim();
}

function getDirectAdvice(input) {
  const lower = (input || '').toLowerCase();
  if (lower.includes('пороль') || lower.includes('пароль') || lower.includes('құпиясөз') || lower.includes('password')) {
    return 'Мықты пароль: кемі 12-16 таңба, бас/кіші әріп, сан, символ. Бір парольді бірнеше сайтта қолданбаңыз және 2FA қосыңыз.';
  }
  if (lower.includes('фишинг') || lower.includes('phishing')) {
    return 'Фишингтен қорғану: доменді тексеріңіз, шұғыл ақша/код сұраса сенбеңіз, сілтемені ашпай тұрып тексеріңіз.';
  }
  if (lower.includes('вирус') || lower.includes('malware') || lower.includes('троян')) {
    return 'Вирус қаупі болса: файлды ашпаңыз, ресми антивируспен скан жасаңыз, жүйені жаңартыңыз.';
  }
  return 'Мен киберқауіпсіздік бойынша көмектесемін. Мысалы: "пороль қалай мықты жасаймын?", "фишингті қалай танимын?" деп жазыңыз.';
}

function extractUrls(text) {
  return (text || '').match(/\bhttps?:\/\/[^\s<>"']+/gi) || [];
}

function modeThreshold(mode) {
  if (mode === 'strict') return { suspicious: 20, blocked: 45 };
  if (mode === 'lenient') return { suspicious: 35, blocked: 70 };
  return { suspicious: 28, blocked: 60 };
}

function analyzeText(text, mode) {
  const lower = (text || '').toLowerCase();
  const findings = [];
  let score = 0;
  const urls = extractUrls(text);

  for (const url of urls) {
    const u = url.toLowerCase();
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
  }

  if (/urgent|immediately|verify now|account suspended|срочно|немедленно|шұғыл|бұғатталды/.test(lower)) {
    findings.push('Шұғылдыққа итермелеу анықталды');
    score += 20;
  }

  if (/otp|one-time code|sms код|cvv|картаның арты|enter your password|confirm your credentials/.test(lower)) {
    findings.push('Құпия дерек сұрау үлгісі анықталды');
    score += 30;
  }

  if (/\.exe|\.vbs|\.bat|\.sh|\.ps1|\.scr|\.apk|\.msi/.test(lower)) {
    findings.push('Орындалатын файл тарату белгісі бар');
    score += 30;
  }

  if (/carding|cc fullz|cvv dump|есірткі сату|қару сату|fake id|обнал|crypto scam/.test(lower)) {
    findings.push('Заңсыз қызмет белгісі байқалды');
    score += 50;
  }

  const threshold = modeThreshold(mode);
  const status = score >= threshold.blocked ? 'blocked' : score >= threshold.suspicious ? 'suspicious' : 'safe';
  return { status, score: Math.min(100, score), findings: findings.length ? findings : ['Қауіпті паттерн табылмады'] };
}

async function isAdmin(chatId, userId) {
  try {
    const r = await tgApi('getChatMember', { chat_id: chatId, user_id: userId });
    return ['administrator', 'creator'].includes(r.result?.status);
  } catch {
    return false;
  }
}

function formatRecent(items) {
  if (!items?.length) return 'Соңғы инциденттер жоқ.';
  const lines = items.slice(0, 10).map((x) => `#${x.id} ${x.status.toUpperCase()} ${x.score}% ${String(x.created_at).slice(0, 19).replace('T', ' ')}`);
  return `Соңғы инциденттер:\n${lines.join('\n')}`;
}

async function ensureChatConfig(chatId) {
  const cfg = await getChatConfig(chatId);
  if (cfg) return cfg;
  return upsertChatConfig(chatId, {
    moderation: true,
    mode: ['strict', 'balanced', 'lenient'].includes(DEFAULT_MODE) ? DEFAULT_MODE : 'strict',
    action: ['warn', 'delete', 'delete_explain', 'mute'].includes(DEFAULT_ACTION) ? DEFAULT_ACTION : 'delete_explain',
    mute_minutes: Number.isFinite(DEFAULT_MUTE_MINUTES) ? DEFAULT_MUTE_MINUTES : 30,
  });
}

async function handleCommand(message, cfg) {
  const chatId = message.chat.id;
  const cmd = commandName(message.text || '');
  const args = parseArgs(message.text || '');

  if (cmd === '/start') return sendMessage(chatId, `${BOT_TITLE} іске қосылды. /help жазыңыз.`);
  if (cmd === '/help') {
    return sendMessage(chatId, '/status /check /scan /stats /recent /guard_on /guard_off /mode /action /mute_minutes');
  }
  if (cmd === '/status') {
    return sendMessage(chatId, `Guard: ${cfg.moderation ? 'ON' : 'OFF'}\nMode: ${cfg.mode}\nAction: ${cfg.action}\nStorage: Neon`);
  }
  if (cmd === '/scan') return sendMessage(chatId, `Телефон тексеруді ашу: ${APP_URL}`);
  if (cmd === '/check') {
    if (!args) return sendMessage(chatId, 'Пайдалану: /check <мәтін немесе URL>');
    const a = analyzeText(args, cfg.mode);
    return sendMessage(chatId, `Нәтиже: ${a.status.toUpperCase()} (${a.score}%)\n${a.findings.slice(0, 3).join('\n')}`);
  }
  if (cmd === '/stats') {
    const s = await getChatStats(chatId);
    return sendMessage(chatId, `Moderated: ${s?.moderated || 0}\nBlocked: ${s?.blocked || 0}\nDeleted: ${s?.deleted || 0}\nMuted: ${s?.muted || 0}`);
  }
  if (cmd === '/recent') {
    const r = await getRecentIncidents(chatId, 10);
    return sendMessage(chatId, formatRecent(r));
  }

  if (['/guard_on', '/guard_off', '/mode', '/action', '/mute_minutes'].includes(cmd)) {
    if (!isGroup(message.chat)) return sendMessage(chatId, 'Бұл команда тек топта.');
    const admin = await isAdmin(chatId, message.from?.id);
    if (!admin) return sendMessage(chatId, 'Тек админ орындай алады.');

    if (cmd === '/guard_on') {
      await upsertChatConfig(chatId, { moderation: true });
      return sendMessage(chatId, 'Guard: ON');
    }
    if (cmd === '/guard_off') {
      await upsertChatConfig(chatId, { moderation: false });
      return sendMessage(chatId, 'Guard: OFF');
    }
    if (cmd === '/mode') {
      if (!['strict', 'balanced', 'lenient'].includes(args)) return sendMessage(chatId, 'Пайдалану: /mode <strict|balanced|lenient>');
      await upsertChatConfig(chatId, { mode: args });
      return sendMessage(chatId, `Mode: ${args.toUpperCase()}`);
    }
    if (cmd === '/action') {
      if (!['warn', 'delete', 'delete_explain', 'mute'].includes(args)) return sendMessage(chatId, 'Пайдалану: /action <warn|delete|delete_explain|mute>');
      await upsertChatConfig(chatId, { action: args });
      return sendMessage(chatId, `Action: ${args.toUpperCase()}`);
    }
    if (cmd === '/mute_minutes') {
      const m = Number(args);
      if (!Number.isFinite(m) || m < 1 || m > 1440) return sendMessage(chatId, 'Пайдалану: /mute_minutes <1..1440>');
      await upsertChatConfig(chatId, { mute_minutes: Math.floor(m) });
      return sendMessage(chatId, `Mute: ${Math.floor(m)} минут`);
    }
  }

  if (cmd) return sendMessage(chatId, 'Белгісіз команда. /help');
}

async function moderateMessage(message, cfg) {
  if (!isGroup(message.chat) || !cfg.moderation) return;
  if (message.from?.is_bot) return;
  const text = [message.text, message.caption, message.document?.file_name, message.video?.file_name].filter(Boolean).join('\n').slice(0, 4000);
  if (!text || text.startsWith('/')) return;

  const a = analyzeText(text, cfg.mode);
  if (a.status === 'safe') return;

  let actionTaken = 'none';
  if (a.status === 'blocked') {
    if (cfg.action === 'warn') {
      actionTaken = 'warn';
      await sendMessage(message.chat.id, `Ескерту (${message.from?.first_name || 'user'}): ${a.findings.slice(0, 2).join('; ')}`);
    } else {
      try {
        await tgApi('deleteMessage', { chat_id: message.chat.id, message_id: message.message_id });
        actionTaken = cfg.action === 'delete_explain' ? 'delete_explain' : 'delete';
      } catch {
        actionTaken = 'delete_failed';
      }

      if (cfg.action === 'delete_explain') {
        await sendMessage(message.chat.id, `Хабарлама өшірілді. Себеп: ${a.findings.slice(0, 2).join('; ')}`);
      }

      if (cfg.action === 'mute' && message.from?.id) {
        const until = Math.floor(Date.now() / 1000) + Number(cfg.mute_minutes || 30) * 60;
        await tgApi('restrictChatMember', {
          chat_id: message.chat.id,
          user_id: message.from.id,
          permissions: { can_send_messages: false },
          until_date: until,
        }).catch(() => {});
        actionTaken = 'mute';
      } else if (message.from?.id) {
        const strikes = await incrementStrike(message.chat.id, message.from.id);
        if (strikes >= 3) {
          const until = Math.floor(Date.now() / 1000) + Number(cfg.mute_minutes || 30) * 60;
          await tgApi('restrictChatMember', {
            chat_id: message.chat.id,
            user_id: message.from.id,
            permissions: { can_send_messages: false },
            until_date: until,
          }).catch(() => {});
          actionTaken = 'mute';
        }
      }
    }
  }

  await insertIncident({
    chatId: message.chat.id,
    userId: message.from?.id ? String(message.from.id) : null,
    status: a.status,
    score: a.score,
    findings: a.findings.slice(0, 4),
    textPreview: text.slice(0, 180),
    actionTaken,
  });
}

export default async function handler(req, res) {
  if (!BOT_TOKEN) return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing' });
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (WEBHOOK_SECRET) {
    const got = req.headers['x-telegram-bot-api-secret-token'];
    if (got !== WEBHOOK_SECRET) return res.status(401).json({ ok: false });
  }

  try {
    if (!schemaReady) {
      await initNeonSchema();
      schemaReady = true;
    }

    const update = req.body || {};
    const message = update.message || update.edited_message;
    if (!message) return res.status(200).json({ ok: true });

    const cfg = await ensureChatConfig(message.chat.id);
    const text = (message.text || '').trim();
    if (text.startsWith('/')) {
      await handleCommand(message, cfg);
    } else if (!isGroup(message.chat)) {
      await sendMessage(message.chat.id, getDirectAdvice(text));
    } else {
      await moderateMessage(message, cfg);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error.message });
  }
}
