export type AgentWorkStatus = 'working' | 'idle' | 'review' | 'blocked' | 'offline';
export type TaskStatus = 'assigned' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ChatMessageType = 'update' | 'alert' | 'task' | 'system';
export type CalendarEntryType = 'task' | 'event' | 'appointment';
export type CalendarEntryStatus = 'scheduled' | 'in-progress' | 'done' | 'tentative';
export type FinancialTone = 'good' | 'watch' | 'risk' | 'neutral';
export type FinancialTrend = 'up' | 'down' | 'flat';
export type CollectionStatus = 'on-track' | 'watch' | 'late';
export type BusinessUnit = 'RD' | 'BD';
export type JobRisk = 'low' | 'medium' | 'high';
export type BrainItemType = 'memory' | 'decision' | 'playbook' | 'question';
export type BrainFreshness = 'fresh' | 'aging' | 'stale';

export interface AgentRosterItem {
  id: string;
  name: string;
  role: string;
  status: AgentWorkStatus;
  color: string;
  currentTask: string;
}

export interface TaskTimestamps {
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  priority: TaskPriority;
  timestamps: TaskTimestamps;
}

export interface FeedEntry {
  id: string;
  agent: string;
  message: string;
  priority: TaskPriority;
  timestamp: string;
}

export interface ChatEntry {
  id: string;
  agent: string;
  message: string;
  type: ChatMessageType;
  timestamp: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  type: CalendarEntryType;
  status: CalendarEntryStatus;
  startAt: string;
  endAt: string;
  owner: string;
  description: string;
  location?: string;
  linkedTaskId?: string;
}

export interface FinancialMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: FinancialTone;
  trend: FinancialTrend;
}

export interface CollectionQueueItem {
  id: string;
  customer: string;
  stage: string;
  amount: number;
  owner: string;
  dueAt: string;
  status: CollectionStatus;
  notes: string;
}

export interface DepartmentJob {
  id: string;
  business: BusinessUnit;
  customer: string;
  market: string;
  workType: string;
  stage: string;
  owner: string;
  value: number;
  nextAction: string;
  risk: JobRisk;
}

export interface BrainItem {
  id: string;
  type: BrainItemType;
  title: string;
  summary: string;
  owner: string;
  source: string;
  freshness: BrainFreshness;
}

export interface RadarSignal {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: FinancialTone;
}

export interface AgentHQData {
  agents: AgentRosterItem[];
  tasks: KanbanTask[];
  feed: FeedEntry[];
  chat: ChatEntry[];
  calendar: CalendarEntry[];
  financialMetrics: FinancialMetric[];
  collections: CollectionQueueItem[];
  departmentJobs: DepartmentJob[];
  brain: BrainItem[];
  radar: RadarSignal[];
}

export const taskStatusOrder: TaskStatus[] = ['assigned', 'in-progress', 'review', 'done'];

const fallbackData: AgentHQData = {
  agents: [
    {
      id: 'main',
      name: 'Main',
      role: 'Chief of Staff',
      status: 'working',
      color: '#10b981',
      currentTask: 'Direct priority routing and operator escalation',
    },
    {
      id: 'builder',
      name: 'Builder',
      role: 'Implementation Engineer',
      status: 'working',
      color: '#38bdf8',
      currentTask: 'Ship interface updates and verify local builds',
    },
    {
      id: 'ops',
      name: 'Ops',
      role: 'Operations Lead',
      status: 'idle',
      color: '#a78bfa',
      currentTask: 'Monitor automation health and queue pressure',
    },
    {
      id: 'deep',
      name: 'Deep',
      role: 'Research Analyst',
      status: 'review',
      color: '#f59e0b',
      currentTask: 'Prepare ranked findings for review',
    },
    {
      id: 'guardian',
      name: 'Guardian',
      role: 'QA and Review',
      status: 'idle',
      color: '#fb7185',
      currentTask: 'Hold final review and escalation cover',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Finalize operator routing rules',
      description: 'Lock the latest intake logic, owner paths, and escalation triggers before the next live test.',
      status: 'assigned',
      assignee: 'Main',
      priority: 'high',
      timestamps: {
        createdAt: '2026-04-19T18:10:00.000Z',
        updatedAt: '2026-04-19T18:20:00.000Z',
      },
    },
    {
      id: 'task-2',
      title: 'Build AI HQ dashboard shell',
      description: 'Ship the three-column dashboard, desk view, sliding chat, and local JSON refresh loop.',
      status: 'in-progress',
      assignee: 'Builder',
      priority: 'high',
      timestamps: {
        createdAt: '2026-04-19T18:05:00.000Z',
        updatedAt: '2026-04-19T18:35:00.000Z',
        startedAt: '2026-04-19T18:08:00.000Z',
      },
    },
    {
      id: 'task-3',
      title: 'Audit live bridge degradation notes',
      description: 'Confirm warning copy and fallback behavior stay honest while dashboards remain readable.',
      status: 'review',
      assignee: 'Guardian',
      priority: 'medium',
      timestamps: {
        createdAt: '2026-04-19T17:55:00.000Z',
        updatedAt: '2026-04-19T18:32:00.000Z',
        startedAt: '2026-04-19T18:00:00.000Z',
      },
    },
    {
      id: 'task-4',
      title: 'Package first-pass finance findings',
      description: 'Prepare a ranked shortlist of finance ops findings once the bridge data is stable enough to trust.',
      status: 'done',
      assignee: 'Deep',
      priority: 'low',
      timestamps: {
        createdAt: '2026-04-19T17:15:00.000Z',
        updatedAt: '2026-04-19T17:50:00.000Z',
        completedAt: '2026-04-19T17:50:00.000Z',
      },
    },
  ],
  feed: [
    {
      id: 'feed-1',
      agent: 'Builder',
      message: 'Dashboard layout pass underway, wiring board view and desk view together.',
      priority: 'high',
      timestamp: '2026-04-19T18:36:00.000Z',
    },
    {
      id: 'feed-2',
      agent: 'Main',
      message: 'Queue pressure rising around review handoffs, keep final approvals visible.',
      priority: 'medium',
      timestamp: '2026-04-19T18:28:00.000Z',
    },
    {
      id: 'feed-3',
      agent: 'Ops',
      message: 'Bridge warning remains active, showing best-effort data instead of blank screens.',
      priority: 'low',
      timestamp: '2026-04-19T18:22:00.000Z',
    },
  ],
  chat: [
    {
      id: 'chat-1',
      agent: 'Main',
      message: 'Route any urgent operator issues to the focus area until review clears.',
      type: 'system',
      timestamp: '2026-04-19T18:18:00.000Z',
    },
    {
      id: 'chat-2',
      agent: 'Builder',
      message: 'Kanban interaction is live, wiring the detail drawer next.',
      type: 'update',
      timestamp: '2026-04-19T18:27:00.000Z',
    },
    {
      id: 'chat-3',
      agent: 'Guardian',
      message: 'Review lane has one open approval waiting on final copy validation.',
      type: 'task',
      timestamp: '2026-04-19T18:33:00.000Z',
    },
  ],
  calendar: [
    {
      id: 'calendar-1',
      title: 'Operator planning block',
      type: 'event',
      status: 'scheduled',
      startAt: '2026-04-20T15:00:00.000Z',
      endAt: '2026-04-20T15:45:00.000Z',
      owner: 'Main',
      description: 'Review active lanes, approvals, and the next sequence of dashboard and agent work.',
      location: 'Command deck',
    },
    {
      id: 'calendar-2',
      title: 'Finalize operator routing rules',
      type: 'task',
      status: 'scheduled',
      startAt: '2026-04-20T16:00:00.000Z',
      endAt: '2026-04-20T17:30:00.000Z',
      owner: 'Main',
      description: 'Scheduled deep-work block for intake logic, owner paths, and escalation timing.',
      linkedTaskId: 'task-1',
    },
    {
      id: 'calendar-3',
      title: 'AI HQ dashboard review',
      type: 'appointment',
      status: 'tentative',
      startAt: '2026-04-20T19:00:00.000Z',
      endAt: '2026-04-20T19:30:00.000Z',
      owner: 'Builder',
      description: 'Walk through the latest dashboard shell, calendar tab, and desk view revisions.',
      location: 'Local review',
      linkedTaskId: 'task-2',
    },
    {
      id: 'calendar-4',
      title: 'Bridge degradation audit window',
      type: 'task',
      status: 'scheduled',
      startAt: '2026-04-21T17:00:00.000Z',
      endAt: '2026-04-21T18:00:00.000Z',
      owner: 'Guardian',
      description: 'Validate warning copy, fallback behavior, and data-truth messaging before the next operator run.',
      linkedTaskId: 'task-3',
    },
    {
      id: 'calendar-5',
      title: 'Finance findings packaging',
      type: 'event',
      status: 'scheduled',
      startAt: '2026-04-22T18:30:00.000Z',
      endAt: '2026-04-22T19:15:00.000Z',
      owner: 'Deep',
      description: 'Bundle the highest-value finance ops findings into a reviewable shortlist.',
      linkedTaskId: 'task-4',
    },
  ],
  financialMetrics: [
    {
      id: 'finance-1',
      label: 'Cash-ready completions',
      value: '$22.6k',
      detail: 'Carlos Acosta is invoiced, at 100% A/R detail, and sitting in ready-for-cap-out with closeout work still visible.',
      tone: 'good',
      trend: 'up',
    },
    {
      id: 'finance-2',
      label: 'Appraisal exposure',
      value: '$8.0k',
      detail: 'Elizabeth Seidell is still in appraisal with balance due on-screen and production preparation not fully cleared.',
      tone: 'watch',
      trend: 'flat',
    },
    {
      id: 'finance-3',
      label: 'Inspection quote bench',
      value: '$2.7k',
      detail: 'Ken Humphreys already has a small retail prescription estimate built from an inspection lane.',
      tone: 'neutral',
      trend: 'up',
    },
    {
      id: 'finance-4',
      label: 'Cancelled lead drag',
      value: '1 lead',
      detail: 'Vivian Harris is cancelled with no visible recovery task, which makes follow-up leakage hard to see.',
      tone: 'risk',
      trend: 'down',
    },
  ],
  collections: [
    {
      id: 'collection-1',
      customer: 'Carlos Acosta',
      stage: 'Ready for cap out',
      amount: 22570.22,
      owner: 'Kali Najah',
      dueAt: '2026-04-18T17:00:00.000Z',
      status: 'on-track',
      notes: 'Warranty info is the last visible closeout move before this lane should feel complete.',
    },
    {
      id: 'collection-2',
      customer: 'Elizabeth Seidell',
      stage: 'Appraisal',
      amount: 7973.91,
      owner: 'Matthew Griffin',
      dueAt: '2026-04-22T19:00:00.000Z',
      status: 'watch',
      notes: 'Appraisal demand is signed, but the lane still depends on approval call and production readiness.',
    },
    {
      id: 'collection-3',
      customer: 'Ken Humphreys',
      stage: 'Estimate follow-up',
      amount: 2700,
      owner: 'Kali Najah',
      dueAt: '2026-04-24T18:00:00.000Z',
      status: 'watch',
      notes: 'Small retail quote exists, but the job is still parked in appointment-scheduled territory.',
    },
  ],
  departmentJobs: [
    {
      id: 'job-1',
      business: 'RD',
      customer: 'Carlos Acosta',
      market: 'Tempe',
      workType: 'Retail',
      stage: 'Ready for cap out',
      owner: 'Kali Najah',
      value: 22570.22,
      nextAction: 'Deliver warranty info and finish closeout sequence.',
      risk: 'low',
    },
    {
      id: 'job-2',
      business: 'RD',
      customer: 'Elizabeth Seidell',
      market: 'Queen Creek',
      workType: 'Insurance / Appraisal',
      stage: 'Appraisal',
      owner: 'Matthew Griffin',
      value: 7973.91,
      nextAction: 'Run approval call and prep for production once appraisal clears.',
      risk: 'high',
    },
    {
      id: 'job-3',
      business: 'BD',
      customer: 'Ken Humphreys',
      market: 'Florence',
      workType: 'Inspection',
      stage: 'Appointment Scheduled',
      owner: 'Kali Najah',
      value: 2700,
      nextAction: 'Complete inspection and convert the existing roof prescription into a firm next step.',
      risk: 'medium',
    },
    {
      id: 'job-4',
      business: 'BD',
      customer: 'Vivian Harris',
      market: 'Goodyear',
      workType: 'Inspection',
      stage: 'Cancelled',
      owner: 'Matthew Griffin',
      value: 0,
      nextAction: 'Decide whether to salvage, nurture later, or archive with a clean reason code.',
      risk: 'medium',
    },
  ],
  brain: [
    {
      id: 'brain-1',
      type: 'decision',
      title: 'Insurance contracts stay deductible-led',
      summary: 'The signed insurance contract structure keeps the promise anchored to carrier-authorized scope and homeowner deductible only.',
      owner: 'Main',
      source: 'Seidell insurance contract audit',
      freshness: 'fresh',
    },
    {
      id: 'brain-2',
      type: 'memory',
      title: 'Appraisal demand already exists for Seidell',
      summary: 'The appraisal demand packet is signed, so the current gap is not paperwork creation. It is workflow advancement and communication timing.',
      owner: 'Deep',
      source: 'Supplement/Appraisal documents',
      freshness: 'fresh',
    },
    {
      id: 'brain-3',
      type: 'playbook',
      title: 'Inspection lanes need a hard next-task within 24 hours',
      summary: 'Appointment-scheduled jobs with no visible task cover become easy to lose, even when an estimate already exists.',
      owner: 'Ops',
      source: 'Ken Humphreys + Vivian Harris audit',
      freshness: 'aging',
    },
    {
      id: 'brain-4',
      type: 'question',
      title: 'What is the BD salvage sequence after cancellation?',
      summary: 'Vivian Harris exposes a weak spot. The system needs a deterministic reclaim, nurture, or archive pattern for dead inspection leads.',
      owner: 'Main',
      source: 'Cancelled job audit',
      freshness: 'aging',
    },
    {
      id: 'brain-5',
      type: 'memory',
      title: 'Retail production can outrun worksheet clarity',
      summary: 'Carlos Acosta is operationally far along even though worksheet structure still looks thin, which hints at handoff information living elsewhere.',
      owner: 'Guardian',
      source: 'Carlos Acosta live job snapshot',
      freshness: 'stale',
    },
  ],
  radar: [
    {
      id: 'radar-1',
      label: 'Cash release',
      value: '$22.6k',
      detail: 'Carlos Acosta is the cleanest visible near-term cash unlock.',
      tone: 'good',
    },
    {
      id: 'radar-2',
      label: 'Appraisal drift',
      value: '1 active lane',
      detail: 'Seidell is the clearest insurance lane that can quietly age if communication slips.',
      tone: 'watch',
    },
    {
      id: 'radar-3',
      label: 'Inspection fallout',
      value: '1 cancelled',
      detail: 'Vivian Harris shows cancellation without a visible recovery task or structured salvage path.',
      tone: 'risk',
    },
    {
      id: 'radar-4',
      label: 'Quote conversion pressure',
      value: '1 waiting',
      detail: 'Ken Humphreys has an estimate and appointment history but has not crossed into a stronger production path.',
      tone: 'watch',
    },
    {
      id: 'radar-5',
      label: 'Task hygiene',
      value: 'light cover',
      detail: 'Two of the sampled live jobs showed little to no open task protection, which increases memory-dependent execution.',
      tone: 'watch',
    },
  ],
};

async function loadJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${path}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchAgentHQData(): Promise<AgentHQData> {
  const [agents, tasks, feed, chat, calendar, financialMetrics, collections, departmentJobs, brain, radar] = await Promise.all([
    loadJson<AgentRosterItem[]>('/data/agents.json', fallbackData.agents),
    loadJson<KanbanTask[]>('/data/tasks.json', fallbackData.tasks),
    loadJson<FeedEntry[]>('/data/feed.json', fallbackData.feed),
    loadJson<ChatEntry[]>('/data/chat.json', fallbackData.chat),
    loadJson<CalendarEntry[]>('/data/calendar.json', fallbackData.calendar),
    loadJson<FinancialMetric[]>('/data/financial-metrics.json', fallbackData.financialMetrics),
    loadJson<CollectionQueueItem[]>('/data/collections.json', fallbackData.collections),
    loadJson<DepartmentJob[]>('/data/department-jobs.json', fallbackData.departmentJobs),
    loadJson<BrainItem[]>('/data/brain.json', fallbackData.brain),
    loadJson<RadarSignal[]>('/data/radar.json', fallbackData.radar),
  ]);

  return {
    agents,
    tasks,
    feed: [...feed].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    chat: [...chat].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    calendar: [...calendar].sort((a, b) => a.startAt.localeCompare(b.startAt)),
    financialMetrics,
    collections: [...collections].sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    departmentJobs: [...departmentJobs].sort((a, b) => b.value - a.value),
    brain,
    radar,
  };
}
