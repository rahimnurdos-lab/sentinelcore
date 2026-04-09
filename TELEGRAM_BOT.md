# Telegram Bot (Advanced)

## 1) Setup

1. `.env.example` файлын `.env` деп көшіріңіз.
2. `TELEGRAM_BOT_TOKEN` мәнін `@BotFather` берген токенге ауыстырыңыз.
3. `VITE_TELEGRAM_BOT_URL` мен `SENTINEL_APP_URL` толтырыңыз.

## 2) Run

```bash
npm run bot:db:init
npm run bot:setup
npm run bot:start
```

## 3) User Commands

- `/start`
- `/help`
- `/status`
- `/tip`
- `/scan`
- `/check <мәтін немесе URL>`
- `/report`
- `/appeal <incident_id> <себеп>`

## 4) Admin Commands (Group)

- `/guard_on`
- `/guard_off`
- `/mode <strict|balanced|lenient>`
- `/action <warn|delete|delete_explain|mute>`
- `/mute_minutes <1..1440>`
- `/whitelist_add <domain>`
- `/whitelist_remove <domain>`
- `/whitelist_list`
- `/allow_user <user_id>` (немесе қолданушы хабарламасына reply)
- `/deny_user <user_id>` (немесе reply)
- `/settings`
- `/stats`
- `/recent`

## 5) Group Requirements

Ботты топқа қосыңыз, admin жасаңыз, мына рұқсаттарды беріңіз:

- Delete messages
- Restrict members (mute режимі үшін)

## 6) Moderation Logic

- Сайттағы URL/email-like эвристикаға жақын талдау
- `safe / suspicious / blocked` нәтижесі
- `blocked` кезінде action-ға сай әрекет:
  - `warn`
  - `delete`
  - `delete_explain`
  - `mute`
- 3 strike асса автоматты mute қолданылады
- Incident журнал жүргізіледі (соңғы N жазба)

## 7) ENV Options

```env
DATABASE_URL=postgresql://USER:PASSWORD@YOUR-NEON-HOST/DBNAME?sslmode=require
TELEGRAM_GROUP_MODERATION_DEFAULT=true
TELEGRAM_DEFAULT_MODE=balanced
TELEGRAM_DEFAULT_ACTION=delete_explain
TELEGRAM_MUTE_MINUTES=15
TELEGRAM_MAX_RECENT_INCIDENTS=50
```

## 8) Neon Storage

- `DATABASE_URL` берілсе, бот инциденттерді Neon-ға жазады (`tg_incidents`).
- `/stats` және `/recent` командалары алдымен Neon деректерін көрсетеді.
- `DATABASE_URL` жоқ болса, бот local JSON fallback режимінде жұмыс істейді.

## 9) Production Hardening

- Anti-spam rate limit:
  - `TELEGRAM_COMMAND_WINDOW_MS`
  - `TELEGRAM_COMMAND_LIMIT`
  - `TELEGRAM_MOD_WINDOW_MS`
  - `TELEGRAM_MOD_LIMIT`
- Message size guard: `TELEGRAM_MAX_ANALYSIS_CHARS`
- Optional admin alert chat: `TELEGRAM_ADMIN_ALERT_CHAT_ID`
- `.env` файлын ешқашан git-ке қоспаңыз, токенді периодтық rotate жасаңыз.
