import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

const sessionStatusStyle: Record<string, string> = {
  hot: 'bg-destructive/20 text-destructive border-destructive/30',
  warm: 'bg-warning/20 text-warning border-warning/30',
  cold: 'bg-primary/20 text-primary border-primary/30',
  unknown: 'bg-muted text-muted-foreground border-muted',
};

const SessionDetails = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Session Details" message="Loading recent OpenClaw sessions…" detail="Pulling structured context usage, remaining tokens, cache reads, and model/provider data." />;
  }

  if (error || !data) {
    return <StatePanel title="Session Details" message="Could not load recent sessions" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  if (data.sessions.length === 0) {
    return <StatePanel title="Session Details" message="No recent sessions returned" detail="This runtime currently has no recent sessions to render." />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {data.sessions.map((session, index) => (
        <motion.div
          key={session.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="glass-card p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`text-xs ${sessionStatusStyle[session.status]}`}>{session.status}</Badge>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary/80">
                  {session.kind}
                </Badge>
                <span className="text-xs text-muted-foreground">{session.age}</span>
              </div>
              <h3 className="text-base font-semibold text-foreground break-all">{session.key}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {session.model}
                {session.provider ? ` · ${session.provider}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="rounded-lg bg-secondary/25 p-3">
              <p className="text-xs text-muted-foreground uppercase">Context</p>
              <p className="text-foreground font-mono font-medium">{session.percentUsed ?? '—'}%</p>
            </div>
            <div className="rounded-lg bg-secondary/25 p-3">
              <p className="text-xs text-muted-foreground uppercase">Remaining</p>
              <p className="text-foreground font-mono font-medium">{session.remainingTokens ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-secondary/25 p-3">
              <p className="text-xs text-muted-foreground uppercase">Output</p>
              <p className="text-foreground font-mono font-medium">{session.outputTokens ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-secondary/25 p-3">
              <p className="text-xs text-muted-foreground uppercase">Cached</p>
              <p className="text-foreground font-mono font-medium">{session.cachedPercent ?? '—'}%</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p><span className="text-foreground">Agent:</span> {session.agentId || 'unknown'}</p>
            <p><span className="text-foreground">Session ID:</span> <span className="break-all">{session.sessionId || 'unknown'}</span></p>
            <p><span className="text-foreground">Context tokens:</span> {session.contextTokens ?? '—'}</p>
            <p><span className="text-foreground">Total tokens:</span> {session.totalTokens ?? '—'}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SessionDetails;
