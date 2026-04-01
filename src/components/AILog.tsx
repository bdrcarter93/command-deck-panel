import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { LogCategory } from '@/lib/liveData';

const categoryStyle: Record<LogCategory, string> = {
  observation: 'bg-primary/20 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-muted',
  reminder: 'bg-warning/20 text-warning border-warning/30',
  fyi: 'bg-accent/20 text-accent border-accent/30',
};

const sessionStatusStyle: Record<string, string> = {
  hot: 'bg-destructive/20 text-destructive border-destructive/30',
  warm: 'bg-warning/20 text-warning border-warning/30',
  cold: 'bg-primary/20 text-primary border-primary/30',
  unknown: 'bg-muted text-muted-foreground border-muted',
};

const AILog = () => {
  const [filter, setFilter] = useState<string>('all');
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Agent Log" message="Streaming live OpenClaw logs…" />;
  }

  if (error || !data) {
    return <StatePanel title="Agent Log" message="Could not load live logs" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  const filtered = filter === 'all' ? data.logEntries : data.logEntries.filter((e) => e.category === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.sessions.slice(0, 3).map((session) => (
          <div key={session.key} className="glass-card p-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`text-xs ${sessionStatusStyle[session.status]}`}>{session.status}</Badge>
              <span className="text-xs text-muted-foreground">{session.kind}</span>
              <span className="text-xs text-muted-foreground ml-auto">{session.age}</span>
            </div>
            <p className="text-sm font-medium text-foreground break-all">{session.key}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {session.model}{session.provider ? ` · ${session.provider}` : ''}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Context</p>
                <p className="text-foreground font-mono">{session.percentUsed ?? '—'}%</p>
              </div>
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Remaining</p>
                <p className="text-foreground font-mono">{session.remainingTokens ?? '—'}</p>
              </div>
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Cached</p>
                <p className="text-foreground font-mono">{session.cachedPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agent Log</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 glass-card border-none text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-card border border-secondary">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-start gap-3"
          >
            <span className="text-lg mt-0.5">{entry.agentEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-foreground">{entry.agentName}</span>
                <Badge className={`text-xs ${categoryStyle[entry.category]}`}>{entry.category}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{entry.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AILog;
