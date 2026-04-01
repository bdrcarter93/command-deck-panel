import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { MeetingType } from '@/lib/liveData';

const typeStyle: Record<MeetingType, string> = {
  standup: 'bg-primary/20 text-primary border-primary/30',
  sales: 'bg-accent/20 text-accent border-accent/30',
  interview: 'bg-warning/20 text-warning border-warning/30',
  'all-hands': 'bg-primary/20 text-primary border-primary/30',
  '1-on-1': 'bg-muted text-muted-foreground border-muted',
  planning: 'bg-accent/20 text-accent border-accent/30',
  team: 'bg-primary/20 text-primary border-primary/30',
  external: 'bg-warning/20 text-warning border-warning/30',
};

const sentimentColor = {
  positive: 'text-primary',
  neutral: 'text-warning',
  negative: 'text-destructive',
};

const MeetingIntelligence = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Meeting Intelligence" message="Building live runtime review cards…" detail="This panel now derives from status, security, and presence instead of demo meeting data." />;
  }

  if (error || !data) {
    return <StatePanel title="Meeting Intelligence" message="Could not load runtime review cards" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  return (
    <div className="space-y-4">
      {data.meetings.map((meeting, i) => {
        const isExpanded = expanded === meeting.id;
        return (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : meeting.id)}
              className="w-full p-4 flex items-start gap-4 text-left hover:bg-secondary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`text-xs ${typeStyle[meeting.type]}`}>{meeting.type}</Badge>
                  <span className={`text-xs font-medium ${sentimentColor[meeting.sentiment]}`}>{meeting.sentiment}</span>
                  <span className="text-xs text-muted-foreground">{meeting.duration_display}</span>
                </div>
                <h3 className="text-foreground font-medium">{meeting.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{meeting.summary}</p>
              </div>
              {isExpanded ? <ChevronUp size={18} className="text-muted-foreground mt-1" /> : <ChevronDown size={18} className="text-muted-foreground mt-1" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4 border-t border-secondary/30 pt-4">
                    {meeting.action_items.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Action Items</h4>
                        <div className="space-y-2">
                          {meeting.action_items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className={`h-2 w-2 rounded-full ${item.done ? 'bg-primary' : 'bg-warning'}`} />
                              <span className="text-foreground">{item.task}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{item.assignee}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">AI Insight</h4>
                      <p className="text-sm text-muted-foreground">{meeting.ai_insights}</p>
                    </div>

                    {(meeting.fathom_url || meeting.share_url) && (
                      <div className="flex items-center gap-3 text-xs">
                        {meeting.fathom_url && (
                          <a href={meeting.fathom_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            Fathom <ExternalLink size={12} />
                          </a>
                        )}
                        {meeting.share_url && (
                          <a href={meeting.share_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            Share <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MeetingIntelligence;
