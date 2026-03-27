import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Check, Clock, MessageSquare } from 'lucide-react';
import { councilSessions } from '@/data/mockData';

const statusBadge: Record<string, string> = {
  active: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/20 text-warning border-warning/30',
};

const participantStatusIcon: Record<string, React.ReactNode> = {
  done: <Check size={12} className="text-primary" />,
  pending: <Clock size={12} className="text-warning" />,
  active: <MessageSquare size={12} className="text-accent" />,
};

const Council = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {councilSessions.map((session, si) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
            className="w-full p-5 flex items-start gap-4 text-left hover:bg-secondary/20 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`text-xs ${statusBadge[session.status]}`}>{session.status}</Badge>
              </div>
              <h3 className="text-foreground font-medium mb-3">{session.question}</h3>
              <div className="flex flex-wrap gap-2">
                {session.participants.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/30 text-xs">
                    <span>{p.emoji}</span>
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="text-muted-foreground font-mono">{p.sent}/{p.limit}</span>
                    {participantStatusIcon[p.status]}
                  </div>
                ))}
              </div>
            </div>
            {expanded === session.id ? <ChevronUp size={18} className="text-muted-foreground mt-1" /> : <ChevronDown size={18} className="text-muted-foreground mt-1" />}
          </button>

          <AnimatePresence>
            {expanded === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-secondary/30 pt-4">
                  {session.messages.map((msg, mi) => (
                    <motion.div
                      key={mi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20"
                    >
                      <span className="text-lg">{msg.agentEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{msg.agentName}</span>
                          <span className="text-xs text-muted-foreground font-mono">#{msg.messageNumber}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default Council;
