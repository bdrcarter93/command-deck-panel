import { fetchJson } from '@/lib/api';

export interface BridgeStatus {
  ok: boolean;
  bridge: {
    host: string;
    port: number;
    uptimeMs: number;
    startedAt: string;
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    consecutiveFailures: number;
    lastError: string | null;
  };
  upstream: {
    cliAvailable: boolean;
    openclawReachable: boolean;
    lastCheckAt: string | null;
    lastError: string | null;
  };
}

export async function getBridgeStatus(): Promise<BridgeStatus> {
  // Uses VITE_API_BASE prefix so it works in both local dev (relative) and Vercel (tunnel URL).
  return fetchJson<BridgeStatus>('/api/openclaw/bridge-status', 6000);
}
