# RankPilot — frontend

React app for the SEO Checker: run a site audit, research keywords, and look
back at past audits. Talks to the Node backend in `../backend`.

## Run it

```bash
npm install
npm start
```

The app runs on http://localhost:3000. By default it expects the backend at
http://localhost:5000. Point it somewhere else with:

```bash
REACT_APP_API_URL=https://your-backend.example.com npm start
```

## Build

```bash
npm run build
```

## Layout

- `src/App.js` — routes, sidebar layout, mobile header
- `src/pages/` — Dashboard, Audit, Keywords, History, Login, Signup
- `src/components/` — ChatBot, ProtectedRoute, AuthLayout
- `src/context/AuthContext.js` — login, signup, guest session, logout
