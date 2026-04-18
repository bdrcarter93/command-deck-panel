# DashboardOC deploy guide

## Branch policy

- `dev` = preview / staging branch
- `main` = production branch
- Deploy from a clean working tree only

## Required env vars

### Production

- `VITE_DASHBOARD_AUTH_MODE=required`
- `VITE_DASHBOARD_USER=<shared operator username>`
- `VITE_DASHBOARD_PASS=<shared operator password>`

### Preview or local verification

Choose one:

1. Bypass auth for trusted preview environments
   - `VITE_DASHBOARD_AUTH_MODE=off`
2. Keep auth on
   - `VITE_DASHBOARD_AUTH_MODE=required`
   - `VITE_DASHBOARD_USER=<preview username>`
   - `VITE_DASHBOARD_PASS=<preview password>`

## Local workflow

```bash
npm install
cp .env.example .env.local
npm run preflight
npm run verify
npm run dev
```

## Preview deploy

```bash
git checkout dev
git pull
git status --short
npm run preflight
npm run verify
git push origin dev
```

## Production deploy

```bash
git checkout main
git pull
git status --short
npm run preflight
npm run verify
git push origin main
```

## Verification checklist

Check both routes after every deploy:

- `/`
- `/office-live`

Expected behavior:

- production should show `LoginGate` unless an active session already exists
- preview can either show `LoginGate` or bypass auth, depending on `VITE_DASHBOARD_AUTH_MODE`
- if auth is enabled, verify shared operator credentials work
- live data panels should render without a blank screen

## Repo hygiene rules

- Keep exported Vercel env files out of repo root
- Keep screenshots and watchdog captures under `artifacts/screenshots/`
- Keep runtime scratch under `.run/`, `.local/`, `tmp/`, or `watchdog/`
- Update `README.md` when workflow or auth behavior changes
