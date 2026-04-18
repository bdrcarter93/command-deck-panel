import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { LogCategory } from '@/lib/liveData';

const categoryStyle: Record<LogCategory, string> = {
  observation: 'bg-primary/20 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-muted',
  reminder: 'bg-warning/20 text-warning border-warning/30',
  fyi: 'bg-accent/20 text-accent border-accent/30',
};

const sessionStatusStyle: Record<string, string> = {
  working: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  hot: 'bg-destructive/20 text-destructive border-destructive/30',
  warm: 'bg-warning/20 text-warning border-warning/30',
  cold: 'bg-primary/20 text-primary border-primary/30',
  unknown: 'bg-muted text-muted-foreground border-muted',
};

const BUILD_PHASES = [
  { id: 'intake', label: 'Intake', emoji: '📥', desc: 'Read task, confirm scope' },
  { id: 'scaffold', label: 'Scaffold', emoji: '🏗️', desc: 'Create files/directories' },
  { id: 'implement', label: 'Implement', emoji: '⚙️', desc: 'Write the code' },
  { id: 'wire', label: 'Wire', emoji: '🔌', desc: 'Connect imports/routes' },
  { id: 'test', label: 'Test', emoji: '🧪', desc: 'npm run build' },
  { id: 'verify', label: 'Verify', emoji: '✅', desc: 'Feature works as intended' },
  { id: 'document', label: 'Document', emoji: '📝', desc: 'Update README/comments' },
  { id: 'report', label: 'Report', emoji: '📣', desc: 'Ship summary' },
] as const;

type PhaseId = (typeof BUILD_PHASES)[number]['id'];

const phaseColors: Record<PhaseId, string> = {
  intake: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  scaffold: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  implement: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  wire: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  test: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  verify: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  document: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
  report: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
};

const PHASE_STORAGE_KEY = 'command-deck-build-phases-v1';

interface RunState {
  activePhase: PhaseId | null;
  completedPhases: PhaseId[];
  runLabel: string;
  startedAt: string | null;
}

const defaultRunState: RunState = {
  activePhase: null,
  completedPhases: [],
  runLabel: '',
  startedAt: null,
};

function loadRunState(): RunState {
  if (typeof window === 'undefined') return defaultRunState;
  try {
    const raw = window.localStorage.getItem(PHASE_STORAGE_KEY);
    if (!raw) return defaultRunState;
    return JSON.parse(raw) as RunState;
  } catch {
    return defaultRunState;
  }
}

function saveRunState(state: RunState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PHASE_STORAGE_KEY, JSON.stringify(state));
}

const AILog = () => {
  const [filter, setFilter] = useState<string>('all');
  const [runState, setRunState] = useState<RunState>(loadRunState);
  const [newRunLabel, setNewRunLabel] = useState('');
  const { data, isLoading, error } = useDashboardData();

  const updateRunState = (updater: (prev: RunState) => RunState) => {
    setRunState((prev) => {
      const next = updater(prev);
      saveRunState(next);
      return next;
    });
  };

  const startRun = () => {
    updateRunState(() => ({
      activePhase: BUILD_PHASES[0].id,
      completedPhases: [],
      runLabel: newRunLabel.trim() || `Run ${new Date().toLocaleTimeString()}`,
      startedAt: new Date().toISOString(),
    }));
    setNewRunLabel('');
  };

  const advancePhase = () => {
    updateRunState((prev) => {
      if (!prev.activePhase) return prev;
      const currentIndex = BUILD_PHASES.findIndex((p) => p.id === prev.activePhase);
      const nextPhase = BUILD_PHASES[currentIndex + 1]?.id ?? null;
      return {
        ...prev,
        completedPhases: [...prev.completedPhases, prev.activePhase],
        activePhase: nextPhase,
      };
    });
  };

  const resetRun = () => {
    updateRunState(() => defaultRunState);
  };

  if (isLoading) {
    return <StatePanel title="Agent Log" message="Streaming live OpenClaw logs…" />;
  }

  if (error || !data) {
    return <StatePanel title="Agent Log" message="Could not load live logs" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  const filtered = filter === 'all' ? data.logEntries : data.logEntries.filter((e) => e.category === filter);
  const isRunning = runState.activePhase !== null;
  const isComplete = !isRunning && runState.completedPhases.length === BUILD_PHASES.length;

  return (
    <div className="space-y-5">
      {/* 8-Phase Build Pipeline Tracker */}
      <div className="glass-card p-4 md:p-5 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Builder Protocol</p>
            <h2 className="text-base font-semibold text-foreground">8-Phase Build Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              {isComplete ? '✅ Run complete' : isRunning ? `Running: ${runState.runLabel}` : 'Track autonomous build runs through 8 phases'}
            </p>
          </div>
          {!isRunning && !isComplete && (
            <div className="flex gap-2">
              <input
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newRunLabel}
                onChange={(e) => setNewRunLabel(e.target.value)}
                placeholder="Task label…"
              />
              <button
                onClick={startRun}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Start run
              </button>
            </div>
          )}
          {(isRunning || isComplete) && (
            <div className="flex gap-2">
              {isRunning && (
                <button
                  onClick={advancePhase}
                  className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Next phase →
                </button>
              )}
              <button
                onClick={resetRun}
                className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-secondary/30 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Chapter 12 workflow example, role boundaries, guardrails, proof</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Canonical workflow</p>
              <p>Builder creates the app skeleton, Orchestrator assigns and sequences work, Executor performs bounded tasks and reports status.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Role boundaries</p>
              <p>Do not use OpenClaw as the builder. Use the builder for creation, OpenClaw for coordination, and executors for implementation steps.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Misuse guardrails</p>
              <p>If one system is trying to own all three roles, the handoff model is wrong. Split planning, orchestration, and execution explicitly.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Proof required</p>
              <p>A run must show phase progression, handoff visibility, and a reportable outcome from the workflow instead of a vague status claim.</p>
            </div>
          </div>
        </div>

        {/* Phase grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {BUILD_PHASES.map((phase) => {
            const isActive = runState.activePhase === phase.id;
            const isDone = runState.completedPhases.includes(phase.id);
            const isPending = !isActive && !isDone;

            return (
              <motion.div
                key={phase.id}
                animate={isActive ? { scale: [1, 1.04, 1] } : {}}
                transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                className={`rounded-lg border p-2 text-center transition-all ${
                  isActive
                    ? `${phaseColors[phase.id]} ring-2 ring-offset-1 ring-offset-background ring-current`
                    : isDone
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-muted/20 bg-secondary/10 text-muted-foreground/40'
                }`}
                title={phase.desc}
              >
                <div className="text-base">{isDone ? '✅' : phase.emoji}</div>
                <div className="text-[10px] font-medium mt-0.5">{phase.label}</div>
              </motion.div>
            );
          })}
        </div>

        {runState.activePhase && (() => {
          const phase = BUILD_PHASES.find((p) => p.id === runState.activePhase);
          return phase ? (
            <div className={`rounded-lg border px-4 py-3 text-sm ${phaseColors[phase.id]}`}>
              <span className="font-semibold">{phase.emoji} {phase.label}:</span> {phase.desc}
            </div>
          ) : null;
        })()}
      </div>

      {/* Live sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.sessions.slice(0, 3).map((session) => (
          <div key={session.key} className="glass-card p-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`text-xs ${sessionStatusStyle[session.status]}`}>{session.status}</Badge>
              <span className="text-xs text-muted-foreground">{session.kind}</span>
              <span className="text-xs text-muted-foreground ml-auto">{session.age}</span>
            </div>
            <p className="text-sm font-medium text-foreground break-all">{session.key}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {session.model}{session.provider ? ` · ${session.provider}` : ''}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Context</p>
                <p className="text-foreground font-mono">{session.percentUsed ?? '—'}%</p>
              </div>
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Remaining</p>
                <p className="text-foreground font-mono">{session.remainingTokens ?? '—'}</p>
              </div>
              <div className="rounded bg-secondary/30 p-2">
                <p className="text-muted-foreground">Cached</p>
                <p className="text-foreground font-mono">{session.cachedPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agent Log</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 glass-card border-none text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-card border border-secondary">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">No log entries match this filter.</div>
        )}
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex items-start gap-3"
          >
            <span className="text-lg mt-0.5">{entry.agentEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-foreground">{entry.agentName}</span>
                <Badge className={`text-xs ${categoryStyle[entry.category]}`}>{entry.category}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{entry.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AILog;
