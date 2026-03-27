import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, CheckSquare, Clock, Search, Globe, Sparkles, ExternalLink, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { meetings, Meeting, MeetingType } from '@/data/mockData';
import { format, parseISO, isAfter, subDays } from 'date-fns';

const typeColors: Record<MeetingType, string> = {
  'standup': '#818cf8',
  'sales': '#34d399',
  'interview': '#f472b6',
  'all-hands': '#fb923c',
  '1-on-1': '#60a5fa',
  'planning': '#2dd4bf',
  'team': '#a78bfa',
  'external': '#fbbf24',
};

const typeBadgeClass: Record<string, string> = {
  'standup': 'bg-[#818cf8]/20 text-[#818cf8]',
  'sales': 'bg-[#34d399]/20 text-[#34d399]',
  'interview': 'bg-[#f472b6]/20 text-[#f472b6]',
  'all-hands': 'bg-[#fb923c]/20 text-[#fb923c]',
  '1-on-1': 'bg-[#60a5fa]/20 text-[#60a5fa]',
  'planning': 'bg-[#2dd4bf]/20 text-[#2dd4bf]',
  'team': 'bg-[#a78bfa]/20 text-[#a78bfa]',
  'external': 'bg-[#fbbf24]/20 text-[#fbbf24]',
};

const MeetingIntelligence = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasActionItems, setHasActionItems] = useState(false);
  const [externalOnly, setExternalOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = [...meetings];
    if (searchQuery) result = result.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (hasActionItems) result = result.filter((m) => m.action_items.length > 0);
    if (externalOnly) result = result.filter((m) => m.has_external_participants);
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      result = result.filter((m) => isAfter(parseISO(m.date), subDays(new Date(), days)));
    }
    result.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.duration_minutes - a.duration_minutes;
    });
    return result;
  }, [searchQuery, dateRange, sortBy, hasActionItems, externalOnly]);

  const totalMeetings = meetings.length;
  const thisWeek = meetings.filter((m) => isAfter(parseISO(m.date), subDays(new Date(), 7))).length;
  const openActions = meetings.reduce((acc, m) => acc + m.action_items.filter((a) => !a.done).length, 0);
  const avgDuration = Math.round(meetings.reduce((acc, m) => acc + m.duration_minutes, 0) / meetings.length);

  const kpis = [
    { label: 'Total Meetings', value: totalMeetings.toString(), icon: Calendar },
    { label: 'This Week', value: thisWeek.toString(), icon: TrendingUp },
    { label: 'Open Action Items', value: openActions.toString(), icon: CheckSquare },
    { label: 'Avg Duration', value: `${avgDuration}m`, icon: Clock },
  ];

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    meetings.forEach((m) => { counts[m.meeting_type] = (counts[m.meeting_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const monthlyTrend = useMemo(() => {
    const counts: Record<string, number> = {};
    meetings.forEach((m) => {
      const month = format(parseISO(m.date), 'MMM');
      counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  }, []);

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10"><kpi.icon size={20} className="text-primary" /></div>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{kpi.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Meeting Types</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {typeDistribution.map((entry) => (
                  <Cell key={entry.name} fill={typeColors[entry.name as MeetingType] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {typeDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: typeColors[t.name as MeetingType] }} />
                {t.name}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/30 border-none text-foreground"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-28 bg-secondary/30 border-none text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border border-secondary">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setHasActionItems(!hasActionItems)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasActionItems ? 'bg-primary/20 text-primary' : 'bg-secondary/30 text-muted-foreground'}`}
          >
            Has Action Items
          </button>
          <button
            onClick={() => setExternalOnly(!externalOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${externalOnly ? 'bg-primary/20 text-primary' : 'bg-secondary/30 text-muted-foreground'}`}
          >
            External Only
          </button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 bg-secondary/30 border-none text-sm ml-auto"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border border-secondary">
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="longest">Longest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meeting Feed */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {filtered.map((meeting, i) => (
            <MeetingCard key={meeting.id} meeting={meeting} index={i} expanded={expandedId === meeting.id} onToggle={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)} getInitials={getInitials} />
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No meetings found.</p>}
        </div>
      </ScrollArea>
    </div>
  );
};

const MeetingCard = ({ meeting, index, expanded, onToggle, getInitials }: { meeting: Meeting; index: number; expanded: boolean; onToggle: () => void; getInitials: (n: string) => string }) => {
  const openActions = meeting.action_items.filter((a) => !a.done).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="glass-card overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/20 transition-colors">
        <Badge className={`text-xs shrink-0 ${typeBadgeClass[meeting.meeting_type] || 'bg-muted text-muted-foreground'}`}>{meeting.meeting_type}</Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">{format(parseISO(meeting.date), 'MMM d, yyyy')} · {meeting.duration_display}</p>
        </div>
        <div className="hidden sm:flex items-center -space-x-2">
          {meeting.attendees.slice(0, 3).map((a) => (
            <div key={a} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-mono text-foreground border-2 border-card">{getInitials(a)}</div>
          ))}
          {meeting.attendees.length > 3 && <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground border-2 border-card">+{meeting.attendees.length - 3}</div>}
        </div>
        {meeting.has_external_participants && <Globe size={14} className="text-accent shrink-0" />}
        {openActions > 0 && <Badge className="bg-warning/20 text-warning text-xs shrink-0">{openActions}</Badge>}
        {expanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-secondary/30 pt-4">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{meeting.summary}</p>

              {meeting.action_items.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Action Items</h4>
                  <div className="space-y-1.5">
                    {meeting.action_items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={item.done} readOnly className="rounded border-muted accent-primary" />
                        <span className={item.done ? 'line-through text-muted-foreground' : 'text-foreground'}>{item.task}</span>
                        <span className="text-xs text-muted-foreground ml-auto">@{item.assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles size={12} className="text-primary" />
                {meeting.ai_insights}
              </div>

              {meeting.external_domains.length > 0 && (
                <p className="text-xs text-muted-foreground">External: {meeting.external_domains.join(', ')}</p>
              )}

              <div className="flex gap-2 flex-wrap">
                {meeting.fathom_url && (
                  <a href={meeting.fathom_url} target="_blank" rel="noopener" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/30 text-xs text-foreground hover:bg-secondary/50 transition-colors">
                    <ExternalLink size={12} /> Open Recording
                  </a>
                )}
                {meeting.share_url && (
                  <a href={meeting.share_url} target="_blank" rel="noopener" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/30 text-xs text-foreground hover:bg-secondary/50 transition-colors">
                    <Share2 size={12} /> Share Link
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MeetingIntelligence;
