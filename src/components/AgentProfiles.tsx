import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { agents } from '@/data/mockData';

const statusLabel: Record<string, string> = {
  active: 'Online',
  idle: 'Idle',
  error: 'Error',
  offline: 'Offline',
};

const statusBadgeClass: Record<string, string> = {
  active: 'bg-primary/20 text-primary border-primary/30',
  idle: 'bg-warning/20 text-warning border-warning/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
  offline: 'bg-muted text-muted-foreground border-muted',
};

const AgentProfiles = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {agents.map((agent, i) => (
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
            <p className="text-muted-foreground text-xs">Tasks Done</p>
            <p className="text-foreground font-mono font-medium">{agent.tasksCompleted}</p>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <p className="text-muted-foreground text-xs">Accuracy</p>
            <p className="text-foreground font-mono font-medium">{agent.accuracy}%</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs border-primary/20 text-primary/80">{skill}</Badge>
          ))}
        </div>

        <button
          className="mt-auto w-full py-2 px-4 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          View Details
        </button>
      </motion.div>
    ))}
  </div>
);

export default AgentProfiles;
