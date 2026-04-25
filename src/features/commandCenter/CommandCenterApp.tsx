import { type ReactNode, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeDollarSign,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileStack,
  FolderKanban,
  Gauge,
  HeartHandshake,
  LayoutGrid,
  Link2,
  Megaphone,
  Search,
  ShieldAlert,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { commandCenterData, alerts, findCustomer, findRoofSystem, findTeamMember, ownerActionItems } from './mockData';
import type { Alert, CommandCenterFilters, OwnerActionItem, Priority, RiskLevel } from './types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const pageDefs = [
  { id: 'executive-overview', label: 'Executive Overview', icon: Gauge },
  { id: 'sales-pipeline', label: 'Sales Pipeline', icon: Megaphone },
  { id: 'production-board', label: 'Production Board', icon: LayoutGrid },
  { id: 'insurance-supplements', label: 'Insurance & Supplements', icon: ShieldAlert },
  { id: 'finance-cash-flow', label: 'Finance / Cash Flow', icon: Wallet },
  { id: 'job-profitability', label: 'Job Profitability', icon: BadgeDollarSign },
  { id: 'customer-experience', label: 'Customer Experience / Risk', icon: HeartHandshake },
  { id: 'csr-admin-center', label: 'CSR / Admin Center', icon: ClipboardList },
  { id: 'marketing-roi', label: 'Marketing / Lead Source ROI', icon: Briefcase },
  { id: 'team-accountability', label: 'Team Accountability', icon: Users },
  { id: 'vendors-materials-crews', label: 'Vendors / Materials / Crews', icon: Wrench },
  { id: 'roof-systems-pricing', label: 'Roof Systems / Pricing', icon: Building2 },
  { id: 'openclaw-automations', label: 'OpenClaw / Automations', icon: Bot },
  { id: 'documents-sop-library', label: 'Documents / SOP Library', icon: FileStack },
  { id: 'integrations-system-health', label: 'Integrations / System Health', icon: Link2 },
] as const;

type PageId = (typeof pageDefs)[number]['id'];

const defaultFilters: CommandCenterFilters = {
  search: '',
  owner: 'all',
  stage: 'all',
  status: 'all',
  risk: 'all',
  roofSystem: 'all',
  salesRep: 'all',
  crew: 'all',
  leadSource: 'all',
  carrier: 'all',
  dateRange: '30d',
};

const priorityTone: Record<Priority, string> = {
  critical: 'border-rose-400/30 bg-rose-400/15 text-rose-100',
  high: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
  medium: 'border-[#75b7ff44] bg-[#75b7ff1a] text-[#cfe6ff]',
  low: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
};

const riskTone: Record<RiskLevel, string> = {
  critical: 'border-rose-400/30 bg-rose-400/15 text-rose-100',
  high: 'border-orange-400/30 bg-orange-400/15 text-orange-100',
  medium: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
  low: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
};

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function compactDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="mission-label text-[11px]">Command center</div>
        <div className="mt-1 text-xl font-semibold text-[#f1ae78]">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-400">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, detail, tone = 'medium', clickable }: { label: string; value: string; detail: string; tone?: Priority | 'neutral'; clickable?: boolean }) {
  const toneClass = tone === 'neutral' ? 'border-white/10 bg-white/5 text-slate-200' : priorityTone[tone];
  return (
    <div className={cn('mission-panel-soft rounded-[24px] p-4 transition', clickable && 'hover:-translate-y-0.5 hover:border-[#8ec7ff66] cursor-pointer')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize', toneClass)}>{clickable ? 'drill down' : tone}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', className)}>{children}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes('past') || normalized.includes('failed') || normalized.includes('critical')
    ? 'border-rose-400/30 bg-rose-400/15 text-rose-100'
    : normalized.includes('pending') || normalized.includes('watch') || normalized.includes('due')
      ? 'border-amber-400/30 bg-amber-400/15 text-amber-100'
      : 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100';
  return <Pill className={tone}>{value.replaceAll('_', ' ')}</Pill>;
}

function RiskBadge({ value }: { value: RiskLevel }) {
  return <Pill className={riskTone[value]}>{value}</Pill>;
}

function PriorityBadge({ value }: { value: Priority }) {
  return <Pill className={priorityTone[value]}>{value}</Pill>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#78b2ff33] bg-slate-950/30 p-6 text-sm text-slate-400">
      <div className="font-medium text-slate-200">{title}</div>
      <div className="mt-2 leading-6">{detail}</div>
    </div>
  );
}

function DataPanel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mission-panel rounded-[28px] p-4">
      <SectionHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </div>
  );
}

function AlertsList({ items, onSelect }: { items: Alert[]; onSelect: (item: Alert) => void }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button key={item.id} onClick={() => onSelect(item)} className="mission-panel-soft w-full rounded-[22px] p-4 text-left transition hover:border-[#8ec7ff66]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#f1ae78]">{item.title}</div>
              <div className="mt-2 text-sm text-slate-300">{item.description}</div>
            </div>
            <PriorityBadge value={item.priority} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <StatusBadge value={item.status} />
            <span>{item.ageLabel}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function OwnerQueueList({ items, onSelect }: { items: OwnerActionItem[]; onSelect: (item: OwnerActionItem) => void }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button key={item.id} onClick={() => onSelect(item)} className="mission-panel-soft w-full rounded-[22px] p-4 text-left transition hover:border-[#8ec7ff66]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#f1ae78]">{item.title}</div>
              <div className="mt-2 text-sm text-slate-300">{item.reason}</div>
            </div>
            <PriorityBadge value={item.priority} />
          </div>
          <div className="mt-3 text-xs text-slate-500">Due {compactDate(item.dueAt)} • {item.relatedEntity}</div>
        </button>
      ))}
    </div>
  );
}

function FiltersBar({ filters, setFilters }: { filters: CommandCenterFilters; setFilters: React.Dispatch<React.SetStateAction<CommandCenterFilters>> }) {
  const owners = ['all', ...commandCenterData.teamMembers.map((member) => member.name)];
  const risks = ['all', 'critical', 'high', 'medium', 'low'];
  const carriers = ['all', ...new Set(commandCenterData.insuranceClaims.map((claim) => claim.carrier))];

  return (
    <div className="mission-panel rounded-[28px] p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mission-label text-[11px]">Filters</div>
          <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Operator controls</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Search customer, job, claim"
              className="mission-button border-[#77aeff33] bg-transparent pl-10 text-slate-200 placeholder:text-slate-500"
            />
          </div>
          <Select value={filters.owner} onValueChange={(value) => setFilters((prev) => ({ ...prev, owner: value }))}>
            <SelectTrigger className="mission-button border-[#77aeff33] bg-transparent text-slate-200"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              {owners.map((owner) => <SelectItem key={owner} value={owner}>{owner === 'all' ? 'All owners' : owner}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.risk} onValueChange={(value) => setFilters((prev) => ({ ...prev, risk: value }))}>
            <SelectTrigger className="mission-button border-[#77aeff33] bg-transparent text-slate-200"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              {risks.map((risk) => <SelectItem key={risk} value={risk}>{risk === 'all' ? 'All risk levels' : risk}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.carrier} onValueChange={(value) => setFilters((prev) => ({ ...prev, carrier: value }))}>
            <SelectTrigger className="mission-button border-[#77aeff33] bg-transparent text-slate-200"><SelectValue placeholder="Carrier" /></SelectTrigger>
            <SelectContent>
              {carriers.map((carrier) => <SelectItem key={carrier} value={carrier}>{carrier === 'all' ? 'All carriers' : carrier}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.dateRange} onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value as CommandCenterFilters['dateRange'] }))}>
            <SelectTrigger className="mission-button border-[#77aeff33] bg-transparent text-slate-200"><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function useFilteredData(filters: CommandCenterFilters) {
  return useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const customerMatch = (customerId: string) => {
      const customer = findCustomer(customerId);
      if (!customer) return false;
      if (filters.owner !== 'all') {
        const ownerNames = [findTeamMember(customer.salesRepId)?.name, findTeamMember(customer.productionManagerId)?.name].filter(Boolean);
        if (!ownerNames.includes(filters.owner)) return false;
      }
      if (filters.risk !== 'all' && customer.riskLevel !== filters.risk) return false;
      if (!q) return true;
      return [customer.name, customer.address, customer.city].join(' ').toLowerCase().includes(q);
    };

    return {
      jobs: commandCenterData.jobs.filter((job) => customerMatch(job.customerId) && (filters.risk === 'all' || job.riskLevel === filters.risk) && (filters.carrier === 'all' || true)),
      claims: commandCenterData.insuranceClaims.filter((claim) => customerMatch(claim.customerId) && (filters.carrier === 'all' || claim.carrier === filters.carrier)),
      customers: commandCenterData.customers.filter((customer) => customerMatch(customer.id)),
      leads: commandCenterData.leads.filter((lead) => customerMatch(lead.customerId)),
      approvals: commandCenterData.approvals.filter((approval) => !approval.relatedCustomerId || customerMatch(approval.relatedCustomerId)),
      alerts: alerts.filter((alert) => {
        if (!q) return true;
        const relatedCustomer = alert.relatedType === 'customer' || alert.relatedType === 'job' || alert.relatedType === 'claim' || alert.relatedType === 'finance'
          ? findCustomer(commandCenterData.jobs.find((job) => job.id === alert.relatedId)?.customerId || commandCenterData.insuranceClaims.find((claim) => claim.id === alert.relatedId)?.customerId || alert.relatedId)
          : undefined;
        return [alert.title, alert.description, relatedCustomer?.name || ''].join(' ').toLowerCase().includes(q);
      }),
      ownerItems: ownerActionItems.filter((item) => !q || [item.title, item.reason, item.relatedEntity].join(' ').toLowerCase().includes(q)),
    };
  }, [filters]);
}

function ExecutiveOverview({ filters, onAlertSelect, onOwnerSelect }: { filters: CommandCenterFilters; onAlertSelect: (item: Alert) => void; onOwnerSelect: (item: OwnerActionItem) => void }) {
  const { jobs, claims, customers, alerts: filteredAlerts, ownerItems, approvals } = useFilteredData(filters);
  const soldRevenue = jobs.reduce((sum, job) => sum + job.contractAmount, 0);
  const producedRevenue = jobs.filter((job) => ['In Production', 'Final Inspection', 'Invoice Sent'].includes(job.stage)).reduce((sum, job) => sum + job.contractAmount, 0);
  const collectedRevenue = commandCenterData.payments.filter((payment) => payment.status === 'received').reduce((sum, payment) => sum + payment.amount, 0);
  const ar = commandCenterData.invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const ap = commandCenterData.vendors.reduce((sum, vendor) => sum + vendor.balanceDue, 0);
  const lowMarginJobs = jobs.filter((job) => job.netProfitEstimate < 0.2);
  const customerRiskCount = commandCenterData.customerRisks.filter((risk) => risk.ownerAttention).length;
  const pendingApprovals = approvals.filter((approval) => approval.status === 'pending' && approval.requiresMatthewApproval).length;
  const topQueue = [
    ...jobs.filter((job) => job.stage === 'Deposit Needed').map((job) => ({
      id: `queue-${job.id}`,
      title: `${findCustomer(job.customerId)?.name} deposit follow-up`,
      priority: 'high' as Priority,
      status: 'Open',
      owner: findTeamMember(job.salesRepId)?.name || 'Unassigned',
      due: compactDate('2026-04-25T17:00:00Z'),
      related: `${findCustomer(job.customerId)?.name} / ${job.stage}`,
      action: 'Collect deposit or get owner decision on exception.',
    })),
    ...claims.map((claim) => ({
      id: `queue-${claim.id}`,
      title: `${findCustomer(claim.customerId)?.name} supplement action`,
      priority: claim.agingDays > 21 ? 'critical' as Priority : 'high' as Priority,
      status: claim.stage,
      owner: findTeamMember(claim.assignedOwnerId)?.name || 'Unassigned',
      due: compactDate(claim.nextActionDate),
      related: `${findCustomer(claim.customerId)?.name} / ${claim.carrier}`,
      action: 'Update customer and move carrier / adjuster next step today.',
    })),
  ].slice(0, 8);

  const pipelineStages = ['Lead', 'Inspection Booked', 'Inspection Complete', 'Estimate Drafting', 'Proposal Sent', 'Sold', 'Deposit Needed', 'Supplement / Insurance', 'Material Ordered', 'Scheduled', 'In Production', 'Final Inspection', 'Invoice Sent', 'Paid', 'Closed', 'Warranty / Follow-Up'];

  const salesByRep = commandCenterData.teamMembers.filter((member) => member.role === 'Sales Rep' || member.role === 'Owner').map((rep) => {
    const repJobs = commandCenterData.jobs.filter((job) => job.salesRepId === rep.id);
    return {
      rep: rep.name,
      sold: repJobs.reduce((sum, job) => sum + job.contractAmount, 0),
      closeRate: rep.id === 'tm-1' ? '41%' : '34%',
      avgTicket: repJobs.length ? currency(repJobs.reduce((sum, job) => sum + job.contractAmount, 0) / repJobs.length) : '$0',
    };
  });

  const productionSnapshot = {
    activeJobs: jobs.filter((job) => ['Scheduled', 'In Production', 'Final Inspection'].includes(job.stage)).length,
    stuckJobs: jobs.filter((job) => job.daysInStage > 7).length,
    waitingOnMaterials: jobs.filter((job) => ['not_ordered', 'ordered', 'backordered'].includes(job.materialStatus)).length,
    waitingOnCustomer: customers.filter((customer) => customer.ownerAttention).length,
    waitingOnInsurance: claims.length,
  };

  const supplementAges = commandCenterData.supplements.reduce((acc, supplement) => {
    if (supplement.agingDays > 30) acc.over30 += 1;
    else if (supplement.agingDays > 21) acc.over21 += 1;
    else if (supplement.agingDays > 14) acc.over14 += 1;
    return acc;
  }, { over14: 0, over21: 0, over30: 0 });

  return (
    <div className="space-y-4">
      <DataPanel title="Executive Overview / Command Deck" subtitle="Daily owner glance across money, jobs, customers, insurance, and OpenClaw operations.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Cash on Hand" value={currency(182400)} detail="Mock treasury balance across operating accounts." clickable tone="low" />
          <MetricCard label="30-Day Cash Forecast" value={currency(214800)} detail="Forecast after expected deposits, AR collection, and payroll cycle." clickable tone="medium" />
          <MetricCard label="60-Day Cash Forecast" value={currency(247900)} detail="Includes sold backlog conversion and supplement forecast." clickable tone="medium" />
          <MetricCard label="90-Day Cash Forecast" value={currency(282300)} detail="Shows expected lift if stalled deposits and appraisal lanes convert." clickable tone="medium" />
          <MetricCard label="Revenue Sold This Month" value={currency(soldRevenue)} detail="All sold contract value in the current mock window." clickable tone="low" />
          <MetricCard label="Revenue Produced This Month" value={currency(producedRevenue)} detail="Work in production/final inspection/invoicing." clickable tone="medium" />
          <MetricCard label="Cash Collected This Month" value={currency(collectedRevenue || 26400)} detail="Collected cash trails sold revenue; conversion pressure is visible." clickable tone="medium" />
          <MetricCard label="Gross Profit %" value={percent(0.31)} detail="Weighted by active job mix and current mock cost load." clickable tone="low" />
          <MetricCard label="Net Profit %" value={percent(0.19)} detail="Below target because Patricia + Monroe lanes are dragging margin." clickable tone="high" />
          <MetricCard label="Open Accounts Receivable" value={currency(ar)} detail="Open invoices still sitting outside collected cash." clickable tone="high" />
          <MetricCard label="Accounts Payable Due This Week" value={currency(ap)} detail="Supplier exposure, especially ABC Supply, needs scheduling clarity." clickable tone="medium" />
          <MetricCard label="Jobs Below Target Margin" value={String(lowMarginJobs.length)} detail="Anything forecast below 20% net should be treated as a management issue." clickable tone="critical" />
          <MetricCard label="Customer Risk Count" value={String(customerRiskCount)} detail="Customers with communication, complaint, or timing risk." clickable tone="high" />
          <MetricCard label="Pending Owner Approvals" value={String(pendingApprovals)} detail="Money, customer, contract, and insurance-sensitive approvals waiting on Matthew." clickable tone="critical" />
        </div>
      </DataPanel>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DataPanel title="Red Alert Panel" subtitle="Urgent exceptions and operating threats that should not get buried.">
          <AlertsList items={filteredAlerts} onSelect={onAlertSelect} />
        </DataPanel>
        <DataPanel title="Owner Intervention Needed" subtitle="Only the items that need Matthew-level judgment or approval.">
          <OwnerQueueList items={ownerItems} onSelect={onOwnerSelect} />
        </DataPanel>
      </div>

      <DataPanel title="Today’s Command Queue" subtitle="Prioritized work for inspections, deposits, supplements, updates, and intervention.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priority</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Related</TableHead>
              <TableHead>Next recommended action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topQueue.map((item) => (
              <TableRow key={item.id}>
                <TableCell><PriorityBadge value={item.priority} /></TableCell>
                <TableCell className="font-medium text-[#f1ae78]">{item.title}</TableCell>
                <TableCell><StatusBadge value={item.status} /></TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.due}</TableCell>
                <TableCell>{item.related}</TableCell>
                <TableCell className="text-slate-300">{item.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataPanel title="Money Movement Panel" subtitle="Revenue and cash conversion by stage.">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['Leads quoted', currency(113000)],
              ['Estimates pending', currency(24300)],
              ['Sold not started', currency(59874)],
              ['Waiting on supplement', currency(7974)],
              ['Materials ordered', currency(18400)],
              ['Scheduled', currency(0)],
              ['In production', currency(22570)],
              ['Completed not invoiced', currency(0)],
              ['Invoiced not paid', currency(ar)],
              ['Collected this month', currency(collectedRevenue || 26400)],
              ['Forecasted next 30 days', currency(148300)],
            ].map(([label, value]) => (
              <div key={label} className="mission-panel-soft rounded-[22px] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
                <div className="mt-2 text-xl font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </DataPanel>
        <DataPanel title="Job Pipeline by Stage" subtitle="Count, contract value, age, oldest lane, and responsible owner.">
          <div className="grid gap-3">
            {pipelineStages.map((stage) => {
              const stageJobs = commandCenterData.jobs.filter((job) => job.stage === stage);
              if (stageJobs.length === 0) return null;
              const oldest = [...stageJobs].sort((a, b) => b.daysInStage - a.daysInStage)[0];
              return (
                <div key={stage} className="mission-panel-soft rounded-[22px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#f1ae78]">{stage}</div>
                      <div className="mt-1 text-xs text-slate-500">{stageJobs.length} jobs • {currency(stageJobs.reduce((sum, job) => sum + job.contractAmount, 0))}</div>
                    </div>
                    <div className="text-right text-xs text-slate-400">Avg {Math.round(stageJobs.reduce((sum, job) => sum + job.daysInStage, 0) / stageJobs.length)}d • Oldest {oldest.daysInStage}d</div>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">Responsible owner: {findTeamMember(oldest.ownerId || oldest.salesRepId)?.name || 'Unassigned'}</div>
                </div>
              );
            })}
          </div>
        </DataPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataPanel title="Sales Snapshot" subtitle="Lead flow, inspection activity, proposal pressure, and rep output.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="New leads today" value="4" detail="Two LSA, one referral, one insurance referral." tone="low" />
            <MetricCard label="New leads this week" value="18" detail="Lead volume is fine; conversion and follow-up are the issue." tone="medium" />
            <MetricCard label="Booked inspections" value="11" detail="Booking rate is healthy on referred and organic channels." tone="low" />
            <MetricCard label="Completed inspections" value="8" detail="Three still need same-day estimate discipline." tone="medium" />
            <MetricCard label="Estimates sent" value="6" detail="Two estimates are older than 3 days and still at risk." tone="high" />
            <MetricCard label="Open proposals" value="3" detail="One high-risk proposal is already slipping emotionally." tone="high" />
          </div>
          <div className="mt-4 overflow-hidden rounded-[22px] border border-white/8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Revenue sold</TableHead>
                  <TableHead>Close rate</TableHead>
                  <TableHead>Average ticket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByRep.map((row) => (
                  <TableRow key={row.rep}>
                    <TableCell className="font-medium text-[#f1ae78]">{row.rep}</TableCell>
                    <TableCell>{currency(row.sold)}</TableCell>
                    <TableCell>{row.closeRate}</TableCell>
                    <TableCell>{row.avgTicket}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataPanel>
        <DataPanel title="Production / Insurance / Profitability / CX / OpenClaw Snapshot" subtitle="Compressed operator read across the other major lanes.">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard label="Active jobs" value={String(productionSnapshot.activeJobs)} detail={`${productionSnapshot.stuckJobs} jobs are stuck beyond threshold.`} tone="medium" />
            <MetricCard label="Waiting on materials" value={String(productionSnapshot.waitingOnMaterials)} detail="Material ordering is still holding conversion on sold work." tone="high" />
            <MetricCard label="Claims pending supplement" value={String(commandCenterData.insuranceClaims.filter((claim) => claim.stage === 'pending_supplement').length)} detail={`${supplementAges.over14} over 14d • ${supplementAges.over21} over 21d • ${supplementAges.over30} over 30d`} tone="high" />
            <MetricCard label="Jobs below 20% net target" value={String(lowMarginJobs.length)} detail="Main issue is estimate vs actual cost drift plus owner concessions risk." tone="critical" />
            <MetricCard label="Open complaints" value={String(commandCenterData.customerCommunications.filter((comm) => comm.sentiment === 'negative').length)} detail="Complaint handling should route fast before reviews are triggered." tone="critical" />
            <MetricCard label="Active agents" value={String(commandCenterData.agents.filter((agent) => agent.status === 'active').length)} detail={`${commandCenterData.agents.filter((agent) => agent.status === 'failed').length} failed automation/agent surfaces need review.`} tone="medium" />
          </div>
        </DataPanel>
      </div>
    </div>
  );
}

function SalesPipelinePage({ filters }: { filters: CommandCenterFilters }) {
  const { leads, customers } = useFilteredData(filters);
  const highValueUnsold = leads.filter((lead) => ['new', 'contacted', 'booked', 'inspection_complete', 'estimate_pending', 'proposal_sent'].includes(lead.status)).sort((a, b) => b.valuePotential - a.valuePotential);
  return (
    <div className="grid gap-4">
      <DataPanel title="Sales Pipeline" subtitle="Leads, inspections, estimates, proposals, follow-up, sold work, and leakage alerts.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Lead list" value={String(leads.length)} detail="All active mock leads in scope." tone="medium" />
          <MetricCard label="Booked inspections" value={String(commandCenterData.inspections.filter((inspection) => inspection.status === 'scheduled').length)} detail="Today’s booking discipline starts here." tone="low" />
          <MetricCard label="High-value unsold jobs" value={currency(highValueUnsold.reduce((sum, lead) => sum + lead.valuePotential, 0))} detail="Unsold value that should not quietly age out." tone="high" />
          <MetricCard label="No-follow-up alerts" value={String(alerts.filter((alert) => alert.title.toLowerCase().includes('follow-up')).length)} detail="Proposal and estimate follow-up failure points." tone="high" />
        </div>
      </DataPanel>
      <DataPanel title="Lead / Proposal Queue" subtitle="Purpose-built list of lead source, booking status, follow-up pressure, and sold/lost state.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Lead source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Potential</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Leakage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const customer = customers.find((item) => item.id === lead.customerId);
              const source = commandCenterData.marketingSources.find((item) => item.id === lead.sourceId);
              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-[#f1ae78]">{customer?.name}</TableCell>
                  <TableCell>{source?.name || 'Unknown'}</TableCell>
                  <TableCell><StatusBadge value={lead.status} /></TableCell>
                  <TableCell><StatusBadge value={lead.bookingStatus} /></TableCell>
                  <TableCell>{currency(lead.valuePotential)}</TableCell>
                  <TableCell>{findTeamMember(lead.assignedTo)?.name || lead.assignedTo}</TableCell>
                  <TableCell>{lead.leakageRisk ? <RiskBadge value="high" /> : <RiskBadge value="low" />}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataPanel>
    </div>
  );
}

function ProductionBoardPage({ filters }: { filters: CommandCenterFilters }) {
  const { jobs } = useFilteredData(filters);
  const stages = ['Deposit Needed', 'Contract Complete', 'Material Selection Needed', 'Material Ordered', 'Waiting on Delivery', 'Scheduled', 'In Production', 'Final Inspection', 'Invoice Sent', 'Paid / Closed', 'Warranty Follow-Up'];
  return (
    <DataPanel title="Production Board" subtitle="Movement from sold to closed with bottlenecks, crew readiness, and margin risk.">
      <div className="grid gap-4 xl:grid-cols-3">
        {stages.map((stage) => {
          const stageJobs = jobs.filter((job) => job.stage === stage);
          return (
            <div key={stage} className="mission-panel-soft rounded-[24px] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#f1ae78]">{stage}</div>
                <Pill className="border-white/10 bg-white/5 text-slate-200">{stageJobs.length}</Pill>
              </div>
              <div className="mt-4 space-y-3">
                {stageJobs.length === 0 ? <EmptyState title="No jobs in stage" detail="This stage is ready for live production data later." /> : stageJobs.map((job) => {
                  const customer = findCustomer(job.customerId);
                  const roofSystem = findRoofSystem(job.roofSystemId);
                  return (
                    <div key={job.id} className="rounded-[20px] border border-white/8 bg-slate-950/30 p-4 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#f1ae78]">{customer?.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{customer?.address}</div>
                        </div>
                        <RiskBadge value={job.riskLevel} />
                      </div>
                      <div className="mt-3 grid gap-2 text-slate-300">
                        <div>{roofSystem?.name} • {currency(job.contractAmount)}</div>
                        <div>Sales rep: {findTeamMember(job.salesRepId)?.name}</div>
                        <div>Production manager: {findTeamMember(job.productionManagerId)?.name || 'Unassigned'}</div>
                        <div>Crew: {commandCenterData.crews.find((crew) => crew.id === job.crewId)?.name || 'Unassigned'}</div>
                        <div>Scheduled: {compactDate(job.scheduledDate)}</div>
                        <div>Material: <StatusBadge value={job.materialStatus} /> </div>
                        <div>Labor: <StatusBadge value={job.laborStatus} /> </div>
                        <div>Permit / HOA: {job.permitStatus} / {job.hoaStatus}</div>
                        <div>Bottleneck: {job.bottleneck}</div>
                        <div>Days in stage: {job.daysInStage}</div>
                        <div>Forecast gross margin: {percent(job.forecastGrossMargin)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DataPanel>
  );
}

function InsurancePage({ filters }: { filters: CommandCenterFilters }) {
  const { claims } = useFilteredData(filters);
  return (
    <div className="grid gap-4">
      <DataPanel title="Insurance & Supplements" subtitle="Control the insurance bottleneck with claim aging, supplement movement, and next action gaps.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Claims pending supplement" value={String(claims.filter((claim) => claim.stage === 'pending_supplement').length)} detail="Claims still waiting on supplement decision." tone="high" />
          <MetricCard label="Supplements submitted" value={String(commandCenterData.supplements.length)} detail="Total supplement count in the mock layer." tone="medium" />
          <MetricCard label="Average supplement age" value={`${Math.round(commandCenterData.supplements.reduce((sum, item) => sum + item.agingDays, 0) / commandCenterData.supplements.length)}d`} detail="Aging should compress, not drift upward." tone="high" />
          <MetricCard label="Claims with no next action" value={String(claims.filter((claim) => !claim.nextActionDate).length)} detail="Every claim needs a concrete next move and owner." tone="high" />
        </div>
      </DataPanel>
      <DataPanel title="Claims Aging Report" subtitle="Carrier, stage, requested/approved supplement, next action, and risk state.">
        <Table>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Carrier</TableHead><TableHead>Claim #</TableHead><TableHead>Adjuster</TableHead><TableHead>RCV / ACV</TableHead><TableHead>Supplement</TableHead><TableHead>Last contact</TableHead><TableHead>Next action</TableHead><TableHead>Owner</TableHead><TableHead>Aging</TableHead><TableHead>Risk</TableHead></TableRow></TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const supplement = commandCenterData.supplements.find((item) => item.claimId === claim.id);
              return (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium text-[#f1ae78]">{findCustomer(claim.customerId)?.name}</TableCell>
                  <TableCell>{claim.carrier}</TableCell>
                  <TableCell>{claim.claimNumber}</TableCell>
                  <TableCell>{claim.adjuster}</TableCell>
                  <TableCell>{currency(claim.originalRCV)} / {currency(claim.originalACV)}</TableCell>
                  <TableCell>{supplement ? `${currency(supplement.requestedAmount)} / ${currency(supplement.approvedAmount)}` : '—'}</TableCell>
                  <TableCell>{compactDate(claim.lastContactDate)}</TableCell>
                  <TableCell>{compactDate(claim.nextActionDate)}</TableCell>
                  <TableCell>{findTeamMember(claim.assignedOwnerId)?.name}</TableCell>
                  <TableCell>{claim.agingDays}d</TableCell>
                  <TableCell><RiskBadge value={claim.riskLevel} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataPanel>
    </div>
  );
}

function FinancePage() {
  const depositsCollected = commandCenterData.payments.filter((payment) => payment.type === 'deposit' && payment.status === 'received').reduce((sum, payment) => sum + payment.amount, 0);
  const finalPaymentsDue = commandCenterData.payments.filter((payment) => payment.type === 'final' && payment.status !== 'received').reduce((sum, payment) => sum + payment.amount, 0);
  const grossMarginByJob = commandCenterData.jobs.map((job) => ({
    job,
    grossMargin: job.forecastGrossMargin,
    netMargin: job.netProfitEstimate,
  }));
  return (
    <div className="grid gap-4">
      <DataPanel title="Finance / Cash Flow" subtitle="Owner-facing money control with sold vs produced vs invoiced vs collected separated cleanly.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Sold revenue" value={currency(commandCenterData.jobs.reduce((sum, job) => sum + job.contractAmount, 0))} detail="Contracted revenue." tone="low" />
          <MetricCard label="Produced revenue" value={currency(commandCenterData.jobs.filter((job) => ['In Production', 'Final Inspection', 'Invoice Sent'].includes(job.stage)).reduce((sum, job) => sum + job.contractAmount, 0))} detail="Work pushed through production." tone="medium" />
          <MetricCard label="Invoiced revenue" value={currency(commandCenterData.invoices.reduce((sum, invoice) => sum + invoice.amount, 0))} detail="Already invoiced but not necessarily collected." tone="medium" />
          <MetricCard label="Collected revenue" value={currency(commandCenterData.payments.filter((payment) => payment.status === 'received').reduce((sum, payment) => sum + payment.amount, 0))} detail="Cash in the bank." tone="medium" />
          <MetricCard label="30 / 60 / 90" value={`${currency(214800)} / ${currency(247900)} / ${currency(282300)}`} detail="Forecast tiers using mock conversion assumptions." tone="high" />
        </div>
      </DataPanel>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataPanel title="Cash control" subtitle="AR, AP, deposits, finals, payroll, supplier bills, and fixed/variable load.">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard label="AR" value={currency(commandCenterData.invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0))} detail="Open receivables." tone="high" />
            <MetricCard label="AP" value={currency(commandCenterData.vendors.reduce((sum, vendor) => sum + vendor.balanceDue, 0))} detail="Supplier liabilities due." tone="medium" />
            <MetricCard label="Deposits collected" value={currency(depositsCollected)} detail="Current collected deposit base." tone="medium" />
            <MetricCard label="Final payments due" value={currency(finalPaymentsDue)} detail="Cash still trapped in closeout and complaint lanes." tone="critical" />
            <MetricCard label="Payroll due" value={currency(28600)} detail="Mock payroll due this cycle." tone="medium" />
            <MetricCard label="Fixed expenses" value={currency(commandCenterData.expenses.filter((expense) => !expense.variable).reduce((sum, expense) => sum + expense.amount, 0) + 19000)} detail="Overhead and fixed business load." tone="medium" />
          </div>
        </DataPanel>
        <DataPanel title="Job profitability summary" subtitle="Gross margin by job with clear problem children.">
          <Table>
            <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Gross margin</TableHead><TableHead>Net margin</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {grossMarginByJob.map(({ job, grossMargin, netMargin }) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium text-[#f1ae78]">{findCustomer(job.customerId)?.name}</TableCell>
                  <TableCell>{percent(grossMargin)}</TableCell>
                  <TableCell>{percent(netMargin)}</TableCell>
                  <TableCell>{netMargin < 0.2 ? <RiskBadge value={job.riskLevel} /> : <StatusBadge value="healthy" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>
      </div>
    </div>
  );
}

function ProfitabilityPage() {
  const rows = commandCenterData.jobs.map((job) => {
    const materialBudget = job.contractAmount * 0.36;
    const actualMaterial = commandCenterData.expenses.filter((expense) => expense.jobId === job.id && expense.category === 'material').reduce((sum, expense) => sum + expense.amount, 0);
    const laborBudget = job.contractAmount * 0.14;
    const actualLabor = commandCenterData.expenses.filter((expense) => expense.jobId === job.id && expense.category === 'labor').reduce((sum, expense) => sum + expense.amount, 0);
    const additional = commandCenterData.expenses.filter((expense) => expense.jobId === job.id && !['material', 'labor'].includes(expense.category)).reduce((sum, expense) => sum + expense.amount, 0);
    const supplementRevenue = commandCenterData.insuranceClaims.filter((claim) => findCustomer(claim.customerId)?.id === job.customerId).reduce((sum, claim) => sum + claim.depreciationRecoverable, 0);
    const grossProfit = job.contractAmount + supplementRevenue - actualMaterial - actualLabor - additional;
    return { job, materialBudget, actualMaterial, laborBudget, actualLabor, additional, supplementRevenue, grossProfit };
  });
  return (
    <DataPanel title="Job Profitability" subtitle="Protect margin ruthlessly with estimate vs actual variance and profitability slices.">
      <Table>
        <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Contract</TableHead><TableHead>Deposit</TableHead><TableHead>Material budget / actual</TableHead><TableHead>Labor budget / actual</TableHead><TableHead>Additional</TableHead><TableHead>Supplement</TableHead><TableHead>Gross profit</TableHead><TableHead>Net est.</TableHead><TableHead>Variance</TableHead><TableHead>Roof system</TableHead><TableHead>Rep / Crew</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.job.id}>
              <TableCell className="font-medium text-[#f1ae78]">{findCustomer(row.job.customerId)?.name}</TableCell>
              <TableCell>{currency(row.job.contractAmount)}</TableCell>
              <TableCell>{currency(row.job.depositCollected)}</TableCell>
              <TableCell>{currency(row.materialBudget)} / {currency(row.actualMaterial)}</TableCell>
              <TableCell>{currency(row.laborBudget)} / {currency(row.actualLabor)}</TableCell>
              <TableCell>{currency(row.additional)}</TableCell>
              <TableCell>{currency(row.supplementRevenue)}</TableCell>
              <TableCell>{currency(row.grossProfit)}</TableCell>
              <TableCell>{percent(row.job.netProfitEstimate)}</TableCell>
              <TableCell>{currency((row.actualMaterial - row.materialBudget) + (row.actualLabor - row.laborBudget) + row.additional)}</TableCell>
              <TableCell>{findRoofSystem(row.job.roofSystemId)?.name}</TableCell>
              <TableCell>{findTeamMember(row.job.salesRepId)?.name} / {commandCenterData.crews.find((crew) => crew.id === row.job.crewId)?.name || 'Unassigned'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function CustomerExperiencePage() {
  return (
    <DataPanel title="Customer Experience / Customer Risk" subtitle="Prevent dropped communication, bad reviews, and confused customers.">
      <Table>
        <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Journey stage</TableHead><TableHead>Last contact</TableHead><TableHead>Next contact</TableHead><TableHead>Sentiment</TableHead><TableHead>Complaint / delay</TableHead><TableHead>Review</TableHead><TableHead>Owner attention</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.customers.map((customer) => {
            const risk = commandCenterData.customerRisks.find((item) => item.customerId === customer.id);
            return (
              <TableRow key={customer.id}>
                <TableCell className="font-medium text-[#f1ae78]">{customer.name}</TableCell>
                <TableCell>{customer.journeyStage}</TableCell>
                <TableCell>{compactDate(customer.lastContactAt)}</TableCell>
                <TableCell>{compactDate(customer.nextContactAt)}</TableCell>
                <TableCell><StatusBadge value={customer.sentiment} /></TableCell>
                <TableCell>{risk ? risk.reason : 'None surfaced'}</TableCell>
                <TableCell><StatusBadge value={customer.reviewRequestStatus} /></TableCell>
                <TableCell>{customer.ownerAttention ? <PriorityBadge value="high" /> : <StatusBadge value="clear" />}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function CSRPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DataPanel title="CSR / Admin Center" subtitle="Office execution center for communications, booking, documents, and deposits.">
        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard label="Incoming call queue" value="12" detail="Placeholder for CallRail / RingCentral intake queue." tone="medium" />
          <MetricCard label="Missed calls" value="3" detail="Needs same-day callback discipline." tone="high" />
          <MetricCard label="Lead response time" value="14 min" detail="Fast enough on referrals, slower on paid channels." tone="low" />
          <MetricCard label="Appointment booking rate" value="61%" detail="Needs tighter script discipline on colder leads." tone="medium" />
          <MetricCard label="Unconfirmed appointments" value="2" detail="Today’s inspection book needs confirmation touches." tone="high" />
          <MetricCard label="Missing documents" value="4" detail="Contract, insurance, and HOA packet gaps visible." tone="high" />
        </div>
      </DataPanel>
      <DataPanel title="Admin queue" subtitle="Texts, emails, updates, financing, contracts, and deposit collection placeholders.">
        <div className="space-y-3 text-sm text-slate-300">
          {[
            'Texts needing response: 7',
            'Emails needing response: 5',
            'Customer update tasks due today: 6',
            'Financing applications pending: 2',
            'Contracts not signed: 1',
            'Deposits not collected: 2',
            'Script guidance placeholder ready by workflow type.',
          ].map((item) => <div key={item} className="mission-panel-soft rounded-[22px] p-4">{item}</div>)}
        </div>
      </DataPanel>
    </div>
  );
}

function MarketingPage() {
  return (
    <DataPanel title="Marketing / Lead Source ROI" subtitle="Gross profit by marketing source, not just lead count.">
      <Table>
        <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Leads</TableHead><TableHead>Booked</TableHead><TableHead>Sales</TableHead><TableHead>Spend</TableHead><TableHead>Cost / lead</TableHead><TableHead>Cost / sale</TableHead><TableHead>Close rate</TableHead><TableHead>Average ticket</TableHead><TableHead>Gross profit</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.marketingSources.map((source) => (
            <TableRow key={source.id}>
              <TableCell className="font-medium text-[#f1ae78]">{source.name}</TableCell>
              <TableCell>{source.leads}</TableCell>
              <TableCell>{source.bookedInspections}</TableCell>
              <TableCell>{source.sales}</TableCell>
              <TableCell>{currency(source.spend)}</TableCell>
              <TableCell>{currency(source.spend / source.leads)}</TableCell>
              <TableCell>{currency(source.spend / Math.max(source.sales, 1))}</TableCell>
              <TableCell>{percent(source.sales / source.leads)}</TableCell>
              <TableCell>{currency(source.averageTicket)}</TableCell>
              <TableCell>{currency(source.grossProfit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function TeamPage() {
  return (
    <DataPanel title="Team Accountability" subtitle="Ownership, dropped balls, overdue tasks, quality, and escalation by person and agent.">
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Response time</TableHead><TableHead>Quality score</TableHead><TableHead>Escalations</TableHead><TableHead>Jobs owned</TableHead><TableHead>Revenue owned</TableHead><TableHead>Overdue / bottlenecks</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.teamMembers.map((member) => {
            const jobsOwned = commandCenterData.jobs.filter((job) => job.salesRepId === member.id || job.productionManagerId === member.id || job.ownerId === member.id);
            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-[#f1ae78]">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.responseHours}h</TableCell>
                <TableCell>{member.qualityScore}</TableCell>
                <TableCell>{member.escalationCount}</TableCell>
                <TableCell>{jobsOwned.length}</TableCell>
                <TableCell>{currency(jobsOwned.reduce((sum, job) => sum + job.contractAmount, 0))}</TableCell>
                <TableCell>{jobsOwned.filter((job) => job.daysInStage > 7).length} stuck lanes</TableCell>
              </TableRow>
            );
          })}
          {commandCenterData.agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium text-[#f1ae78]">{agent.name}</TableCell>
              <TableCell>OpenClaw agent</TableCell>
              <TableCell>{compactDate(agent.lastHeartbeat)}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>{commandCenterData.agentTasks.filter((task) => task.agentId === agent.id && task.status === 'blocked').length}</TableCell>
              <TableCell>{commandCenterData.agentTasks.filter((task) => task.agentId === agent.id).length}</TableCell>
              <TableCell>{agent.costPlaceholder || '—'}</TableCell>
              <TableCell>{agent.currentTask}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function VendorsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DataPanel title="Vendors / Materials / Crews" subtitle="Fulfillment control across orders, balances, capacity, quality, and schedule readiness.">
        <Table>
          <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Balance due</TableHead><TableHead>Next delivery</TableHead><TableHead>Status</TableHead><TableHead>Recommended action</TableHead></TableRow></TableHeader>
          <TableBody>
            {commandCenterData.vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium text-[#f1ae78]">{vendor.name}</TableCell>
                <TableCell>{currency(vendor.balanceDue)}</TableCell>
                <TableCell>{compactDate(vendor.nextDeliveryDate)}</TableCell>
                <TableCell><StatusBadge value={vendor.status} /></TableCell>
                <TableCell>{vendor.status === 'risk' ? 'Confirm backorder impact and sequencing.' : vendor.status === 'watch' ? 'Protect vendor terms and delivery cadence.' : 'Normal monitoring.'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <DataPanel title="Crew performance" subtitle="Capacity, labor rates, quality, callback risk, and unscheduled-ready jobs.">
        <Table>
          <TableHeader><TableRow><TableHead>Crew</TableHead><TableHead>Systems</TableHead><TableHead>Capacity</TableHead><TableHead>Labor rate</TableHead><TableHead>Callback rate</TableHead><TableHead>Avg duration</TableHead><TableHead>Quality</TableHead></TableRow></TableHeader>
          <TableBody>
            {commandCenterData.crews.map((crew) => (
              <TableRow key={crew.id}>
                <TableCell className="font-medium text-[#f1ae78]">{crew.name}</TableCell>
                <TableCell>{crew.roofSystemIds.map((id) => findRoofSystem(id)?.name).join(', ')}</TableCell>
                <TableCell>{crew.capacityScore}</TableCell>
                <TableCell>{currency(crew.laborRate)}</TableCell>
                <TableCell>{percent(crew.callbackRate)}</TableCell>
                <TableCell>{crew.averageInstallDuration}d</TableCell>
                <TableCell>{crew.qualityScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
    </div>
  );
}

function RoofSystemsPage() {
  return (
    <DataPanel title="Roof Systems / Pricing Intelligence" subtitle="Margin, operational reality, supplement patterns, and callback behavior by system.">
      <Table>
        <TableHeader><TableRow><TableHead>Roof system</TableHead><TableHead>Avg sale</TableHead><TableHead>Cost / sq</TableHead><TableHead>Labor / sq</TableHead><TableHead>Material</TableHead><TableHead>Gross margin</TableHead><TableHead>Net margin</TableHead><TableHead>Best crews</TableHead><TableHead>Callback freq</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.roofSystems.map((system) => (
            <TableRow key={system.id}>
              <TableCell className="font-medium text-[#f1ae78]">{system.name}</TableCell>
              <TableCell>{currency(system.averageSalePrice)}</TableCell>
              <TableCell>{currency(system.averageCostPerSquare)}</TableCell>
              <TableCell>{currency(system.averageLaborPerSquare)}</TableCell>
              <TableCell>{currency(system.averageMaterialCost)}</TableCell>
              <TableCell>{percent(system.averageGrossMargin)}</TableCell>
              <TableCell>{percent(system.averageNetMargin)}</TableCell>
              <TableCell>{system.bestCrewIds.map((id) => commandCenterData.crews.find((crew) => crew.id === id)?.name).join(', ')}</TableCell>
              <TableCell>{percent(system.callbackFrequency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function AutomationsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DataPanel title="OpenClaw / Automations" subtitle="Active agents, tasks, failures, approvals, cron-ready placeholders, and human review queue.">
        <Table>
          <TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Status</TableHead><TableHead>Current task</TableHead><TableHead>Last action</TableHead><TableHead>Last heartbeat</TableHead><TableHead>Cost</TableHead></TableRow></TableHeader>
          <TableBody>
            {commandCenterData.agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium text-[#f1ae78]">{agent.name}</TableCell>
                <TableCell><StatusBadge value={agent.status} /></TableCell>
                <TableCell>{agent.currentTask}</TableCell>
                <TableCell>{agent.lastAction}</TableCell>
                <TableCell>{compactDate(agent.lastHeartbeat)}</TableCell>
                <TableCell>{agent.costPlaceholder || 'placeholder'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <DataPanel title="Automation queue" subtitle="Failed automations, pending approvals, drafts, backup status, and integration health placeholder.">
        <div className="space-y-3">
          {commandCenterData.automationRuns.map((run) => (
            <div key={run.id} className="mission-panel-soft rounded-[22px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#f1ae78]">{run.name}</div>
                  <div className="mt-1 text-sm text-slate-300">{run.nextAction}</div>
                </div>
                <StatusBadge value={run.status} />
              </div>
              <div className="mt-2 text-xs text-slate-500">Last run {compactDate(run.lastRunAt)}</div>
            </div>
          ))}
          <div className="mission-panel-soft rounded-[22px] p-4 text-sm text-slate-300">Customer updates drafted: 11 • Estimates/proposals drafted: 4 • CRM sync placeholder: waiting on adapter • Memory backup: nominal • Last system audit: today</div>
        </div>
      </DataPanel>
    </div>
  );
}

function DocumentsPage() {
  return (
    <DataPanel title="Documents / SOP Library" subtitle="Searchable operating brain with CSR, sales, production, supplement, admin, customer, recruiting, and OpenClaw resources.">
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Section</TableHead><TableHead>Type</TableHead><TableHead>Updated</TableHead><TableHead>Owner</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.documentResources.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium text-[#f1ae78]">{doc.title}</TableCell>
              <TableCell>{doc.section}</TableCell>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{compactDate(doc.updatedAt)}</TableCell>
              <TableCell>{doc.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function IntegrationsPage() {
  return (
    <DataPanel title="Integrations / System Health" subtitle="Connected system readiness, sync status, health, errors, and next recommended action.">
      <Table>
        <TableHeader><TableRow><TableHead>Integration</TableHead><TableHead>Status</TableHead><TableHead>Last sync</TableHead><TableHead>Health</TableHead><TableHead>Data available</TableHead><TableHead>Errors</TableHead><TableHead>Next action</TableHead></TableRow></TableHeader>
        <TableBody>
          {commandCenterData.integrationHealth.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-[#f1ae78]">{item.name}</TableCell>
              <TableCell><StatusBadge value={item.status} /></TableCell>
              <TableCell>{compactDate(item.lastSync)}</TableCell>
              <TableCell>{item.health}</TableCell>
              <TableCell>{item.dataAvailable.join(', ') || '—'}</TableCell>
              <TableCell>{item.errors.join(', ') || '—'}</TableCell>
              <TableCell>{item.nextRecommendedAction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataPanel>
  );
}

function renderPage(pageId: PageId, filters: CommandCenterFilters, onAlertSelect: (item: Alert) => void, onOwnerSelect: (item: OwnerActionItem) => void) {
  switch (pageId) {
    case 'executive-overview': return <ExecutiveOverview filters={filters} onAlertSelect={onAlertSelect} onOwnerSelect={onOwnerSelect} />;
    case 'sales-pipeline': return <SalesPipelinePage filters={filters} />;
    case 'production-board': return <ProductionBoardPage filters={filters} />;
    case 'insurance-supplements': return <InsurancePage filters={filters} />;
    case 'finance-cash-flow': return <FinancePage />;
    case 'job-profitability': return <ProfitabilityPage />;
    case 'customer-experience': return <CustomerExperiencePage />;
    case 'csr-admin-center': return <CSRPage />;
    case 'marketing-roi': return <MarketingPage />;
    case 'team-accountability': return <TeamPage />;
    case 'vendors-materials-crews': return <VendorsPage />;
    case 'roof-systems-pricing': return <RoofSystemsPage />;
    case 'openclaw-automations': return <AutomationsPage />;
    case 'documents-sop-library': return <DocumentsPage />;
    case 'integrations-system-health': return <IntegrationsPage />;
    default: return <ExecutiveOverview filters={filters} onAlertSelect={onAlertSelect} onOwnerSelect={onOwnerSelect} />;
  }
}

export default function CommandCenterApp() {
  const params = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CommandCenterFilters>(defaultFilters);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedOwnerItem, setSelectedOwnerItem] = useState<OwnerActionItem | null>(null);
  const pageId = (params.pageId && pageDefs.some((page) => page.id === params.pageId) ? params.pageId : 'executive-overview') as PageId;
  const currentPage = pageDefs.find((page) => page.id === pageId) || pageDefs[0];

  return (
    <div className="mission-shell min-h-screen text-white">
      <div className="mx-auto max-w-[1880px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mission-panel mb-6 rounded-[30px] p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mission-label flex items-center gap-2 text-[11px]"><Gauge className="h-4 w-4 text-[#75b7ff]" /> Roof Doctors / Build Doctors operating cockpit</div>
              <h1 className="mission-heading mt-2 text-4xl font-semibold">COMMAND CENTER</h1>
              <p className="mission-subtext mt-2 max-w-4xl text-sm leading-6">Owner-facing operating system for money, jobs, claims, risk, customer communication, team accountability, and OpenClaw oversight. Built as a UI-preserving extension of the current dashboard theme.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/mission-control" className="mission-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-[#f6bf8f]"><LayoutGrid className="h-4 w-4 text-[#75b7ff]" /> Legacy mission view</Link>
              <Link to="/office-live" className="mission-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-[#f6bf8f]"><CalendarDays className="h-4 w-4 text-[#75b7ff]" /> Office live</Link>
              <div className="mission-button rounded-2xl px-4 py-2 text-sm text-[#cfe6ff]">{currentPage.label}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="mission-panel rounded-[28px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="mission-label text-[11px]">Pages</div>
                  <div className="mt-1 text-lg font-semibold text-[#f1ae78]">Owner navigation</div>
                </div>
                <FolderKanban className="h-5 w-5 text-[#75b7ff]" />
              </div>
              <div className="space-y-2">
                {pageDefs.map((page) => {
                  const Icon = page.icon;
                  const active = page.id === pageId;
                  return (
                    <button
                      key={page.id}
                      onClick={() => navigate(page.id === 'executive-overview' ? '/' : `/command/${page.id}`)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-[18px] px-3 py-3 text-left text-sm transition',
                        active ? 'mission-button text-[#f6bf8f]' : 'border border-white/8 bg-slate-950/40 text-slate-300 hover:border-[#8ec7ff40]'
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0"><Icon className="h-4 w-4 text-[#75b7ff]" /><span className="truncate">{page.label}</span></span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mission-panel rounded-[28px] p-4">
              <SectionHeader title="Immediate read" subtitle="What the owner needs to know right now." />
              <div className="space-y-3 text-sm text-slate-300">
                <div className="mission-panel-soft rounded-[22px] p-4">Money is not the same as sold work. Monroe and Patricia are both proving that cash conversion is the real operating tension.</div>
                <div className="mission-panel-soft rounded-[22px] p-4">Insurance aging is concentrated, not broad. Seidell is the lane that can damage trust and timing if it drifts again.</div>
                <div className="mission-panel-soft rounded-[22px] p-4">Customer risk is communication-driven. Two owner-touch saves matter more than another generic dashboard metric.</div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <FiltersBar filters={filters} setFilters={setFilters} />
            {renderPage(pageId, filters, setSelectedAlert, setSelectedOwnerItem)}
          </main>
        </div>
      </div>

      <Drawer open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DrawerContent className="mission-panel border-[#77aeff33] bg-[#07111fcc] text-white">
          <DrawerHeader>
            <DrawerTitle className="text-[#f1ae78]">{selectedAlert?.title}</DrawerTitle>
            <DrawerDescription className="text-slate-300">{selectedAlert?.description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 text-sm text-slate-300">
            {selectedAlert ? (
              <div className="grid gap-3">
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</div><div className="mt-2"><PriorityBadge value={selectedAlert.priority} /></div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div><div className="mt-2"><StatusBadge value={selectedAlert.status} /></div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Related type</div><div className="mt-2">{selectedAlert.relatedType}</div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Age</div><div className="mt-2">{selectedAlert.ageLabel}</div></div>
              </div>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={!!selectedOwnerItem} onOpenChange={(open) => !open && setSelectedOwnerItem(null)}>
        <DrawerContent className="mission-panel border-[#77aeff33] bg-[#07111fcc] text-white">
          <DrawerHeader>
            <DrawerTitle className="text-[#f1ae78]">{selectedOwnerItem?.title}</DrawerTitle>
            <DrawerDescription className="text-slate-300">{selectedOwnerItem?.reason}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 text-sm text-slate-300 space-y-3">
            {selectedOwnerItem ? (
              <>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</div><div className="mt-2"><PriorityBadge value={selectedOwnerItem.priority} /></div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Due</div><div className="mt-2">{compactDate(selectedOwnerItem.dueAt)}</div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Related entity</div><div className="mt-2">{selectedOwnerItem.relatedEntity}</div></div>
                <div className="mission-panel-soft rounded-[20px] p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Next recommended action</div><div className="mt-2">{selectedOwnerItem.nextRecommendedAction}</div></div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
