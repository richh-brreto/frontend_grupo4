# AGENTS.md — frontend_grupo4

## Quickstart

- **Start dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview build:** `npm run preview`

## Project structure

- **App:** `src/App.jsx` — auth-gated routing with React Router v7
- **API:** `axios` configured at `src/App.jsx:15-16` with `baseURL: "http://localhost:8080"` and `withCredentials: true`
- **Auth flow:** Unauthenticated users see `<Card />` at `src/components/login/card-form/Card.jsx`; authenticated users get protected routes
- **Routes:** Public `/aulas`; protected `/`, `/dashboard`, `/dashboard2`, `/contratos`, `/alunos`, `/turmas`, `/professores`, `/overview`
- **Proxy:** Vite dev server proxies `/api` to `http://localhost:8080` (`vite.config.js:7-13`)

## Commands that must be run in order

```bash
npm run lint    # before typecheck/test if anything changes
npm run build   # verify build succeeds
```

## Notes

- No TypeScript in this repo — all `.jsx`; `@types/react` is a dev dep for editor support only
- `src/index.css` uses a global reset + font stack; do not remove the `* { margin: 0; padding: 0; box-sizing: border-box; }` rule without checking dependent components
- Axios `default.baseURL` and `withCredentials` are set at module level (`src/App.jsx:15-16`); changing them in individual requests may not take effect
- Vite HMR is active by default via `npm run dev`
- `db.json` is present at root — likely used by a local JSON Server; no server script defined in `package.json`, so start manually if needed