import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Task, TaskColumn, TaskPriority } from '@/lib/liveData';

const columns: { id: TaskColumn; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'doing', label: 'Doing' },
  { id: 'needs-input', label: 'Needs Input' },
  { id: 'done', label: 'Done' },
];

const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-muted-foreground',
  medium: 'bg-warning',
  high: 'bg-destructive',
  urgent: 'bg-destructive animate-pulse-dot',
};

const TaskBoard = () => {
  const { data, isLoading, error } = useDashboardData();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, TaskColumn>>({});

  if (isLoading) {
    return <StatePanel title="Task Board" message="Building live operator task board…" detail="Derived from status, security findings, explicit warnings, and current sessions." />;
  }

  if (error || !data) {
    return <StatePanel title="Task Board" message="Could not build live task board" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  const tasks: Task[] = data.initialTasks.map((task) => ({
    ...task,
    column: overrides[task.id] ?? task.column,
  }));

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);

  const handleDrop = (column: TaskColumn) => {
    if (!draggedTask) return;
    setOverrides((prev) => ({ ...prev, [draggedTask]: column }));
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((col, ci) => (
        <motion.div
          key={col.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.08 }}
          className="glass-card p-4 min-w-[250px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</h3>
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
              {tasks.filter((t) => t.column === col.id).length}
            </Badge>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-2">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task, ti) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ci * 0.08 + ti * 0.05 }}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] border border-transparent hover:border-primary/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground font-medium">{task.title}</p>
                      <span className="text-lg">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
                      <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                      {task.progress !== undefined && (
                        <div className="flex-1 ml-2">
                          <div className="h-1 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </ScrollArea>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskBoard;
