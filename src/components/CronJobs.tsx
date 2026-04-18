import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Trash2, Plus, RefreshCw, CheckCircle, XCircle, AlertCircle, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

type JobStatus = 'active' | 'paused' | 'error' | 'running';
type ScheduleType = 'cron' | 'every' | 'at';

interface CronJob {
  id: string;
  name: string;
  scheduleType: ScheduleType;
  schedule: string;
  message: string;
  channel?: string;
  sessionTarget: 'isolated' | 'main';
  status: JobStatus;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  lastResult?: 'ok' | 'error' | 'suppressed';
}

const DEMO_JOBS: CronJob[] = [
  {
    id: 'j1',
    name: 'Morning Digest',
    scheduleType: 'cron',
    schedule: '0 7 * * *',
    message: 'Summarize overnight emails, Slack messages, calendar for today, and blocked tasks.',
    channel: 'telegram',
    sessionTarget: 'isolated',
    status: 'active',
    lastRun: '7:00 AM today',
    nextRun: '7:00 AM tomorrow',
    runCount: 47,
    lastResult: 'ok',
  },
  {
    id: 'j2',
    name: 'Midday Prep',
    scheduleType: 'cron',
    schedule: '0 12 * * 1-5',
    message: 'Check afternoon calendar, prep meeting briefs, flag tasks that need attention before EOD.',
    channel: 'discord',
    sessionTarget: 'isolated',
    status: 'active',
    lastRun: '12:00 PM today',
    nextRun: '12:00 PM Mon',
    runCount: 23,
    lastResult: 'suppressed',
  },
  {
    id: 'j3',
    name: 'Meeting Intel Sync',
    scheduleType: 'every',
    schedule: '4h',
    message: 'Pull latest meetings from Fathom, extract action items, update Meeting Intelligence, flag follow-ups.',
    sessionTarget: 'isolated',
    status: 'active',
    lastRun: '2h ago',
    nextRun: 'in 2h',
    runCount: 89,
    lastResult: 'ok',
  },
  {
    id: 'j4',
    name: 'Evening Report',
    scheduleType: 'cron',
    schedule: '0 18 * * 1-5',
    message: "Summarize what got done today, what's still open, what's blocked. Post to Discord.",
    channel: 'discord',
    sessionTarget: 'isolated',
    status: 'paused',
    lastRun: '6:00 PM yesterday',
    nextRun: 'paused',
    runCount: 12,
    lastResult: 'ok',
  },
  {
    id: 'j5',
    name: 'Competitor Intel',
    scheduleType: 'cron',
    schedule: '0 9 * * 1',
    message: 'Scan competitor YouTube, blogs, and social for new content. Extract trends and post weekly digest.',
    channel: 'discord',
    sessionTarget: 'isolated',
    status: 'error',
    lastRun: 'Mon 9:00 AM',
    nextRun: 'Mon 9:00 AM',
    runCount: 8,
    lastResult: 'error',
  },
];

const statusConfig: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  paused: { label: 'Paused', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Pause className="w-3 h-3" /> },
  error: { label: 'Error', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
  running: { label: 'Running', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
};

const resultConfig = {
  ok: { label: '✓ OK', color: 'text-emerald-400' },
  error: { label: '✗ Error', color: 'text-red-400' },
  suppressed: { label: '— Quiet', color: 'text-muted-foreground' },
};

const scheduleTypeConfig: Record<ScheduleType, { label: string; icon: string }> = {
  cron: { label: 'Cron', icon: '📅' },
  every: { label: 'Every', icon: '🔁' },
  at: { label: 'At', icon: '📍' },
};

interface AddJobForm {
  name: string;
  scheduleType: ScheduleType;
  schedule: string;
  message: string;
  channel: string;
  sessionTarget: 'isolated' | 'main';
}

const DEFAULT_FORM: AddJobForm = {
  name: '',
  scheduleType: 'cron',
  schedule: '0 9 * * 1-5',
  message: '',
  channel: 'discord',
  sessionTarget: 'isolated',
};

export default function CronJobs() {
  const { data, meta, refresh } = useDashboardData();
  const [jobs, setJobs] = useState<CronJob[]>(DEMO_JOBS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddJobForm>(DEFAULT_FORM);
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');

  const summary = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    paused: jobs.filter((j) => j.status === 'paused').length,
    error: jobs.filter((j) => j.status === 'error').length,
  };

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  const toggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        return { ...j, status: j.status === 'active' ? 'paused' : j.status === 'paused' ? 'active' : j.status };
      }),
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const runNow = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'running' } : j)));
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, status: 'active', lastRun: 'just now', runCount: j.runCount + 1, lastResult: 'ok' }
            : j,
        ),
      );
    }, 2000);
  };

  const addJob = () => {
    if (!form.name || !form.message) return;
    const newJob: CronJob = {
      id: `j${Date.now()}`,
      name: form.name,
      scheduleType: form.scheduleType,
      schedule: form.schedule,
      message: form.message,
      channel: form.channel || undefined,
      sessionTarget: form.sessionTarget,
      status: 'active',
      runCount: 0,
      nextRun: 'calculated on next tick',
    };
    setJobs((prev) => [newJob, ...prev]);
    setForm(DEFAULT_FORM);
    setShowAdd(false);
  };

  return (
    <StatePanel meta={meta} onRefresh={refresh} label="Cron Jobs">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Automations</span>
          </div>
          <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3" /> Add Job
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: summary.total, color: 'text-foreground' },
            { label: 'Active', value: summary.active, color: 'text-emerald-400' },
            { label: 'Paused', value: summary.paused, color: 'text-yellow-400' },
            { label: 'Errors', value: summary.error, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="bg-muted/30 rounded-lg p-2 text-center border border-border/40">
              <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'active', 'paused', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Job form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3"
            >
              <div className="text-xs font-semibold text-primary">New Cron Job</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    className="h-7 text-xs mt-1"
                    placeholder="Morning Digest"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Schedule Type</Label>
                  <select
                    className="w-full h-7 text-xs mt-1 rounded-md border border-input bg-background px-2"
                    value={form.scheduleType}
                    onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value as ScheduleType }))}
                  >
                    <option value="cron">Cron expression</option>
                    <option value="every">Every interval</option>
                    <option value="at">At specific time</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">
                    {form.scheduleType === 'cron'
                      ? 'Cron Expression'
                      : form.scheduleType === 'every'
                        ? 'Interval (e.g. 4h, 30m)'
                        : 'ISO 8601 Timestamp'}
                  </Label>
                  <Input
                    className="h-7 text-xs mt-1 font-mono"
                    placeholder={form.scheduleType === 'cron' ? '0 7 * * *' : form.scheduleType === 'every' ? '4h' : '2026-04-05T09:00:00Z'}
                    value={form.schedule}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Deliver to Channel</Label>
                  <select
                    className="w-full h-7 text-xs mt-1 rounded-md border border-input bg-background px-2"
                    value={form.channel}
                    onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
                  >
                    <option value="discord">Discord</option>
                    <option value="telegram">Telegram</option>
                    <option value="slack">Slack</option>
                    <option value="">None</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Prompt / Message</Label>
                  <Input
                    className="h-7 text-xs mt-1"
                    placeholder="Summarize overnight emails and flag anything urgent..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Session Mode</Label>
                  <select
                    className="w-full h-7 text-xs mt-1 rounded-md border border-input bg-background px-2"
                    value={form.sessionTarget}
                    onChange={(e) => setForm((f) => ({ ...f, sessionTarget: e.target.value as 'isolated' | 'main' }))}
                  >
                    <option value="isolated">Isolated (clean context)</option>
                    <option value="main">Main (full history)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="h-7 text-xs" onClick={addJob}>
                  Add Job
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((job) => {
              const sc = statusConfig[job.status];
              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="border border-border/50 rounded-lg p-3 bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{job.name}</span>
                        <Badge variant="outline" className={`text-xs py-0 px-1.5 flex items-center gap-1 ${sc.color}`}>
                          {sc.icon}
                          {sc.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0 px-1.5 bg-muted/30 text-muted-foreground border-border/40">
                          {scheduleTypeConfig[job.scheduleType].icon} {job.schedule}
                        </Badge>
                        {job.channel && (
                          <Badge variant="outline" className="text-xs py-0 px-1.5 bg-muted/30 text-muted-foreground border-border/40">
                            → {job.channel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{job.message}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/70">
                        {job.lastRun && (
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Last: {job.lastRun}
                            {job.lastResult && (
                              <span className={resultConfig[job.lastResult].color}>
                                {' '}
                                {resultConfig[job.lastResult].label}
                              </span>
                            )}
                          </span>
                        )}
                        {job.nextRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next: {job.nextRun}
                          </span>
                        )}
                        <span>{job.runCount} runs</span>
                        <span className="text-muted-foreground/50">{job.sessionTarget}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => runNow(job.id)}
                        disabled={job.status === 'running'}
                        className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        title="Run now"
                      >
                        {job.status === 'running' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {(job.status === 'active' || job.status === 'paused') && (
                        <button
                          onClick={() => toggleJob(job.id)}
                          className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                          title={job.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {job.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground/40">
              No jobs match this filter
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="text-xs text-muted-foreground/50 pt-1">
          Jobs persist at ~/.openclaw/cron/jobs.json · Manage via CLI: <code className="font-mono">openclaw cron list</code>
        </div>
      </div>
    </StatePanel>
  );
}
