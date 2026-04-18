import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  assessRoofingCase,
  getRecommendedPathLabel,
  getRoofSystemProfile,
  roofSystemProfiles,
  sampleRoofingCases,
  type RecommendationStatus,
} from '@/lib/roofingWorkflow';

const statusTone: Record<RecommendationStatus, string> = {
  clear: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
  guarded: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
  conflicted: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
  blocked: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
};

const pathTone: Record<string, string> = {
  repair: 'text-emerald-200',
  retail_replacement: 'text-violet-200',
  insurance_claim: 'text-cyan-200',
  needs_human_review: 'text-amber-200',
};

const RoofingWorkflowPanel = () => {
  const [selectedCaseId, setSelectedCaseId] = useState(sampleRoofingCases[0]?.id ?? '');

  const selectedCase = useMemo(
    () => sampleRoofingCases.find((item) => item.id === selectedCaseId) ?? sampleRoofingCases[0],
    [selectedCaseId],
  );

  const assessment = selectedCase ? assessRoofingCase(selectedCase) : null;
  const profile = selectedCase ? getRoofSystemProfile(selectedCase.roofSystem) : null;

  if (!selectedCase || !assessment || !profile) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Roof-system routing rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {roofSystemProfiles.map((item) => {
              const active = item.id === selectedCase.roofSystem;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCaseId(sampleRoofingCases.find((sample) => sample.roofSystem === item.id)?.id ?? selectedCase.id)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition',
                    active ? 'border-cyan-400/25 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                  )}
                >
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.cautions[0]}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.watchFor.slice(0, 2).map((signal) => (
                      <Badge key={signal} className="border-white/10 bg-white/5 text-slate-200">{signal}</Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Why one matrix is not enough</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <SignalGroup title="Wear pattern" items={profile.watchFor} icon={ClipboardList} />
            <SignalGroup title="Storm signature" items={profile.stormSignals} icon={ShieldAlert} />
            <SignalGroup title="Repairability" items={profile.repairSignals} icon={CheckCircle2} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Scenario pack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleRoofingCases.map((item) => {
              const itemAssessment = assessRoofingCase(item);
              const active = item.id === selectedCase.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCaseId(item.id)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition',
                    active ? 'border-cyan-400/25 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/10 bg-white/5 text-slate-200">{getRoofSystemProfile(item.roofSystem).label}</Badge>
                    <Badge className={cn('capitalize', statusTone[itemAssessment.recommendationStatus])}>{itemAssessment.recommendationStatus}</Badge>
                  </div>
                  <div className="mt-3 font-medium text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Recommended:</span>
                    <span className={cn('font-medium', pathTone[itemAssessment.recommendedPath])}>{getRecommendedPathLabel(itemAssessment.recommendedPath)}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-white">Decision output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/5 text-slate-200">{profile.emoji} {profile.label}</Badge>
              <Badge className={cn('capitalize', statusTone[assessment.recommendationStatus])}>{assessment.recommendationStatus}</Badge>
            </div>

            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-slate-500">Recommended path</div>
              <div className={cn('mt-2 text-3xl font-semibold', pathTone[assessment.recommendedPath])}>{getRecommendedPathLabel(assessment.recommendedPath)}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCase.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetaTile label="Damage scope" value={selectedCase.damageScope} />
              <MetaTile label="Storm evidence" value={selectedCase.stormEvidence} />
              <MetaTile label="Wear severity" value={selectedCase.wearSeverity} />
              <MetaTile label="Repairability" value={selectedCase.repairability} />
            </div>

            {assessment.blockedReason && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Escalation note</div>
                <p className="mt-2 leading-6">{assessment.blockedReason}</p>
              </div>
            )}

            <DecisionList title="Why this path" items={assessment.rationale} />
            <DecisionList title="Next actions" items={assessment.nextActions} />
            <DecisionList title="System cautions" items={profile.cautions} />
            <DecisionList title="Replacement tells" items={profile.replacementSignals} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function SignalGroup({ title, items, icon: Icon }: { title: string; items: string[]; icon: any }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white"><Icon className="h-4 w-4 text-cyan-300" /> {title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm text-slate-300">• {item}</div>
        ))}
      </div>
    </div>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-base font-medium capitalize text-white">{value.replaceAll('_', ' ')}</div>
    </div>
  );
}

function DecisionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-slate-300">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoofingWorkflowPanel;
