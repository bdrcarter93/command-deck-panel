import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, CheckCircle, XCircle, Clock, Star, Archive, RefreshCw, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';

type MemoryStatus = 'pending' | 'approved' | 'rejected' | 'core';
type MemoryCategory = 'preference' | 'fact' | 'decision' | 'lesson' | 'context';

interface Memory {
  id: string;
  content: string;
  category: MemoryCategory;
  status: MemoryStatus;
  confidence: number;
  source: string;
  timestamp: string;
  tags: string[];
  pinned?: boolean;
}

const DEMO_MEMORIES: Memory[] = [
  {
    id: 'm1',
    content: 'Matthew prefers direct, concise replies without filler phrases.',
    category: 'preference',
    status: 'core',
    confidence: 98,
    source: 'SOUL.md + repeated interactions',
    timestamp: '2 days ago',
    tags: ['communication', 'style'],
    pinned: true,
  },
  {
    id: 'm2',
    content: 'dashboardoc.com uses Cloudflare DNS with Vercel as the backend. A record points to 76.76.21.21 (DNS only, not proxied).',
    category: 'fact',
    status: 'approved',
    confidence: 100,
    source: 'DNS configuration session',
    timestamp: 'Today',
    tags: ['infrastructure', 'dns', 'vercel'],
  },
  {
    id: 'm3',
    content: 'The Cloudflare proxy (orange cloud) must be disabled for Vercel-hosted domains. Proxied A records break Vercel SSL.',
    category: 'lesson',
    status: 'approved',
    confidence: 100,
    source: 'Debugging dashboardoc.com',
    timestamp: 'Today',
    tags: ['cloudflare', 'vercel', 'lesson'],
  },
  {
    id: 'm4',
    content: 'command-deck-panel Vercel project is under bdrcarter93-8764s-projects. Main domain: dashboardoc.com.',
    category: 'fact',
    status: 'approved',
    confidence: 100,
    source: 'Vercel CLI deployment',
    timestamp: 'Yesterday',
    tags: ['infrastructure', 'vercel', 'project'],
  },
  {
    id: 'm5',
    content: 'Matthew may be running an agency or client-facing consulting operation based on the Ops Loop pipeline (Outreach → Delivery → Retention).',
    category: 'context',
    status: 'pending',
    confidence: 72,
    source: 'OpsLoop tab design inference',
    timestamp: '3h ago',
    tags: ['business', 'inference'],
  },
  {
    id: 'm6',
    content: 'React error #310 can occur when AnimatePresence + ScrollArea are nested inside a component that reads from localStorage during render.',
    category: 'lesson',
    status: 'approved',
    confidence: 90,
    source: 'TaskBoard crash debug',
    timestamp: 'Today',
    tags: ['react', 'debugging', 'lesson'],
  },
  {
    id: 'm7',
    content: 'Matthew prefers deployments happen automatically without approval when I have clear intent from prior conversation.',
    category: 'preference',
    status: 'pending',
    confidence: 65,
    source: 'Overnight work session pattern',
    timestamp: '8h ago',
    tags: ['workflow', 'preference', 'inference'],
  },
  {
    id: 'm8',
    content: 'The OpenClaw Masterclass course is at masterclass-prompts.netlify.app and has 13+ chapters. Chapters 1-8 cover install, security, foundations, cognitive memory, token optimization, ClawBuddy, kanban, and automations.',
    category: 'fact',
    status: 'approved',
    confidence: 100,
    source: 'Course audit session',
    timestamp: 'Yesterday',
    tags: ['course', 'openclaw', 'masterclass'],
  },
];

const statusConfig: Record<MemoryStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="w-3 h-3" />,
  },
  core: {
    label: 'Core',
    color: 'bg-primary/20 text-primary border-primary/30',
    icon: <Star className="w-3 h-3" />,
  },
};

const categoryColors: Record<MemoryCategory, string> = {
  preference: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  fact: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  decision: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  lesson: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  context: 'bg-muted text-muted-foreground border-border/40',
};

export default function MemoryBrowser() {
  const { data, meta, refresh } = useDashboardData();
  const [memories, setMemories] = useState<Memory[]>(DEMO_MEMORIES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemoryStatus | 'all' | 'pinned'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pending = memories.filter((m) => m.status === 'pending');

  const filtered = memories.filter((m) => {
    const matchSearch =
      !search ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      m.category.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'pinned'
          ? m.pinned
          : m.status === filter;

    return matchSearch && matchFilter;
  });

  const approve = (id: string) =>
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'approved' } : m)));

  const reject = (id: string) =>
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'rejected' } : m)));

  const pin = (id: string) =>
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));

  const archive = (id: string) =>
    setMemories((prev) => prev.filter((m) => m.id !== id));

  return (
    <StatePanel meta={meta} onRefresh={refresh} label="Memory">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Cognitive Memory</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {memories.filter((m) => m.status !== 'rejected').length} active · {pending.length} pending review
          </div>
        </div>

        {/* Pending approval banner */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">
                    {pending.length} memor{pending.length === 1 ? 'y' : 'ies'} pending your review
                  </span>
                </div>
                <button
                  onClick={() => setFilter('pending')}
                  className="text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors"
                >
                  Review →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Core', value: memories.filter((m) => m.status === 'core').length, color: 'text-primary' },
            { label: 'Approved', value: memories.filter((m) => m.status === 'approved').length, color: 'text-emerald-400' },
            { label: 'Pending', value: pending.length, color: 'text-yellow-400' },
            { label: 'Pinned', value: memories.filter((m) => m.pinned).length, color: 'text-violet-400' },
          ].map((s) => (
            <div key={s.label} className="bg-muted/30 rounded-lg p-2 text-center border border-border/40">
              <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-7 h-7 text-xs"
              placeholder="Search memories, tags, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'core', 'approved', 'pending', 'pinned'] as const).map((f) => (
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

        {/* Memory list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((mem) => {
              const sc = statusConfig[mem.status];
              const expanded = expandedId === mem.id;
              return (
                <motion.div
                  key={mem.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`border rounded-lg overflow-hidden transition-colors ${
                    mem.status === 'pending'
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : mem.status === 'core'
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border/50 bg-card/50'
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <Badge variant="outline" className={`text-xs py-0 px-1.5 flex items-center gap-1 ${sc.color}`}>
                            {sc.icon}
                            {sc.label}
                          </Badge>
                          <Badge variant="outline" className={`text-xs py-0 px-1.5 ${categoryColors[mem.category]}`}>
                            {mem.category}
                          </Badge>
                          {mem.pinned && (
                            <Star className="w-3 h-3 text-violet-400 fill-violet-400" />
                          )}
                          <span className="text-xs text-muted-foreground/50 ml-auto">{mem.timestamp}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{mem.content}</p>
                        {mem.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {mem.tags.map((t) => (
                              <span key={t} className="text-xs bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                        {expanded && (
                          <div className="mt-2 text-xs text-muted-foreground/60 flex items-center gap-3">
                            <span>Source: {mem.source}</span>
                            <span>Confidence: {mem.confidence}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setExpandedId(expanded ? null : mem.id)}
                          className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Pending approval actions */}
                    {mem.status === 'pending' && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-yellow-500/20">
                        <Button
                          size="sm"
                          className="h-6 text-xs bg-emerald-600 hover:bg-emerald-500 gap-1"
                          onClick={() => approve(mem.id)}
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                          onClick={() => reject(mem.id)}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => pin(mem.id)}
                            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-violet-400 transition-colors"
                            title="Pin"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => archive(mem.id)}
                            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    {mem.status !== 'pending' && mem.status !== 'core' && (
                      <div className="flex justify-end gap-1 mt-1">
                        <button
                          onClick={() => pin(mem.id)}
                          className={`p-1 rounded hover:bg-muted/60 transition-colors ${mem.pinned ? 'text-violet-400' : 'text-muted-foreground hover:text-violet-400'}`}
                          title={mem.pinned ? 'Unpin' : 'Pin'}
                        >
                          <Star className={`w-3 h-3 ${mem.pinned ? 'fill-violet-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => archive(mem.id)}
                          className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground/40">
              {search ? 'No memories match your search' : 'No memories in this filter'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground/50 pt-1">
          Memories persist in MEMORY.md · Daily logs in memory/YYYY-MM-DD.md
        </div>
      </div>
    </StatePanel>
  );
}
