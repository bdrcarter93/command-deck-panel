import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { agents, recentActivity } from '@/data/mockData';

const metrics = [
  { label: 'Tasks Completed', value: 787, icon: CheckCircle2, color: 'text-primary' },
  { label: 'Active Agents', value: 2, icon: Zap, color: 'text-accent' },
  { label: 'Warnings', value: 3, icon: AlertTriangle, color: 'text-warning' },
  { label: 'Avg Response', value: 1.2, suffix: 's', icon: Clock, color: 'text-muted-foreground' },
];

const CountUp = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{Number.isInteger(target) ? Math.round(count) : count.toFixed(1)}{suffix}</span>;
};

const statusColor: Record<string, string> = {
  active: 'bg-primary',
  idle: 'bg-warning',
  error: 'bg-destructive',
  offline: 'bg-muted-foreground',
};

const CommandDeck = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <m.icon size={20} className={m.color} />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-foreground">
            <CountUp target={m.value} suffix={m.suffix} />
          </p>
          <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-3 glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</h3>
        <ScrollArea className="h-[320px]">
          <div className="space-y-3 pr-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className="text-lg">{item.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.agentName} · {item.timestamp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2 glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Agent Status</h3>
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <span className={`relative flex h-2 w-2`}>
                      {agent.status === 'active' && (
                        <span className={`animate-pulse-dot absolute inline-flex h-full w-full rounded-full ${statusColor[agent.status]} opacity-75`} />
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor[agent.status]}`} />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{agent.currentActivity}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{agent.lastSeen}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default CommandDeck;
