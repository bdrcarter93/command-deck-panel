import { Activity, BrainCircuit, Flame, Gauge, ShieldCheck, Siren, TimerReset, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardData } from '@/hooks/useDashboardData';

const PriorityKpiOverview = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-slate-950/70">
        <CardContent className="p-6 text-sm text-slate-300">Loading command KPIs...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="p-6 text-rose-100">Couldn’t load the command KPI layer right now.</CardContent>
      </Card>
    );
  }

  const activeAgents = data.agents.filter((agent) => agent.status === 'active').length;
  const idleAgents = data.agents.filter((agent) => agent.status === 'idle').length;
  const offlineAgents = data.agents.filter((agent) => agent.status === 'offline').length;
  const blockedAgents = data.agents.filter((agent) => agent.readiness === 'blocked').length;
  const urgentTasks = data.initialTasks.filter((task) => task.priority === 'urgent').length;
  const highPriorityTasks = data.initialTasks.filter((task) => task.priority === 'high').length;
  const hotSessions = data.sessions.filter((session) => session.status === 'hot').length;
  const warmSessions = data.sessions.filter((session) => session.status === 'warm').length;
  const strongSignals = data.agents.reduce((count, agent) => count + agent.signals.filter((signal) => signal.state === 'yes').length, 0);
  const totalSignals = data.agents.reduce((count, agent) => count + agent.signals.length, 0);
  const signalIntegrity = totalSignals > 0 ? Math.round((strongSignals / totalSignals) * 100) : 0;
  const reasoningSessions = data.sessions.filter((s) =>
    (s.model !== 'unknown' && s.model.toLowerCase().includes('opus')) ||
    (s.contextTokens !== null && s.contextTokens !== undefined && s.contextTokens > 50000)
  ).length;

  const core = [
    {
      title: 'Active operators',
      value: `${activeAgents}`,
      subtitle: `${idleAgents} idle, ${offlineAgents} offline`,
      progress: data.summary.totalAgents > 0 ? Math.round((activeAgents / data.summary.totalAgents) * 100) : 0,
      icon: Activity,
      tone: 'text-cyan-200',
    },
    {
      title: 'Urgent queue',
      value: `${urgentTasks}`,
      subtitle: `${highPriorityTasks} additional high-priority tasks`,
      progress: data.initialTasks.length > 0 ? Math.round((urgentTasks / data.initialTasks.length) * 100) : 0,
      icon: Siren,
      tone: 'text-rose-200',
    },
    {
      title: 'Signal integrity',
      value: `${signalIntegrity}%`,
      subtitle: `${strongSignals}/${totalSignals} strong runtime signals`,
      progress: signalIntegrity,
      icon: Zap,
      tone: 'text-emerald-200',
    },
    {
      title: 'Session heat',
      value: hotSessions > 0 ? `${hotSessions} hot` : 'Nominal',
      subtitle: `${warmSessions} warm session${warmSessions === 1 ? '' : 's'} in watch range`,
      progress: data.summary.sessionCount > 0 ? Math.round((hotSessions / data.summary.sessionCount) * 100) : 0,
      icon: Flame,
      tone: 'text-amber-200',
    },
  ];

  const pulseRows = [
    {
      label: 'Blocked readiness',
      value: blockedAgents > 0 ? `${blockedAgents} agent${blockedAgents === 1 ? '' : 's'}` : 'Clear',
      note: 'These agents are visible but not fully able to execute. That tends to create human interruption cost.',
      icon: ShieldCheck,
    },
    {
      label: 'Bridge latency posture',
      value: data.meta.remoteDegraded ? 'Degraded' : data.meta.bridgeAvailable ? 'Healthy' : 'Unavailable',
      note: 'This determines whether the room is reacting to live runtime truth or cached/fallback state.',
      icon: Gauge,
    },
    {
      label: 'Reasoning pressure',
      value: reasoningSessions > 0 ? `${reasoningSessions} session${reasoningSessions === 1 ? '' : 's'}` : 'Low',
      note: 'Reasoning-enabled sessions are often the best proxy for expensive or delicate work underway.',
      icon: BrainCircuit,
    },
    {
      label: 'Freshness',
      value: new Date(data.meta.generatedAt).toLocaleTimeString(),
      note: 'How fresh the snapshot is. Useful when deciding whether to trust minute-by-minute motion in the room.',
      icon: TimerReset,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-slate-950/70">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Command KPIs</CardTitle>
          <p className="text-sm text-slate-300">Operator-first metrics pulled from the actual runtime model: agent activity, queue pressure, session heat, and signal confidence.</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {core.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-white/10 bg-slate-950/70">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-400">{item.title}</div>
                    <div className={`mt-2 text-3xl font-semibold text-white ${item.tone}`}>{item.value}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-cyan-200"><Icon className="h-5 w-5" /></div>
                </div>
                <p className="mt-3 text-sm text-slate-300">{item.subtitle}</p>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span>Share of system</span><span>{item.progress}%</span></div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Priority pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pulseRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-200"><Icon className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm text-slate-400">{row.label}</div>
                      <div className="text-lg font-semibold text-white">{row.value}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{row.note}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">What matters next</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <NarrativeCard
              title="Protect the hot edge"
              body={hotSessions > 0
                ? `There ${hotSessions === 1 ? 'is' : 'are'} ${hotSessions} hot session${hotSessions === 1 ? '' : 's'} running right now. Keep context and routing visible at the top of the room.`
                : 'No hot sessions are currently detected, which buys room to improve usability without losing operational awareness.'}
            />
            <NarrativeCard
              title="Clear blocked readiness"
              body={blockedAgents > 0
                ? `${blockedAgents} agent${blockedAgents === 1 ? ' is' : 's are'} blocked. That is the cleanest place to recover trust in the room.`
                : 'Blocked readiness is currently clear, so the next leverage move is usually improving visibility, not unjamming execution.'}
            />
            <NarrativeCard
              title="Use the queue honestly"
              body={urgentTasks > 0
                ? `${urgentTasks} urgent task${urgentTasks === 1 ? '' : 's'} already tell the story. The room should spotlight those instead of inventing demo drama.`
                : 'The urgent queue is quiet. That gives us space to let the dashboard feel cinematic without lying about pressure.'}
            />
            <NarrativeCard
              title="Trust follows signal quality"
              body={signalIntegrity >= 70
                ? 'Signal integrity is strong enough that the dashboard can act like a real operations surface, not a mockup.'
                : 'Signal integrity is still mixed, so the UI should keep showing fallback labels and confidence cues instead of pretending certainty.'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const NarrativeCard = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
    <div className="text-sm font-medium text-white">{title}</div>
    <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
  </div>
);

export default PriorityKpiOverview;
