import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

const statusLabel: Record<string, string> = {
  active: 'Online',
  idle: 'Idle',
  error: 'Error',
  offline: 'Unconfigured',
};

const statusBadgeClass: Record<string, string> = {
  active: 'bg-primary/20 text-primary border-primary/30',
  idle: 'bg-warning/20 text-warning border-warning/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
  offline: 'bg-muted text-muted-foreground border-muted',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.agents.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-hover p-6 flex flex-col"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{agent.emoji}</span>
              <div>
                <h3 className="text-lg font-bold font-heading text-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.subtitle}</p>
              </div>
            </div>
            <Badge className={`${statusBadgeClass[agent.status]} text-xs`}>{statusLabel[agent.status]}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="p-2 rounded bg-secondary/30">
              <p className="text-muted-foreground text-xs">Type</p>
              <p className="text-foreground font-medium">{agent.type}</p>
            </div>
            <div className="p-2 rounded bg-secondary/30">
              <p className="text-muted-foreground text-xs">Role</p>
              <p className="text-foreground font-medium">{agent.role}</p>
            </div>
            <div className="p-2 rounded bg-secondary/30">
              <p className="text-muted-foreground text-xs">Sessions</p>
              <p className="text-foreground font-mono font-medium">{agent.sessionCount}</p>
            </div>
            <div className="p-2 rounded bg-secondary/30">
              <p className="text-muted-foreground text-xs">Health Score</p>
              <p className="text-foreground font-mono font-medium">{agent.accuracy}%</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs border-primary/20 text-primary/80">{skill}</Badge>
            ))}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground mb-4">
            <p><span className="text-foreground">Current:</span> {agent.currentActivity}</p>
            <p><span className="text-foreground">Last seen:</span> {agent.activeAgo}</p>
          </div>

          <div className="mt-auto p-3 rounded-lg bg-secondary/20 text-xs text-muted-foreground">
            {agent.status === 'offline'
              ? 'This domain remains visibly unconfigured instead of being padded with fake demo output.'
              : `Live runtime-backed profile for ${agent.name}.`}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AgentProfiles;
