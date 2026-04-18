#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const [, , firstArg, ...rest] = process.argv;

function printUsage() {
  console.error(`Usage:
  node scripts/browser-helper.mjs <url> [options]
  node scripts/browser-helper.mjs --diff <left> <right> [options]

Core options:
  --out <path>               Save rendered output to a file
  --format <type>            json | text | markdown (default: json)
  --profile <name>           inspect | debug | capture | monitor | qa
  --timeout <ms>             Default timeout (default: 15000)
  --retries <n>              Retry count for navigation/actions (default: 0)
  --soft-fail                Return structured error output instead of exiting hard
  --wait-for <css>           Wait for selector before extraction
  --selector <css>           Focus extraction/screenshot on a selector
  --user-agent <ua>          Override browser user agent

Actions and workflows:
  --recipe <path>            Run a JSON workflow recipe
  --steps '<json>'           Inline JSON action array
  --vars '<json>'            Recipe variables, e.g. {"URL":"https://..."}
  --session <path>           Reuse persistent storage state JSON
  --user-data-dir <path>     Reuse a Chromium user data directory
  --policy <mode>            assist | guarded | autonomous | high-trust (default: assist)
  --allow-domains <list>     Comma-separated domains trusted for elevated actions
  --confirm-high-risk        Allow high-risk irreversible actions in this run
  --persist-session          Save session state automatically when not explicitly requested
  --settle-mode <mode>       load | idle | mutation (default: idle)
  --settle-timeout <ms>      Timeout for SPA settle helpers (default: 5000)
  --downloads-dir <path>     Capture browser downloads into a directory

Capture and export:
  --screenshot <path>        Save screenshot
  --full-page                Use full page screenshot when not clipping to selector
  --html-out <path>          Save final HTML
  --text-out <path>          Save cleaned text
  --bundle-dir <path>        Save screenshot/html/text/console/network/metadata bundle
  --extract <mode>           summary | selector | tables | lists | sections | all | dom
  --selector-out <path>      Save selector extraction JSON/text
  --trace <path>             Save Playwright trace zip
  --har <path>               Save HAR file
  --video-dir <path>         Save Playwright video artifacts
  --cookies-in <path>        Import cookies JSON
  --cookies-out <path>       Export cookies JSON
  --crawl <json>             Crawl config JSON, e.g. {"limit":5,"sameOrigin":true}

Diagnostics:
  --evaluate <js>            Evaluate JavaScript in the page
  --capture-console          Capture browser console messages
  --capture-network          Capture network requests and responses

Diff mode:
  --diff <left> <right>      Compare two URLs or two prior JSON metadata files
`);
}

function getArg(flag) {
  const index = rest.indexOf(flag);
  return index >= 0 ? rest[index + 1] : null;
}

function hasFlag(flag) {
  return rest.includes(flag);
}

async function ensureParent(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  return resolved;
}

async function ensureDir(dirPath) {
  const resolved = path.resolve(process.cwd(), dirPath);
  await fs.mkdir(resolved, { recursive: true });
  return resolved;
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(path.resolve(process.cwd(), filePath), 'utf8');
  } catch {
    return null;
  }
}

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarizeText(text) {
  return text.slice(0, 6000);
}

function parseJsonInput(raw, label) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse ${label} as JSON: ${error.message}`);
  }
}

function diffArrays(left = [], right = []) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return {
    added: right.filter((item) => !leftSet.has(item)),
    removed: left.filter((item) => !rightSet.has(item)),
  };
}

function applyProfileDefaults(profile, options) {
  const profiles = {
    inspect: { extract: options.extract || 'summary' },
    debug: { captureConsole: true, captureNetwork: true, extract: options.extract || 'all', tracePath: options.tracePath || 'tmp/browser-trace.zip' },
    capture: { screenshot: options.screenshot || 'tmp/browser-capture.png', fullPage: true, extract: options.extract || 'sections' },
    monitor: { captureConsole: true, captureNetwork: true, extract: options.extract || 'summary', softFail: true },
    qa: { captureConsole: true, captureNetwork: true, extract: options.extract || 'all', fullPage: true, tracePath: options.tracePath || 'tmp/browser-trace.zip' },
  };
  return { ...profiles[profile], ...options };
}

async function readMaybeJsonFile(input) {
  const resolved = path.resolve(process.cwd(), input);
  const text = await fs.readFile(resolved, 'utf8');
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, retries) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

function substituteVars(value, vars) {
  if (typeof value === 'string') {
    return value.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/gi, (_, key) => {
      if (Object.prototype.hasOwnProperty.call(vars, key)) return String(vars[key]);
      if (Object.prototype.hasOwnProperty.call(process.env, key)) return String(process.env[key]);
      return `{{${key}}}`;
    });
  }
  if (Array.isArray(value)) return value.map((item) => substituteVars(item, vars));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substituteVars(v, vars)]));
  }
  return value;
}

function redactValue(value, patterns) {
  if (typeof value !== 'string') return value;
  let result = value;
  for (const pattern of patterns) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function redactDeep(value, patterns) {
  if (typeof value === 'string') return redactValue(value, patterns);
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, patterns));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, redactDeep(inner, patterns)]));
  }
  return value;
}

function buildRedactionPatterns(vars) {
  const patterns = [
    /(authorization|cookie|set-cookie):\s*[^\n]+/gi,
    /Bearer\s+[A-Za-z0-9._\-]+/g,
    /sk-[A-Za-z0-9]+/g,
  ];
  for (const value of Object.values(vars || {})) {
    if (typeof value === 'string' && value.length >= 6) {
      patterns.push(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    }
  }
  return patterns;
}

async function createContext({ browser, sessionPath, userDataDir, userAgent, harPath, videoDir }) {
  if (userDataDir) {
    const launchOptions = {
      headless: true,
      userAgent,
      viewport: { width: 1440, height: 1080 },
    };
    if (videoDir) launchOptions.recordVideo = { dir: path.resolve(process.cwd(), videoDir) };
    return chromium.launchPersistentContext(path.resolve(process.cwd(), userDataDir), launchOptions);
  }

  let storageState;
  if (sessionPath) {
    const resolvedSessionPath = path.resolve(process.cwd(), sessionPath);
    try {
      await fs.access(resolvedSessionPath);
      storageState = resolvedSessionPath;
    } catch {
      storageState = undefined;
    }
  }
  const contextOptions = {
    userAgent,
    viewport: { width: 1440, height: 1080 },
    storageState,
  };
  if (harPath) contextOptions.recordHar = { path: path.resolve(process.cwd(), harPath), mode: 'minimal' };
  if (videoDir) contextOptions.recordVideo = { dir: path.resolve(process.cwd(), videoDir) };
  return browser.newContext(contextOptions);
}

async function persistSession(context, sessionPath) {
  if (!sessionPath) return null;
  const resolved = await ensureParent(sessionPath);
  await context.storageState({ path: resolved });
  return resolved;
}

async function importCookies(context, cookiesIn) {
  if (!cookiesIn) return null;
  const raw = await fs.readFile(path.resolve(process.cwd(), cookiesIn), 'utf8');
  const cookies = JSON.parse(raw);
  await context.addCookies(cookies);
  return cookies.length;
}

async function exportCookies(context, cookiesOut) {
  if (!cookiesOut) return null;
  const resolved = await ensureParent(cookiesOut);
  const cookies = await context.cookies();
  await fs.writeFile(resolved, JSON.stringify(cookies, null, 2), 'utf8');
  return resolved;
}

function buildLocator(page, action) {
  if (action.selector) return page.locator(action.selector).first();
  if (action.role) return page.getByRole(action.role, action.name ? { name: action.name } : {});
  if (action.label) return page.getByLabel(action.label);
  if (action.placeholder) return page.getByPlaceholder(action.placeholder);
  if (action.text) return page.getByText(action.text, { exact: Boolean(action.exact) }).first();
  return null;
}

function normalizeDomain(value) {
  return String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function classifyActionRisk(action) {
  const type = String(action?.type || '').toLowerCase();
  const intent = String(action?.intent || '').toLowerCase();
  const haystack = JSON.stringify(action || {}).toLowerCase();
  const intentRiskMap = {
    navigate: 'read',
    read: 'read',
    observe: 'read',
    draft: 'low',
    fill: 'low',
    upload: 'low',
    submit: 'high',
    delete: 'high',
    'auth-change': 'high',
    purchase: 'high',
  };
  const highRiskTerms = ['delete', 'remove', 'destroy', 'purchase', 'pay', 'checkout', 'submit', 'send', 'post', 'confirm', 'transfer', 'security', 'password', '2fa'];
  const lowRiskWriteTypes = new Set(['click', 'type', 'press', 'select', 'hover', 'scroll', 'goto', 'waitforselector', 'waitfortimeout', 'assert', 'upload', 'download']);

  if (intent && intentRiskMap[intent]) return intentRiskMap[intent];
  if (highRiskTerms.some((term) => haystack.includes(term))) return 'high';
  if (['type', 'press', 'select', 'click', 'upload'].includes(type)) return 'low';
  if (lowRiskWriteTypes.has(type)) return 'read';
  return 'read';
}

function buildPolicyContext(page, options) {
  const allowedDomains = new Set((options.allowDomains || []).map(normalizeDomain).filter(Boolean));
  const currentDomain = (() => {
    try {
      return normalizeDomain(new URL(page.url()).hostname);
    } catch {
      return '';
    }
  })();
  return {
    policy: options.policy || 'assist',
    confirmHighRisk: Boolean(options.confirmHighRisk),
    allowedDomains,
    currentDomain,
  };
}

function enforceActionPolicy(page, action, options) {
  const ctx = buildPolicyContext(page, options);
  const risk = classifyActionRisk(action);
  const actionType = String(action?.type || 'unknown');
  const domainTrusted = !ctx.currentDomain || ctx.allowedDomains.has(ctx.currentDomain);

  if (ctx.policy === 'guarded' && risk !== 'read') {
    throw new Error(`Blocked ${actionType} action by guarded policy. Switch policy or lower the action risk.`);
  }

  if (ctx.policy === 'assist' && risk === 'high' && !ctx.confirmHighRisk) {
    throw new Error(`Blocked high-risk ${actionType} action. Re-run with --confirm-high-risk if you intend to commit this action.`);
  }

  if (ctx.policy === 'autonomous' && risk === 'high' && !ctx.confirmHighRisk) {
    throw new Error(`Blocked high-risk ${actionType} action in autonomous mode without explicit confirmation.`);
  }

  if (ctx.policy === 'high-trust' && risk === 'high' && !domainTrusted) {
    throw new Error(`Blocked high-risk ${actionType} action because ${ctx.currentDomain || 'this domain'} is not in --allow-domains.`);
  }

  return { risk, domainTrusted, policy: ctx.policy, domain: ctx.currentDomain || null };
}

function deriveSessionPath(url, options) {
  if (options.sessionPath) return options.sessionPath;
  if (!options.persistSession) return null;
  try {
    const hostname = normalizeDomain(new URL(url).hostname) || 'session';
    return `tmp/browser-sessions/${hostname}.json`;
  } catch {
    return 'tmp/browser-sessions/default.json';
  }
}

async function extractStructuredContent(page, selector) {
  const base = selector ? page.locator(selector).first() : page.locator('body');
  return base.evaluate((node) => {
    const root = node instanceof HTMLElement ? node : document.body;
    const getText = (el) => el.textContent?.replace(/\s+/g, ' ').trim() || '';
    const headings = Array.from(root.querySelectorAll('h1, h2, h3')).map(getText).filter(Boolean).slice(0, 20);
    const links = Array.from(root.querySelectorAll('a[href]')).map((el) => el.getAttribute('href')).filter(Boolean).slice(0, 60);
    const tables = Array.from(root.querySelectorAll('table')).slice(0, 10).map((table) => ({
      headers: Array.from(table.querySelectorAll('th')).map(getText).filter(Boolean),
      rows: Array.from(table.querySelectorAll('tr')).slice(0, 20).map((row) =>
        Array.from(row.querySelectorAll('td, th')).map(getText).filter(Boolean)
      ).filter((row) => row.length > 0),
    }));
    const lists = Array.from(root.querySelectorAll('ul, ol')).slice(0, 12).map((list) =>
      Array.from(list.querySelectorAll(':scope > li')).map(getText).filter(Boolean)
    ).filter((items) => items.length > 0);
    const sections = Array.from(root.querySelectorAll('section, article, main, aside, nav')).slice(0, 20).map((section, index) => ({
      index,
      tag: section.tagName.toLowerCase(),
      label: section.getAttribute('aria-label') || section.getAttribute('data-testid') || section.id || '',
      text: getText(section).slice(0, 1000),
    })).filter((section) => section.text);
    const domMap = Array.from(root.querySelectorAll('a, button, input, select, textarea, [role]')).slice(0, 250).map((el, index) => ({
      index,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || '',
      text: getText(el).slice(0, 120),
      label: el.getAttribute('aria-label') || el.getAttribute('name') || el.getAttribute('placeholder') || '',
      id: el.id || '',
    }));
    const selectorText = getText(root).slice(0, 5000);
    return { headings, links, tables, lists, sections, domMap, selectorText };
  });
}

async function runAssertions(page, assertions = [], timeout = 15000) {
  const results = [];
  for (const assertion of assertions) {
    if (assertion.type === 'textIncludes') {
      const text = assertion.selector
        ? await buildLocator(page, assertion).textContent({ timeout })
        : await page.textContent('body', { timeout });
      const passed = (text || '').includes(assertion.value);
      results.push({ ...assertion, passed });
      if (!passed) throw new Error(`Assertion failed: expected text to include "${assertion.value}"`);
    } else if (assertion.type === 'visible') {
      const locator = buildLocator(page, assertion);
      const passed = await locator.isVisible({ timeout });
      results.push({ ...assertion, passed });
      if (!passed) throw new Error(`Assertion failed: target not visible`);
    } else if (assertion.type === 'urlIncludes') {
      const passed = page.url().includes(assertion.value);
      results.push({ ...assertion, passed });
      if (!passed) throw new Error(`Assertion failed: url does not include "${assertion.value}"`);
    } else {
      throw new Error(`Unknown assertion type: ${assertion.type}`);
    }
  }
  return results;
}

async function waitForSettled(page, mode = 'idle', timeout = 5000) {
  if (mode === 'load') {
    await page.waitForLoadState('load', { timeout }).catch(() => {});
    return { mode, ok: true };
  }
  if (mode === 'idle') {
    await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
    return { mode, ok: true };
  }
  if (mode === 'mutation') {
    const result = await page.evaluate(async (settleTimeout) => {
      await new Promise((resolve) => {
        let done = false;
        let timer;
        const finish = () => {
          if (done) return;
          done = true;
          observer.disconnect();
          clearTimeout(timer);
          resolve();
        };
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(finish, 400);
        });
        observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: false });
        timer = setTimeout(finish, 400);
        setTimeout(finish, settleTimeout);
      });
      return true;
    }, timeout).catch(() => false);
    return { mode, ok: result };
  }
  return { mode, ok: false };
}

async function runActions(page, actions = [], defaultTimeout, retries = 0, policyOptions = {}) {
  const performed = [];

  for (const [index, rawAction] of actions.entries()) {
    const action = rawAction;
    const timeout = action.timeout ?? defaultTimeout;
    const startedAt = Date.now();

    await withRetries(async () => {
      const policyDecision = enforceActionPolicy(page, action, policyOptions);
      const target = buildLocator(page, action);
      let downloadPath = null;
      switch (action.type) {
        case 'waitForSelector':
          await page.waitForSelector(action.selector, { timeout });
          break;
        case 'click':
          await target.waitFor({ state: 'visible', timeout });
          await target.click({ timeout });
          break;
        case 'type':
          await target.waitFor({ state: 'visible', timeout });
          await target.fill(action.value ?? '');
          break;
        case 'press':
          if (target) {
            await target.press(action.key, { timeout });
          } else {
            await page.keyboard.press(action.key);
          }
          break;
        case 'select':
          await target.selectOption(action.value);
          break;
        case 'hover':
          await target.hover({ timeout });
          break;
        case 'scroll':
          if (target) {
            await target.evaluate((node, amount) => node.scrollBy(0, amount), action.amount ?? 400);
          } else {
            await page.evaluate((amount) => window.scrollBy(0, amount), action.amount ?? 400);
          }
          break;
        case 'goto':
          await page.goto(action.url, { waitUntil: action.waitUntil || 'domcontentloaded', timeout });
          break;
        case 'waitForTimeout':
          await page.waitForTimeout(action.ms ?? 500);
          break;
        case 'assert':
          await runAssertions(page, [action.assertion], timeout);
          break;
        case 'upload':
          await target.setInputFiles(action.files || action.file || []);
          break;
        case 'download': {
          const download = await page.waitForEvent('download', { timeout, predicate: () => true }).catch(() => null);
          if (!download) throw new Error(`Download did not start within ${timeout}ms`);
          if (policyOptions.downloadsDir) {
            const suggested = download.suggestedFilename();
            const resolved = await ensureParent(path.join(policyOptions.downloadsDir, suggested));
            await download.saveAs(resolved);
            downloadPath = resolved;
          }
          break;
        }
        default:
          throw new Error(`Unknown action type at step ${index + 1}: ${action.type}`);
      }
      const settle = action.settle === false ? null : await waitForSettled(page, action.settleMode || policyOptions.settleMode, action.settleTimeout ?? policyOptions.settleTimeout);
      performed.push({
        ...action,
        policyDecision,
        receipt: {
          startedAt: new Date(startedAt).toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          url: page.url(),
          title: await page.title().catch(() => null),
          settle,
          downloadPath,
        },
      });
    }, action.retries ?? retries);
  }

  return performed;
}

async function maybeVisualDiff(currentScreenshot, priorScreenshotPath) {
  if (!currentScreenshot || !priorScreenshotPath) return null;
  const prior = await readTextIfExists(priorScreenshotPath);
  if (prior !== null) return null;
  try {
    const [a, b] = await Promise.all([fs.readFile(currentScreenshot), fs.readFile(path.resolve(process.cwd(), priorScreenshotPath))]);
    const hashA = crypto.createHash('sha256').update(a).digest('hex');
    const hashB = crypto.createHash('sha256').update(b).digest('hex');
    return {
      changed: hashA !== hashB,
      currentHash: hashA,
      priorHash: hashB,
      changeRegions: hashA !== hashB ? ['binary screenshot changed'] : [],
    };
  } catch {
    return null;
  }
}

async function crawlSite(page, config = {}) {
  const limit = Math.max(1, Math.min(Number(config.limit || 5), 20));
  const sameOrigin = config.sameOrigin !== false;
  const baseUrl = new URL(page.url());
  const visited = [];
  const hrefs = await page.locator('a[href]').evaluateAll((nodes) =>
    nodes.map((node) => node.href).filter(Boolean)
  );
  for (const href of hrefs) {
    if (visited.length >= limit) break;
    try {
      const target = new URL(href);
      if (sameOrigin && target.origin !== baseUrl.origin) continue;
      visited.push(target.toString());
    } catch {}
  }
  return visited;
}

async function captureArtifacts(page, options, extracted, consoleMessages, networkEvents, redactionPatterns) {
  const artifact = { screenshot: null, html: null, text: null, selectorData: null, bundleDir: null, trace: null, har: null, videoDir: null };

  if (options.bundleDir) {
    artifact.bundleDir = await ensureDir(options.bundleDir);
  }

  const baseDir = artifact.bundleDir;

  if (options.screenshot || baseDir) {
    const targetPath = options.screenshot || path.join(baseDir, 'screenshot.png');
    const resolved = await ensureParent(targetPath);
    if (options.selector) {
      const locator = page.locator(options.selector).first();
      await locator.waitFor({ state: 'visible', timeout: options.timeout });
      await locator.screenshot({ path: resolved });
    } else {
      await page.screenshot({ path: resolved, fullPage: options.fullPage });
    }
    artifact.screenshot = resolved;
  }

  if (options.htmlOutPath || baseDir) {
    const targetPath = options.htmlOutPath || path.join(baseDir, 'page.html');
    const resolved = await ensureParent(targetPath);
    await fs.writeFile(resolved, redactValue(await page.content(), redactionPatterns), 'utf8');
    artifact.html = resolved;
  }

  if (options.textOutPath || baseDir) {
    const targetPath = options.textOutPath || path.join(baseDir, 'page.txt');
    const resolved = await ensureParent(targetPath);
    await fs.writeFile(resolved, redactValue(extracted.excerpt, redactionPatterns), 'utf8');
    artifact.text = resolved;
  }

  if ((options.selectorOutPath || baseDir) && extracted.selectorData) {
    const targetPath = options.selectorOutPath || path.join(baseDir, 'selector.json');
    const resolved = await ensureParent(targetPath);
    await fs.writeFile(resolved, JSON.stringify(redactDeep(extracted.selectorData, redactionPatterns), null, 2), 'utf8');
    artifact.selectorData = resolved;
  }

  if (options.tracePath) {
    artifact.trace = path.resolve(process.cwd(), options.tracePath);
  }
  if (options.harPath) {
    artifact.har = path.resolve(process.cwd(), options.harPath);
  }
  if (options.videoDir) {
    artifact.videoDir = path.resolve(process.cwd(), options.videoDir);
  }

  if (baseDir) {
    const consolePath = path.join(baseDir, 'console.json');
    const networkPath = path.join(baseDir, 'network.json');
    const metadataPath = path.join(baseDir, 'metadata.json');
    await fs.writeFile(consolePath, JSON.stringify(redactDeep(consoleMessages, redactionPatterns), null, 2), 'utf8');
    await fs.writeFile(networkPath, JSON.stringify(redactDeep(networkEvents, redactionPatterns), null, 2), 'utf8');
    artifact.console = consolePath;
    artifact.network = networkPath;
    artifact.metadata = metadataPath;
  }

  return artifact;
}

function buildRenderedOutput(result, format) {
  if (format === 'markdown') {
    return [
      `# Browser Helper Result`,
      '',
      `- **URL:** ${result.url}`,
      `- **Title:** ${result.title || '(none)'}`,
      `- **Profile:** ${result.profile || 'custom'}`,
      `- **Fetched:** ${result.fetchedAt}`,
      result.sessionPath ? `- **Session:** ${result.sessionPath}` : '',
      result.bundleDir ? `- **Bundle:** ${result.bundleDir}` : '',
      '',
      `## Headings`,
      ...(result.headings?.length ? result.headings.map((heading) => `- ${heading}`) : ['- None']),
      '',
      `## Excerpt`,
      result.excerpt || '(empty)',
      '',
      result.assertions?.length ? `## Assertions\n${result.assertions.map((entry) => `- ${entry.passed ? 'PASS' : 'FAIL'} ${entry.type}`).join('\n')}` : '',
      result.consoleMessages?.length ? `## Console\n${result.consoleMessages.map((entry) => `- [${entry.type}] ${entry.text}`).join('\n')}` : '',
      result.networkEvents?.length ? `## Network\n${result.networkEvents.slice(0, 20).map((entry) => `- [${entry.status ?? 'pending'}] ${entry.method} ${entry.url}`).join('\n')}` : '',
    ].filter(Boolean).join('\n');
  }

  if (format === 'text') {
    return [
      `URL: ${result.url}`,
      `Title: ${result.title}`,
      `Profile: ${result.profile || 'custom'}`,
      result.headings?.length ? `Headings: ${result.headings.join(' | ')}` : 'Headings: ',
      result.links?.length ? `Links: ${result.links.join(' | ')}` : 'Links: ',
      `Excerpt: ${result.excerpt || ''}`,
      result.screenshot ? `Screenshot: ${result.screenshot}` : null,
      result.bundleDir ? `Bundle: ${result.bundleDir}` : null,
      result.tracePath ? `Trace: ${result.tracePath}` : null,
      result.harPath ? `HAR: ${result.harPath}` : null,
      result.evaluationResult !== null && result.evaluationResult !== undefined ? `Evaluation: ${JSON.stringify(result.evaluationResult)}` : null,
    ].filter(Boolean).join('\n');
  }

  return JSON.stringify(result, null, 2);
}

async function runDiff(leftInput, rightInput, options) {
  const [left, right] = await Promise.all([
    leftInput.endsWith('.json') ? readMaybeJsonFile(leftInput) : runSingle(leftInput, options, true),
    rightInput.endsWith('.json') ? readMaybeJsonFile(rightInput) : runSingle(rightInput, options, true),
  ]);

  const diff = {
    left: typeof leftInput === 'string' ? leftInput : left.url,
    right: typeof rightInput === 'string' ? rightInput : right.url,
    titleChanged: left.title !== right.title,
    excerptChanged: left.excerpt !== right.excerpt,
    headings: diffArrays(left.headings || [], right.headings || []),
    links: diffArrays(left.links || [], right.links || []),
    sections: diffArrays((left.sections || left.selectorData?.sections || []).map((section) => section.text || section), (right.sections || right.selectorData?.sections || []).map((section) => section.text || section)),
    domMap: diffArrays((left.domMap || left.selectorData?.domMap || []).map((node) => `${node.tag}:${node.text}:${node.label}`), (right.domMap || right.selectorData?.domMap || []).map((node) => `${node.tag}:${node.text}:${node.label}`)),
    screenshots: { left: left.screenshot || null, right: right.screenshot || null },
    visual: left.visualDiff || right.visualDiff || null,
    comparedAt: new Date().toISOString(),
  };

  const rendered = buildRenderedOutput(diff, options.format === 'markdown' ? 'json' : options.format);
  if (options.outPath) {
    const resolved = await ensureParent(options.outPath);
    await fs.writeFile(resolved, rendered, 'utf8');
  }
  process.stdout.write(`${rendered}\n`);
}

async function runSingle(url, incomingOptions, returnResultOnly = false) {
  const baseOptions = incomingOptions.profile ? applyProfileDefaults(incomingOptions.profile, incomingOptions) : incomingOptions;
  const recipeData = baseOptions.recipePath ? JSON.parse(await fs.readFile(path.resolve(process.cwd(), baseOptions.recipePath), 'utf8')) : null;
  const vars = substituteVars(baseOptions.vars || {}, baseOptions.vars || {});
  const resolvedUrl = substituteVars(recipeData?.url || url, vars);
  const resolvedSteps = substituteVars(recipeData?.steps || (baseOptions.inlineSteps ? parseJsonInput(baseOptions.inlineSteps, '--steps') : []), vars);
  const resolvedAssertions = substituteVars(recipeData?.assertions || [], vars);
  const redactionPatterns = buildRedactionPatterns(vars);
  const effectiveSessionPath = deriveSessionPath(resolvedUrl, baseOptions);
  const downloadsDir = baseOptions.downloadsDir ? await ensureDir(baseOptions.downloadsDir) : null;

  const browser = baseOptions.userDataDir ? null : await chromium.launch({ headless: true });
  const context = await createContext({
    browser,
    sessionPath: effectiveSessionPath,
    userDataDir: baseOptions.userDataDir,
    userAgent: baseOptions.userAgent,
    harPath: baseOptions.harPath,
    videoDir: baseOptions.videoDir,
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const networkEvents = [];

  if (baseOptions.captureConsole || baseOptions.bundleDir) {
    page.on('console', (message) => {
      consoleMessages.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => {
      consoleMessages.push({ type: 'pageerror', text: error.message });
    });
  }

  if (baseOptions.captureNetwork || baseOptions.bundleDir) {
    page.on('request', async (request) => {
      const headers = await request.allHeaders().catch(() => ({}));
      networkEvents.push({ type: 'request', url: request.url(), method: request.method(), headers });
    });
    page.on('response', async (response) => {
      networkEvents.push({ type: 'response', url: response.url(), status: response.status(), method: response.request().method() });
    });
  }

  if (baseOptions.tracePath) {
    await context.tracing.start({ screenshots: true, snapshots: true });
  }

  try {
    await importCookies(context, baseOptions.cookiesIn);

    await withRetries(async () => {
      await page.goto(resolvedUrl, { waitUntil: 'domcontentloaded', timeout: baseOptions.timeout });
    }, baseOptions.retries);

    if (baseOptions.waitFor) {
      await page.waitForSelector(baseOptions.waitFor, { timeout: baseOptions.timeout });
    } else {
      await waitForSettled(page, baseOptions.settleMode, baseOptions.settleTimeout);
    }

    const performedActions = await runActions(page, resolvedSteps, baseOptions.timeout, baseOptions.retries, { ...baseOptions, downloadsDir });
    const assertionResults = await runAssertions(page, resolvedAssertions, baseOptions.timeout);

    const finalUrl = page.url();
    const title = await page.title();
    const html = await page.content();
    const structured = await extractStructuredContent(page, baseOptions.selector);
    const excerpt = summarizeText(cleanText(html));
    const includeSelectorData = ['selector', 'all', 'tables', 'lists', 'sections', 'dom'].includes(baseOptions.extract);
    const selectorData = includeSelectorData ? structured : null;
    const extracted = { excerpt, selectorData };
    const evaluationResult = baseOptions.evaluateScript ? await page.evaluate(baseOptions.evaluateScript) : null;
    const crawledUrls = baseOptions.crawlConfig ? await crawlSite(page, baseOptions.crawlConfig) : null;
    const artifacts = await captureArtifacts(page, baseOptions, extracted, consoleMessages, networkEvents, redactionPatterns);
    const visualDiff = await maybeVisualDiff(artifacts.screenshot, baseOptions.compareScreenshot);
    const sessionSaved = await persistSession(context, effectiveSessionPath);
    const cookiesSaved = await exportCookies(context, baseOptions.cookiesOut);

    if (baseOptions.tracePath) {
      const traceResolved = await ensureParent(baseOptions.tracePath);
      await context.tracing.stop({ path: traceResolved });
      artifacts.trace = traceResolved;
    }

    const result = redactDeep({
      url: finalUrl,
      title,
      headings: structured.headings,
      links: structured.links,
      excerpt,
      selectorData,
      tables: ['tables', 'all'].includes(baseOptions.extract) ? structured.tables : undefined,
      lists: ['lists', 'all'].includes(baseOptions.extract) ? structured.lists : undefined,
      sections: ['sections', 'all'].includes(baseOptions.extract) ? structured.sections : undefined,
      domMap: ['dom', 'all'].includes(baseOptions.extract) ? structured.domMap : undefined,
      screenshot: artifacts.screenshot,
      htmlPath: artifacts.html,
      textPath: artifacts.text,
      selectorPath: artifacts.selectorData,
      bundleDir: artifacts.bundleDir,
      tracePath: artifacts.trace,
      harPath: artifacts.har,
      videoDir: artifacts.videoDir,
      consoleMessages,
      networkEvents,
      evaluationResult,
      profile: baseOptions.profile || null,
      policy: baseOptions.policy || 'assist',
      allowDomains: baseOptions.allowDomains || [],
      persistSession: Boolean(baseOptions.persistSession),
      settleMode: baseOptions.settleMode,
      settleTimeout: baseOptions.settleTimeout,
      downloadsDir,
      actions: performedActions,
      assertions: assertionResults,
      sessionPath: sessionSaved,
      cookiesOut: cookiesSaved,
      visualDiff,
      crawl: crawledUrls,
      fetchedAt: new Date().toISOString(),
    }, redactionPatterns);

    if (artifacts.metadata) {
      await fs.writeFile(artifacts.metadata, JSON.stringify(result, null, 2), 'utf8');
    }

    if (returnResultOnly) {
      return result;
    }

    const rendered = buildRenderedOutput(result, baseOptions.format);
    if (baseOptions.outPath) {
      const resolved = await ensureParent(baseOptions.outPath);
      await fs.writeFile(resolved, rendered, 'utf8');
    }
    process.stdout.write(`${rendered}\n`);
    return result;
  } catch (error) {
    if (baseOptions.softFail) {
      const payload = {
        ok: false,
        error: error.message,
        url: resolvedUrl,
        profile: baseOptions.profile || null,
        fetchedAt: new Date().toISOString(),
      };
      const rendered = JSON.stringify(payload, null, 2);
      process.stdout.write(`${rendered}\n`);
      return payload;
    }
    throw error;
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}

if (!firstArg || firstArg === '--help' || firstArg === '-h') {
  printUsage();
  process.exit(firstArg ? 0 : 1);
}

const options = {
  outPath: getArg('--out'),
  htmlOutPath: getArg('--html-out'),
  textOutPath: getArg('--text-out'),
  screenshot: getArg('--screenshot'),
  selector: getArg('--selector'),
  selectorOutPath: getArg('--selector-out'),
  evaluateScript: getArg('--evaluate'),
  waitFor: getArg('--wait-for'),
  recipePath: getArg('--recipe'),
  inlineSteps: getArg('--steps'),
  vars: getArg('--vars') ? parseJsonInput(getArg('--vars'), '--vars') : {},
  format: getArg('--format') || 'json',
  timeout: Number(getArg('--timeout') || 15000),
  retries: Number(getArg('--retries') || 0),
  softFail: hasFlag('--soft-fail'),
  fullPage: hasFlag('--full-page'),
  userAgent: getArg('--user-agent') || 'Mozilla/5.0 (compatible; CommandDeckBrowserHelper/4.0; +https://dashboardoc.com)',
  extract: getArg('--extract') || 'summary',
  bundleDir: getArg('--bundle-dir'),
  captureConsole: hasFlag('--capture-console'),
  captureNetwork: hasFlag('--capture-network'),
  profile: getArg('--profile'),
  sessionPath: getArg('--session'),
  userDataDir: getArg('--user-data-dir'),
  tracePath: getArg('--trace'),
  harPath: getArg('--har'),
  videoDir: getArg('--video-dir'),
  cookiesIn: getArg('--cookies-in'),
  cookiesOut: getArg('--cookies-out'),
  compareScreenshot: getArg('--compare-screenshot'),
  crawlConfig: getArg('--crawl') ? parseJsonInput(getArg('--crawl'), '--crawl') : null,
  policy: getArg('--policy') || 'assist',
  allowDomains: (getArg('--allow-domains') || '').split(',').map((item) => item.trim()).filter(Boolean),
  confirmHighRisk: hasFlag('--confirm-high-risk'),
  persistSession: hasFlag('--persist-session'),
  settleMode: getArg('--settle-mode') || 'idle',
  settleTimeout: Number(getArg('--settle-timeout') || 5000),
  downloadsDir: getArg('--downloads-dir'),
};

if (firstArg === '--diff') {
  const left = rest[1];
  const right = rest[2];
  if (!left || !right) {
    throw new Error('Diff mode requires two inputs: --diff <left> <right>');
  }
  await runDiff(left, right, options);
} else {
  await runSingle(firstArg, options);
}
