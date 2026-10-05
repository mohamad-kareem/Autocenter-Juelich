# Autocenter Jülich – Website

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · MongoDB · mobile.de Seller API

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Environment variables

See `.env.example`. Put the values in `.env.local` locally and in Vercel → Project → Settings → Environment Variables.

### Google reviews (homepage section "Das sagen unsere Kunden")

1. Open <https://console.cloud.google.com/>, create/select a project and set up billing
   (Google gives a free monthly usage quota; the site caches reviews for 12 h, so usage stays tiny).
2. APIs & Services → Library → enable **Places API (New)**.
3. APIs & Services → Credentials → **Create API key**. Restrict it to "Places API (New)".
4. Set `GOOGLE_PLACES_API_KEY=...` (optionally `GOOGLE_PLACE_ID=...`).

Without a key the section still shows the rating (value from `src/lib/site.js`) and a link to Google Maps.
Note: Google returns at most 5 reviews via the API.

### AI chat assistant (bottom-right)

1. Open <https://aistudio.google.com/apikey> and create a free API key.
2. Set `GEMINI_API_KEY=...` (optional `GEMINI_MODEL`, default `gemini-2.5-flash`).

The assistant knows the live mobile.de inventory, opening hours, financing and warranty info
(prompt in `src/app/api/chat/route.js`). Without a key the chat shows a friendly "call us" message.

## Where things live

| What | File |
| --- | --- |
| Business data (phone, address, hours, rating fallback) | `src/lib/site.js` |
| Design tokens (colors, buttons, fields) | `src/app/globals.css` |
| Header / footer / cookie banner | `src/app/(components)/Navbar.jsx`, `Footer.jsx`, `CookieBanner.jsx` |
| Car card used everywhere | `src/app/(components)/CarCard.jsx` |
| Google reviews | `src/lib/googleReviews.js`, `src/app/(components)/GoogleReviews.jsx` |
| AI chat | `src/app/(components)/ChatWidget.jsx`, `src/app/api/chat/route.js` |
| Staff area header | `src/app/(Pages)/dashboard/layout.jsx` |
