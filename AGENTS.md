# AGENTS.md — Doblet Front

## Quick Commands

- `pnpm install` — install deps (uses pnpm; see `.npmrc`)
- `pnpm run dev` — dev server with HMR
- `pnpm run lint` — ESLint on src
- `pnpm run format` — Prettier on all files
- `pnpm run build` — production build via Quasar CLI

No test suite exists (`test` script is a no-op).

## Project Type

Vue 3 + Quasar 2 (Vite-based) SPA with hash-mode routing. All routes live in `src/router/routes.js`. Boot files (`src/boot/`) run at app init — `axios.js` configures the API client, `i18n.js` sets up translations.

## Key Conventions

- **Language**: UI text and comments are in Catalan. Keep new strings in Catalan.
- **Prettier**: no semicolons, single quotes, 100 char width.
- **Editor**: 2-space indent, LF line endings.
- **Imports**: Use `#q-app/wrappers` for Quasar's `defineBoot` / `defineStore`. Import the API client as `import { api } from 'boot/axios'`.
- **Composables**: Shared logic goes in `src/composables/` — `useFetch`, `useCrudDialog`, `useDateFormat`, `useRightDrawer`.
- **Styling**: Global SCSS in `src/css/app.scss`. Use SCSS (not plain CSS).
- **i18n**: Translation files are in `src/i18n/`. Currently only `en-US` locale directory exists.
- **Env vars**: `VITE_API_URL` is set per environment (`.env.development` → localhost:3001, `.env.production` → api.santspatrons.com).

## Routing & Auth

All authenticated routes set `meta: { requiresAuth: true }`. The auth guard is in `src/router/index.js`. The API interceptor in `src/boot/axios.js` handles 401 by clearing the token and redirecting to `/#/login`.

## State Management

Pinia stores live in `src/stores/`. Only a single `example-store.js` exists — create new domain stores alongside it.

## Gotchas

- The `quasar.config.js` runs ESLint via `vite-plugin-checker` in dev — lint errors appear as warnings in the browser overlay.
- `postinstall` runs `quasar prepare` automatically.
- There's no `.quasar/` checked in (it's gitignored). Run `quasar prepare` or `pnpm install` to regenerate.
