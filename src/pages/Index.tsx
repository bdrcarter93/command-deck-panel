import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BadgeDollarSign,
  Bot,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  Filter,
  LayoutGrid,
  ListFilter,
  MessageSquareMore,
  MonitorCog,
  Radar,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import AgentDeskMap from '@/components/AgentDeskMap';
import { useAgentHQData } from '@/hooks/useAgentHQData';
import { cn } from '@/lib/utils';
import type {
  AgentRosterItem,
  BrainItem,
  CalendarEntry,
  ChatEntry,
  CollectionQueueItem,
  DepartmentJob,
  FeedEntry,
  FinancialMetric,
  KanbanTask,
  RadarSignal,
  TaskPriority,
  TaskStatus,
} from '@/lib/agentHq';

const columns: { key: TaskStatus; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

type ViewMode = 'board' | 'calendar' | 'desks' | 'money' | 'departments' | 'brain' | 'radar';
type FilterValue = 'all' | TaskStatus | TaskPriority | string;

const priorityTone: Record<TaskPriority, string> = {
  high: 'border-rose-400/30 bg-rose-400/15 text-rose-200',
  medium: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
  low: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
};

const statusTone: Record<AgentRosterItem['status'], string> = {
  working: 'bg-emerald-400',
  idle: 'bg-slate-400',
  review: 'bg-amber-400',
  blocked: 'bg-rose-400',
  offline: 'bg-slate-600',
};

const calendarTypeTone: Record<CalendarEntry['type'], string> = {
  task: 'border-[#75b7ff44] bg-[#75b7ff1a] text-[#cfe6ff]',
  event: 'border-[#f1ae7844] bg-[#f1ae7817] text-[#ffe1c8]',
  appointment: 'border-[#9b8cff44] bg-[#9b8cff17] text-[#ddd8ff]',
};

const calendarStatusTone: Record<CalendarEntry['status'], string> = {
  scheduled: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  'in-progress': 'border-[#75b7ff44] bg-[#75b7ff17] text-[#cfe6ff]',
  done: 'border-slate-400/25 bg-slate-400/10 text-slate-200',
  tentative: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
};

const moneyTone: Record<FinancialMetric['tone'], string> = {
  good: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  watch: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  risk: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  neutral: 'border-[#75b7ff33] bg-[#75b7ff12] text-[#cfe6ff]',
};

const radarTone: Record<RadarSignal['tone'], string> = {
  good: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  watch: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  risk: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  neutral: 'border-[#75b7ff33] bg-[#75b7ff12] text-[#cfe6ff]',
};

const collectionTone: Record<CollectionQueueItem['status'], string> = {
  'on-track': 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  watch: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  late: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
};

const businessTone: Record<DepartmentJob['business'], string> = {
  RD: 'border-[#75b7ff44] bg-[#75b7ff1a] text-[#cfe6ff]',
  BD: 'border-[#f1ae7844] bg-[#f1ae7817] text-[#ffe1c8]',
};

const riskTone: Record<DepartmentJob['risk'], string> = {
  low: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  medium: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  high: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
};

const brainTone: Record<BrainItem['type'], string> = {
  memory: 'border-[#75b7ff33] bg-[#75b7ff12] text-[#cfe6ff]',
  decision: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  playbook: 'border-[#f1ae7844] bg-[#f1ae7817] text-[#ffe1c8]',
  question: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
};

const freshnessTone: Record<BrainItem['freshness'], string> = {
  fresh: 'text-emerald-200',
  aging: 'text-amber-100',
  stale: 'text-slate-400',
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatCalendarDay(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mission-panel rounded-[26px] px-4 py-3 text-right">
      <div className="mission-label flex items-center justify-end gap-2 text-[11px]">
        <Clock3 className="h-4 w-4 text-[#75b7ff]" />
        System clock
      </div>
      <div className="mission-stat mt-1 text-lg font-semibold">
        {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-xs text-slate-500">{now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
    </div>
  );
}

function StatCard({ label, value, accent, icon: Icon }: { label: string; value: number; accent: string; icon: typeof Users }) {
  return (
    <div className="mission-panel rounded-[26px] px-4 py-3">
      <div className="mission-label flex items-center justify-between gap-3 text-[11px]">
        <span>{label}</span>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="mission-stat mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: KanbanTask; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mission-panel-soft w-full rounded-[22px] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#8ec7ff66]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{task.title}</div>
          <div className="mt-1 text-xs text-slate-400">{task.assignee}</div>
        </div>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', priorityTone[task.priority])}>{task.priority}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{task.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Updated {formatTimestamp(task.timestamps.updatedAt)}</span>
        <span className="flex items-center gap-1 text-[#8ebeff]">
          Details
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  return (
    <div className="mission-panel-soft rounded-[22px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#f1ae78]">{entry.agent}</div>
        <span className={cn('rounded-full border px-2 py-1 text-[10px] font-medium uppercase', priorityTone[entry.priority])}>{entry.priority}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{entry.message}</p>
      <div className="mt-3 text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</div>
    </div>
  );
}

function ChatRow({ message }: { message: ChatEntry }) {
  const tone =
    message.type === 'alert'
      ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
      : message.type === 'task'
        ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
        : message.type === 'system'
          ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100'
          : 'border-white/10 bg-white/5 text-slate-100';

  return (
    <div className="mission-panel-soft rounded-[22px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#f1ae78]">{message.agent}</div>
        <span className={cn('rounded-full border px-2 py-1 text-[10px] font-medium uppercase', tone)}>{message.type}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{message.message}</p>
      <div className="mt-3 text-xs text-slate-500">{formatTimestamp(message.timestamp)}</div>
    </div>
  );
}

function CalendarCard({ entry, linkedTask }: { entry: CalendarEntry; linkedTask?: KanbanTask }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{entry.title}</div>
          <div className="mt-1 text-xs text-slate-400">
            {formatCalendarDay(entry.startAt)} • {formatTimeRange(entry.startAt, entry.endAt)}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', calendarTypeTone[entry.type])}>{entry.type}</span>
          <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', calendarStatusTone[entry.status])}>{entry.status.replace('-', ' ')}</span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{entry.description}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[20px] border border-white/8 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Owner</div>
          <div className="mt-1 font-medium text-[#cfe6ff]">{entry.owner}</div>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Location</div>
          <div className="mt-1 font-medium text-[#cfe6ff]">{entry.location ?? 'Not set'}</div>
        </div>
      </div>

      {linkedTask && (
        <div className="mt-4 rounded-[20px] border border-[#75b7ff22] bg-[#75b7ff0f] px-3 py-3 text-sm text-slate-300">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Linked task</div>
          <div className="mt-1 font-medium text-[#f1ae78]">{linkedTask.title}</div>
          <div className="mt-1 text-xs text-slate-400">{linkedTask.assignee} • {linkedTask.status.replace('-', ' ')}</div>
        </div>
      )}
    </div>
  );
}

function FinancialCard({ metric }: { metric: FinancialMetric }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{metric.label}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{metric.value}</div>
        </div>
        <div className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase', moneyTone[metric.tone])}>{metric.tone}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{metric.detail}</p>
      <div className="mt-3 text-xs text-slate-500">Trend: {metric.trend}</div>
    </div>
  );
}

function CollectionRow({ item }: { item: CollectionQueueItem }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{item.customer}</div>
          <div className="mt-1 text-xs text-slate-400">{item.stage} • {item.owner}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-white">{formatCurrency(item.amount)}</div>
          <div className={cn('mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', collectionTone[item.status])}>{item.status.replace('-', ' ')}</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{item.notes}</p>
      <div className="mt-3 text-xs text-slate-500">Due {formatTimestamp(item.dueAt)}</div>
    </div>
  );
}

function DepartmentCard({ job }: { job: DepartmentJob }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase', businessTone[job.business])}>{job.business}</span>
            <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', riskTone[job.risk])}>{job.risk}</span>
          </div>
          <div className="mt-3 text-lg font-semibold text-[#f1ae78]">{job.customer}</div>
          <div className="mt-1 text-sm text-slate-400">{job.market} • {job.workType}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-white">{formatCurrency(job.value)}</div>
          <div className="mt-1 text-xs text-slate-500">{job.owner}</div>
        </div>
      </div>
      <div className="mt-4 rounded-[20px] border border-white/8 bg-slate-950/30 px-3 py-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Current stage</div>
        <div className="mt-1 text-sm font-medium text-[#cfe6ff]">{job.stage}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{job.nextAction}</p>
    </div>
  );
}

function BrainCard({ item }: { item: BrainItem }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{item.title}</div>
          <div className="mt-1 text-xs text-slate-400">{item.owner} • {item.source}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', brainTone[item.type])}>{item.type}</span>
          <span className={cn('text-xs uppercase tracking-[0.2em]', freshnessTone[item.freshness])}>{item.freshness}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
    </div>
  );
}

function RadarCard({ signal }: { signal: RadarSignal }) {
  return (
    <div className="mission-panel-soft rounded-[24px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#f1ae78]">{signal.label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{signal.value}</div>
        </div>
        <div className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase', radarTone[signal.tone])}>{signal.tone}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{signal.detail}</p>
    </div>
  );
}

const Index = () => {
  const { data, isLoading, error } = useAgentHQData();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<FilterValue>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterValue>('all');
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const agents = data?.agents ?? [];
  const tasks = data?.tasks ?? [];
  const feed = data?.feed ?? [];
  const chat = data?.chat ?? [];
  const calendar = data?.calendar ?? [];
  const financialMetrics = data?.financialMetrics ?? [];
  const collections = data?.collections ?? [];
  const departmentJobs = data?.departmentJobs ?? [];
  const brain = data?.brain ?? [];
  const radar = data?.radar ?? [];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, assigneeFilter, priorityFilter]);

  const tasksByColumn = useMemo(
    () =>
      columns.reduce<Record<TaskStatus, KanbanTask[]>>((acc, column) => {
        acc[column.key] = filteredTasks.filter((task) => task.status === column.key);
        return acc;
      }, { assigned: [], 'in-progress': [], review: [], done: [] }),
    [filteredTasks],
  );

  const activeAgents = agents.filter((agent) => agent.status === 'working').length;
  const queueCount = tasks.filter((task) => task.status !== 'done').length;
  const upcomingCount = calendar.filter((entry) => new Date(entry.endAt) >= new Date()).length;
  const atRiskJobs = departmentJobs.filter((job) => job.risk === 'high').length;
  const collectionExposure = collections.reduce((sum, item) => sum + item.amount, 0);

  const calendarGroups = useMemo(() => {
    return calendar.reduce<Record<string, CalendarEntry[]>>((acc, entry) => {
      const key = new Date(entry.startAt).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [calendar]);

  const groupedCalendarEntries = useMemo(() => {
    return Object.entries(calendarGroups)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([dayKey, entries]) => ({
        dayKey,
        label: formatCalendarDay(entries[0].startAt),
        entries: [...entries].sort((a, b) => a.startAt.localeCompare(b.startAt)),
      }));
  }, [calendarGroups]);

  return (
    <div className="mission-shell min-h-screen text-white">
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mission-panel mb-6 rounded-[30px] p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mission-label flex items-center gap-2 text-[11px]">
                <Sparkles className="h-4 w-4 text-[#75b7ff]" />
                System nominal
              </div>
              <h1 className="mission-heading mt-2 text-4xl font-semibold">MISSION CONTROL</h1>
              <p className="mission-subtext mt-2 max-w-3xl text-sm leading-6">
                Live operator control with kanban management, desk visualization, money radar, department lanes, memory signals, and tactical chat grounded in current Roofing and Build Doctors patterns.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <StatCard label="Agent count" value={agents.length} accent="#69b0ff" icon={Users} />
              <StatCard label="Tasks in queue" value={queueCount} accent="#f59e0b" icon={LayoutGrid} />
              <StatCard label="Active agents" value={activeAgents} accent="#75b7ff" icon={Bot} />
              <StatCard label="Scheduled items" value={upcomingCount} accent="#c084fc" icon={CalendarDays} />
              <StatCard label="At-risk jobs" value={atRiskJobs} accent="#fb7185" icon={Radar} />
              <LiveClock />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <div className="mission-panel rounded-[28px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="mission-label text-[11px]">Operator roster</div>
                  <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Active desks</div>
                </div>
                <Users className="h-5 w-5 text-[#75b7ff]" />
              </div>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="mission-panel-soft rounded-[22px] p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full shadow-[0_0_12px_rgba(117,183,255,0.35)]" style={{ backgroundColor: agent.color }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate font-medium text-[#f1ae78]">{agent.name}</div>
                          <span className={cn('h-2.5 w-2.5 rounded-full', statusTone[agent.status])} />
                        </div>
                        <div className="text-sm text-slate-400">{agent.role}</div>
                        <div className="mt-2 text-sm leading-6 text-slate-300">{agent.currentTask}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mission-panel rounded-[28px] p-4">
              <div className="mission-label mb-3 text-[11px]">View mode</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'board', label: 'Kanban', icon: LayoutGrid },
                  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
                  { key: 'desks', label: 'Desk view', icon: MonitorCog },
                  { key: 'money', label: 'Money', icon: BadgeDollarSign },
                  { key: 'departments', label: 'Departments', icon: Users },
                  { key: 'brain', label: 'Brain', icon: Brain },
                  { key: 'radar', label: 'Radar', icon: Radar },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as ViewMode)}
                    className={cn(
                      'rounded-2xl border px-3 py-3 text-sm font-medium transition',
                      viewMode === key
                        ? 'mission-button border-[#8ec7ff66] text-[#f6bf8f]'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-[#8ec7ff40]',
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <div className="mission-panel rounded-[28px] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mission-label text-[11px]">Filters</div>
                  <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Tactical controls</div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <label className="mission-button flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-300">
                    <ListFilter className="h-4 w-4 text-[#75b7ff]" />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent outline-none">
                      <option value="all">All status</option>
                      {columns.map((column) => (
                        <option key={column.key} value={column.key} className="bg-slate-950 text-white">{column.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="mission-button flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-300">
                    <Users className="h-4 w-4 text-[#75b7ff]" />
                    <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="bg-transparent outline-none">
                      <option value="all">All assignees</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.name} className="bg-slate-950 text-white">{agent.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="mission-button flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-300">
                    <Filter className="h-4 w-4 text-[#75b7ff]" />
                    <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="bg-transparent outline-none">
                      <option value="all">All priority</option>
                      {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                        <option key={priority} value={priority} className="bg-slate-950 text-white">{priority}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="mission-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-[#f6bf8f] transition"
                  >
                    <MessageSquareMore className="h-4 w-4 text-[#75b7ff]" />
                    Open chat panel
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'board' ? (
              <div className="grid gap-4 xl:grid-cols-4">
                {columns.map((column) => (
                  <div key={column.key} className="mission-panel rounded-[28px] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="mission-label text-[11px]">Lane</div>
                        <div className="mt-1 text-lg font-semibold text-[#f1ae78]">{column.label}</div>
                      </div>
                      <div className="mission-button rounded-full px-3 py-1 text-xs text-[#8ebeff]">{tasksByColumn[column.key].length}</div>
                    </div>
                    <div className="space-y-3">
                      {tasksByColumn[column.key].map((task) => (
                        <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                      ))}
                      {tasksByColumn[column.key].length === 0 && (
                        <div className="rounded-[22px] border border-dashed border-[#78b2ff33] bg-slate-950/30 p-4 text-sm text-slate-500">No tasks match the current filters.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'calendar' ? (
              <div className="mission-panel rounded-[28px] p-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mission-label text-[11px]">Calendar</div>
                    <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Scheduled work, events, and appointments</div>
                  </div>
                  <div className="mission-button rounded-2xl px-4 py-2 text-sm text-[#cfe6ff]">
                    {upcomingCount} upcoming item{upcomingCount === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="space-y-5">
                  {groupedCalendarEntries.map((group) => (
                    <section key={group.dayKey} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{group.label}</div>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {group.entries.map((entry) => (
                          <CalendarCard
                            key={entry.id}
                            entry={entry}
                            linkedTask={entry.linkedTaskId ? tasks.find((task) => task.id === entry.linkedTaskId) : undefined}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  {groupedCalendarEntries.length === 0 && (
                    <div className="rounded-[22px] border border-dashed border-[#78b2ff33] bg-slate-950/30 p-4 text-sm text-slate-500">
                      No scheduled items yet. Add events to <code>public/data/calendar.json</code> to populate the calendar.
                    </div>
                  )}
                </div>
              </div>
            ) : viewMode === 'desks' ? (
              <AgentDeskMap agents={agents} tasks={tasks} feed={feed} />
            ) : viewMode === 'money' ? (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-4">
                  {financialMetrics.map((metric) => (
                    <FinancialCard key={metric.id} metric={metric} />
                  ))}
                </div>
                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="mission-label text-[11px]">Collections</div>
                        <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Recovery queue</div>
                      </div>
                      <div className="mission-button rounded-2xl px-4 py-2 text-sm text-[#cfe6ff]">{formatCurrency(collectionExposure)}</div>
                    </div>
                    <div className="space-y-3">
                      {collections.map((item) => (
                        <CollectionRow key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mission-label text-[11px]">Read on the board</div>
                    <div className="mt-1 text-lg font-semibold text-[#f1ae78]">What the live sample says</div>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Carlos Acosta is the cleanest visible near-term cash lane. The job is far enough along that the remaining work feels administrative rather than sales-risk heavy.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Elizabeth Seidell is the opposite. The signed appraisal demand means the paperwork exists, but the job still depends on advancing communication and production prep without drift.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Ken Humphreys and Vivian Harris expose the softer leak. Inspection-stage work can hold real signal, quotes, and history while still lacking enough task structure to protect follow-up.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === 'departments' ? (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  {departmentJobs.map((job) => (
                    <DepartmentCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            ) : viewMode === 'brain' ? (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="mission-label text-[11px]">Operational memory</div>
                        <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Working intelligence</div>
                      </div>
                      <Brain className="h-5 w-5 text-[#75b7ff]" />
                    </div>
                    <div className="space-y-3">
                      {brain.map((item) => (
                        <BrainCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mission-label text-[11px]">What should persist</div>
                    <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Signal worth keeping</div>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        The insurance contract model is a process asset, not just a file. It encodes deductible-led positioning, supplement handling, and cancellation protection.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Appraisal lanes should not be treated as paperwork problems once the demand is already signed. From there, the pressure shifts to communication cadence and movement rules.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Inspection-stage jobs need deterministic next-step ownership, especially when a quote already exists. Otherwise the system quietly relies on human memory instead of infrastructure.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="mission-label text-[11px]">Command radar</div>
                        <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Heat map</div>
                      </div>
                      <Radar className="h-5 w-5 text-[#75b7ff]" />
                    </div>
                    <div className="space-y-3">
                      {radar.map((signal) => (
                        <RadarCard key={signal.id} signal={signal} />
                      ))}
                    </div>
                  </div>
                  <div className="mission-panel rounded-[28px] p-4">
                    <div className="mission-label text-[11px]">Operator summary</div>
                    <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Current directional read</div>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Roof Doctors currently shows the healthiest visible money lane in Carlos, the heaviest decision lane in Elizabeth, and the clearest task-discipline issue in the inspection jobs.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        Build Doctors style inspection work is where silent leakage happens first. It has lower ticket values but a higher tendency to disappear without structured follow-up or salvage logic.
                      </div>
                      <div className="mission-panel-soft rounded-[22px] p-4">
                        The deck should bias operator attention toward three things: finish cash-ready closeouts, actively shepherd appraisal movement, and prevent inspection leads from dying quietly between visit, quote, and next action.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-4">
            <div className="mission-panel rounded-[28px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="mission-label text-[11px]">System telemetry</div>
                  <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Activity feed</div>
                </div>
                <Activity className="h-5 w-5 text-[#75b7ff]" />
              </div>
              <div className="space-y-3">
                {feed.map((entry) => (
                  <FeedRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              className="mission-panel fixed right-4 top-4 z-20 h-[calc(100vh-2rem)] w-full max-w-xl rounded-[30px] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mission-label text-[11px]">Task detail</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#f1ae78]">{selectedTask.title}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', priorityTone[selectedTask.priority])}>{selectedTask.priority}</span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">{selectedTask.status.replace('-', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="mission-button rounded-2xl p-2 text-slate-300 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5 text-sm text-slate-300">
                <div className="mission-panel-soft rounded-[24px] p-4 leading-7">{selectedTask.description}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="mission-panel-soft rounded-[24px] p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Assignee</div>
                    <div className="mt-2 text-base font-medium text-[#f1ae78]">{selectedTask.assignee}</div>
                  </div>
                  <div className="mission-panel-soft rounded-[24px] p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Updated</div>
                    <div className="mt-2 text-base font-medium text-[#f1ae78]">{formatTimestamp(selectedTask.timestamps.updatedAt)}</div>
                  </div>
                  <div className="mission-panel-soft rounded-[24px] p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Created</div>
                    <div className="mt-2 text-base font-medium text-[#f1ae78]">{formatTimestamp(selectedTask.timestamps.createdAt)}</div>
                  </div>
                  <div className="mission-panel-soft rounded-[24px] p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Completed</div>
                    <div className="mt-2 text-base font-medium text-[#f1ae78]">{selectedTask.timestamps.completedAt ? formatTimestamp(selectedTask.timestamps.completedAt) : 'Not yet'}</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="mission-panel fixed right-0 top-0 z-40 flex h-screen w-full max-w-lg flex-col rounded-l-[30px] p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mission-label text-[11px]">Live messages</div>
                  <div className="mt-1 text-2xl font-semibold text-[#f1ae78]">Agent chat panel</div>
                  <div className="mt-2 text-sm text-slate-400">Messages refresh from `chat.json` every 30 seconds.</div>
                </div>
                <button onClick={() => setChatOpen(false)} className="mission-button rounded-2xl p-2 text-slate-300 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {chat.map((message) => (
                  <ChatRow key={message.id} message={message} />
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {(isLoading || error) && (
        <div className="mission-panel fixed bottom-4 left-4 rounded-2xl px-4 py-3 text-sm text-slate-300">
          {error ? 'Using local fallback JSON after a data load issue.' : 'Refreshing dashboard data...'}
        </div>
      )}
    </div>
  );
};

export default Index;
