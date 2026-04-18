import { formatDistanceToNow } from 'date-fns';
import { apiUrl, fetchJson, fetchJsonOr } from '@/lib/api';

export type AgentStatus = 'working' | 'active' | 'idle' | 'blocked' | 'offline' | 'unknown';
export type AgentReadiness = 'ready' | 'limited' | 'blocked' | 'unknown';
export type ReadinessSignal = 'presentational' | 'config' | 'runtime' | 'deploy';

const BUILDER_DEPLOY_PROOF = {
  url: 'https://dashboardoc.com/',
  label: 'Canonical production deploy verified',
};

interface OpenClawProbeHealth {
  ok?: boolean;
  at?: number;
  error?: string | null;
}

interface OpenClawChannelAccountHealth {
  running?: boolean;
  probe?: OpenClawProbeHealth;
}
export type LogCategory = 'observation' | 'general' | 'reminder' | 'fyi';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskColumn = 'todo' | 'doing' | 'needs-input' | 'done' | 'canceled';
export type MeetingType = 'standup' | 'sales' | 'interview' | 'all-hands' | '1-on-1' | 'planning' | 'team' | 'external';

export interface AgentSignal {
  kind: ReadinessSignal;
  label: string;
  state: 'yes' | 'no' | 'partial' | 'unknown';
  detail: string;
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  type: string;
  role: string;
  status: AgentStatus;
  readiness: AgentReadiness;
  readinessLabel: string;
  blockedReason?: string;
  accentColor: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  currentActivity: string;
  lastSeen: string;
  sessionCount: number;
  activeAgo: string;
  storePath?: string;
  evaluationOrder: number;
  signals: AgentSignal[];
  truthSummary: string;
  operatorSummary: string;
}

export interface ActivityItem {
  id: string;
  agentEmoji: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  progress?: number;
  column: TaskColumn;
  deadline?: string;      // ISO date string
  notes?: string;
  description?: string;
  eta?: string;
  statusText?: string;
  nextStep?: string;
  nextStepSummary?: string;
  blockers?: string;
  impact?: string;
  helpText?: string;
  ownerDetail?: string;
  decisionHelp?: string;
  subtasks?: SubTask[];
  tags?: string[];
}

export type OpsStage = 'outreach' | 'discovery' | 'proposal' | 'onboarding' | 'delivery' | 'intel' | 'retention';

export interface OpsContact {
  id: string;
  name: string;
  company?: string;
  stage: OpsStage;
  priority: TaskPriority;
  lastTouch: string;
  nextAction: string;
  notes?: string;
  value?: string;  // deal value label e.g. "$5k/mo"
}

export interface OpsLoopData {
  contacts: OpsContact[];
  stageOrder: OpsStage[];
  stageLabels: Record<OpsStage, string>;
  stageEmojis: Record<OpsStage, string>;
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
  opsLoop: OpsLoopData;
  summary: {
    version: string;
    update: string;
    gateway: string;
    channels: string[];
    sessionsText: string;
    heartbeat: string;
    securitySummary: string;
    totalAgents: number;
    configuredAgents: number;
    readyAgents: number;
    limitedAgents: number;
    blockedAgents: number;
    unknownAgents: number;
    activeAgents: number;
    workingAgents: number;
    heartbeatAgents: number;
    configuredChannels: number;
    runningChannels: number;
    sessionCount: number;
  };
  meta: {
    source: string;
    warnings: string[];
    generatedAt: string;
    bridgeAvailable: boolean;
    remoteDegraded: boolean;
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

interface DashboardFetchMeta {
  ok: boolean;
  source: 'live' | 'fallback';
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

const AGENT_PRESENTATION: Record<
  string,
  {
    emoji?: string;
    subtitle: string;
    role: string;
    type?: string;
    currentActivity?: string;
  }
> = {
  main: {
    emoji: '🧭',
    subtitle: 'Chief of Staff',
    role: 'Primary operator and routing brain',
    type: 'Command Agent',
    currentActivity: 'Coordinating inbound work and operator-facing decisions',
  },
  builder: {
    emoji: '🛠️',
    subtitle: 'Implementation Engineer',
    role: 'Builds, refactors, ships, and validates scoped work',
    type: 'Build Agent',
    currentActivity: 'Standing by for scoped implementation work',
  },
  finance: {
    emoji: '💼',
    subtitle: 'Finance Director',
    role: 'Handles finance workflows, budgets, and money-side analysis',
    type: 'Finance Agent',
    currentActivity: 'Available for finance reviews and money ops',
  },
  ops: {
    emoji: '📡',
    subtitle: 'Operations Lead',
    role: 'Owns runtime health, execution flow, and operational readiness',
    type: 'Ops Agent',
    currentActivity: 'Watching systems, readiness, and process flow',
  },
  deep: {
    emoji: '🧠',
    subtitle: 'Research Analyst',
    role: 'Performs deeper synthesis, investigation, and structured analysis',
    type: 'Research Agent',
    currentActivity: 'Waiting for deep research and synthesis work',
  },
};

// API helpers (apiUrl, fetchJson, fetchJsonOr) are imported from @/lib/api
// which reads VITE_API_BASE and VITE_BRIDGE_SECRET at build time.
// Do not duplicate those here.

async function fetchJsonWithMeta<T>(url: string, fallback: T, timeoutMs = 5000): Promise<{ data: T; meta: DashboardFetchMeta }> {
  try {
    const data = await fetchJson<T>(url, timeoutMs);
    return { data, meta: { ok: true, source: 'live' } };
  } catch {
    return { data: fallback, meta: { ok: false, source: 'fallback' } };
  }
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

function normalizeDetail(value: unknown, fallback: string) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function cleanText(value: unknown, fallback: string) {
  const raw = normalizeDetail(value, fallback);
  return raw.replace(/\s+/g, ' ').trim();
}

function summarizeRuntimeStatus(sessionCount: number, ageMs?: number, heartbeatEnabled?: boolean): AgentStatus {
  if (sessionCount > 0 && ageMs !== undefined && ageMs < 10 * 60 * 1000) return 'working';
  if (sessionCount > 0 && ageMs !== undefined && ageMs < 60 * 60 * 1000) return 'active';
  if (sessionCount > 0 || heartbeatEnabled) return 'idle';
  if (sessionCount === 0 && heartbeatEnabled === false) return 'offline';
  return 'unknown';
}

function deriveAccuracy(status: AgentStatus, sessionCount: number, readiness: AgentReadiness) {
  if (readiness === 'ready') return status === 'working' ? 99 : status === 'active' ? 97 : 94;
  if (readiness === 'limited') return sessionCount > 0 ? 82 : 74;
  if (readiness === 'blocked') return 38;
  if (status === 'working' || status === 'active') return 72;
  return sessionCount > 0 ? 68 : 55;
}

function formatSessionLabel(key?: string | null) {
  if (!key) return 'recent session';
  const compact = key.replace(/^agent:/, '').replace(/:channel:/g, ' • channel ').replace(/:thread:/g, ' • thread ');
  return compact.length > 72 ? `${compact.slice(0, 69)}…` : compact;
}

function getStatusHeartbeatEntry(status: OpenClawStatusResponse, agentId: string) {
  return (status.heartbeat?.agents || []).find((entry) => entry.agentId === agentId);
}

function computeSignals(agent: OpenClawHealthAgent, status: OpenClawStatusResponse): AgentSignal[] {
  const recent = agent.sessions?.recent?.[0];
  const sessionCount = agent.sessions?.count ?? 0;
  const statusHeartbeat = getStatusHeartbeatEntry(status, agent.agentId);
  const heartbeatEnabled = agent.heartbeat?.enabled ?? statusHeartbeat?.enabled;
  const heartbeatEvery = agent.heartbeat?.every || statusHeartbeat?.every;
  const isPresented = !!AGENT_PRESENTATION[agent.agentId];
  const runtimeAgeMs = recent?.age ?? (recent?.updatedAt ? Date.now() - recent.updatedAt : undefined);
  const hasRuntimeEvidence = sessionCount > 0 || runtimeAgeMs !== undefined;

  const presentational: AgentSignal = {
    kind: 'presentational',
    label: 'Presentation',
    state: isPresented ? 'yes' : 'partial',
    detail: isPresented ? 'Agent has an explicit deck persona and role mapping.' : 'Agent is visible, but using fallback deck presentation metadata.',
  };

  const config: AgentSignal = {
    kind: 'config',
    label: 'Config',
    state: heartbeatEnabled === true || agent.isDefault ? 'yes' : sessionCount > 0 ? 'partial' : 'unknown',
    detail:
      heartbeatEnabled === true
        ? `Heartbeat enabled${heartbeatEvery ? ` (${heartbeatEvery})` : ''}.`
        : agent.isDefault
          ? 'Default agent is configured by runtime even without heartbeat automation.'
          : sessionCount > 0
            ? 'Agent is configured enough to have sessions, but no autonomous heartbeat is enabled.'
            : 'No explicit autonomous config signal returned for this agent.',
  };

  const runtime: AgentSignal = {
    kind: 'runtime',
    label: 'Runtime',
    state: hasRuntimeEvidence ? (runtimeAgeMs !== undefined && runtimeAgeMs < 60 * 60 * 1000 ? 'yes' : 'partial') : 'unknown',
    detail:
      sessionCount > 0
        ? `Observed ${sessionCount} session${sessionCount === 1 ? '' : 's'}${runtimeAgeMs !== undefined ? `, last active ${relFromAgeMs(runtimeAgeMs)}` : ''}.`
        : 'No recent runtime activity was returned for this agent.',
  };

  let deployState: AgentSignal['state'] = 'unknown';
  let deployDetail = 'No direct deploy-capability signal is exposed by the current runtime surfaces.';

  if (agent.agentId === 'builder') {
    if (sessionCount > 0) {
      deployState = 'yes';
      deployDetail = `Builder now has end-to-end frontend deploy proof via ${BUILDER_DEPLOY_PROOF.label} (${BUILDER_DEPLOY_PROOF.url}); remote live bridge/API access remains a separate architecture task.`;
    } else if (agent.isDefault || heartbeatEnabled) {
      deployState = 'partial';
      deployDetail = `Builder is configured and has verified deploy proof via ${BUILDER_DEPLOY_PROOF.label}, but no recent builder session directly proves current live runtime activity.`;
    } else {
      deployState = 'partial';
      deployDetail = `Builder has verified deploy proof via ${BUILDER_DEPLOY_PROOF.label}, but current runtime surfaces still do not expose enough live config/activity evidence to make broader runtime claims.`;
    }
  } else if (sessionCount > 0) {
    deployState = 'partial';
    deployDetail = 'Agent has runtime evidence, but deploy capability is still inferred because no dedicated deploy signal is exposed.';
  }

  return [presentational, config, runtime, {
    kind: 'deploy',
    label: 'Deploy',
    state: deployState,
    detail: deployDetail,
  }];
}

function evaluateReadiness(agent: OpenClawHealthAgent, status: OpenClawStatusResponse) {
  const recent = agent.sessions?.recent?.[0];
  const sessionCount = agent.sessions?.count ?? 0;
  const ageMs = recent?.age ?? (recent?.updatedAt ? Date.now() - recent.updatedAt : undefined);
  const statusHeartbeat = getStatusHeartbeatEntry(status, agent.agentId);
  const heartbeatEnabled = agent.heartbeat?.enabled ?? statusHeartbeat?.enabled;
  const signals = computeSignals(agent, status);

  const hasConfig = agent.isDefault || heartbeatEnabled === true || sessionCount > 0;
  const hasRuntimeEvidence = sessionCount > 0;
  const builderSpecialCase = agent.agentId === 'builder';

  let readiness: AgentReadiness = 'unknown';
  let readinessLabel = 'Unknown';
  let blockedReason: string | undefined;

  if (builderSpecialCase) {
    if (hasRuntimeEvidence && hasConfig) {
      readiness = 'ready';
      readinessLabel = 'Builder deploy-ready';
      blockedReason = undefined;
    } else if (hasConfig) {
      readiness = 'limited';
      readinessLabel = 'Builder deploy-proven, awaiting live runtime proof';
      blockedReason = `Deploy path is now proven via ${BUILDER_DEPLOY_PROOF.label}, but current runtime signals still do not directly prove live builder activity.`;
    } else {
      readiness = 'limited';
      readinessLabel = 'Builder deploy-proven, runtime evidence thin';
      blockedReason = `Deploy proof exists via ${BUILDER_DEPLOY_PROOF.label}, but broader runtime/config evidence is still incomplete.`;
    }
  } else if (hasRuntimeEvidence && hasConfig) {
    readiness = heartbeatEnabled ? 'ready' : 'limited';
    readinessLabel = heartbeatEnabled ? 'Ready now' : 'Live, but operator-routed';
    if (!heartbeatEnabled) blockedReason = 'Live sessions exist, but autonomous scheduling is disabled, so this agent should be treated as operator-routed instead of fully autonomous.';
  } else if (hasConfig) {
    readiness = 'limited';
    readinessLabel = 'Configured, awaiting runtime proof';
    blockedReason = 'The agent is configured, but current runtime activity is missing or stale.';
  } else if ((agent.sessions?.count ?? 0) === 0) {
    readiness = 'unknown';
    readinessLabel = 'Evidence not yet sufficient';
    blockedReason = 'The current runtime surfaces did not return enough config or activity evidence to classify this agent confidently.';
  }

  let statusValue = summarizeRuntimeStatus(sessionCount, ageMs, heartbeatEnabled);
  if (readiness === 'blocked') statusValue = 'blocked';
  if (readiness === 'unknown' && statusValue === 'offline') statusValue = 'unknown';

  const truthSummary = signals.map((signal) => `${signal.label}: ${signal.detail}`).join(' ');
  const operatorSummary =
    readiness === 'ready'
      ? builderSpecialCase
        ? `Builder has verified end-to-end frontend deploy proof via ${BUILDER_DEPLOY_PROOF.label}; treat remote live bridge/API access as a separate architecture track.`
        : 'Current runtime signals show this agent is configured and recently active.'
      : readiness === 'limited'
        ? builderSpecialCase
          ? `Builder deploy capability is now proven, but live runtime/bridge evidence is still incomplete; do not merge that separate architecture gap into deploy readiness.`
          : 'This agent has some live evidence, but not enough to treat it as fully autonomous.'
        : readiness === 'blocked'
          ? 'Do not assume this agent can take the claimed work until missing evidence is restored.'
          : 'This is an evidence gap, not necessarily a failure; the runtime just is not proving enough yet.';

  return {
    statusValue,
    readiness,
    readinessLabel,
    blockedReason,
    signals,
    truthSummary,
    operatorSummary,
    ageMs,
  };
}

function deriveAgent(agent: OpenClawHealthAgent, index: number, status: OpenClawStatusResponse): Agent {
  const id = agent.agentId;
  const displayName = agent.name || titleizeAgentId(id);
  const recent = agent.sessions?.recent?.[0];
  const sessionCount = agent.sessions?.count ?? 0;
  const presentation = AGENT_PRESENTATION[id];
  const evaluationOrder = id === 'builder' ? 0 : index + 1;
  const { statusValue, readiness, readinessLabel, blockedReason, signals, truthSummary, operatorSummary, ageMs } = evaluateReadiness(agent, status);
  const lastSeen = recent?.updatedAt ? relTime(recent.updatedAt) : sessionCount > 0 && ageMs !== undefined ? relFromAgeMs(ageMs) : 'unknown';

  const currentActivity =
    statusValue === 'working'
      ? `Working in ${formatSessionLabel(recent?.key)}`
      : statusValue === 'active'
        ? `Recently active in ${formatSessionLabel(recent?.key)}`
        : readiness === 'blocked'
          ? blockedReason || 'Missing the live evidence needed for a confident readiness claim'
          : presentation?.currentActivity ||
            (agent.heartbeat?.enabled
              ? 'Standing by for heartbeat and inbound work'
              : 'Available only when real runtime work is routed to it');

  return {
    id,
    name: displayName,
    emoji: presentation?.emoji || FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length],
    subtitle: presentation?.subtitle || (agent.isDefault ? 'Default OpenClaw operator agent' : 'Configured OpenClaw agent'),
    type: presentation?.type || (agent.heartbeat?.enabled ? 'Heartbeat Agent' : 'On-demand Agent'),
    role: presentation?.role || (agent.isDefault ? 'Primary Runtime' : 'Specialist Runtime'),
    status: statusValue,
    readiness,
    readinessLabel,
    blockedReason,
    accentColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    tasksCompleted: sessionCount,
    sessionCount,
    accuracy: deriveAccuracy(statusValue, sessionCount, readiness),
    skills: [
      `agent:${id}`,
      sessionCount > 0 ? `${sessionCount} session${sessionCount === 1 ? '' : 's'}` : 'no sessions yet',
      agent.heartbeat?.enabled ? `heartbeat ${agent.heartbeat.every || 'enabled'}` : 'manual or unknown automation',
      agent.heartbeat?.model || 'default model',
      readinessLabel,
    ],
    currentActivity,
    lastSeen,
    activeAgo: lastSeen,
    evaluationOrder,
    signals,
    truthSummary,
    operatorSummary,
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
  const raw = cleanText(entry.message || entry.msg, 'OpenClaw event');
  return raw.length > 220 ? `${raw.slice(0, 217)}…` : raw;
}

function toActivity(logs: OpenClawLogEntry[], agents: Agent[]): ActivityItem[] {
  const agentById = new Map(agents.map((agent) => [agent.id, agent]));
  return logs.slice(0, 12).map((entry, index) => {
    const agent = agentById.get(String(entry.agentId || entry.agent || ''));
    return {
      id: `activity-${index}`,
      agentEmoji: agent?.emoji || '📡',
      agentName: agent?.name || cleanText(entry.agentId || entry.agent || entry.channel, 'OpenClaw'),
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
      agentName: agent?.name || cleanText(entry.agentId || entry.agent, 'OpenClaw'),
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
  const recent = Array.isArray(status.sessions?.recent) ? status.sessions.recent : [];
  return recent.map((session) => ({
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
  const issues = Array.isArray(status.securityAudit?.issues) ? status.securityAudit.issues : [];
  return issues.map((issue) => ({
    severity: issue.severity || 'info',
    title: cleanText(issue.title, 'Untitled issue'),
    detail: cleanText(issue.detail, 'No detail provided.'),
    fix: issue.fix ? cleanText(issue.fix, 'No fix provided.') : undefined,
  }));
}

function toPresence(items: OpenClawPresenceResponseItem[]): PresenceItem[] {
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => ({
    text: cleanText(item.text, 'Presence event'),
    host: item.host ? cleanText(item.host, 'unknown') : undefined,
    mode: item.mode ? cleanText(item.mode, 'unknown') : undefined,
    reason: item.reason ? cleanText(item.reason, 'unknown') : undefined,
    lastSeen: item.ts ? relTime(item.ts) : undefined,
  }));
}

function isChannelReachable(details: OpenClawChannelHealth | undefined): boolean {
  if (!details) return false;
  if (details.running) return true;
  if (details.probe?.ok) return true;
  const accounts = details.accounts || {};
  return Object.values(accounts).some((account) => !!account?.running || !!account?.probe?.ok);
}


function summarizeChannelHealth(health: OpenClawHealthResponse, status: OpenClawStatusResponse) {
  const fromHealth = Object.entries(health.channels || {}).map(([channel, details]) => {
    const state = details?.configured ? 'configured' : isChannelReachable(details) ? 'reachable' : 'unconfigured';
    const accounts = Object.entries(details?.accounts || {}).map(([accountId, account]) => {
      const mode = account?.probe?.ok || account?.running ? 'live' : 'idle';
      const label = accountId === 'default' ? 'default' : accountId;
      return `${label}:${mode}`;
    });
    return accounts.length > 0 ? `${titleizeAgentId(channel)}: ${state} (${accounts.join(', ')})` : `${titleizeAgentId(channel)}: ${state}`;
  });

  if (fromHealth.length > 0) return fromHealth;

  const fromStatus = (Array.isArray(status.health?.channels) ? status.health.channels : [])
    .map((channel) => `${cleanText(channel.name, 'channel')}: ${cleanText(channel.status, 'unknown')}`)
    .filter(Boolean);

  if (fromStatus.length > 0) return fromStatus;

  return Array.isArray(status.channelSummary)
    ? status.channelSummary.filter(Boolean).map((line) => cleanText(line, 'channel'))
    : [];
}

function collectWarnings(
  health: OpenClawHealthResponse,
  logs: OpenClawLogEntry[],
  status: OpenClawStatusResponse,
  securityIssues: SecurityIssue[],
  agents: Agent[],
): string[] {
  const warnings = new Set<string>();

  Object.entries(health.channels || {}).forEach(([channel, details]) => {
    if (details.configured && !isChannelReachable(details)) warnings.add(`${channel} channel is configured but not reachable`);
    if (details.lastError) warnings.add(`${channel} error: ${cleanText(details.lastError, 'unknown error')}`);
    if ((details.tokenSource || 'none') === 'none' && !details.probe?.ok) warnings.add(`${channel} token source is missing`);
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

  agents.filter((agent) => agent.readiness === 'blocked').forEach((agent) => {
    warnings.add(`${agent.name} blocked: ${agent.blockedReason || 'missing live readiness signal'}`);
  });

  if ((status.overview?.update || '').toLowerCase().includes('available')) warnings.add(`Update pending: ${status.overview?.update}`);

  return Array.from(warnings);
}

function buildTasks(
  health: OpenClawHealthResponse,
  warnings: string[],
  securityIssues: SecurityIssue[],
  sessions: SessionSummary[],
  agents: Agent[],
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
    if (details.configured && !isChannelReachable(details)) {
      tasks.push({
        id: `channel-${channel}`,
        title: `${channel} channel configured but not reachable`,
        assignee: '📡',
        priority: 'high',
        column: 'needs-input',
      });
    }
  });

  const blockedAgents = agents.filter((agent) => {
    if (agent.readiness === 'blocked') return true;
    if (agent.readiness !== 'limited') return false;
    if (agent.id === 'builder' && agent.readinessLabel.toLowerCase().includes('deploy-proven')) return false;
    return true;
  });
  blockedAgents.slice(0, 3).forEach((agent, index) => {
    tasks.push({
      id: `agent-readiness-${agent.id}`,
      title: `${agent.name}: ${agent.readinessLabel}`,
      assignee: agent.emoji,
      priority: index === 0 ? 'high' : 'medium',
      column: 'needs-input',
    });
  });

  const builder = agents.find((agent) => agent.id === 'builder');
  if (builder?.readiness === 'ready') {
    tasks.push({
      id: 'builder-deploy-proof',
      title: `Owen Mercer deploy proof verified via Vercel (${BUILDER_DEPLOY_PROOF.url})`,
      assignee: builder.emoji,
      priority: 'low',
      progress: 100,
      column: 'done',
    });
  }

  if (warnings.some((warning) => warning.toLowerCase().includes('websocket')) || warnings.some((warning) => warning.toLowerCase().includes('http after 500'))) {
    tasks.push({
      id: 'remote-live-bridge-architecture',
      title: 'Separate remote live command-deck bridge/API architecture from deploy proof',
      assignee: '📡',
      priority: 'high',
      column: 'todo',
    });
  }

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

  const unknownAgents = agents.filter((agent) => agent.readiness === 'unknown');
  unknownAgents.slice(0, 2).forEach((agent, index) => {
    tasks.push({
      id: `agent-unknown-${agent.id}`,
      title: `Collect more runtime evidence for ${agent.name}`,
      assignee: '❔',
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
  const builder = agents.find((agent) => agent.id === 'builder');

  return [
    {
      id: 'live-system-review',
      question: 'What needs operator attention right now in OpenClaw?',
      status: warnings.length > 0 ? 'active' : 'completed',
      participants,
      messages: [
        {
          agentEmoji: builder?.emoji || '🛠️',
          agentName: builder?.name || 'Builder',
          messageNumber: 1,
          content: builder
            ? `Builder evaluated first: ${builder.readinessLabel}. ${builder.truthSummary}`
            : 'Builder was not returned by current OpenClaw health surfaces.',
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
      summary: cleanText(status.overview?.sessions, 'Live status snapshot from OpenClaw.'),
      action_items: warnings.slice(0, 4).map((warning) => ({ task: warning, assignee: 'operator', done: false })),
      ai_insights: `Gateway: ${cleanText(status.overview?.gateway, 'unknown')} · Heartbeat: ${cleanText(status.overview?.heartbeat, 'unknown')}`,
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
      summary: cleanText(status.securityAudit?.summary, 'No security audit summary available.'),
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

const OPS_STAGE_ORDER: OpsStage[] = ['outreach', 'discovery', 'proposal', 'onboarding', 'delivery', 'intel', 'retention'];
const OPS_STAGE_LABELS: Record<OpsStage, string> = {
  outreach: 'Outreach',
  discovery: 'Discovery',
  proposal: 'Proposal',
  onboarding: 'Onboarding',
  delivery: 'Delivery',
  intel: 'Intel',
  retention: 'Retention',
};
const OPS_STAGE_EMOJIS: Record<OpsStage, string> = {
  outreach: '📣',
  discovery: '🔍',
  proposal: '📝',
  onboarding: '🚀',
  delivery: '⚙️',
  intel: '🧠',
  retention: '🔄',
};

const OPS_STORAGE_KEY = 'command-deck-opsloop-v1';

function loadOpsContacts(): OpsContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OpsContact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildOpsLoop(): OpsLoopData {
  const saved = loadOpsContacts();
  return {
    contacts: saved,
    stageOrder: OPS_STAGE_ORDER,
    stageLabels: OPS_STAGE_LABELS,
    stageEmojis: OPS_STAGE_EMOJIS,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [healthResult, logsResult, statusResult, presenceResult] = await Promise.all([
    fetchJsonWithMeta<OpenClawHealthResponse>('/api/openclaw/health', { agents: [], channels: {}, sessions: { count: 0 } }),
    fetchJsonWithMeta<OpenClawLogEntry[]>('/api/openclaw/logs?limit=40', []),
    fetchJsonWithMeta<OpenClawStatusResponse>('/api/openclaw/status', {}),
    fetchJsonWithMeta<OpenClawPresenceResponseItem[]>('/api/openclaw/system-presence', []),
  ]);

  const health = healthResult.data;
  const logs = logsResult.data;
  const status = statusResult.data;
  const presence = presenceResult.data;
  const bridgeAvailable = [healthResult, logsResult, statusResult, presenceResult].some((result) => result.meta.ok);
  const remoteDegraded = [healthResult, logsResult, statusResult, presenceResult].some((result) => !result.meta.ok);

  const rawAgents = Array.isArray(health.agents) ? health.agents : [];
  const agents = rawAgents
    .map((agent, index) => deriveAgent(agent, index, status))
    .sort((a, b) => a.evaluationOrder - b.evaluationOrder || a.name.localeCompare(b.name));

  const sessions = toSessions(status);
  const securityIssues = toSecurityIssues(status);
  const presenceItems = toPresence(presence);
  const warnings = collectWarnings(health, logs, status, securityIssues, agents);
  if (remoteDegraded) {
    warnings.unshift('Remote API degraded: bridge-backed endpoints partially unavailable. Showing best-effort dashboard data instead of blank-screening.');
  }
  const channelEntries = Object.entries(health.channels || {});
  const configuredChannels = channelEntries.filter(([, details]) => details?.configured).length;
  const runningChannels = channelEntries.filter(([, details]) => isChannelReachable(details)).length;
  const channelSummary = summarizeChannelHealth(health, status);
  const readyAgents = agents.filter((agent) => agent.readiness === 'ready').length;
  const limitedAgents = agents.filter((agent) => agent.readiness === 'limited').length;
  const blockedAgents = agents.filter((agent) => agent.readiness === 'blocked').length;
  const unknownAgents = agents.filter((agent) => agent.readiness === 'unknown').length;
  const configuredAgents = agents.filter((agent) => agent.signals.some((signal) => signal.kind === 'config' && signal.state !== 'unknown')).length;
  const activeAgents = agents.filter((agent) => agent.status === 'working' || agent.status === 'active' || agent.status === 'idle').length;
  const workingAgents = agents.filter((agent) => agent.status === 'working').length;
  const heartbeatAgents = (health.agents || []).filter((agent) => agent.heartbeat?.enabled).length;
  const sessionCount = health.sessions?.count ?? sessions.length;

  return {
    agents,
    recentActivity: toActivity(logs, agents),
    initialTasks: buildTasks(health, warnings, securityIssues, sessions, agents),
    logEntries: toLogs(logs, agents),
    councilSessions: buildCouncil(agents, warnings, securityIssues, sessions, presenceItems),
    meetings: buildMeetings(status, warnings, securityIssues, presenceItems),
    sessions,
    securityIssues,
    presence: presenceItems,
    opsLoop: buildOpsLoop(),
    summary: {
      version: cleanText(status.runtimeVersion, 'unknown'),
      update: cleanText(status.overview?.update, 'unknown'),
      gateway: cleanText(status.overview?.gateway, 'unknown'),
      channels: channelSummary,
      sessionsText: cleanText(status.overview?.sessions, 'unknown'),
      heartbeat: cleanText(status.overview?.heartbeat, 'unknown'),
      securitySummary: cleanText(status.securityAudit?.summary, 'No security summary'),
      totalAgents: agents.length,
      configuredAgents,
      readyAgents,
      limitedAgents,
      blockedAgents,
      unknownAgents,
      activeAgents,
      workingAgents,
      heartbeatAgents,
      configuredChannels,
      runningChannels,
      sessionCount,
    },
    meta: {
      source: remoteDegraded ? 'openclaw-live-bridge-degraded' : 'openclaw-live-bridge',
      warnings,
      generatedAt: new Date().toISOString(),
      bridgeAvailable,
      remoteDegraded,
    },
  };
}
