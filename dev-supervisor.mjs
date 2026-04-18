import { spawn } from 'node:child_process';
import process from 'node:process';

const children = new Set();
let shuttingDown = false;
let bridgeRestartTimer = null;
let bridgeStarting = false;

function log(prefix, message) {
  process.stdout.write(`[${prefix}] ${message}\n`);
}

function pipeOutput(child, prefix) {
  child.stdout?.on('data', (chunk) => process.stdout.write(`[${prefix}] ${chunk}`));
  child.stderr?.on('data', (chunk) => process.stderr.write(`[${prefix}] ${chunk}`));
}

function spawnManaged(name, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    env: { ...process.env, ...(options.env || {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.add(child);
  pipeOutput(child, name);

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;

    if (options.onExit) {
      options.onExit({ code, signal });
      return;
    }

    const why = signal ? `signal ${signal}` : `code ${code}`;
    log(name, `exited with ${why}`);
    shutdown(code ?? 1);
  });

  child.on('error', (error) => {
    if (shuttingDown) return;
    log(name, `failed to start: ${error instanceof Error ? error.message : String(error)}`);
    shutdown(1);
  });

  return child;
}

function startBridge() {
  if (bridgeStarting || shuttingDown) return null;
  bridgeStarting = true;

  return spawnManaged('bridge', process.execPath, ['openclaw-bridge.mjs'], {
    onExit: ({ code, signal }) => {
      bridgeStarting = false;
      if (shuttingDown) return;
      const why = signal ? `signal ${signal}` : `code ${code}`;
      log('bridge', `exited with ${why}; restarting in 1s`);
      if (bridgeRestartTimer) {
        clearTimeout(bridgeRestartTimer);
      }
      bridgeRestartTimer = setTimeout(() => {
        bridgeRestartTimer = null;
        startBridge();
      }, 1000);
    },
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (bridgeRestartTimer) {
    clearTimeout(bridgeRestartTimer);
    bridgeRestartTimer = null;
  }

  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {}
  }

  setTimeout(() => {
    for (const child of children) {
      try {
        child.kill('SIGKILL');
      } catch {}
    }
    process.exit(code);
  }, 1500).unref();

  setTimeout(() => process.exit(code), 50).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => {
  if (bridgeRestartTimer) clearTimeout(bridgeRestartTimer);
});

log('supervisor', 'starting bridge + vite');
startBridge();
spawnManaged('vite', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '8080']);
