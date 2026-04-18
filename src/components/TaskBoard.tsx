import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bot, Calendar, CheckCircle2, ChevronDown, Clock3, Loader2, Plus, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { SubTask, Task, TaskColumn, TaskPriority } from '@/lib/liveData';

const columns: { id: TaskColumn; label: string; accent: string; empty: string }[] = [
  { id: 'todo', label: 'Queued up', accent: 'from-slate-500/30 to-slate-700/10', empty: 'Nothing waiting here.' },
  { id: 'doing', label: 'In motion', accent: 'from-cyan-500/30 to-blue-700/10', empty: 'No active work right now.' },
  { id: 'needs-input', label: 'Needs input', accent: 'from-amber-500/30 to-orange-700/10', empty: 'No decision items waiting.' },
  { id: 'done', label: 'Wrapped', accent: 'from-emerald-500/30 to-green-700/10', empty: 'No completed wins logged yet.' },
];

const priorityTone: Record<TaskPriority, string> = {
  low: 'bg-slate-500/15 text-slate-200 border-slate-400/20',
  medium: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
  high: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
  urgent: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
};

const columnTone: Record<TaskColumn, string> = {
  todo: 'text-slate-300',
  doing: 'text-cyan-300',
  'needs-input': 'text-amber-300',
  done: 'text-emerald-300',
  canceled: 'text-slate-500',
};

const priorityLabel: Record<TaskPriority, string> = {
  low: 'Low pressure',
  medium: 'Worth watching',
  high: 'Needs attention',
  urgent: 'Front of the line',
};

interface DraftTask {
  title: string;
  assignee: string;
  priority: TaskPriority;
  notes: string;
  eta: string;
  status: string;
  subtasks: string[];
}

const defaultDraft: DraftTask = {
  title: '',
  assignee: '',
  priority: 'medium',
  notes: '',
  eta: '',
  status: '',
  subtasks: [''],
};

function percent(task: Task) {
  if (typeof task.progress === 'number') return Math.max(0, Math.min(100, task.progress));
  const total = task.subtasks?.length ?? 0;
  if (!total) return task.column === 'done' ? 100 : 0;
  const complete = task.subtasks?.filter((s) => s.done).length ?? 0;
  return Math.round((complete / total) * 100);
}

function statusText(task: Task, pct: number) {
  if (task.statusText) return task.statusText;
  if (task.column === 'done') return 'Done';
  if (task.column === 'needs-input') return 'Needs input';
  if (task.column === 'canceled') return 'Canceled';
  if (task.column === 'doing') return pct > 65 ? 'Closing in' : 'Actively moving';
  return 'Queued';
}

function nextStep(task: Task) {
  if (task.nextStep) return task.nextStep;
  if (task.column === 'needs-input') return 'Review the current state, make the decision, and unblock the next move.';
  if (task.column === 'doing') return 'Keep shipping the next visible improvement and tighten the details.';
  if (task.column === 'done') return 'Use the finished work to unblock the next decision.';
  if (task.column === 'canceled') return 'Confirm this should stay closed and archive any leftover context.';
  return 'Start the first concrete action and move it into active work.';
}

function blockersText(task: Task) {
  if (task.blockers) return task.blockers;
  if (task.column === 'needs-input') return 'Waiting on operator input or sign-off.';
  if (task.column === 'canceled') return 'Stopped intentionally.';
  return 'No blocker right now.';
}

function whyItMatters(task: Task) {
  return task.impact ?? task.description ?? 'This keeps the operation clearer, faster, and easier to manage.';
}

function whatItHelps(task: Task) {
  return task.helpText ?? task.impact ?? 'It helps the operator decide what to do next without digging.';
}

const TaskCard = ({ task, onToggleSubtask }: { task: Task; onToggleSubtask: (taskId: string, subtaskId: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const pct = percent(task);
  const status = statusText(task, pct);
  const completedSubtasks = task.subtasks?.filter((s) => s.done).length ?? 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <Card className="border-white/10 bg-slate-950/70 backdrop-blur transition hover:border-cyan-400/30">
        <CardContent className="p-4">
          <button className="w-full text-left" onClick={() => setExpanded((v) => !v)}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={priorityTone[task.priority]}>{priorityLabel[task.priority]}</Badge>
                  <Badge variant="outline" className="border-cyan-400/20 bg-cyan-500/10 text-cyan-100">
                    <Bot className="mr-1 h-3 w-3" /> {task.assignee}
                  </Badge>
                  <Badge variant="outline" className={`border-white/10 bg-white/5 ${columnTone[task.column]}`}>{status}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{task.description}</p>
                </div>
              </div>
              <ChevronDown className={`mt-1 h-4 w-4 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Progress</div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="text-sm font-semibold text-white">{pct}%</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">ETA</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-200"><Clock3 className="h-4 w-4 text-cyan-300" /> {task.eta ?? 'Not set yet'}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Next move</div>
                <div className="mt-2 text-sm text-slate-200">{task.nextStepSummary ?? nextStep(task)}</div>
              </div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DetailBlock icon={<Target className="h-4 w-4 text-cyan-300" />} label="What this is" text={task.description} />
                  <DetailBlock icon={<Bot className="h-4 w-4 text-violet-300" />} label="Who is on it" text={task.ownerDetail ?? task.assignee} />
                  <DetailBlock icon={<Sparkles className="h-4 w-4 text-amber-300" />} label="Why it matters" text={whyItMatters(task)} />
                  <DetailBlock icon={<TrendingUp className="h-4 w-4 text-emerald-300" />} label="What it helps" text={whatItHelps(task)} />
                  <DetailBlock icon={<CheckCircle2 className="h-4 w-4 text-cyan-300" />} label="Current status" text={status} />
                  <DetailBlock icon={<Calendar className="h-4 w-4 text-sky-300" />} label="What happens next" text={nextStep(task)} />
                  <DetailBlock icon={<AlertCircle className="h-4 w-4 text-rose-300" />} label="Blockers / waiting items" text={blockersText(task)} />
                  <DetailBlock icon={<Clock3 className="h-4 w-4 text-orange-300" />} label="Decision support" text={task.decisionHelp ?? 'This is the minimum context needed to decide whether to push, review, or unblock it.'} />
                </div>

                {!!task.subtasks?.length && (
                  <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">Checklist</div>
                        <div className="text-xs text-slate-400">{completedSubtasks} of {task.subtasks.length} items complete</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {task.subtasks.map((subtask) => (
                        <button key={subtask.id} onClick={() => onToggleSubtask(task.id, subtask.id)} className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5">
                          {subtask.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <div className="h-4 w-4 rounded-full border border-slate-500" />}
                          <span className={`text-sm ${subtask.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{subtask.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DetailBlock = ({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) => (
  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">{icon}<span>{label}</span></div>
    <p className="mt-2 text-sm leading-6 text-slate-200">{text}</p>
  </div>
);

const TaskBoard = () => {
  const { data, isLoading, error } = useDashboardData();
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<DraftTask>(defaultDraft);

  const tasks = useMemo(() => ([...(data?.initialTasks ?? []), ...customTasks]), [data?.initialTasks, customTasks]);

  useEffect(() => {
    const stored = localStorage.getItem('command-deck-custom-tasks');
    if (stored) {
      try {
        setCustomTasks(JSON.parse(stored));
      } catch {
        setCustomTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('command-deck-custom-tasks', JSON.stringify(customTasks));
  }, [customTasks]);

  const addTask = () => {
    if (!draft.title.trim()) return;
    const subtasks: SubTask[] = draft.subtasks.filter(Boolean).map((title, index) => ({ id: `sub-${Date.now()}-${index}`, title, done: false }));
    const task: Task = {
      id: `custom-${Date.now()}`,
      title: draft.title,
      assignee: draft.assignee || 'Unassigned',
      priority: draft.priority,
      description: draft.notes || 'New operator task.',
      column: 'todo',
      progress: 0,
      eta: draft.eta || 'TBD',
      statusText: draft.status || 'Queued',
      nextStep: 'Pick an owner and start the first concrete action.',
      blockers: 'No blocker logged yet.',
      ownerDetail: draft.assignee || 'Needs an owner',
      decisionHelp: 'This was added manually and still needs a clear next move.',
      subtasks,
    };
    setCustomTasks((prev) => [task, ...prev]);
    setDraft(defaultDraft);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setCustomTasks((prev) => prev.map((task) => task.id !== taskId ? task : {
      ...task,
      subtasks: task.subtasks?.map((sub) => sub.id === subtaskId ? { ...sub, done: !sub.done } : sub),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-300">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading the task board...
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="p-6 text-rose-100">Couldn’t load the task board right now.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-slate-950/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-white">Task board</CardTitle>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">A human-first view of what is moving, who owns it, what matters, and what needs a decision next.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" /> Add task</Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-xl">
              <DialogHeader><DialogTitle>Add a task</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2"><Label>Task title</Label><Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Example: Clean up task board copy" /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Owner</Label><Input value={draft.assignee} onChange={(e) => setDraft((p) => ({ ...p, assignee: e.target.value }))} placeholder="Owen" /></div>
                  <div className="space-y-2"><Label>Priority</Label><Select value={draft.priority} onValueChange={(v: TaskPriority) => setDraft((p) => ({ ...p, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>ETA</Label><Input value={draft.eta} onChange={(e) => setDraft((p) => ({ ...p, eta: e.target.value }))} placeholder="Today" /></div>
                  <div className="space-y-2"><Label>Status</Label><Input value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))} placeholder="Queued" /></div>
                </div>
                <div className="space-y-2"><Label>What this is</Label><Textarea value={draft.notes} onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))} placeholder="Describe the task in plain English." /></div>
                <div className="space-y-2">
                  <Label>Checklist</Label>
                  {draft.subtasks.map((subtask, index) => (
                    <Input key={index} value={subtask} onChange={(e) => setDraft((p) => ({ ...p, subtasks: p.subtasks.map((item, i) => i === index ? e.target.value : item) }))} placeholder={`Checklist item ${index + 1}`} />
                  ))}
                  <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setDraft((p) => ({ ...p, subtasks: [...p.subtasks, ''] }))}>Add checklist item</Button>
                </div>
                <Button onClick={addTask} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Save task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter((task) => task.column === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${col.accent} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{col.label}</div>
                    <div className="text-xs text-slate-300">{columnTasks.length} task{columnTasks.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {columnTasks.map((task) => <TaskCard key={task.id} task={task} onToggleSubtask={toggleSubtask} />)}
                </AnimatePresence>
                {!columnTasks.length && <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">{col.empty}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
