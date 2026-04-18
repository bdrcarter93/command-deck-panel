import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBridgeStatus } from '@/hooks/useBridgeStatus';

const severityStyle: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  warn: 'bg-warning/20 text-warning border-warning/30',
  info: 'bg-primary/20 text-primary border-primary/30',
};

const SystemStatus = () => {
  const { data, isLoading, error } = useDashboardData();
  const { data: bridge } = useBridgeStatus();
  const bridgeNode = bridge?.bridge;
  const upstream = bridge?.upstream;
  const openclawReachable = upstream?.openclawReachable ?? false;

  if (isLoading) {
    return <StatePanel title="System Status" message="Loading security and presence data…" detail="Using explicit security audit and system-presence surfaces from OpenClaw." />;
  }

  if (error || !data) {
    return <StatePanel title="System Status" message="Could not load system status" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-card p-5 xl:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Bridge Health</p>
            <h3 className="text-lg font-semibold text-foreground">Local dashboard bridge</h3>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary/80">
            {openclawReachable ? 'healthy' : 'degraded'}
          </Badge>
        </div>

        {!bridgeNode ? (
          <StatePanel title="Bridge status unavailable" message="The UI could not fetch bridge telemetry" detail="The dashboard can still render partial cached/live data when available." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-secondary/20 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Bridge</p>
              <p className="text-foreground font-medium">{bridgeNode.host}:{bridgeNode.port}</p>
            </div>
            <div className="rounded-lg bg-secondary/20 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Uptime</p>
              <p className="text-foreground font-medium">{Math.floor((bridgeNode.uptimeMs ?? 0) / 1000)}s</p>
            </div>
            <div className="rounded-lg bg-secondary/20 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">OpenClaw Reachable</p>
              <p className="text-foreground font-medium">{openclawReachable ? 'yes' : 'no'}</p>
            </div>
            <div className="rounded-lg bg-secondary/20 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Failures</p>
              <p className="text-foreground font-medium">{bridgeNode.consecutiveFailures ?? 0}</p>
            </div>
          </div>
        )}

        {bridgeNode?.lastError && <p className="text-xs text-muted-foreground mt-3">Last bridge error: {bridgeNode.lastError}</p>}
        {upstream?.lastError && <p className="text-xs text-muted-foreground mt-1">Last upstream error: {upstream.lastError}</p>}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Security Audit</p>
            <h3 className="text-lg font-semibold text-foreground">Explicit findings</h3>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary/80">
            {data.securityIssues.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {data.securityIssues.length === 0 ? (
            <StatePanel title="No findings" message="No security findings returned" detail={data.summary.securitySummary} />
          ) : (
            data.securityIssues.map((issue, index) => (
              <motion.div
                key={`${issue.title}-${index}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg bg-secondary/20 p-4"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`text-xs ${severityStyle[issue.severity]}`}>{issue.severity}</Badge>
                  <span className="text-sm font-medium text-foreground">{issue.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{issue.detail}</p>
                {issue.fix && <p className="text-xs text-primary mt-2">Fix: {issue.fix}</p>}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Presence</p>
            <h3 className="text-lg font-semibold text-foreground">Runtime presence events</h3>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary/80">
            {data.presence.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {data.presence.length === 0 ? (
            <StatePanel title="No presence events" message="OpenClaw returned no current presence items" detail="This area stays empty instead of showing fake operator traffic." />
          ) : (
            data.presence.map((item, index) => (
              <motion.div
                key={`${item.text}-${index}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg bg-secondary/20 p-4"
              >
                <p className="text-sm text-foreground">{item.text}</p>
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  {item.host && <p><span className="text-foreground">Host:</span> {item.host}</p>}
                  {item.mode && <p><span className="text-foreground">Mode:</span> {item.mode}</p>}
                  {item.reason && <p><span className="text-foreground">Reason:</span> {item.reason}</p>}
                  {item.lastSeen && <p><span className="text-foreground">Seen:</span> {item.lastSeen}</p>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
