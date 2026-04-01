import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

const Council = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Council" message="Building live operator council…" detail="This panel now reflects warnings, security findings, session pressure, and presence events." />;
  }

  if (error || !data) {
    return <StatePanel title="Council" message="Could not load live council state" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  return (
    <div className="space-y-6">
      {data.councilSessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Council Prompt</p>
              <h3 className="text-lg font-bold text-foreground">{session.question}</h3>
            </div>
            <Badge
              className={
                session.status === 'active'
                  ? 'bg-warning/20 text-warning border-warning/30'
                  : session.status === 'completed'
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-muted text-muted-foreground border-muted'
              }
            >
              {session.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            {session.participants.map((participant) => (
              <div key={participant.name} className="rounded-lg bg-secondary/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{participant.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{participant.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {participant.sent}/{participant.limit} messages · {participant.status}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {session.messages.map((message) => (
              <div key={`${session.id}-${message.messageNumber}`} className="rounded-lg bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{message.agentEmoji}</span>
                  <span className="text-sm font-medium text-foreground">{message.agentName}</span>
                  <span className="text-xs text-muted-foreground">#{message.messageNumber}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{message.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{message.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Council;
