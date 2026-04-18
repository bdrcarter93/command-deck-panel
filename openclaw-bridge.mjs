import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { URL } from 'node:url';

const PORT = Number(process.env.OPENCLAW_BRIDGE_PORT || 8787);
const HOST = process.env.OPENCLAW_BRIDGE_HOST || '127.0.0.1';

// Remote access security — set BRIDGE_SECRET env var to require X-Bridge-Secret header on all requests.
// Leave unset for local dev (no auth enforced when BRIDGE_SECRET is absent).
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || null;

// CORS — set ALLOWED_ORIGIN to restrict to specific domain (e.g. https://command-deck-panel.vercel.app).
// Defaults to '*' for local dev.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const startedAt = Date.now();
let lastSuccessAt = null;
let lastErrorAt = null;
let lastError = null;
let consecutiveFailures = 0;
let upstreamLastCheckAt = null;
let upstreamLastError = null;
let upstreamReachable = false;
const ALLOWED = new Set([
  'openclaw sessions --json',
  'openclaw logs --json --limit 40 --plain',
  'openclaw gateway call health',
  'openclaw gateway call status',
  'openclaw gateway call system-presence',
  'openclaw status --json --deep',
]);

function run(command) {
  if (!ALLOWED.has(command.join(' '))) {
    return Promise.reject(new Error(`Command not allowed: ${command.join(' ')}`));
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: process.env.OPENCLAW_BRIDGE_CWD || '/Volumes/Extreme SSD/AOS_ENTERPRISE_CORE/agents/general',
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Command failed with code ${code}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function markSuccess() {
  lastSuccessAt = new Date().toISOString();
  lastError = null;
  consecutiveFailures = 0;
}

function markError(error) {
  lastErrorAt = new Date().toISOString();
  lastError = error instanceof Error ? error.message : String(error);
  consecutiveFailures += 1;
}

async function probeUpstream() {
  upstreamLastCheckAt = new Date().toISOString();
  try {
    await run(['openclaw', 'gateway', 'call', 'health']);
    upstreamReachable = true;
    upstreamLastError = null;
  } catch (error) {
    upstreamReachable = false;
    upstreamLastError = error instanceof Error ? error.message : String(error);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Bridge-Secret',
    'Vary': 'Origin',
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(),
  });
  res.end(JSON.stringify(payload));
}

function parseLogs(stdout) {
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { message: line, level: 'info' };
      }
    })
    .filter((entry) => entry.type !== 'meta');
}

function parseGatewayCall(stdout) {
  const lines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate = [...lines].reverse().find((line) =>
    (line.startsWith('{') && line.endsWith('}')) || (line.startsWith('[') && line.endsWith(']')),
  );

  if (!candidate) {
    const start = stdout.indexOf('{');
    const listStart = stdout.indexOf('[');
    const index = start === -1 ? listStart : listStart === -1 ? start : Math.min(start, listStart);
    if (index === -1) throw new Error('No JSON payload found in gateway response');
    return JSON.parse(stdout.slice(index));
  }

  return JSON.parse(candidate);
}

async function handler(req, res) {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing URL' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // Enforce secret header when BRIDGE_SECRET is configured
  if (BRIDGE_SECRET) {
    const provided = req.headers['x-bridge-secret'];
    if (provided !== BRIDGE_SECRET) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }
  }

  try {
    if (url.pathname === '/api/openclaw/bridge-status') {
      await probeUpstream();
      sendJson(res, 200, {
        ok: true,
        bridge: {
          host: HOST,
          port: PORT,
          uptimeMs: Date.now() - startedAt,
          startedAt: new Date(startedAt).toISOString(),
          lastSuccessAt,
          lastErrorAt,
          consecutiveFailures,
          lastError,
        },
        upstream: {
          cliAvailable: true,
          openclawReachable: upstreamReachable,
          lastCheckAt: upstreamLastCheckAt,
          lastError: upstreamLastError,
        },
      });
      return;
    }

    if (url.pathname === '/api/openclaw/health') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'health']);
      markSuccess();
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/status') {
      const stdout = await run(['openclaw', 'status', '--json', '--deep']);
      markSuccess();
      sendJson(res, 200, JSON.parse(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/runtime-status') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'status']);
      markSuccess();
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/system-presence') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'system-presence']);
      markSuccess();
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/sessions') {
      const stdout = await run(['openclaw', 'sessions', '--json']);
      markSuccess();
      sendJson(res, 200, JSON.parse(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/logs') {
      const stdout = await run(['openclaw', 'logs', '--json', '--limit', '40', '--plain']);
      markSuccess();
      sendJson(res, 200, parseLogs(stdout));
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    markError(error);
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

const server = createServer(handler);

server.on('error', (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`OpenClaw bridge listening on http://${HOST}:${PORT}`);
});
