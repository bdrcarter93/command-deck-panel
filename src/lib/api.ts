/**
 * Shared API utilities.
 *
 * VITE_API_BASE: Set in Vercel env vars to the stable Cloudflare Tunnel URL,
 *   e.g. https://openclaw-bridge.yourdomain.com
 *   Omit for local dev — falls back to "" (relative path, proxied by Vite → localhost:8787).
 *
 * VITE_BRIDGE_SECRET: Set in Vercel env vars to match BRIDGE_SECRET on the Mac mini bridge.
 *   Omit for local dev (no auth header sent).
 */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export const BRIDGE_SECRET = import.meta.env.VITE_BRIDGE_SECRET as string | undefined;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function authHeaders(): HeadersInit {
  if (BRIDGE_SECRET) return { 'X-Bridge-Secret': BRIDGE_SECRET };
  return {};
}

export async function fetchJson<T>(url: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(url), {
      signal: controller.signal,
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJsonOr<T>(url: string, fallback: T, timeoutMs = 5000): Promise<T> {
  try {
    return await fetchJson<T>(url, timeoutMs);
  } catch {
    return fallback;
  }
}
