# Command Deck Panel

Internal operator dashboard for OpenClaw and DashboardOC.

## What it does

- renders live local runtime data in a control-room UI
- shows operator warnings instead of fake placeholder telemetry
- includes task tracking, AI logs, session views, system health, and office-live views
- supports local bridge mode for live OpenClaw data

## Core routes

- `/`
- `/office-live`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Auth behavior

`LoginGate` is controlled by Vite env vars:

- `VITE_DASHBOARD_AUTH_MODE=required` keeps auth on
- `VITE_DASHBOARD_AUTH_MODE=off` bypasses auth
- if no password is set, auth is also bypassed

Recommended defaults:

- local dev: `VITE_DASHBOARD_AUTH_MODE=off`
- preview: `off` for trusted internal previews, otherwise `required`
- production: `required`

## Scripts

- `npm run dev` - Vite dev server
- `npm run bridge` - local OpenClaw bridge only
- `npm run dev:live` - bridge + app together
- `npm run browser` - browser helper utilities
- `npm run preflight` - verify branch, repo cleanliness, Vercel linkage, and deploy docs
- `npm run test` - run Vitest
- `npm run build` - production build
- `npm run verify` - run tests then production build

## Deployment

Vercel is already wired for this repo.

Use:

- `dev` for preview / staging
- `main` for production

Full workflow lives in `DEPLOY.md`.

## Repo hygiene

- keep exported env files out of repo root
- keep screenshots under `artifacts/screenshots/`
- keep scratch runtime files under `.run/`, `.local/`, `tmp/`, or `watchdog/`
- do not deploy from a dirty working tree
