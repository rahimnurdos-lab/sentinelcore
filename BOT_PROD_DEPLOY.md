# Telegram Bot Production Deploy

## 1) Token қауіпсіздігі (міндетті)

1. `@BotFather` ішінде `/revoke` жасаңыз.
2. Жаңа token алыңыз.
3. Ескі token-ді толық тоқтатыңыз.

## 2) Environment Variables

Worker platform-ға мына env-терді қойыңыз:

- `TELEGRAM_BOT_TOKEN`
- `DATABASE_URL`
- `SENTINEL_APP_URL`
- `BOT_TITLE`
- `TELEGRAM_GROUP_MODERATION_DEFAULT=true`
- `TELEGRAM_DEFAULT_MODE=strict`
- `TELEGRAM_DEFAULT_ACTION=delete_explain`
- `TELEGRAM_MUTE_MINUTES=30`
- `TELEGRAM_MAX_RECENT_INCIDENTS=100`
- `TELEGRAM_MAX_ANALYSIS_CHARS=4000`
- `TELEGRAM_COMMAND_WINDOW_MS=10000`
- `TELEGRAM_COMMAND_LIMIT=8`
- `TELEGRAM_MOD_WINDOW_MS=15000`
- `TELEGRAM_MOD_LIMIT=6`
- `TELEGRAM_ADMIN_ALERT_CHAT_ID` (optional)

## 3) Бір реттік DB init

```bash
npm run bot:db:init
```

## 4) Preflight check

```bash
npm run bot:preflight
```

## 5) Deploy options

- Railway: `railway.json` дайын
- Render: `render.yaml` дайын
- VPS/PM2: `ecosystem.config.cjs` дайын

## 6) Post-deploy smoke test

1. `/status`
2. `/stats`
3. Group-та `/guard_on`
4. Фишингке ұқсас тест хабарлама жіберу
5. `/recent` арқылы incident логын көру
