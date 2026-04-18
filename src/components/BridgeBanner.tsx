/**
 * BridgeBanner — shows a non-fatal warning when the remote bridge is unreachable.
 *
 * Rules:
 * - Only renders when VITE_API_BASE is set (production Vercel deploy with a remote bridge).
 * - Shows nothing when the bridge responds ok.
 * - Shows a dismissible amber banner when the bridge is down or the fetch errors.
 * - Never throws; all states are handled explicitly.
 * - Local dev: VITE_API_BASE is unset → bridge check points at local relay → no banner.
 */
import { useState } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useBridgeStatus } from '@/hooks/useBridgeStatus';

const IS_REMOTE = Boolean(import.meta.env.VITE_API_BASE);

export function BridgeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data, isError, isLoading, refetch } = useBridgeStatus();

  // Local dev or not configured → don't render anything
  if (!IS_REMOTE) return null;

  // Still loading first fetch → don't flash a banner yet
  if (isLoading) return null;

  // Bridge is up → no banner
  if (!isError && data?.ok) return null;

  // User dismissed → gone until page refresh
  if (dismissed) return null;

  const message = isError
    ? 'Remote bridge unreachable — showing cached data.'
    : data && !data.ok
      ? `Bridge connected but reporting errors — ${data.bridge?.lastError ?? 'unknown error'}.`
      : 'Remote bridge unavailable — showing cached data.';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
      <AlertTriangle size={16} className="shrink-0 text-amber-400" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => void refetch()}
        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
        title="Retry"
      >
        <RefreshCw size={12} />
        Retry
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-0.5 text-amber-500 hover:text-amber-300 hover:bg-amber-500/20 transition-colors"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
