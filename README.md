# BookLeaf Author Support Portal — Frontend

React 18 + Vite + React Router. Plain CSS, mobile-first responsive (phone / tablet / desktop). No UI framework.

```bash
cp .env.example .env     # leave VITE_API_URL empty in dev; Vite proxies /api -> http://localhost:5000
npm install
npm run dev              # http://localhost:5173
npm run build            # static output in dist/
```

Author pages: `/books`, `/tickets/new`, `/tickets`, `/tickets/:id`. Admin pages: `/admin`, `/admin/tickets/:id`.
Live updates use one shared Server-Sent Events connection (`src/hooks.js`) with a 45 s polling safety net.
For deployment set `VITE_API_URL=https://<your-api>/api` at build time and add the site URL to the backend `CLIENT_URL`. SPA rewrites are included for Netlify (`_redirects`) and Vercel (`vercel.json`).
