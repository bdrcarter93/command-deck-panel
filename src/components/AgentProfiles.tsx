import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, HelpCircle, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

const statusLabel: Record<string, string> = {
  working: 'Working',
  active: 'Online',
  idle: 'Idle',
  blocked: 'Blocked',
  offline: 'Offline',
  unknown: 'Unknown',
};

const statusBadgeClass: Record<string, string> = {
  working: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  active: 'bg-primary/20 text-primary border-primary/30',
  idle: 'bg-warning/20 text-warning border-warning/30',
  blocked: 'bg-destructive/20 text-destructive border-destructive/30',
  offline: 'bg-muted text-muted-foreground border-muted',
  unknown: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const readinessBadgeClass: Record<string, string> = {
  ready: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  limited: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  blocked: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  unknown: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const signalBadgeClass: Record<string, string> = {
  yes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  partial: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  no: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  unknown: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const readinessIcon = {
  ready: CheckCircle2,
  limited: Clock3,
  blocked: AlertTriangle,
  unknown: HelpCircle,
};

const AgentProfiles = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Agent Profiles" message="Loading configured OpenClaw agents…" />;
  }

  if (error || !data) {
    return <StatePanel title="Agent Profiles" message="Could not load live agent profiles" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Chapter 10 · Integrations + Skills</p>
        <h2 className="text-base font-semibold text-foreground">What this layer unlocks</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This section shows the operational outcome of the integrations stack: agent type, readiness, live activity, and skill coverage become visible enough to decide what the system can actually do next.
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
          <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
            <p className="font-medium text-foreground mb-1">Outcome clarity</p>
            <p>GitHub, browser, messaging, and skill surfaces should translate into visible operator capability, not hidden setup.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
            <p className="font-medium text-foreground mb-1">Proof required</p>
            <p>An operator should be able to identify who is ready, what tools they have, and what work they can take immediately.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
            <p className="font-medium text-foreground mb-1">Polish target</p>
            <p>Keep this chapter as a cleaner bridge into execution chapters, not a deeper rewrite tonight.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.agents.map((agent, i) => {
          const ReadinessIcon = readinessIcon[agent.readiness];

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-4xl shrink-0">{agent.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold font-heading text-foreground truncate">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.subtitle}</p>
                  </div>
                </div>
                <Badge className={`${statusBadgeClass[agent.status] || statusBadgeClass.unknown} text-xs`}>
                  {statusLabel[agent.status] || 'Unknown'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={`${readinessBadgeClass[agent.readiness]} text-xs flex items-center gap-1`}>
                  <ReadinessIcon className="h-3.5 w-3.5" />
                  {agent.readinessLabel}
                </Badge>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary/80 flex items-center gap-1">
                  <Radio className="h-3.5 w-3.5" />
                  eval #{agent.evaluationOrder}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded bg-secondary/30">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="text-foreground font-medium break-words">{agent.type}</p>
                </div>
                <div className="p-3 rounded bg-secondary/30">
                  <p className="text-muted-foreground text-xs">Readiness score</p>
                  <p className="text-foreground font-mono font-medium">{agent.accuracy}%</p>
                </div>
                <div className="p-3 rounded bg-secondary/30">
                  <p className="text-muted-foreground text-xs">Sessions</p>
                  <p className="text-foreground font-mono font-medium">{agent.sessionCount}</p>
                </div>
                <div className="p-3 rounded bg-secondary/30">
                  <p className="text-muted-foreground text-xs">Last seen</p>
                  <p className="text-foreground font-medium">{agent.activeAgo}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Role</p>
                  <p className="text-foreground">{agent.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Current activity</p>
                  <p className="text-foreground break-words">{agent.currentActivity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Operator summary</p>
                  <p className="text-foreground break-words">{agent.operatorSummary}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Readiness evidence</p>
                <div className="space-y-2">
                  {agent.signals.map((signal) => (
                    <div key={`${agent.id}-${signal.kind}`} className="rounded-lg border border-border/50 bg-secondary/10 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{signal.label}</span>
                        <Badge className={`${signalBadgeClass[signal.state]} text-[10px] uppercase tracking-wide`}>
                          {signal.state}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground break-words">{signal.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {agent.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs border-primary/20 text-primary/80 break-all">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentProfiles;
