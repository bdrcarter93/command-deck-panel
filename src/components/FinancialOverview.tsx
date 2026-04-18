import { AlertTriangle, BadgeDollarSign, CheckCircle2, HandCoins, ReceiptText, ShieldAlert, TrendingUp, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardData } from '@/hooks/useDashboardData';

const FinancialOverview = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-slate-950/70">
        <CardContent className="p-6 text-sm text-slate-300">Loading finance signal layer...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="p-6 text-rose-100">Couldn’t load the finance signal layer right now.</CardContent>
      </Card>
    );
  }

  const urgentTasks = data.initialTasks.filter((task) => task.priority === 'urgent').length;
  const blockedAgents = data.agents.filter((agent) => agent.readiness === 'blocked').length;
  const highHeatSessions = data.sessions.filter((session) => session.status === 'hot').length;
  const unresolvedWarnings = data.meta.warnings.length;
  const bridgeHealth = data.meta.remoteDegraded ? 42 : data.meta.bridgeAvailable ? 88 : 18;
  const readinessCoverage = data.summary.totalAgents > 0 ? Math.round((data.summary.readyAgents / data.summary.totalAgents) * 100) : 0;
  const channelCoverage = data.summary.configuredChannels > 0 ? Math.round((data.summary.runningChannels / data.summary.configuredChannels) * 100) : 0;
  const sessionPressure = data.summary.sessionCount > 0 ? Math.min(100, Math.round((highHeatSessions / data.summary.sessionCount) * 100)) : 0;

  const cards = [
    {
      title: 'Bridge health',
      amount: data.meta.remoteDegraded ? 'Degraded' : data.meta.bridgeAvailable ? 'Live' : 'Offline',
      note: data.meta.remoteDegraded
        ? 'The bridge is answering, but one or more live endpoints are degraded. The panel is running in best-effort mode.'
        : data.meta.bridgeAvailable
          ? 'Live bridge endpoints are available, so this panel is grounded in current OpenClaw runtime data.'
          : 'The bridge is not currently proving live runtime access.',
      progress: bridgeHealth,
      icon: data.meta.remoteDegraded ? WifiOff : BadgeDollarSign,
      tone: data.meta.remoteDegraded ? 'text-amber-200' : 'text-cyan-200',
    },
    {
      title: 'Ready agent coverage',
      amount: `${data.summary.readyAgents}/${data.summary.totalAgents}`,
      note: 'Agents with enough config and runtime proof to treat as truly ready right now.',
      progress: readinessCoverage,
      icon: CheckCircle2,
      tone: 'text-emerald-200',
    },
    {
      title: 'Session heat pressure',
      amount: highHeatSessions > 0 ? `${highHeatSessions} hot` : 'Stable',
      note: 'Hot sessions are the ones most likely to need operator attention before context runs thin.',
      progress: sessionPressure,
      icon: ReceiptText,
      tone: 'text-sky-200',
    },
    {
      title: 'Channel coverage',
      amount: `${data.summary.runningChannels}/${data.summary.configuredChannels}`,
      note: 'Configured channels currently proving reachability through health or probe data.',
      progress: channelCoverage,
      icon: HandCoins,
      tone: 'text-violet-200',
    },
  ];

  const recoveryLanes = [
    {
      title: 'Fastest risk reduction',
      value: `${unresolvedWarnings} live warning${unresolvedWarnings === 1 ? '' : 's'}`,
      detail: 'Clear the warnings queue first. It removes ambiguity faster than polishing presentation.',
    },
    {
      title: 'Operator leverage',
      value: `${urgentTasks} urgent task${urgentTasks === 1 ? '' : 's'}`,
      detail: 'Urgent tasks already encode where the deck thinks pressure is real, not hypothetical.',
    },
    {
      title: 'Runtime bottleneck',
      value: blockedAgents > 0 ? `${blockedAgents} blocked agent${blockedAgents === 1 ? '' : 's'}` : 'No blocked agents',
      detail: 'Blocked or limited readiness is where routing confidence breaks down and manual overhead creeps in.',
    },
  ];

  const frictionItems = [
    `Security summary: ${data.summary.securitySummary}`,
    `Gateway snapshot: ${data.summary.gateway}`,
    `Heartbeat posture: ${data.summary.heartbeat}`,
    ...data.meta.warnings.slice(0, 3),
  ];

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-slate-950/70">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Runtime economics</CardTitle>
          <p className="text-sm text-slate-300">This replaces the fake roofing finance layer with the actual operator economics of the deck: bridge reliability, agent readiness, channel reachability, session heat, and warning pressure.</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-white/10 bg-slate-950/70">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-400">{card.title}</div>
                    <div className={`mt-2 text-3xl font-semibold text-white ${card.tone}`}>{card.amount}</div>
                  </div>
                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-200"><Icon className="h-5 w-5" /></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{card.note}</p>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span>Signal strength</span><span>{card.progress}%</span></div>
                  <Progress value={card.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Best leverage lanes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recoveryLanes.map((lane) => (
              <div key={lane.title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{lane.title}</div>
                  <div className="text-lg font-semibold text-emerald-300">{lane.value}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{lane.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Current friction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {frictionItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Quick read: if the bridge is live, channels are reachable, and ready-agent coverage is healthy, the deck is economically sound even before deeper product polish lands.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat icon={TrendingUp} label="Live source" value={data.meta.source} note="Where this panel is currently grounding its runtime view." />
        <MiniStat icon={ShieldAlert} label="Security posture" value={data.securityIssues.length ? `${data.securityIssues.length} findings` : 'No findings'} note="Straight from the current security audit surface." />
        <MiniStat icon={HandCoins} label="Session count" value={`${data.summary.sessionCount}`} note="Useful as a rough load indicator for the current operator snapshot." />
      </div>
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, note }: { icon: any; label: string; value: string; note: string }) => (
  <Card className="border-white/10 bg-slate-950/70">
    <CardContent className="p-5">
      <div className="flex items-center gap-3 text-slate-300"><Icon className="h-4 w-4 text-cyan-300" /><span className="text-sm">{label}</span></div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </CardContent>
  </Card>
);

export default FinancialOverview;
