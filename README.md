# RankVista — See your site the way search engines do

RankVista audits any public website's on-page SEO: it fetches the page, runs
a set of real checks, and gives you a weighted score plus plain-language fixes.
No signup needed to try it — guest login runs a full audit.

**Live demo:** https://seo-checker-tan.vercel.app
(also https://seo-checker-hydra-hamerins-projects.vercel.app)
**API:** https://seo-checker-2p81.onrender.com

> The repo is still named `SEO-Checker` for continuity; RankVista is the
> product's display name.

## What it does

- **SEO Audit** — paste any public URL. The backend fetches the page and
  checks the things that actually matter: title and meta description, headings,
  images and alt text, links (including a broken-link sample), canonical and
  robots tags, Open Graph / Twitter cards, structured data, HTTPS and security
  headers, viewport and language, robots.txt and sitemap, load time and page
  size. Each check reports pass / warning / critical / note, with a fix.
- **Weighted score (0–100)** — eight categories with explicit weights: Meta &
  Tags 22%, Content 20%, Structure 12%, Crawlability 12%, Links 10%,
  Performance 10%, Security 7%, Mobile 7%. Two honest caps: plain HTTP caps
  the score at 60, and a noindex tag or robots block caps it at 40. The score
  is a RankVista model score, not a Google score — the UI says so.
- **Top fixes** — the five highest-impact recommendations for the page, each
  with the issue and the action.
- **Search + social previews** — a Google-style snippet and an Open Graph card
  built from the page's real tags.
- **History & trends** — past audits with scores, issue counts, a score-trend
  chart, re-audit, share, and delete.
- **Shareable reports** — any saved audit can be shared at a public
  `/report/:id` link; unsharing hides it again.
- **Print / Save PDF** — a print stylesheet turns any report into a clean
  document.
- **Keyword ideas** — brainstorming patterns for a topic (question forms,
  modifiers, long-tail combinations), grouped by intent. These are ideas, not
  search-volume data — the UI labels them honestly.
- **SEO assistant** — a rule-based helper that explains scores and checks from
  a fixed knowledge base. It is not an LLM chat, and the UI says so.
- **Guest login** — the login page has a prominent "Continue as Guest" button;
  guests can run full audits.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Recharts, Motion, Lucide |
| Backend | Node.js, Express 5, MongoDB (Mongoose), axios + cheerio |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## Repo layout

```
backend/            Express API (see backend/README.md if present)
  controllers/      auth, audit, keywords
  models/           User, Report, KeywordSearch
  routes/           /api/auth, /api/audit, /api/keywords, /api/chat
  services/         scraper, seoAnalyzer, recommendations, urlguard
  server.js         app entry: rate limits, /health, route mounts
frontend/           Vite + React app (see frontend/README.md)
  src/pages/        Dashboard, Audit, Keywords, History, Report, Login, Signup
  src/components/   ReportView, ChatAssistant, layout, ui primitives
  src/lib/api.js    axios instance + error helper
  src/context/      AuthContext (token in localStorage, /api/auth/me revalidation)
```

## Run it locally

Prerequisites: Node.js 20+ and a MongoDB connection string (local or Atlas).

**Backend**

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/rankvista
JWT_SECRET=<redacted>
PORT=5000
```

```bash
node server.js   # http://localhost:5000, GET /health for a liveness check
```

**Frontend**

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Point the frontend at your backend with `VITE_API_URL` in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Without it, the app uses the production backend.

## API overview

| Method & path | Auth | What it does |
| --- | --- | --- |
| `POST /api/auth/register` | — | Create an account, returns JWT + user |
| `POST /api/auth/login` | — | Log in, returns JWT + user |
| `POST /api/auth/guest` | — | Guest session, returns JWT + guest user |
| `GET /api/auth/me` | Bearer | Current user |
| `POST /api/audit` | Optional | Audit a URL; returns score, checks, recommendations; saves the report when authed |
| `GET /api/audit/history` | Bearer | Your saved audits |
| `GET /api/audit/report/:id` | — | A shared report (only if the owner shared it) |
| `POST /api/audit/report/:id/share` | Bearer, owner | Toggle public sharing |
| `DELETE /api/audit/report/:id` | Bearer, owner | Delete a report |
| `POST /api/keywords` | Bearer | Keyword ideas for a topic |
| `GET /api/keywords/history` | Bearer | Past keyword searches |
| `POST /api/chat/chat` | — | Rule-based SEO answers |
| `GET /health` | — | `{ ok: true }` liveness check |

Safety notes: audit URLs pass an SSRF guard (public IPs only — localhost and
private ranges are rejected), audit/auth endpoints are rate-limited, and the
audit fetch has a size cap and timeout.

## Deploy notes

- Pushing to `main` auto-deploys the backend on Render.
- The frontend deploys to Vercel from `frontend/` (framework Vite, build
  `npm run build`, output `dist`). `VITE_API_URL` is set in the Vercel project
  settings; the SPA rewrite lives in `frontend/vercel.json`.
- `frontend/package-lock.json` is intentionally left untouched (it predates
  the Vite migration); installers resolve fresh.
