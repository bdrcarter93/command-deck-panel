import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CircleDot,
  Coffee,
  Cpu,
  LayoutGrid,
  LampDesk,
  MessageSquareQuote,
  Radar,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Waves,
  Workflow,
  X,
} from 'lucide-react';
import AILog from '@/components/AILog';
import OpsLoop from '@/components/OpsLoop';
import TaskBoard from '@/components/TaskBoard';
import FinancialOverview from '@/components/FinancialOverview';
import PriorityKpiOverview from '@/components/PriorityKpiOverview';
import RoofingWorkflowPilot from '@/components/RoofingWorkflowPilot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import type { ActivityItem, Agent, AgentStatus, SessionSummary, Task } from '@/lib/liveData';

const FALLBACK_SCENE_AGENTS: Agent[] = [
  {
    id: 'scene-main',
    name: 'Main',
    emoji: '🧭',
    subtitle: 'Chief of Staff',
    type: 'Command Agent',
    role: 'Primary operator and routing brain',
    status: 'working',
    readiness: 'ready',
    readinessLabel: 'Operator-ready',
    accentColor: '#10b981',
    tasksCompleted: 18,
    accuracy: 98,
    skills: ['routing', 'coordination', 'operator-facing'],
    currentActivity: 'Routing inbound work while the live bridge catches up',
    lastSeen: 'just now',
    sessionCount: 3,
    activeAgo: 'just now',
    evaluationOrder: 0,
    signals: [],
    truthSummary: 'Presentational fallback used to keep the room readable during thin live snapshots.',
    operatorSummary: 'Fallback persona holding the room open while live bridge evidence is sparse.',
  },
  {
    id: 'scene-builder',
    name: 'Builder',
    emoji: '🛠️',
    subtitle: 'Implementation Engineer',
    type: 'Build Agent',
    role: 'Builds, refactors, ships, and validates scoped work',
    status: 'active',
    readiness: 'limited',
    readinessLabel: 'Deploy-proven',
    accentColor: '#60a5fa',
    tasksCompleted: 11,
    accuracy: 94,
    skills: ['frontend', 'deploy', 'validation'],
    currentActivity: 'Shaping the animated command deck locally before production verification',
    lastSeen: 'recently',
    sessionCount: 2,
    activeAgo: 'recently',
    evaluationOrder: 1,
    signals: [],
    truthSummary: 'Fallback builder persona used when live runtime detail is unavailable.',
    operatorSummary: 'Keeps implementation energy visible without pretending authenticated production proof exists.',
  },
  {
    id: 'scene-ops',
    name: 'Ops',
    emoji: '📡',
    subtitle: 'Operations Lead',
    type: 'Ops Agent',
    role: 'Owns runtime health, execution flow, and operational readiness',
    status: 'idle',
    readiness: 'limited',
    readinessLabel: 'Monitoring',
    accentColor: '#a78bfa',
    tasksCompleted: 7,
    accuracy: 88,
    skills: ['health', 'channels', 'watchpoints'],
    currentActivity: 'Watching bridge health and confidence cues across the room',
    lastSeen: 'moments ago',
    sessionCount: 1,
    activeAgo: 'moments ago',
    evaluationOrder: 2,
    signals: [],
    truthSummary: 'Fallback ops persona keeps the scene expressive while live telemetry is degraded.',
    operatorSummary: 'Shows operational posture without inventing unreachable bridge details.',
  },
  {
    id: 'scene-deep',
    name: 'Deep',
    emoji: '🧠',
    subtitle: 'Research Analyst',
    type: 'Research Agent',
    role: 'Performs deeper synthesis, investigation, and structured analysis',
    status: 'blocked',
    readiness: 'unknown',
    readinessLabel: 'Awaiting signal',
    blockedReason: 'Live evidence is currently too thin to promote this seat beyond ambient presence.',
    accentColor: '#f59e0b',
    tasksCompleted: 4,
    accuracy: 72,
    skills: ['analysis', 'synthesis', 'research'],
    currentActivity: 'Holding in the wings until stronger runtime evidence returns',
    lastSeen: 'signal thin',
    sessionCount: 0,
    activeAgo: 'signal thin',
    evaluationOrder: 3,
    signals: [],
    truthSummary: 'Fallback research persona marks the uncertainty honestly instead of disappearing.',
    operatorSummary: 'Represents evidence gaps clearly so the room stays alive without lying.',
  },
];

const FALLBACK_SCENE_TASKS: Task[] = [
  { id: 'scene-task-1', title: 'Stage live agent caricatures', assignee: '🛠️', priority: 'high', progress: 82, column: 'doing' },
  { id: 'scene-task-2', title: 'Keep motion believable under degraded bridge reads', assignee: '📡', priority: 'medium', progress: 64, column: 'doing' },
  { id: 'scene-task-3', title: 'Hold production verification behind authenticated access', assignee: '🧭', priority: 'high', progress: 35, column: 'needs-input' },
];

const FALLBACK_SCENE_WARNINGS = [
  'Live bridge is partially degraded, confidence cues are shown instead of certainty.',
  'Production deck remains auth-gated, local completion comes first.',
];

const FALLBACK_SCENE_SESSION: SessionSummary = {
  key: 'local:animated-office-pass',
  kind: 'direct',
  age: 'just now',
  model: 'unknown',
  percentUsed: 68,
  totalTokens: null,
  remainingTokens: null,
  cachedPercent: null,
  status: 'warm',
};

type ViewKey = 'overview' | 'tasks' | 'financial' | 'priority' | 'roofing' | 'ai-log' | 'ops-loop';

const tabs: { id: ViewKey; label: string; description: string; icon: any }[] = [
  { id: 'overview', label: 'Mission control', description: 'Live operator picture, office motion, and high-value watchpoints.', icon: Radar },
  { id: 'tasks', label: 'Task board', description: 'Who owns what, what is blocked, and what should move next.', icon: LayoutGrid },
  { id: 'financial', label: 'Runtime economics', description: 'Bridge health, channel reachability, and leverage over cost and friction.', icon: BriefcaseBusiness },
  { id: 'priority', label: 'Command KPIs', description: 'Queue pressure, signal integrity, and where the room needs attention.', icon: Activity },
  { id: 'roofing', label: 'Roof routing', description: 'Roof-system-aware pathing for shingle, tile, SPF foam, and cedar shake.', icon: ShieldAlert },
  { id: 'ai-log', label: 'Agent log', description: 'Live system logs, 8-phase build pipeline tracker, and session context.', icon: ScrollText },
  { id: 'ops-loop', label: 'Ops loop', description: '7-stage business pipeline: Outreach → Discovery → Proposal → Onboarding → Delivery → Intel → Retention.', icon: Workflow },
];

const deskStatus: AgentStatus[] = ['working', 'active'];
const loungeStatus: AgentStatus[] = ['idle', 'unknown'];
const breakRoomStatus: AgentStatus[] = ['blocked', 'offline'];

type OfficeLiveState = {
  doingTasks: Task[];
  blockedTasks: Task[];
  warnings: string[];
  hotSessions: SessionSummary[];
  deskAgents: Agent[];
  loungeAgents: Agent[];
  breakRoomAgents: Agent[];
  officeRoster: { agent: Agent; zone: 'desk' | 'lounge' | 'break'; slot: number }[];
  usingSceneFallback: boolean;
};

type HotspotDef = {
  id: string;
  kind: 'agent' | 'session' | 'warning' | 'task';
  label: string;
  x: string;
  y: string;
  accentColor: string;
  detail: {
    emoji?: string;
    title: string;
    status?: string;
    body: string;
    meta?: string;
    skills?: string[];
  };
};

function buildOfficeLiveState(data: any): OfficeLiveState {
  const liveAgents = data.agents || [];
  const sceneAgents = liveAgents.length >= 3 ? liveAgents : FALLBACK_SCENE_AGENTS;
  const liveDoingTasks = data.initialTasks.filter((task: Task) => task.column === 'doing');
  const liveBlockedTasks = data.initialTasks.filter((task: Task) => task.column === 'needs-input');
  const doingTasks = liveDoingTasks.length > 0 ? liveDoingTasks : FALLBACK_SCENE_TASKS.filter((task) => task.column === 'doing');
  const blockedTasks = liveBlockedTasks.length > 0 ? liveBlockedTasks : FALLBACK_SCENE_TASKS.filter((task) => task.column === 'needs-input');
  const liveWarnings = data.meta.warnings.slice(0, 5);
  const warnings = liveWarnings.length > 0 ? liveWarnings : FALLBACK_SCENE_WARNINGS;
  const liveHotSessions = data.sessions.filter((session: SessionSummary) => session.status === 'hot');
  const hotSessions = liveHotSessions.length > 0 ? liveHotSessions : [FALLBACK_SCENE_SESSION];
  const deskAgents = sceneAgents.filter((agent: Agent) => deskStatus.includes(agent.status));
  const loungeAgents = sceneAgents.filter((agent: Agent) => loungeStatus.includes(agent.status));
  const breakRoomAgents = sceneAgents.filter((agent: Agent) => breakRoomStatus.includes(agent.status));
  const officeRoster = [
    ...deskAgents.map((agent: Agent, index: number) => ({ agent, zone: 'desk' as const, slot: index })),
    ...loungeAgents.map((agent: Agent, index: number) => ({ agent, zone: 'lounge' as const, slot: index })),
    ...breakRoomAgents.map((agent: Agent, index: number) => ({ agent, zone: 'break' as const, slot: index })),
  ].slice(0, 8);
  const usingSceneFallback = liveAgents.length < 3 || liveDoingTasks.length === 0;

  return {
    doingTasks,
    blockedTasks,
    warnings,
    hotSessions,
    deskAgents,
    loungeAgents,
    breakRoomAgents,
    officeRoster,
    usingSceneFallback,
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<ViewKey>('overview');
  const { data, isLoading, error } = useDashboardData();

  const activeView = useMemo(() => {
    switch (activeTab) {
      case 'tasks':
        return <TaskBoard />;
      case 'financial':
        return <FinancialOverview />;
      case 'priority':
        return <PriorityKpiOverview />;
      case 'roofing':
        return <RoofingWorkflowPilot />;
      case 'ai-log':
        return <AILog />;
      case 'ops-loop':
        return <OpsLoop />;
      case 'overview':
      default:
        return <MissionControlOverview data={data} isLoading={isLoading} error={error} />;
    }
  }, [activeTab, data, isLoading, error]);

  const summaryCards = data
    ? [
        {
          label: 'Agents online',
          value: `${data.summary.activeAgents}/${data.summary.totalAgents}`,
          note: `${data.summary.readyAgents} ready now`,
          tone: 'text-cyan-200',
        },
        {
          label: 'Open sessions',
          value: `${data.summary.sessionCount}`,
          note: `${data.sessions.filter((session) => session.status === 'hot').length} hot`,
          tone: 'text-emerald-200',
        },
        {
          label: 'Warnings',
          value: `${data.meta.warnings.length}`,
          note: data.meta.remoteDegraded ? 'bridge degraded' : 'live bridge stable',
          tone: data.meta.warnings.length ? 'text-amber-200' : 'text-slate-100',
        },
        {
          label: 'Channels',
          value: `${data.summary.runningChannels}/${data.summary.configuredChannels}`,
          note: 'reachable now',
          tone: 'text-violet-200',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),radial-gradient(circle_at_85%_18%,_rgba(167,139,250,0.16),_transparent_18%),linear-gradient(180deg,#020617_0%,#030712_42%,#020617_100%)] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="overflow-hidden border-white/10 bg-slate-950/75 shadow-[0_0_80px_rgba(14,165,233,0.08)] backdrop-blur-xl">
            <CardHeader className="relative space-y-6 border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(2,6,23,0.6))] pb-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-4xl">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-cyan-300">
                    <Sparkles className="h-4 w-4" /> Mission Control
                  </div>
                  <CardTitle className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Command deck, restored around live runtime truth</CardTitle>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    A darker, more operational dashboard shell that puts real agent readiness, session heat, bridge state, and queue pressure ahead of decorative mock data. The room should feel cinematic without lying.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[460px]">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
                      <div className={cn('mt-2 text-3xl font-semibold text-white', card.tone)}>{card.value}</div>
                      <div className="mt-1 text-sm text-slate-400">{card.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <TopStripCard title="Gateway" value={data?.summary.gateway || 'Loading…'} icon={Cpu} detail={`Version ${data?.summary.version || '…'}`} />
                  <TopStripCard title="Heartbeat" value={data?.summary.heartbeat || 'Loading…'} icon={Waves} detail={`${data?.summary.heartbeatAgents || 0} heartbeat agents`} />
                  <TopStripCard title="Security" value={data?.summary.securitySummary || 'Loading…'} icon={ShieldAlert} detail={`${data?.securityIssues.length || 0} surfaced issues`} />
                </div>
                <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/10 p-4 text-sm text-cyan-50">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-200"><BrainCircuit className="h-4 w-4" /> Operator note</div>
                  <p className="mt-3 leading-7 text-cyan-50/90">
                    {data
                      ? data.meta.remoteDegraded
                        ? 'Bridge-backed sources are partially degraded, so the deck is showing best-effort live truth with confidence cues instead of fake certainty.'
                        : 'Bridge-backed sources are responding, so this room is grounded in current OpenClaw state rather than a demo narrative.'
                      : 'Waiting for bridge data to settle.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'group min-w-[230px] rounded-2xl border p-4 text-left transition duration-200',
                        active
                          ? 'border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.16)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('rounded-xl p-2', active ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/10 text-slate-300 group-hover:text-white')}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{tab.label}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-400">{tab.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
          </Card>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeView}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

function MissionControlOverview({ data, isLoading, error }: { data: any; isLoading: boolean; error: unknown }) {
  if (isLoading) {
    return (
      <Card className="border-white/10 bg-slate-950/70">
        <CardContent className="p-8 text-sm text-slate-300">Loading mission control...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="p-8 text-rose-100">Mission control could not load live runtime data yet.</CardContent>
      </Card>
    );
  }

  const { doingTasks, blockedTasks, warnings, hotSessions, deskAgents, loungeAgents, breakRoomAgents, officeRoster, usingSceneFallback } = buildOfficeLiveState(data);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-white/10 bg-slate-950/80 p-0">
          <CardContent className="p-0">
            <Link to="/office-live" className="group block transition">
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/7' }}>
                <img src="/office-live-reference.png" alt="Office Live" className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.015]" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-transparent to-slate-950/88" />

                {/* Top strip */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', usingSceneFallback ? 'bg-amber-400' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]')} />
                    <span className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Office Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950/65 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md">
                      {hotSessions.length} hot session{hotSessions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/65 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md">
                      {doingTasks.length} in flight
                    </div>
                    {warnings.length > 0 && (
                      <div className="rounded-xl border border-amber-400/20 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-200 backdrop-blur-md">
                        {warnings.length} alert{warnings.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5">
                  <div>
                    <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Agent workspace</div>
                    <div className="mt-1 text-sm text-slate-300">
                      {usingSceneFallback
                        ? 'Fallback runtime — reference art'
                        : `Live bridge · ${officeRoster.length} agent${officeRoster.length !== 1 ? 's' : ''} mapped`}
                    </div>
                  </div>
                  <div className="flex-shrink-0 rounded-2xl border border-cyan-400/25 bg-slate-950/65 px-5 py-2.5 text-sm font-medium text-cyan-100 backdrop-blur-md transition group-hover:border-cyan-400/50 group-hover:bg-cyan-500/15">
                    <span className="flex items-center gap-2">Enter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </div>

              {/* Live stat strip */}
              <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/8">
                <div className="px-5 py-3.5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sessions</div>
                  <div className="mt-1 text-xl font-semibold text-white">{hotSessions.length}</div>
                </div>
                <div className="px-5 py-3.5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Warnings</div>
                  <div className={cn('mt-1 text-xl font-semibold', warnings.length > 0 ? 'text-amber-300' : 'text-white')}>{warnings.length}</div>
                </div>
                <div className="px-5 py-3.5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">In flight</div>
                  <div className="mt-1 text-xl font-semibold text-white">{doingTasks.length}</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Command watch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <WatchRow label="Bridge source" value={data.meta.source} />
            <WatchRow label="Generated" value={new Date(data.meta.generatedAt).toLocaleTimeString()} />
            <WatchRow label="Sessions" value={data.summary.sessionsText} />
            <WatchRow label="Channels" value={`${data.summary.runningChannels}/${data.summary.configuredChannels} reachable`} />
            <WatchRow label="Warnings" value={warnings.length ? `${warnings.length} surfaced` : 'Quiet'} />
            <WatchRow label="Scene mode" value={usingSceneFallback ? 'cinematic fallback' : 'live runtime'} />
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Top warnings</div>
              <div className="mt-3 space-y-2">
                {warnings.length > 0 ? warnings.map((warning: string) => (
                  <div key={warning} className="rounded-xl border border-amber-400/10 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{warning}</div>
                )) : <div className="text-sm text-slate-400">No active warnings in the current snapshot.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Runtime deck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.agents.slice(0, 6).map((agent: Agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl">{agent.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white">{agent.name}</div>
                        <StatusBadge status={agent.status} />
                      </div>
                      <div className="text-sm text-slate-400">{agent.subtitle}</div>
                    </div>
                  </div>
                  <Badge className="border-white/10 bg-white/5 text-slate-200">{agent.readinessLabel}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.operatorSummary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.signals.map((signal) => (
                    <Badge key={`${agent.id}-${signal.kind}`} className={cn('border-white/10 bg-white/5 text-slate-200', signal.state === 'yes' && 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100', signal.state === 'partial' && 'border-amber-400/20 bg-amber-500/10 text-amber-100')}>
                      {signal.label}: {signal.state}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Hot sessions and next moves</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <CommandColumn title="Hot sessions" items={hotSessions.map((session: SessionSummary) => `${session.key} · ${session.percentUsed ?? '?'}% context used`)} empty="No hot sessions right now." />
              <CommandColumn title="In flight" items={doingTasks.map((task: Task) => `${task.title}${task.progress !== undefined ? ` · ${task.progress}%` : ''}`)} empty="Nothing is currently in the doing column." />
              <CommandColumn title="Needs input" items={blockedTasks.map((task: Task) => task.title)} empty="Nothing currently blocked on input." />
              <CommandColumn title="Recent activity" items={data.recentActivity.slice(0, 4).map((item: any) => `${item.agentEmoji} ${item.action}`)} empty="No recent activity surfaced." />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Section map</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                ['Mission control', 'The main cinematic operational shell with live agent placement and warning posture.'],
                ['Task board', 'Real task orchestration and blocked work.'],
                ['Runtime economics', 'Bridge, channel, and readiness signals reframed as system economics.'],
                ['Command KPIs', 'Pressure, integrity, and throughput metrics grounded in runtime evidence.'],
                ['Roof routing', 'Roof-system-aware inspection routing, starter case examples, and conservative human-review fallback rules.'],
                ['Agent log', 'Live OpenClaw system logs, 8-phase build pipeline tracker, and active session context.'],
                ['Ops loop', '7-stage business pipeline for tracking contacts from Outreach through Retention.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-white"><CircleDot className="h-4 w-4 text-cyan-300" /> {title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function OfficeLiveFullscreen({ data, isLoading, error }: { data: any; isLoading: boolean; error: unknown }) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDef | null>(null);

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-slate-950/70">
        <CardContent className="p-8 text-sm text-slate-300">Loading Office Live...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="p-8 text-rose-100">Office Live could not load live runtime data yet.</CardContent>
      </Card>
    );
  }

  const { doingTasks, blockedTasks, warnings, hotSessions, deskAgents, loungeAgents, breakRoomAgents, officeRoster, usingSceneFallback } = buildOfficeLiveState(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-300"><Building2 className="h-4 w-4" /> Office Live</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dedicated full-screen visual</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">This is the big scene view. Mission Control stays operational, and this route gets to be cinematic.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Back to mission control
        </Link>
      </div>

      <Card className="overflow-hidden border-white/10 bg-slate-950/70">
        <CardContent className="p-3 sm:p-4">
          <OfficeScene
            agents={officeRoster}
            tasks={doingTasks}
            warnings={warnings}
            hotSessions={hotSessions}
            recentActivity={data.recentActivity}
            runningChannels={data.summary.runningChannels}
            configuredChannels={data.summary.configuredChannels}
            generatedAt={data.meta.generatedAt}
            usingFallback={usingSceneFallback}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <OfficeZone title="Desk bay" subtitle="Working or recently active" icon={LampDesk} agents={deskAgents} accent="from-cyan-500/15 to-blue-500/5" emptyLabel="No active desk motion right now" />
          <OfficeZone title="Lounge" subtitle="Idle or awaiting routing" icon={Coffee} agents={loungeAgents} accent="from-violet-500/15 to-fuchsia-500/5" emptyLabel="Nobody is idling in the lounge" compact />
          <OfficeZone title="Break room" subtitle="Blocked, offline, or confidence-thin" icon={AlertTriangle} agents={breakRoomAgents} accent="from-amber-500/15 to-rose-500/5" emptyLabel="No agents parked in recovery" compact />
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Command watch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <WatchRow label="Bridge source" value={data.meta.source} />
              <WatchRow label="Generated" value={new Date(data.meta.generatedAt).toLocaleTimeString()} />
              <WatchRow label="Sessions" value={data.summary.sessionsText} />
              <WatchRow label="Channels" value={`${data.summary.runningChannels}/${data.summary.configuredChannels} reachable`} />
              <WatchRow label="Warnings" value={warnings.length ? `${warnings.length} surfaced` : 'Quiet'} />
              <WatchRow label="Scene mode" value={usingSceneFallback ? 'reference art + fallback runtime' : 'reference art + live runtime'} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Hot sessions and next moves</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <CommandColumn title="Hot sessions" items={hotSessions.map((session: SessionSummary) => `${session.key} · ${session.percentUsed ?? '?'}% context used`)} empty="No hot sessions right now." />
              <CommandColumn title="In flight" items={doingTasks.map((task: Task) => `${task.title}${task.progress !== undefined ? ` · ${task.progress}%` : ''}`)} empty="Nothing is currently in the doing column." />
              <CommandColumn title="Needs input" items={blockedTasks.map((task: Task) => task.title)} empty="Nothing currently blocked on input." />
              <CommandColumn title="Recent activity" items={data.recentActivity.slice(0, 4).map((item: any) => `${item.agentEmoji} ${item.action}`)} empty="No recent activity surfaced." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TopStripCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400"><Icon className="h-4 w-4 text-cyan-300" /> {title}</div>
      <div className="mt-3 text-lg font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{detail}</div>
    </div>
  );
}

const DESK_POSITIONS = [{ x: '36%', y: '58%' }, { x: '50%', y: '64%' }];
const LOUNGE_POSITIONS = [{ x: '68%', y: '50%' }];
const BREAK_POSITIONS = [{ x: '81%', y: '38%' }];
const STATUS_DOT_COLORS: Record<string, string> = {
  working: '#10b981',
  active: '#22d3ee',
  idle: '#a78bfa',
  blocked: '#f59e0b',
  offline: '#64748b',
  unknown: '#64748b',
};

function buildSceneHotspots(
  agents: { agent: Agent; zone: 'desk' | 'lounge' | 'break'; slot: number }[],
  tasks: Task[],
  warnings: string[],
  hotSessions: SessionSummary[],
): HotspotDef[] {
  const spots: HotspotDef[] = [];

  agents.slice(0, 4).forEach(({ agent, zone, slot }) => {
    const pool = zone === 'desk' ? DESK_POSITIONS : zone === 'lounge' ? LOUNGE_POSITIONS : BREAK_POSITIONS;
    const pos = pool[slot % pool.length];
    spots.push({
      id: agent.id,
      kind: 'agent',
      label: agent.name,
      x: pos.x,
      y: pos.y,
      accentColor: STATUS_DOT_COLORS[agent.status] ?? agent.accentColor,
      detail: {
        emoji: agent.emoji,
        title: `${agent.name} — ${agent.subtitle}`,
        status: agent.status,
        body: agent.currentActivity,
        meta: `${agent.readinessLabel} · last seen ${agent.lastSeen}`,
        skills: agent.skills?.slice(0, 4),
      },
    });
  });

  if (hotSessions.length > 0) {
    const s = hotSessions[0];
    spots.push({
      id: 'sessions',
      kind: 'session',
      label: `${hotSessions.length} session${hotSessions.length !== 1 ? 's' : ''}`,
      x: '57%',
      y: '26%',
      accentColor: '#10b981',
      detail: {
        title: `${hotSessions.length} hot session${hotSessions.length !== 1 ? 's' : ''}`,
        body: `${s.key} · ${s.percentUsed ?? '?'}% context used`,
        meta: s.model && s.model !== 'unknown' ? `Model: ${s.model}` : undefined,
      },
    });
  }

  if (warnings.length > 0) {
    spots.push({
      id: 'warnings',
      kind: 'warning',
      label: `${warnings.length} alert${warnings.length !== 1 ? 's' : ''}`,
      x: '20%',
      y: '26%',
      accentColor: '#f59e0b',
      detail: {
        title: `${warnings.length} active warning${warnings.length !== 1 ? 's' : ''}`,
        body: warnings.slice(0, 2).join(' · '),
        meta: warnings.length > 2 ? `+${warnings.length - 2} more` : undefined,
      },
    });
  }

  return spots;
}

function OfficeScene({
  agents, tasks, warnings, hotSessions, usingFallback, selectedHotspot, onSelectHotspot,
}: {
  agents: { agent: Agent; zone: 'desk' | 'lounge' | 'break'; slot: number }[];
  tasks: Task[];
  warnings: string[];
  hotSessions: SessionSummary[];
  usingFallback: boolean;
  selectedHotspot: HotspotDef | null;
  onSelectHotspot: (h: HotspotDef | null) => void;
}) {
  const hotspots = buildSceneHotspots(agents, tasks, warnings, hotSessions);

  return (
    <div className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/75 shadow-[0_30px_90px_rgba(2,6,23,0.38)]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-black">
        <img src="/office-live-reference.png" alt="Office Live reference scene" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.02)_32%,rgba(2,6,23,0.18)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(2,6,23,0.34),transparent)]" />

        {/* Top-left branding */}
        <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-white"><Building2 className="h-4 w-4 text-cyan-300" /> Office Live</div>
          <p className="mt-0.5 text-xs text-slate-400">{usingFallback ? 'Fallback runtime active' : `${agents.length} agent${agents.length !== 1 ? 's' : ''} mapped`}</p>
        </div>

        {/* Top-right scene mode */}
        <div className="absolute right-4 top-4 z-10 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-right backdrop-blur-md">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Scene mode</div>
          <div className="mt-0.5 text-sm font-medium text-white">{usingFallback ? 'Cinematic fallback' : 'Live runtime'}</div>
        </div>

        {/* Interactive hotspot markers */}
        {hotspots.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          return (
            <button
              key={spot.id}
              onClick={() => onSelectHotspot(isSelected ? null : spot)}
              style={{ left: spot.x, top: spot.y }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group/spot"
            >
              {!isSelected && (
                <motion.div
                  animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                  style={{ backgroundColor: spot.accentColor }}
                  className="absolute inset-0 rounded-full"
                />
              )}
              <div
                style={{
                  borderColor: spot.accentColor,
                  boxShadow: isSelected ? `0 0 0 3px ${spot.accentColor}33` : undefined,
                }}
                className={cn(
                  'relative flex h-7 w-7 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-200',
                  isSelected ? 'scale-110 bg-slate-950/90' : 'bg-slate-950/60 group-hover/spot:scale-110',
                )}
              >
                <div style={{ backgroundColor: spot.accentColor }} className="h-2.5 w-2.5 rounded-full" />
              </div>
              {/* Hover/active label chip */}
              <div className={cn(
                'absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md transition-all duration-150',
                isSelected
                  ? 'opacity-100 translate-x-0'
                  : 'pointer-events-none translate-x-1 opacity-0 group-hover/spot:translate-x-0 group-hover/spot:opacity-100',
              )}>
                {spot.label}
              </div>
            </button>
          );
        })}

        {usingFallback && !selectedHotspot && (
          <motion.div
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 left-4 z-10 max-w-sm rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-50 backdrop-blur-md"
          >
            Reference art is fixed. Runtime overlays are best-effort while bridge confidence is thin.
          </motion.div>
        )}

        {/* Hint when no hotspot is selected */}
        {hotspots.length > 0 && !selectedHotspot && (
          <div className="absolute bottom-4 right-4 z-10 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400 backdrop-blur-md">
            Click a marker to inspect
          </div>
        )}
      </div>

      {/* Detail readout / footer */}
      <div className="p-4">
        {selectedHotspot ? (
          <HotspotDetail hotspot={selectedHotspot} onClose={() => onSelectHotspot(null)} />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <SceneFooterCard icon={MessageSquareQuote} title="Collaboration" body={hotSessions.length > 0 ? `${hotSessions.length} hot session${hotSessions.length === 1 ? '' : 's'} currently active.` : 'No hot sessions right now.'} />
            <SceneFooterCard icon={Coffee} title="Office vibe" body={warnings.length > 0 ? `${warnings.length} caution signal${warnings.length === 1 ? '' : 's'} surfaced.` : 'No current warning pressure.'} />
            <SceneFooterCard icon={Activity} title="Motion" body={`${tasks.length} in-flight task${tasks.length === 1 ? '' : 's'} driving scene state.`} />
          </div>
        )}
      </div>
    </div>
  );
}

function HotspotDetail({ hotspot, onClose }: { hotspot: HotspotDef; onClose: () => void }) {
  const statusBadgeClass = (status?: string) => {
    const map: Record<string, string> = {
      working: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
      active: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
      idle: 'border-violet-400/20 bg-violet-500/10 text-violet-100',
      blocked: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
      offline: 'border-white/10 bg-white/5 text-slate-300',
    };
    return status ? (map[status] ?? 'border-white/10 bg-white/5 text-slate-300') : 'border-white/10 bg-white/5 text-slate-300';
  };
  const kindBadgeClass: Record<string, string> = {
    warning: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
    session: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
    task: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
    agent: 'border-white/10 bg-white/5 text-slate-300',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-5 rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          {hotspot.detail.emoji && <span className="text-2xl">{hotspot.detail.emoji}</span>}
          <div className="font-semibold text-white">{hotspot.detail.title}</div>
          {hotspot.detail.status && (
            <Badge className={cn('capitalize', statusBadgeClass(hotspot.detail.status))}>{hotspot.detail.status}</Badge>
          )}
          {hotspot.kind !== 'agent' && (
            <Badge className={cn('capitalize', kindBadgeClass[hotspot.kind] ?? 'border-white/10 bg-white/5 text-slate-300')}>{hotspot.kind}</Badge>
          )}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{hotspot.detail.body}</p>
        {hotspot.detail.meta && <div className="mt-2 text-xs text-slate-400">{hotspot.detail.meta}</div>}
        {hotspot.detail.skills && hotspot.detail.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {hotspot.detail.skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">{skill}</span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function SceneFooterCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm font-medium text-white"><Icon className="h-4 w-4 text-cyan-300" /> {title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function OfficeZone({ title, subtitle, icon: Icon, agents, accent, emptyLabel, compact = false }: { title: string; subtitle: string; icon: any; agents: Agent[]; accent: string; emptyLabel: string; compact?: boolean }) {
  return (
    <div className={cn('rounded-[28px] border border-white/10 bg-gradient-to-br p-4', accent)}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2 text-cyan-100"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{subtitle}</div>
        </div>
      </div>
      <div className={cn('mt-4 grid gap-3', compact ? 'sm:grid-cols-1' : 'sm:grid-cols-2')}>
        {agents.length > 0 ? agents.map((agent) => (
          <motion.div key={agent.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.25)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl">{agent.emoji}</div>
                <div>
                  <div className="font-medium text-white">{agent.name}</div>
                  <div className="text-sm text-slate-400">{agent.currentActivity}</div>
                </div>
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{agent.readinessLabel}</span>
              <span>{agent.lastSeen}</span>
            </div>
          </motion.div>
        )) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

function WatchRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-right text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, string> = {
    working: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
    active: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
    idle: 'border-violet-400/20 bg-violet-500/10 text-violet-100',
    blocked: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
    offline: 'border-white/10 bg-white/5 text-slate-300',
    unknown: 'border-white/10 bg-white/5 text-slate-300',
  };
  return <Badge className={cn('capitalize', map[status])}>{status}</Badge>;
}

function CommandColumn({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="flex items-center justify-between text-white">
        <div className="text-sm font-medium">{title}</div>
        <ArrowRight className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? items.map((item) => <div key={item} className="rounded-xl border border-white/8 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">{item}</div>) : <div className="text-sm text-slate-400">{empty}</div>}
      </div>
    </div>
  );
}

export default Index;
