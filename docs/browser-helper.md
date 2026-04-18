# Browser Helper

A reusable local browser CLI for autonomous browsing, screenshots, extraction, debugging, workflow replay, crawling, monitoring, and artifact capture when richer browser attachment is unavailable.

## What it can do now

### Core browsing
- opens real pages with Playwright + Chromium
- follows redirects and waits for load
- extracts final URL, title, headings, links, and cleaned text excerpt
- supports retry and soft-fail behavior for unattended runs

### Scripted actions
- click
- type
- press
- select
- hover
- scroll
- wait for selector
- goto
- wait for timeout
- inline action assertions

### Natural selector resolution
Actions and assertions can target elements by:
- CSS selector
- text
- role + accessible name
- label
- placeholder

### Workflow recipes
- run reusable JSON recipes with `--recipe`
- run inline JSON step arrays with `--steps`
- parameterize recipes with `--vars`
- substitute `{{VAR_NAME}}` from `--vars` or environment values

### Better extraction
- summary mode
- selector-focused extraction
- tables
- lists
- visible section chunks
- DOM element map
- markdown, text, or JSON output

### Stateful sessions and auth helpers
- save and reuse storage state with `--session`
- auto-persist per-domain session state with `--persist-session`
- keep a Chromium profile with `--user-data-dir`
- import cookies with `--cookies-in`
- export cookies with `--cookies-out`

### Action safety model
- `assist` mode allows browsing plus low-risk drafting and form work
- `guarded` mode blocks side-effecting actions
- `autonomous` mode allows normal action flows but still blocks high-risk commits unless explicitly confirmed
- `high-trust` mode supports high-risk actions only on trusted domains from `--allow-domains`
- `--confirm-high-risk` is required for clearly irreversible or commit-style actions
- actions can now declare explicit `intent` values like `navigate`, `draft`, `upload`, `submit`, `delete`, `auth-change`, or `purchase`

### Dynamic-page settling
- `--settle-mode load|idle|mutation` controls how the helper waits for SPA updates
- `--settle-timeout <ms>` bounds those waits
- each action receipt records the settle result after the step

### File workflow support
- `upload` steps can set files on file inputs
- `--downloads-dir <path>` stores captured downloads with their suggested filenames

### Action receipts
- each performed action now returns timing, final URL, title, settle result, and any saved download path

### Diagnostics and replay
- console capture
- page errors
- network capture
- HAR export
- Playwright trace export
- optional video directory
- JS evaluation

### Artifact bundles
- save screenshot
- save HTML
- save text
- save selector extraction
- save console log
- save network log
- save metadata JSON
- apply redaction to persisted text artifacts and logs

### Diff mode
- compare two URLs
- compare two prior metadata JSON files
- detect changed titles, headings, links, excerpts, section text, and DOM map entries
- optional screenshot hash comparison for practical visual diff detection

### Crawl and monitor helpers
- lightweight crawl mode for same-origin link discovery
- monitor-friendly soft-fail behavior
- profile defaults for `inspect`, `debug`, `capture`, `monitor`, and `qa`

## Usage

### Basic inspect

```bash
npm run browser -- https://dashboardoc.com/
```

### Save a full artifact bundle

```bash
npm run browser -- https://dashboardoc.com/ --profile qa --bundle-dir tmp/dashboardoc-bundle
```

### Capture one page area

```bash
npm run browser -- https://dashboardoc.com/ \
  --selector "main" \
  --extract selector \
  --selector-out tmp/main.json \
  --screenshot tmp/main.png
```

### Use natural selectors in a scripted flow

```bash
npm run browser -- http://127.0.0.1:4173 \
  --steps '[
    {"type":"click","role":"button","name":"Open"},
    {"type":"type","label":"Search","value":"Office Live"},
    {"type":"press","placeholder":"Search","key":"Enter"}
  ]'
```

### Run a recipe file with variables

```json
{
  "url": "{{TARGET_URL}}",
  "steps": [
    { "type": "waitForSelector", "selector": "body" },
    { "type": "click", "text": "Launch" },
    { "type": "waitForTimeout", "ms": 500 }
  ],
  "assertions": [
    { "type": "urlIncludes", "value": "dashboard" }
  ]
}
```

```bash
npm run browser -- https://example.com \
  --recipe tmp/recipe.json \
  --vars '{"TARGET_URL":"http://127.0.0.1:4173"}' \
  --bundle-dir tmp/recipe-run
```

### Save and reuse session state

```bash
npm run browser -- https://example.com/login --session tmp/session.json --capture-console
npm run browser -- https://example.com/app --session tmp/session.json --bundle-dir tmp/app-state
```

### Auto-persist per-domain sessions

```bash
npm run browser -- https://example.com/login --persist-session --capture-console
npm run browser -- https://example.com/app --persist-session --bundle-dir tmp/app-state
```

### Policy-gated browser actions

```bash
npm run browser -- https://example.com/app \
  --policy assist \
  --settle-mode mutation \
  --steps '[
    {"type":"type","intent":"draft","label":"Title","value":"Draft reply"},
    {"type":"click","intent":"draft","text":"Save draft"}
  ]'
```

```bash
npm run browser -- https://example.com/settings \
  --policy high-trust \
  --allow-domains example.com \
  --confirm-high-risk \
  --steps '[
    {"type":"click","intent":"delete","text":"Delete project"}
  ]'
```

```bash
npm run browser -- https://example.com/upload \
  --downloads-dir tmp/browser-downloads \
  --steps '[
    {"type":"upload","intent":"upload","label":"Attachment","file":"tmp/report.pdf"}
  ]'
```

### Import/export cookies

```bash
npm run browser -- https://example.com --cookies-in tmp/cookies.json --cookies-out tmp/cookies-out.json
```

### Capture trace, HAR, and video

```bash
npm run browser -- http://127.0.0.1:4173 \
  --profile debug \
  --trace tmp/run.trace.zip \
  --har tmp/run.har \
  --video-dir tmp/videos \
  --bundle-dir tmp/debug-run
```

### Assert expected state

```bash
npm run browser -- http://127.0.0.1:4173 \
  --recipe tmp/assertion-recipe.json \
  --retries 2
```

### Extract tables, lists, sections, or DOM map

```bash
npm run browser -- https://example.com/report --extract tables --format markdown
npm run browser -- https://example.com/menu --extract lists --format json
npm run browser -- https://example.com/app --extract dom --format json
```

### Crawl a site lightly

```bash
npm run browser -- https://docs.openclaw.ai --crawl '{"limit":8,"sameOrigin":true}' --format json
```

### Compare two runs

```bash
npm run browser -- --diff tmp/run-a/metadata.json tmp/run-b/metadata.json
npm run browser -- --diff https://dashboardoc.com/ https://docs.openclaw.ai --format json
```

### Soft-fail monitor usage

```bash
npm run browser -- https://dashboardoc.com/ --profile monitor --soft-fail --out tmp/monitor.json
```

## Notes

- This is now a shared workflow browser CLI, not just a fetcher.
- The redaction layer protects persisted artifacts better, but you should still treat bundles as sensitive when authenticated sessions are involved.
- The screenshot diff is intentionally practical right now: it reports binary change rather than full pixel heatmaps.
- For complex authenticated apps, recipes plus `--session` or `--persist-session`, `--cookies-in`, and `--trace` are the best combination.
- Prefer explicit `intent` on action steps when the workflow matters. It makes policy decisions more reliable than guessing from button text.
- The safety model is intentionally "draft freely, commit carefully" rather than hard read-only.
