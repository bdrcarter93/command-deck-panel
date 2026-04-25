import { AlertTriangle, Siren, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AgentRosterItem, FeedEntry, KanbanTask } from '@/lib/agentHq';

interface AgentDeskMapProps {
  agents: AgentRosterItem[];
  tasks: KanbanTask[];
  feed: FeedEntry[];
  compact?: boolean;
}

const deskSlots = [
  { top: '10%', left: '9%' },
  { top: '10%', left: '69%' },
  { top: '33%', left: '6%' },
  { top: '33%', left: '72%' },
  { top: '61%', left: '10%' },
  { top: '61%', left: '68%' },
  { top: '79%', left: '27%' },
  { top: '79%', left: '51%' },
];

const statusLabel: Record<AgentRosterItem['status'], string> = {
  working: 'Active',
  idle: 'Standby',
  review: 'Review',
  blocked: 'Blocked',
  offline: 'Offline',
};

export default function AgentDeskMap({ agents, tasks, feed, compact = false }: AgentDeskMapProps) {
  const urgentTasks = tasks.filter((task) => task.priority === 'high' && task.status !== 'done');
  const urgentFeed = feed.filter((entry) => entry.priority === 'high').slice(0, 3);

  return (
    <div
      className={cn(
        'mission-panel relative overflow-hidden rounded-[28px]',
        compact ? 'min-h-[480px]' : 'min-h-[680px]',
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(109,160,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(109,160,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="mission-line pointer-events-none absolute inset-x-[10%] top-[18%] h-px" />
      <div className="mission-line pointer-events-none absolute inset-x-[14%] top-[50%] h-px opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#74b7ffb0] to-transparent shadow-[0_0_12px_rgba(116,183,255,0.34)]" />

      {agents.slice(0, deskSlots.length).map((agent, index) => {
        const slot = deskSlots[index] ?? deskSlots[0];
        const statusTone =
          agent.status === 'working'
            ? 'ring-emerald-400/45'
            : agent.status === 'blocked'
              ? 'ring-rose-400/45'
              : agent.status === 'review'
                ? 'ring-amber-400/45'
                : 'ring-[#77baff33]';

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="absolute w-[220px] max-w-[38vw]"
            style={slot}
          >
            <div className={cn('mission-panel rounded-[24px] p-4 ring-1', statusTone)}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mission-label text-[10px]">Agent desk</div>
                  <div className="mt-1 text-lg font-semibold text-[#f1ae78]">{agent.name}</div>
                  <div className="text-sm text-slate-400">{agent.role}</div>
                </div>
                <div
                  className="h-11 w-11 rounded-2xl border border-[#8dc6ff44] shadow-[0_0_28px_rgba(93,165,255,0.28)]"
                  style={{ background: `radial-gradient(circle at 35% 35%, ${agent.color}, rgba(10,18,34,0.96))` }}
                />
              </div>
              <div className="mission-panel-soft mb-3 h-[118px] rounded-[20px] p-3">
                <div className="mission-label flex items-center justify-between text-[10px]">
                  <span>Desk status</span>
                  <span style={{ color: agent.color }}>{statusLabel[agent.status]}</span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_72px] gap-3">
                  <div className="rounded-2xl border border-[#8dc6ff22] bg-slate-950/60 p-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Current focus</div>
                    <div className="mt-2 text-sm leading-6 text-slate-200">{agent.currentTask}</div>
                  </div>
                  <div className="relative rounded-2xl border border-[#8dc6ff22] bg-slate-950/75">
                    <div className="absolute left-1/2 top-3 h-7 w-7 -translate-x-1/2 rounded-full border border-white/10 bg-slate-700/80" />
                    <div className="absolute left-1/2 top-10 h-9 w-9 -translate-x-1/2 rounded-[14px] border border-white/10 bg-slate-800/80" />
                    <div className="absolute left-1/2 top-[72px] h-4 w-12 -translate-x-1/2 rounded-full bg-black/40 blur-sm" />
                    <div className="absolute left-1/2 top-8 h-1 w-10 -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(117,183,255,0.6)]" style={{ backgroundColor: `${agent.color}cc` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full border border-[#8dc6ff30] px-2.5 py-1 text-[#8ebeff]">{statusLabel[agent.status]}</span>
                <span className="text-slate-500">Color locked</span>
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-1/2 top-1/2 w-[320px] max-w-[56vw] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="rounded-[30px] border border-[#f0a66b55] bg-[radial-gradient(circle_at_top,_rgba(240,166,107,0.12),_transparent_42%),linear-gradient(180deg,rgba(12,20,36,0.97),rgba(6,12,24,0.98))] p-5 shadow-[0_0_70px_rgba(84,150,255,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="mission-label flex items-center gap-2 text-[11px]">
                <Siren className="h-4 w-4 text-[#f0a66b]" />
                Focus area
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#f1ae78]">Emergency queue</div>
            </div>
            <div className="mission-panel-soft rounded-2xl px-3 py-2 text-right">
              <div className="mission-label text-[10px]">Urgent items</div>
              <div className="mission-stat text-2xl font-semibold">{urgentTasks.length + urgentFeed.length}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {urgentTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="mission-panel-soft rounded-2xl p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#f1ae78]">
                  <Zap className="h-4 w-4 text-rose-300" />
                  {task.title}
                </div>
                <div className="mt-1 text-sm text-slate-300">{task.assignee} • {task.status.replace('-', ' ')}</div>
              </div>
            ))}
            {urgentFeed.slice(0, 2).map((entry) => (
              <div key={entry.id} className="mission-panel-soft rounded-2xl p-3 text-sm text-slate-200">
                <div className="mb-1 flex items-center gap-2 text-rose-200">
                  <AlertTriangle className="h-4 w-4" />
                  {entry.agent}
                </div>
                {entry.message}
              </div>
            ))}
            {urgentTasks.length + urgentFeed.length === 0 && (
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Emergency lane is clear. Keep this area reserved for live escalations.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
