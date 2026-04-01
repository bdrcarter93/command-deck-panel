import { formatDistanceToNow } from 'date-fns';

export type AgentStatus = 'active' | 'idle' | 'error' | 'offline';
export type LogCategory = 'observation' | 'general' | 'reminder' | 'fyi';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskColumn = 'todo' | 'doing' | 'needs-input' | 'done';
export type MeetingType = 'standup' | 'sales' | 'interview' | 'all-hands' | '1-on-1' | 'planning' | 'team' | 'external';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  type: string;
  role: string;
  status: AgentStatus;
  accentColor: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  currentActivity: string;
  lastSeen: string;
  sessionCount: number;
  activeAgo: string;
  storePath?: string;
}

export interface ActivityItem {
  id: string;
  agentEmoji: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  progress?: number;
  column: TaskColumn;
}

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  category: LogCategory;
  message: string;
  timestamp: string;
}

export interface CouncilMessage {
  agentEmoji: string;
  agentName: string;
  messageNumber: number;
  content: string;
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: 'active' | 'completed' | 'pending';
  participants: { emoji: string; name: string; sent: number; limit: number; status: 'done' | 'pending' | 'active' }[];
  messages: CouncilMessage[];
}

export interface ActionItem {
  task: string;
  assignee: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  type: MeetingType;
  title: string;
  date: string;
  duration_minutes: number;
  duration_display: string;
  attendees: string[];
  summary: string;
  action_items: ActionItem[];
  ai_insights: string;
  meeting_type: MeetingType;
  sentiment: 'positive' | 'neutral' | 'negative';
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export interface SecurityIssue {
  severity: 'critical' | 'warn' | 'info';
  title: string;
  detail: string;
  fix?: string;
}

export interface SessionSummary {
  key: string;
  kind: string;
  age: string;
  model: string;
  provider?: string;
  percentUsed: number | null;
  totalTokens: number | null;
  remainingTokens: number | null;
  cachedPercent: number | null;
  sessionId?: string;
  agentId?: string;
  contextTokens?: number | null;
  outputTokens?: number | null;
  status: 'hot' | 'warm' | 'cold' | 'unknown';
}

export interface PresenceItem {
  text: string;
  host?: string;
  mode?: string;
  reason?: string;
  lastSeen?: string;
}

export interface DashboardData {
  agents: Agent[];
  recentActivity: ActivityItem[];
  initialTasks: Task[];
  logEntries: LogEntry[];
  councilSessions: CouncilSession[];
  meetings: Meeting[];
  sessions: SessionSummary[];
  securityIssues: SecurityIssue[];
  presence: PresenceItem[];
  summary: {
    version: string;
    update: string;
    gateway: string;
    channels: string[];
    sessionsText: string;
    heartbeat: string;
    securitySummary: string;
  };
  meta: {
    source: string;
    warnings: string[];
    generatedAt: string;
  };
}

interface OpenClawHealthAgent {
  agentId: string;
  name: string;
  isDefault: boolean;
  heartbeat?: {
    enabled?: boolean;
    every?: string;
    model?: string;
  };
  sessions?: {
    count?: number;
    recent?: Array<{ key: string; updatedAt: number; age?: number }>;
  };
}

interface OpenClawHealthChannel {
  configured?: boolean;
  running?: boolean;
  lastError?: string | null;
  tokenSource?: string | null;
  mode?: string | null;
  accountId?: string | null;
}

interface OpenClawHealthResponse {
  ok?: boolean;
  heartbeatSeconds?: number;
  defaultAgentId?: string;
  agents?: OpenClawHealthAgent[];
  channels?: Record<string, OpenClawHealthChannel>;
  sessions?: {
    count?: number;
    recent?: Array<{ key: string; updatedAt: number; age?: number }>;
  };
}

interface OpenClawLogEntry {
  timestamp?: string;
  level?: string;
  message?: string;
  msg?: string;
  agentId?: string;
  agent?: string;
  sessionKey?: string;
  channel?: string;
  [key: string]: unknown;
}

interface OpenClawStatusIssue {
  severity?: 'critical' | 'warn' | 'info';
  title?: string;
  detail?: string;
  fix?: string;
}

interface OpenClawStatusRecentSession {
  key: string;
  kind?: string;
  model?: string;
  modelProvider?: string;
  percentUsed?: number | null;
  totalTokens?: number | null;
  remainingTokens?: number | null;
  cacheRead?: number | null;
  contextTokens?: number | null;
  sessionId?: string;
  agentId?: string;
  outputTokens?: number | null;
  age?: number;
}

interface OpenClawStatusResponse {
  runtimeVersion?: string;
  overview?: {
    update?: string;
    gateway?: string;
    sessions?: string;
    heartbeat?: string;
    security?: string;
  };
  securityAudit?: {
    summary?: string;
    issues?: OpenClawStatusIssue[];
  };
  health?: {
    channels?: Array<{ name?: string; status?: string; detail?: string }>;
  };
  sessions?: {
    recent?: OpenClawStatusRecentSession[];
  };
  heartbeat?: {
    agents?: Array<{ agentId?: string; enabled?: boolean; every?: string }>;
  };
  channelSummary?: string[];
}

interface OpenClawPresenceResponseItem {
  text?: string;
  host?: string;
  mode?: string;
  reason?: string;
  ts?: number;
}

const FALLBACK_EMOJIS = ['🐾', '🤖', '🛠️', '🧠', '📡', '🧪'];
const FALLBACK_COLORS = ['#10b981', '#60a5fa', '#f59e0b', '#a78bfa', '#06b6d4', '#f43f5e'];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function relTime(value?: string | number | null) {
  if (!value) return 'unknown';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return formatDistanceToNow(date, { addSuffix: true });
}

function relFromAgeMs(age?: number | null) {
  if (age === undefined || age === null) return 'unknown';
  return relTime(Date.now() - age);
}

function titleizeAgentId(agentId: string) {
  return agentId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function deriveStatus(agent: OpenClawHealthAgent): AgentStatus {
  const recent = agent.sessions?.recent?.[0];
  const ageMs = recent?.age ?? (recent?.updatedAt ? Date.now() - recent.updatedAt : undefined);
  if ((agent.sessions?.count ?? 0) > 0 && ageMs !== undefined && ageMs < 10 * 60 * 1000) return 'active';
  if (agent.heartbeat?.enabled) return 'idle';
  return 'offline';
}

function deriveAccuracy(status: AgentStatus, sessionCount: number) {
  if (status === 'active') return 98;
  if (status === 'idle') return 92;
  if (sessionCount > 0) return 88;
  return 75;
}

function deriveAgent(agent: OpenClawHealthAgent, index: number): Agent {
  const id = agent.agentId;
  const displayName = agent.name || titleizeAgentId(id);
  const recent = agent.sessions?.recent?.[0];
  const sessionCount = agent.sessions?.count ?? 0;
  const status = deriveStatus(agent);
  const lastSeen = recent?.updatedAt ? relTime(recent.updatedAt) : 'never';

  return {
    id,
    name: displayName,
    emoji: FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length],
    subtitle: agent.isDefault ? 'Default OpenClaw operator agent' : 'Configured OpenClaw agent',
    type: agent.heartbeat?.enabled ? 'Heartbeat Agent' : 'On-demand Agent',
    role: agent.isDefault ? 'Primary Runtime' : 'Specialist Runtime',
    status,
    accentColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    tasksCompleted: sessionCount,
    sessionCount,
    accuracy: deriveAccuracy(status, sessionCount),
    skills: [
      `agent:${id}`,
      sessionCount > 0 ? `${sessionCount} session${sessionCount === 1 ? '' : 's'}` : 'no sessions yet',
      agent.heartbeat?.enabled ? `heartbeat ${agent.heartbeat.every || 'enabled'}` : 'manual only',
      agent.heartbeat?.model || 'default model',
    ],
    currentActivity:
      status === 'active'
        ? `Active in ${recent?.key || 'recent session'}`
        : agent.heartbeat?.enabled
          ? 'Standing by for heartbeat and inbound work'
          : 'Unconfigured for autonomous work',
    lastSeen,
    activeAgo: lastSeen,
  };
}

function categorizeLog(entry: OpenClawLogEntry): LogCategory {
  const text = `${entry.level || ''} ${entry.message || entry.msg || ''}`.toLowerCase();
  if (text.includes('error') || text.includes('warn') || text.includes('401') || text.includes('invalid api key')) return 'reminder';
  if (text.includes('health') || text.includes('started') || text.includes('ready') || text.includes('heartbeat')) return 'fyi';
  if (text.includes('session') || text.includes('message') || text.includes('agent')) return 'observation';
  return 'general';
}

function humanizeLogMessage(entry: OpenClawLogEntry) {
  const raw = String(entry.message || entry.msg || 'OpenClaw event').trim();
  return raw.length > 220 ? `${raw.slice(0, 217)}…` : raw;
}

function toActivity(logs: OpenClawLogEntry[], agents: Agent[]): ActivityItem[] {
  const agentById = new Map(agents.map((agent) => [agent.id, agent]));
  return logs.slice(0, 12).map((entry, index) => {
    const agent = agentById.get(String(entry.agentId || entry.agent || ''));
    return {
      id: `activity-${index}`,
      agentEmoji: agent?.emoji || '📡',
      agentName: agent?.name || String(entry.agentId || entry.agent || entry.channel || 'OpenClaw'),
      action: humanizeLogMessage(entry),
      timestamp: relTime(entry.timestamp || null),
    };
  });
}

function toLogs(logs: OpenClawLogEntry[], agents: Agent[]): LogEntry[] {
  const agentById = new Map(agents.map((agent) => [agent.id, agent]));
  return logs.slice(0, 40).map((entry, index) => {
    const agent = agentById.get(String(entry.agentId || entry.agent || ''));
    return {
      id: `log-${index}`,
      agentEmoji: agent?.emoji || '📡',
      agentName: agent?.name || String(entry.agentId || entry.agent || 'OpenClaw'),
      category: categorizeLog(entry),
      message: humanizeLogMessage(entry),
      timestamp: relTime(entry.timestamp || null),
    };
  });
}

function sessionHeat(session: OpenClawStatusRecentSession): SessionSummary['status'] {
  const percent = session.percentUsed;
  if (percent === null || percent === undefined) return 'unknown';
  if (percent >= 75) return 'hot';
  if (percent >= 40) return 'warm';
  return 'cold';
}

function toSessions(status: OpenClawStatusResponse): SessionSummary[] {
  return (status.sessions?.recent || []).map((session) => ({
    key: session.key,
    kind: session.kind || 'direct',
    age: relFromAgeMs(session.age),
    model: session.model || 'unknown',
    provider: session.modelProvider || undefined,
    percentUsed: session.percentUsed ?? null,
    totalTokens: session.totalTokens ?? null,
    remainingTokens: session.remainingTokens ?? null,
    cachedPercent:
      session.totalTokens && session.totalTokens > 0 && session.cacheRead
        ? Math.round((session.cacheRead / session.totalTokens) * 100)
        : null,
    sessionId: session.sessionId,
    agentId: session.agentId,
    contextTokens: session.contextTokens ?? null,
    outputTokens: session.outputTokens ?? null,
    status: sessionHeat(session),
  }));
}

function toSecurityIssues(status: OpenClawStatusResponse): SecurityIssue[] {
  return (status.securityAudit?.issues || []).map((issue) => ({
    severity: issue.severity || 'info',
    title: issue.title || 'Untitled issue',
    detail: issue.detail || '',
    fix: issue.fix,
  }));
}

function toPresence(items: OpenClawPresenceResponseItem[]): PresenceItem[] {
  return items.map((item) => ({
    text: item.text || 'Presence event',
    host: item.host,
    mode: item.mode,
    reason: item.reason,
    lastSeen: item.ts ? relTime(item.ts) : undefined,
  }));
}

function collectWarnings(
  health: OpenClawHealthResponse,
  logs: OpenClawLogEntry[],
  status: OpenClawStatusResponse,
  securityIssues: SecurityIssue[],
): string[] {
  const warnings = new Set<string>();

  Object.entries(health.channels || {}).forEach(([channel, details]) => {
    if (details.configured && !details.running) warnings.add(`${channel} channel is configured but not running`);
    if (details.lastError) warnings.add(`${channel} error: ${details.lastError}`);
    if ((details.tokenSource || 'none') === 'none') warnings.add(`${channel} token source is missing`);
  });

  logs.forEach((entry) => {
    const msg = `${entry.message || entry.msg || ''}`.toLowerCase();
    if (msg.includes('invalid api key')) warnings.add('Memory embedding sync failing: invalid OpenAI API key');
    if (msg.includes('401')) warnings.add('Detected 401 errors in recent OpenClaw logs');
    if (msg.includes('unexpected server response: 500')) warnings.add('Embedded session WebSocket stream is falling back to HTTP after 500 errors');
  });

  securityIssues.forEach((issue) => {
    if (issue.severity === 'critical' || issue.severity === 'warn') warnings.add(`${issue.severity.toUpperCase()}: ${issue.title}`);
  });

  if ((status.overview?.update || '').toLowerCase().includes('available')) warnings.add(`Update pending: ${status.overview?.update}`);

  return Array.from(warnings);
}

function buildTasks(
  health: OpenClawHealthResponse,
  warnings: string[],
  securityIssues: SecurityIssue[],
  sessions: SessionSummary[],
): Task[] {
  const tasks: Task[] = [];

  securityIssues.filter((issue) => issue.severity === 'critical').forEach((issue, index) => {
    tasks.push({
      id: `security-critical-${index}`,
      title: issue.title,
      assignee: '🔐',
      priority: 'urgent',
      column: 'needs-input',
    });
  });

  Object.entries(health.channels || {}).forEach(([channel, details]) => {
    if (details.configured && !details.running) {
      tasks.push({
        id: `channel-${channel}`,
        title: `${channel} channel configured but not running`,
        assignee: '📡',
        priority: 'high',
        column: 'needs-input',
      });
    }
  });

  warnings
    .filter((warning) => !tasks.some((task) => task.title === warning))
    .slice(0, 3)
    .forEach((warning, index) => {
      tasks.push({
        id: `warning-${index}`,
        title: warning,
        assignee: '⚠️',
        priority: warning.toLowerCase().includes('401') ? 'urgent' : 'high',
        column: 'needs-input',
      });
    });

  sessions.slice(0, 2).forEach((session, index) => {
    tasks.push({
      id: `session-${index}`,
      title: `Watch ${session.key}`,
      assignee: '🧠',
      priority: (session.percentUsed || 0) >= 75 ? 'high' : 'medium',
      progress: session.percentUsed || 0,
      column: 'doing',
    });
  });

  const inactiveAgents = (health.agents || []).filter((agent) => (agent.sessions?.count ?? 0) === 0);
  inactiveAgents.slice(0, 3).forEach((agent, index) => {
    tasks.push({
      id: `agent-idle-${agent.agentId}`,
      title: `Leave ${agent.name || agent.agentId} visibly unconfigured`,
      assignee: '🫥',
      priority: index === 0 ? 'medium' : 'low',
      column: 'todo',
    });
  });

  tasks.push({
    id: 'dashboard-live',
    title: 'Dashboard switched from mock data to live OpenClaw bridge',
    assignee: '✅',
    priority: 'low',
    progress: 100,
    column: 'done',
  });

  return tasks;
}

function buildCouncil(agents: Agent[], warnings: string[], securityIssues: SecurityIssue[], sessions: SessionSummary[], presence: PresenceItem[]): CouncilSession[] {
  const participants = agents.slice(0, 4).map((agent, index) => ({
    emoji: agent.emoji,
    name: agent.name,
    sent: Math.min(3, Math.max(1, Math.round(agent.sessionCount / 2) || 1)),
    limit: 3,
    status: index === 0 ? ('active' as const) : ('done' as const),
  }));

  const hottestSession = sessions.find((session) => session.status === 'hot') || sessions[0];
  const latestPresence = presence[0];

  return [
    {
      id: 'live-system-review',
      question: 'What needs operator attention right now in OpenClaw?',
      status: warnings.length > 0 ? 'active' : 'completed',
      participants,
      messages: [
        {
          agentEmoji: '🐾',
          agentName: 'System Bridge',
          messageNumber: 1,
          content:
            warnings.length > 0
              ? `Warnings: ${warnings.slice(0, 3).join(' · ')}`
              : 'No critical warnings detected from current OpenClaw health, status, and log surfaces.',
          timestamp: 'just now',
        },
        {
          agentEmoji: '🔐',
          agentName: 'Security Audit',
          messageNumber: 2,
          content:
            securityIssues.length > 0
              ? `${securityIssues.length} security finding(s) present. Highest severity: ${securityIssues[0].severity.toUpperCase()} — ${securityIssues[0].title}`
              : 'No current security findings surfaced by openclaw status.',
          timestamp: 'just now',
        },
        {
          agentEmoji: '🧠',
          agentName: 'Session Monitor',
          messageNumber: 3,
          content: hottestSession
            ? `Hottest session is ${hottestSession.key} on ${hottestSession.model}, using ${hottestSession.percentUsed ?? '?'}% of context with ${hottestSession.remainingTokens ?? '?'} tokens remaining.`
            : 'No recent sessions are available for analysis.',
          timestamp: 'just now',
        },
        {
          agentEmoji: '📡',
          agentName: 'Presence Watch',
          messageNumber: 4,
          content: latestPresence
            ? `${latestPresence.text}${latestPresence.lastSeen ? ` · ${latestPresence.lastSeen}` : ''}`
            : 'No system presence events are currently visible.',
          timestamp: 'just now',
        },
      ],
    },
  ];
}

function buildMeetings(
  status: OpenClawStatusResponse,
  warnings: string[],
  securityIssues: SecurityIssue[],
  presence: PresenceItem[],
): Meeting[] {
  const now = new Date();
  return [
    {
      id: 'runtime-review',
      type: 'planning',
      title: 'Runtime review snapshot',
      date: now.toISOString(),
      duration_minutes: 15,
      duration_display: '15m',
      attendees: ['OpenClaw runtime', 'Operator'],
      summary: status.overview?.sessions || 'Live status snapshot from OpenClaw.',
      action_items: warnings.slice(0, 4).map((warning) => ({ task: warning, assignee: 'operator', done: false })),
      ai_insights: `Gateway: ${status.overview?.gateway || 'unknown'} · Heartbeat: ${status.overview?.heartbeat || 'unknown'}`,
      meeting_type: 'planning',
      sentiment: warnings.length > 0 ? 'neutral' : 'positive',
      has_external_participants: false,
      external_domains: [],
      fathom_url: null,
      share_url: null,
    },
    {
      id: 'security-review',
      type: 'team',
      title: 'Security audit review',
      date: new Date(now.getTime() - 3600_000).toISOString(),
      duration_minutes: 10,
      duration_display: '10m',
      attendees: ['Security audit'],
      summary: status.securityAudit?.summary || 'No security audit summary available.',
      action_items: securityIssues.slice(0, 3).map((issue) => ({ task: issue.title, assignee: 'operator', done: false })),
      ai_insights: securityIssues[0]?.fix || 'No remediation text available.',
      meeting_type: 'team',
      sentiment: securityIssues.some((issue) => issue.severity === 'critical') ? 'negative' : 'neutral',
      has_external_participants: false,
      external_domains: [],
      fathom_url: null,
      share_url: null,
    },
    {
      id: 'presence-review',
      type: 'external',
      title: 'System presence review',
      date: new Date(now.getTime() - 2 * 3600_000).toISOString(),
      duration_minutes: 8,
      duration_display: '8m',
      attendees: presence.map((item) => item.host || item.mode || 'device'),
      summary: presence[0]?.text || 'No presence data reported.',
      action_items: [],
      ai_insights: `${presence.length} presence event(s) are currently visible through OpenClaw system-presence.`,
      meeting_type: 'external',
      sentiment: 'positive',
      has_external_participants: false,
      external_domains: [],
      fathom_url: null,
      share_url: null,
    },
  ];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [health, logs, status, presence] = await Promise.all([
    fetchJson<OpenClawHealthResponse>('/api/openclaw/health'),
    fetchJson<OpenClawLogEntry[]>('/api/openclaw/logs?limit=40'),
    fetchJson<OpenClawStatusResponse>('/api/openclaw/status'),
    fetchJson<OpenClawPresenceResponseItem[]>('/api/openclaw/system-presence'),
  ]);

  const agents = (health.agents || []).map(deriveAgent);
  const sessions = toSessions(status);
  const securityIssues = toSecurityIssues(status);
  const presenceItems = toPresence(presence);
  const warnings = collectWarnings(health, logs, status, securityIssues);

  return {
    agents,
    recentActivity: toActivity(logs, agents),
    initialTasks: buildTasks(health, warnings, securityIssues, sessions),
    logEntries: toLogs(logs, agents),
    councilSessions: buildCouncil(agents, warnings, securityIssues, sessions, presenceItems),
    meetings: buildMeetings(status, warnings, securityIssues, presenceItems),
    sessions,
    securityIssues,
    presence: presenceItems,
    summary: {
      version: status.runtimeVersion || 'unknown',
      update: status.overview?.update || 'unknown',
      gateway: status.overview?.gateway || 'unknown',
      channels:
        (status.health?.channels || []).map((channel) => `${channel.name}: ${channel.status}`) || status.channelSummary || [],
      sessionsText: status.overview?.sessions || 'unknown',
      heartbeat: status.overview?.heartbeat || 'unknown',
      securitySummary: status.securityAudit?.summary || 'No security summary',
    },
    meta: {
      source: 'openclaw-live-bridge',
      warnings,
      generatedAt: new Date().toISOString(),
    },
  };
}
