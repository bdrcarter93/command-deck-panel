import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { URL } from 'node:url';

const PORT = Number(process.env.OPENCLAW_BRIDGE_PORT || 8787);
const HOST = process.env.OPENCLAW_BRIDGE_HOST || '127.0.0.1';
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

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
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
  const start = stdout.indexOf('{');
  const listStart = stdout.indexOf('[');
  const index = start === -1 ? listStart : listStart === -1 ? start : Math.min(start, listStart);
  if (index === -1) throw new Error('No JSON payload found in gateway response');
  return JSON.parse(stdout.slice(index));
}

async function handler(req, res) {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing URL' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (url.pathname === '/api/openclaw/health') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'health']);
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/status') {
      const stdout = await run(['openclaw', 'status', '--json', '--deep']);
      sendJson(res, 200, JSON.parse(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/runtime-status') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'status']);
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/system-presence') {
      const stdout = await run(['openclaw', 'gateway', 'call', 'system-presence']);
      sendJson(res, 200, parseGatewayCall(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/sessions') {
      const stdout = await run(['openclaw', 'sessions', '--json']);
      sendJson(res, 200, JSON.parse(stdout));
      return;
    }

    if (url.pathname === '/api/openclaw/logs') {
      const stdout = await run(['openclaw', 'logs', '--json', '--limit', '40', '--plain']);
      sendJson(res, 200, parseLogs(stdout));
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

createServer(handler).listen(PORT, HOST, () => {
  console.log(`OpenClaw bridge listening on http://${HOST}:${PORT}`);
});
