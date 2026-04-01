import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Radio, AlertTriangle, Cpu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

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

const CommandDeck = () => {
  const { data, isLoading, error } = useDashboardData();

  const metrics = useMemo(() => {
    const liveSessions = data?.sessions.length ?? 0;
    const criticalFindings = data?.securityIssues.filter((issue) => issue.severity === 'critical').length ?? 0;
    const warnings = data?.meta.warnings.length ?? 0;
    const presenceSignals = data?.presence.length ?? 0;

    return [
      { label: 'Recent Sessions', value: liveSessions, icon: Cpu, color: 'text-primary' },
      { label: 'Presence Signals', value: presenceSignals, icon: Radio, color: 'text-accent' },
      { label: 'Warnings', value: warnings, icon: AlertTriangle, color: 'text-warning' },
      { label: 'Critical Findings', value: criticalFindings, icon: ShieldAlert, color: 'text-destructive' },
    ];
  }, [data]);

  if (isLoading) {
    return <StatePanel title="Command Deck" message="Loading live OpenClaw data…" detail="Fetching health, status, presence, sessions, and logs from the local bridge." />;
  }

  if (error || !data) {
    return <StatePanel title="Command Deck" message="Live bridge unavailable" detail={error instanceof Error ? error.message : 'Unable to load dashboard data.'} />;
  }

  return (
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

      {(data.meta.warnings.length > 0 || data.summary.channels.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatePanel
            title="Live Warnings"
            message={data.meta.warnings[0] || 'No active warnings'}
            detail={
              data.meta.warnings.length > 1
                ? `${data.meta.warnings.length - 1} more warning(s) present.`
                : 'Explicit warnings are sourced from status, health, and recent logs.'
            }
          />
          <StatePanel
            title="Channel Status"
            message={data.summary.channels[0] || 'No channel information returned'}
            detail={data.summary.channels.slice(1).join(' · ') || data.summary.gateway}
          />
        </div>
      )}

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
              {data.recentActivity.map((item, i) => (
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
            {data.agents.map((agent, i) => (
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
                      <span className="relative flex h-2 w-2">
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
};

export default CommandDeck;
