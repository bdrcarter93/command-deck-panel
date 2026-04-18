import { AlertTriangle, ArrowRight, ClipboardList, PackageCheck, Send, ShieldAlert, ShieldCheck, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getApprovalLabel,
  getApprovalQueueCases,
  getHandoffLabel,
  getRoofingOperationalFlags,
  getRoofingReviewReason,
  getRoofingStageRollup,
  getWorkflowQueueLabel,
  roofSystemRuleProfiles,
  roofingAgentRoles,
  roofingSourceOfTruth,
  roofingStarterCases,
  summarizeRoofingCases,
  summarizeRoofingOwners,
} from '@/features/roofingWorkflow';

const summary = summarizeRoofingCases(roofingStarterCases);
const ownerSummary = summarizeRoofingOwners(roofingStarterCases);
const stageRollup = getRoofingStageRollup(roofingStarterCases);
const approvalQueue = getApprovalQueueCases(roofingStarterCases);

const pathLabels = {
  repair: 'Repair',
  retail_replacement: 'Retail replacement',
  insurance_claim: 'Insurance claim',
  needs_human_review: 'Human review',
};

export default function RoofingWorkflowPilot() {
  return (
    <Card className="border-cyan-400/15 bg-slate-950/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Roofing pilot</div>
          <CardTitle className="mt-2 text-white">Roof-system-aware inspection routing</CardTitle>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            First implementation slice for <span className="font-medium text-white">inspection_to_next_step_v1</span>. The system now tracks more than a route. It also exposes approval load, evidence gaps, follow-up pressure, and handoff readiness so cases stop living in fuzzy states.
          </p>
        </div>
        <div className="grid min-w-[260px] gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Cases" value={summary.totalCases} icon={ClipboardList} />
          <Metric label="Human review" value={summary.humanReviewCases} icon={AlertTriangle} />
          <Metric label="Approval queue" value={summary.approvalsWaiting} icon={ShieldCheck} />
          <Metric label="Evidence gaps" value={summary.missingEvidenceCases} icon={ShieldAlert} />
          <Metric label="Follow-up due" value={summary.followUpDue} icon={Send} />
          <Metric label="Handoff ready" value={summary.readyForHandoff} icon={PackageCheck} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-4">
          {Object.entries(summary.pathCounts).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{pathLabels[key as keyof typeof pathLabels]}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">Case-state primitives now visible</div>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    This slice translates the blueprint into explicit stage ownership, approval queues, and manual boundaries instead of a vague status board.
                  </p>
                </div>
                <Badge className="border-cyan-400/15 bg-cyan-500/10 text-cyan-100">{stageRollup.filter((stage) => stage.count > 0).length} active stages</Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {stageRollup.filter((stage) => stage.count > 0).map((stage) => (
                  <div key={stage.stage} className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-white">{stage.label}</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="border-white/10 bg-white/5 text-slate-200">{stage.count} case{stage.count === 1 ? '' : 's'}</Badge>
                        <Badge className="border-white/10 bg-white/5 text-slate-200">Owner role: {formatRoleLabel(stage.defaultOwnerRole)}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{stage.goal}</div>
                    <div className="mt-2 text-xs text-amber-100">Manual boundary: {stage.manualBoundary}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Operational queues</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <QueueTile label="Approvals waiting" value={summary.approvalsWaiting} detail="Cases that should not message customers or release scope without a decision." />
                <QueueTile label="Evidence gaps" value={summary.missingEvidenceCases} detail="Cases missing assets or still too thin to route confidently." />
                <QueueTile label="Follow-up due" value={summary.followUpDue} detail="Cases at risk of stalling because the last touch is old or the customer has not responded." />
                <QueueTile label="Handoff ready" value={summary.readyForHandoff} detail="Cases that can move to the next owner without more hidden work." />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Owner lanes and approval load</div>
              <div className="mt-3 grid gap-3">
                {ownerSummary.map((owner) => (
                  <div key={owner.owner} className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-white">{owner.owner}</div>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">{owner.activeCases} active</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      <MiniCount label="Approvals" value={owner.approvalsWaiting} tone="amber" />
                      <MiniCount label="Blocked" value={owner.blockedCases} tone="rose" />
                      <MiniCount label="Follow-up due" value={owner.followUpDue} tone="cyan" />
                      <MiniCount label="Human review" value={owner.humanReviewCases} tone="white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Profile guardrails</div>
              <div className="mt-3 space-y-3">
                {(['asphalt_shingle', 'tile', 'spf_foam', 'cedar_shake'] as const).map((key) => {
                  const profile = roofSystemRuleProfiles[key];
                  return (
                    <div key={profile.family} className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-white">{profile.label}</div>
                        <Badge className="border-white/10 bg-white/5 text-slate-200">{Math.round(profile.minConfidenceForAutoPath * 100)}% auto-path confidence</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{profile.repairabilityNotes[0]}</p>
                      <div className="mt-2 text-xs text-slate-400">Human review triggers: {profile.mandatoryHumanReviewTriggers[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Agent roles and manual boundaries</div>
              <div className="mt-3 space-y-3">
                {roofingAgentRoles.map((role) => (
                  <div key={role.id} className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-white">{role.label}</div>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">{role.owns.length} owned surfaces</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{role.dashboardSignal}</div>
                    <div className="mt-2 text-xs text-amber-100">Boundary: {role.manualBoundary}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Why the route changes by roof type</div>
              <div className="mt-3 grid gap-3">
                <RuleLens
                  title="Wear patterns"
                  icon={ClipboardList}
                  items={[
                    'Shingle: granule loss and brittleness can read as age, not storm.',
                    'Tile: visible breaks may still hide underlayment-driven scope.',
                    'SPF: coating erosion and ponding often point to system wear.',
                    'Cedar: splitting, cupping, and rot can outweigh any single fresh break.',
                  ]}
                />
                <RuleLens
                  title="Storm signatures"
                  icon={ShieldAlert}
                  items={[
                    'Shingle routes faster to claim review when creases or uplift are clean and recent.',
                    'Tile and cedar stay more guarded because causation is easier to overcall from surface photos.',
                    'SPF needs acute puncture or rupture evidence before claim-oriented language is safe.',
                  ]}
                />
                <RuleLens
                  title="Repairability"
                  icon={Wrench}
                  items={[
                    'Repair-first works when scope is bounded and materials or access are realistic.',
                    'Discontinued tile, exposed SPF foam, or aging cedar can make a small repair misleading.',
                    'If evidence is mixed, the workflow should pause at human review instead of forcing a path.',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">Approval gate and source-of-truth split</div>
              <div className="mt-3 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">Approval queue</div>
                    <Badge className="border-amber-400/20 bg-amber-500/10 text-amber-100">{approvalQueue.length} waiting</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {approvalQueue.map((roofingCase) => (
                      <div key={roofingCase.caseId} className="rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-300">
                        <div className="flex items-center justify-between gap-2 text-white">
                          <span>{roofingCase.customerName}</span>
                          <span className="text-xs text-slate-400">{getApprovalLabel(roofingCase)}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">Owner: {roofingCase.nextActionOwner} • {roofingCase.nextAction}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
                  <div className="font-medium text-white">Source-of-truth split</div>
                  <div className="mt-3 space-y-2">
                    {roofingSourceOfTruth.map((source) => (
                      <div key={source.key} className="rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-white">{source.label}</div>
                          <Badge className="border-white/10 bg-white/5 text-slate-200">{source.role === 'canonical_internal' ? 'Internal canonical' : 'External reference'}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">{source.system}</div>
                        <div className="mt-2 text-xs text-slate-300">Owns: {source.owns.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {roofingStarterCases.map((roofingCase) => {
              const flags = getRoofingOperationalFlags(roofingCase);
              return (
                <div key={roofingCase.caseId} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-white">{roofingCase.customerName}</div>
                        <Badge className="border-cyan-400/15 bg-cyan-500/10 text-cyan-100">{roofSystemRuleProfiles[roofingCase.roofSystemFamily].label}</Badge>
                        <Badge className="border-white/10 bg-white/5 text-slate-200">{roofingCase.currentStage}</Badge>
                        <Badge className="border-white/10 bg-white/5 text-slate-200">{getWorkflowQueueLabel(roofingCase)}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-slate-400">{roofingCase.propertyAddress}</div>
                    </div>
                    <div className="text-sm text-slate-300">Owner: {roofingCase.owner}</div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                    <InfoPill label="Recommended path" value={roofingCase.recommendedPath ? pathLabels[roofingCase.recommendedPath] : 'TBD'} />
                    <InfoPill label="Evidence" value={`${roofingCase.evidenceStatus} · ${roofingCase.photoCount} photos`} />
                    <InfoPill label="Approval" value={getApprovalLabel(roofingCase)} />
                    <InfoPill label="Handoff" value={getHandoffLabel(roofingCase)} />
                  </div>

                  <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    {getRoofingReviewReason(roofingCase)}
                  </div>

                  {roofingCase.missingInputs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                      {roofingCase.missingInputs.map((item) => (
                        <Badge key={item} className="border-rose-400/20 bg-rose-500/10 text-rose-100">Missing {item.replaceAll('_', ' ')}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-300">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                    <span>{roofingCase.nextAction}</span>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <InlineStat label="Next owner" value={roofingCase.nextActionOwner} />
                    <InlineStat label="Due" value={roofingCase.dueLabel} />
                    <InlineStat label="Last contact" value={`${roofingCase.lastContactHoursAgo}h ago`} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    {flags.isApprovalQueue && <Badge className="border-amber-400/20 bg-amber-500/10 text-amber-100">Needs approval attention</Badge>}
                    {flags.isMissingEvidence && <Badge className="border-rose-400/20 bg-rose-500/10 text-rose-100">Evidence incomplete</Badge>}
                    {flags.isFollowUpDue && <Badge className="border-cyan-400/20 bg-cyan-500/10 text-cyan-100">Follow-up due</Badge>}
                    {flags.isReadyForHandoff && <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-100">Ready for handoff</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ClipboardList }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><Icon className="h-4 w-4 text-cyan-300" /> {label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function QueueTile({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-white">{value}</div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-white">{value}</div>
    </div>
  );
}

function MiniCount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'rose' | 'cyan' | 'white';
}) {
  const toneMap = {
    amber: 'border-amber-400/15 bg-amber-500/10 text-amber-100',
    rose: 'border-rose-400/15 bg-rose-500/10 text-rose-100',
    cyan: 'border-cyan-400/15 bg-cyan-500/10 text-cyan-100',
    white: 'border-white/10 bg-white/5 text-slate-100',
  } as const;

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneMap[tone]}`}>
      <div className="text-[11px] uppercase tracking-[0.18em]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function formatRoleLabel(roleId: string) {
  return roleId
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function RuleLens({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white"><Icon className="h-4 w-4 text-cyan-300" /> {title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm leading-6 text-slate-300">• {item}</div>
        ))}
      </div>
    </div>
  );
}
