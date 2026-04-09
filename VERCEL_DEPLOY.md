# Vercel Deploy + Auto Update

## 1) Frontend Deploy (Vercel)

1. Репоны GitHub-қа push жасаңыз.
2. Vercel Dashboard -> `Add New Project` -> осы репоны таңдаңыз.
3. Build settings:
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
4. Environment Variables:
- `VITE_TELEGRAM_BOT_URL=https://t.me/sentine1_core_bot`

`main` branch-қа әр push -> Production auto deploy.
Pull Request -> Preview deploy автоматты.

## 2) Domain Қосу

1. Vercel Project -> `Settings` -> `Domains`.
2. Доменді енгізіңіз (мысалы `sentinel.kz`).
3. DNS жазбаларын Vercel бергендей қылыңыз:
- A record: `76.76.21.21` (root domain)
- CNAME: `cname.vercel-dns.com` (`www` үшін)
4. SSL автоматты қосылады.

## 3) Telegram Bot туралы маңызды

`scripts/telegram-bot.js` long-polling режимінде.  
Бұл процесті Vercel-де тұрақты ұстау мүмкін емес (serverless sleep/timeout).

Сондықтан production-да:
- Frontend: Vercel
- Bot Worker: Railway/Render/VPS

## 4) Bot-та frontend URL жаңарту

Bot worker env ішінде:

```env
SENTINEL_APP_URL=https://your-domain.com
```

Сонда `/scan` командасы Vercel доменіне апарады.
