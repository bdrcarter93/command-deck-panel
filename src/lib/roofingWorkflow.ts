export type RoofSystem = 'shingle' | 'tile' | 'spf_foam' | 'cedar_shake';
export type RecommendedPath = 'repair' | 'retail_replacement' | 'insurance_claim' | 'needs_human_review';
export type RecommendationStatus = 'clear' | 'guarded' | 'conflicted' | 'blocked';

export interface RoofSystemProfile {
  id: RoofSystem;
  label: string;
  emoji: string;
  watchFor: string[];
  stormSignals: string[];
  repairSignals: string[];
  replacementSignals: string[];
  cautions: string[];
}

export interface RoofingCaseInput {
  id: string;
  title: string;
  roofSystem: RoofSystem;
  summary: string;
  ageYears?: number;
  wearSeverity: 'low' | 'moderate' | 'high';
  damageScope: 'isolated' | 'slope' | 'multi-slope' | 'systemic';
  stormEvidence: 'none' | 'possible' | 'confirmed';
  repairability: 'high' | 'moderate' | 'low';
  leakActive: boolean;
  brittleOrUnsafeToService?: boolean;
  discontinuedMaterials?: boolean;
  moistureIntrusion?: boolean;
  notes: string[];
}

export interface RoofingAssessment {
  recommendedPath: RecommendedPath;
  recommendationStatus: RecommendationStatus;
  blockedReason?: string;
  awaitingHumanPathDecision: boolean;
  rationale: string[];
  nextActions: string[];
}

export const roofSystemProfiles: RoofSystemProfile[] = [
  {
    id: 'shingle',
    label: 'Asphalt shingle',
    emoji: '🏠',
    watchFor: ['granule loss', 'brittle tabs', 'creased or lifted shingles', 'mat exposure'],
    stormSignals: ['hail bruising', 'wind creases', 'directional uplift', 'fresh displaced tabs'],
    repairSignals: ['isolated tab loss', 'single-slope damage', 'repairable matching material'],
    replacementSignals: ['widespread brittleness', 'multi-slope mat loss', 'advanced age with weak seal strip'],
    cautions: ['Do not call age-related granule loss storm damage without impact evidence.', 'Brittle shingles can turn a small repair into a larger failure risk.'],
  },
  {
    id: 'tile',
    label: 'Tile',
    emoji: '🧱',
    watchFor: ['cracked field tiles', 'slipped tiles', 'underlayment fatigue', 'fragile traffic paths'],
    stormSignals: ['fresh impact breaks', 'directional break pattern', 'storm-dated scattered fractures'],
    repairSignals: ['isolated cracked tiles', 'underlayment still serviceable', 'matching inventory available'],
    replacementSignals: ['discontinued tile profile', 'underlayment failure across slopes', 'widespread breakage or fragile field'],
    cautions: ['Tile appearance alone can hide underlayment-driven failure.', 'Matching and walkability can decide whether a repair is realistic.'],
  },
  {
    id: 'spf_foam',
    label: 'SPF foam',
    emoji: '🫧',
    watchFor: ['coating erosion', 'ponding', 'exposed foam', 'soft or wet insulation zones'],
    stormSignals: ['fresh punctures', 'coating rupture from acute event', 'localized impact with clean edges'],
    repairSignals: ['localized coating failure', 'contained puncture', 'dry substrate with sound surrounding foam'],
    replacementSignals: ['systemic UV wear', 'widespread ponding', 'saturated substrate', 'large-area coating exhaustion'],
    cautions: ['SPF often fails by wear and water management, not the same way shingle or tile does.', 'Mixed moisture and coating issues should stay guarded until core condition is known.'],
  },
  {
    id: 'cedar_shake',
    label: 'Cedar shake',
    emoji: '🪵',
    watchFor: ['splitting', 'cupping', 'rot', 'moss or organic loading', 'fastener fatigue'],
    stormSignals: ['fresh snapped shakes', 'directional tear-off', 'clean recent impact breaks'],
    repairSignals: ['localized shake loss', 'limited slope involvement', 'serviceable surrounding field'],
    replacementSignals: ['rot throughout field', 'widespread splitting', 'end-of-life weathering', 'repair mismatch risk'],
    cautions: ['Natural checking is not the same thing as storm-created functional damage.', 'Older cedar often needs a broader replacement conversation once rot is active.'],
  },
];

export const sampleRoofingCases: RoofingCaseInput[] = [
  {
    id: 'case-shingle-claim',
    title: 'Wind-creased shingle slope after monsoon event',
    roofSystem: 'shingle',
    summary: 'Fresh creases and lifted tabs on two elevations after a recent storm, with otherwise serviceable field condition.',
    ageYears: 11,
    wearSeverity: 'moderate',
    damageScope: 'multi-slope',
    stormEvidence: 'confirmed',
    repairability: 'moderate',
    leakActive: false,
    notes: ['Directional uplift visible on tabs', 'Recent event date available from occupant', 'No broad age-only granule washout'],
  },
  {
    id: 'case-tile-repair',
    title: 'Localized broken tile cluster with matching stock',
    roofSystem: 'tile',
    summary: 'A handful of cracked tiles near one valley, matching replacements available, underlayment still dry.',
    ageYears: 16,
    wearSeverity: 'moderate',
    damageScope: 'isolated',
    stormEvidence: 'possible',
    repairability: 'high',
    leakActive: false,
    notes: ['Matching tiles stored onsite', 'Damage limited to one area', 'No evidence of broad underlayment fatigue'],
  },
  {
    id: 'case-spf-replace',
    title: 'SPF roof with ponding and coating exhaustion',
    roofSystem: 'spf_foam',
    summary: 'Multiple ponding zones, UV wear through coating, and wet insulation indications across large sections.',
    ageYears: 18,
    wearSeverity: 'high',
    damageScope: 'systemic',
    stormEvidence: 'none',
    repairability: 'low',
    leakActive: true,
    moistureIntrusion: true,
    notes: ['Exposed foam in several areas', 'Moisture readings elevated', 'Condition reads as systemic wear, not a single event'],
  },
  {
    id: 'case-cedar-review',
    title: 'Older cedar shake with mixed storm and rot signals',
    roofSystem: 'cedar_shake',
    summary: 'Fresh broken shakes exist, but the field also shows rot, cupping, and deferred maintenance.',
    ageYears: 24,
    wearSeverity: 'high',
    damageScope: 'multi-slope',
    stormEvidence: 'possible',
    repairability: 'low',
    leakActive: true,
    brittleOrUnsafeToService: true,
    notes: ['Mixed causation is likely', 'Storm narrative exists but age-related decline is also strong', 'Unsafe servicing risk'],
  },
];

const labelMap: Record<RecommendedPath, string> = {
  repair: 'Repair',
  retail_replacement: 'Retail replacement',
  insurance_claim: 'Insurance claim',
  needs_human_review: 'Needs human review',
};

export function getRoofSystemProfile(roofSystem: RoofSystem) {
  return roofSystemProfiles.find((profile) => profile.id === roofSystem) ?? roofSystemProfiles[0];
}

export function getRecommendedPathLabel(path: RecommendedPath) {
  return labelMap[path];
}

export function assessRoofingCase(input: RoofingCaseInput): RoofingAssessment {
  const rationale: string[] = [];
  const nextActions: string[] = [];

  if (input.brittleOrUnsafeToService) {
    rationale.push('Field conditions are unsafe or too brittle for a confident low-risk path call.');
    nextActions.push('Escalate to senior inspection review before committing to repair or claim posture.');
    return {
      recommendedPath: 'needs_human_review',
      recommendationStatus: 'blocked',
      blockedReason: 'Serviceability and evidence confidence are both compromised.',
      awaitingHumanPathDecision: true,
      rationale,
      nextActions,
    };
  }

  if (input.stormEvidence === 'possible' && input.wearSeverity === 'high') {
    rationale.push('Possible storm indicators are mixed with strong age or wear signals.');
    nextActions.push('Document storm-specific evidence separately from maintenance or end-of-life findings.');
    return {
      recommendedPath: 'needs_human_review',
      recommendationStatus: 'conflicted',
      blockedReason: 'Mixed causation needs a human path decision.',
      awaitingHumanPathDecision: true,
      rationale,
      nextActions,
    };
  }

  if (input.stormEvidence === 'confirmed' && input.damageScope !== 'isolated' && input.repairability !== 'high') {
    rationale.push('Confirmed event-driven damage affects more than a tightly localized area.');
    rationale.push('Repairability is not strong enough to treat this as a simple spot repair.');
    nextActions.push('Package storm evidence, affected elevations, and functional damage photos for claim review.');
    return {
      recommendedPath: 'insurance_claim',
      recommendationStatus: 'clear',
      awaitingHumanPathDecision: false,
      rationale,
      nextActions,
    };
  }

  if (input.damageScope === 'isolated' && input.repairability === 'high' && input.stormEvidence !== 'confirmed') {
    rationale.push('Damage is localized and the system appears serviceable around the affected area.');
    rationale.push('Repair path is supported by high repairability and limited scope.');
    nextActions.push('Scope the repair with matching-material and access assumptions called out.');
    return {
      recommendedPath: 'repair',
      recommendationStatus: 'clear',
      awaitingHumanPathDecision: false,
      rationale,
      nextActions,
    };
  }

  if (input.wearSeverity === 'high' || input.damageScope === 'systemic' || input.moistureIntrusion || input.discontinuedMaterials) {
    rationale.push('The condition reads as broad system decline rather than a clean isolated repair event.');
    if (input.moistureIntrusion) rationale.push('Active or likely moisture intrusion increases replacement urgency.');
    if (input.discontinuedMaterials) rationale.push('Material mismatch risk reduces confidence in durable spot repair.');
    nextActions.push('Prepare replacement scope with roof-system-specific notes on repairability limits and failure mode.');
    return {
      recommendedPath: 'retail_replacement',
      recommendationStatus: input.stormEvidence === 'none' ? 'clear' : 'guarded',
      awaitingHumanPathDecision: false,
      rationale,
      nextActions,
    };
  }

  rationale.push('The case is directionally clear enough to move, but not clean enough for a fully automatic recommendation.');
  nextActions.push('Hold the recommendation as guarded and request a human path review if new evidence appears.');
  return {
    recommendedPath: 'needs_human_review',
    recommendationStatus: 'guarded',
    blockedReason: 'Evidence remains incomplete or thin.',
    awaitingHumanPathDecision: true,
    rationale,
    nextActions,
  };
}
