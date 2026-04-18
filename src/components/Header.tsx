import { motion } from 'framer-motion';
import { ShieldAlert, Wifi, RefreshCw, Activity } from 'lucide-react';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBridgeStatus } from '@/hooks/useBridgeStatus';

const Header = () => {
  const { data, isLoading, error } = useDashboardData();
  const { data: bridge, isLoading: bridgeLoading, error: bridgeError } = useBridgeStatus();

  if (isLoading) {
    return <StatePanel title="OpenClaw Command Deck" message="Connecting to local runtime bridge…" />;
  }

  if (error || !data) {
    return <StatePanel title="OpenClaw Command Deck" message="Live bridge unavailable" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  const criticalCount = data.securityIssues.filter((issue) => issue.severity === 'critical').length;
  const bridgeNode = bridge?.bridge;
  const upstream = bridge?.upstream;
  const bridgeHealthy = upstream?.openclawReachable ?? false;

  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">OpenClaw Runtime</p>
          <h1 className="text-2xl lg:text-3xl font-bold font-heading text-foreground">Live Command Deck</h1>
          <p className="text-sm text-muted-foreground mt-1">
            v{data.summary.version} · Source: {data.meta.source} · Updated {new Date(data.meta.generatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="px-3 py-2 rounded-lg bg-secondary/30 min-w-[150px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <Wifi size={12} />
              Bridge
            </div>
            <p className="text-lg font-semibold text-foreground">
              {bridgeLoading ? 'Checking…' : bridgeError || !bridgeNode ? 'Down' : bridgeHealthy ? 'Healthy' : 'Degraded'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bridgeError || !bridgeNode
                ? 'Bridge status unavailable'
                : bridgeHealthy
                  ? `Up ${Math.floor((bridgeNode.uptimeMs ?? 0) / 1000)}s · OpenClaw reachable`
                  : upstream?.lastError || 'Bridge up, upstream unreachable'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-secondary/30 min-w-[150px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <Wifi size={12} />
              Agents Working
            </div>
            <p className="text-lg font-semibold text-foreground">{data.summary.workingAgents}/{data.summary.activeAgents}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.summary.sessionCount} sessions · unknown agents excluded from active count
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-secondary/30 min-w-[150px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <ShieldAlert size={12} />
              Security
            </div>
            <p className="text-lg font-semibold text-foreground">{criticalCount} critical</p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-secondary/30 min-w-[150px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <RefreshCw size={12} />
              Channels
            </div>
            <p className="text-sm font-semibold text-foreground line-clamp-2">
              {data.summary.runningChannels}/{data.summary.configuredChannels} running
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-secondary/30 min-w-[150px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <Activity size={12} />
              Readiness
            </div>
            <p className="text-sm font-semibold text-foreground line-clamp-2">
              {data.summary.readyAgents} ready · {data.summary.limitedAgents} limited
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.summary.blockedAgents} blocked · {data.summary.unknownAgents} unknown
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
