# RankVista — frontend

React 19 + Vite + Tailwind CSS v4 dashboard for the RankVista SEO audit API.
This is the `frontend/` of the SEO-Checker repo (the product's display name is
RankVista; the repo keeps its name).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
```

## Configure

The API base URL comes from `VITE_API_URL` (set in `.env` or in the Vercel
project settings). Without it, the app falls back to the production backend:

```
VITE_API_URL=https://seo-checker-2p81.onrender.com
```

## What it does

- **Dashboard** — real stats from your audit + keyword history, score trend
  chart, quick audit, recent audits.
- **SEO Audit** — audit any public URL: weighted 0–100 score across 8
  categories, every check with a fix, search + social previews, shareable
  report link, print / save-as-PDF.
- **Keywords** — keyword *idea* generator (brainstormed patterns grouped by
  intent — not search-volume data).
- **History** — past audits with search, sort, trend chart, re-audit, share,
  delete.
- **Report** — public share view at `/report/:id` (no login needed).
- **Assistant** — rule-based SEO helper (no LLM): explains scores and checks.

Guest login works without an account: the login page has a prominent
"Continue as Guest" button.

## Notes

- No fake data anywhere: every number on the dashboard comes from the API;
  empty states show when there is no history yet.
- The score is a RankVista model score, not a Google score — the UI says so.
- `package-lock.json` is intentionally left as it is upstream; Vercel resolves
  fresh on each deploy.
