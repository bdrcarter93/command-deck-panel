import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logEntries, LogCategory } from '@/data/mockData';

const categoryStyle: Record<LogCategory, string> = {
  observation: 'bg-primary/20 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-muted',
  reminder: 'bg-warning/20 text-warning border-warning/30',
  fyi: 'bg-accent/20 text-accent border-accent/30',
};

const AILog = () => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? logEntries : logEntries.filter((e) => e.category === filter);

  return (
    <div className="space-y-4">
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
