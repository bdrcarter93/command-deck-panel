export const ROOFING_WORKFLOW_ID = 'inspection_to_next_step_v1' as const;

export type RoofSystemFamily =
  | 'asphalt_shingle'
  | 'tile'
  | 'spf_foam'
  | 'cedar_shake'
  | 'metal'
  | 'single_ply'
  | 'modified_bitumen'
  | 'built_up'
  | 'other'
  | 'unknown';

export type RoofingPath = 'repair' | 'retail_replacement' | 'insurance_claim' | 'needs_human_review';
export type RoofingStage =
  | 'intake_ready'
  | 'awaiting_assets'
  | 'evidence_structuring'
  | 'path_review'
  | 'awaiting_human_path_decision'
  | 'package_preparation'
  | 'awaiting_approval'
  | 'ready_for_customer_next_step'
  | 'follow_up_active'
  | 'blocked'
  | 'completed';

export type EvidenceStatus = 'missing' | 'partial' | 'sufficient' | 'weak_quality';
export type RecommendationStatus = 'not_started' | 'drafted' | 'high_confidence' | 'needs_human_review' | 'approved' | 'rejected';
export type PackageStatus = 'not_started' | 'drafting' | 'ready' | 'blocked' | 'approved' | 'sent';
export type CommunicationStatus = 'not_started' | 'drafted' | 'approval_needed' | 'ready' | 'sent' | 'customer_replied' | 'follow_up_running' | 'closed';
export type ApprovalStatus = 'not_required' | 'required' | 'pending' | 'approved' | 'rejected';
export type MeasurementsStatus = 'missing' | 'partial' | 'available';
export type HandoffStatus = 'not_ready' | 'ready' | 'sent' | 'accepted';
export type MissingInput = 'photos' | 'measurements' | 'inspection_notes' | 'assigned_owner' | 'pricing_input' | 'customer_response';
export type ApprovalReason = 'pricing_release' | 'claim_language' | 'scope_exception' | 'low_confidence_path' | 'customer_risk' | 'none';
export type BlockedReason =
  | 'missing_photos'
  | 'missing_measurements'
  | 'missing_inspection_notes'
  | 'unclear_damage'
  | 'insufficient_confidence'
  | 'pricing_input_missing'
  | 'approval_pending'
  | 'customer_unreachable'
  | 'owner_unassigned'
  | 'system_integration_failure'
  | 'manual_exception';

export interface RoofSystemRuleProfile {
  family: RoofSystemFamily;
  label: string;
  minConfidenceForAutoPath: number;
  minPhotosForRecommendation: number;
  insuranceCautionLevel: 'low' | 'medium' | 'high';
  repairabilityNotes: string[];
  replacementTriggers: string[];
  mandatoryHumanReviewTriggers: string[];
  customerLanguageConstraints: string[];
}

export interface RoofingCase {
  caseId: string;
  workflowType: typeof ROOFING_WORKFLOW_ID;
  customerName: string;
  propertyAddress: string;
  owner: string;
  nextActionOwner: string;
  nextActionDueAt: string;
  dueLabel: string;
  currentStage: RoofingStage;
  roofSystemFamily: RoofSystemFamily;
  roofTypeConfidence: number | null;
  evidenceStatus: EvidenceStatus;
  recommendationStatus: RecommendationStatus;
  recommendedPath: RoofingPath | null;
  recommendationConfidence: number | null;
  packageStatus: PackageStatus;
  communicationStatus: CommunicationStatus;
  approvalStatus: ApprovalStatus;
  approvalReason: ApprovalReason;
  handoffStatus: HandoffStatus;
  handoffTarget?: string;
  humanReviewRequired: boolean;
  blockedReason?: BlockedReason;
  missingInputs: MissingInput[];
  photoCount: number;
  inspectionNotesPresent: boolean;
  measurementsStatus: MeasurementsStatus;
  findings: string[];
  nextAction: string;
  lastContactHoursAgo: number;
  externalLinks: {
    acculynx?: string;
    companyCam?: string;
    roofSnap?: string;
  };
}

export interface RoofingWorkflowSummary {
  totalCases: number;
  blockedCases: number;
  humanReviewCases: number;
  readyForPackaging: number;
  approvalsWaiting: number;
  missingEvidenceCases: number;
  followUpDue: number;
  readyForHandoff: number;
  pathCounts: Record<RoofingPath, number>;
  stageCounts: Partial<Record<RoofingStage, number>>;
}

export interface RoofingOperationalFlags {
  isBlocked: boolean;
  isApprovalQueue: boolean;
  isMissingEvidence: boolean;
  isFollowUpDue: boolean;
  isReadyForHandoff: boolean;
}

export interface RoofingStageDefinition {
  id: RoofingStage;
  label: string;
  goal: string;
  defaultOwnerRole: RoofingAgentRoleId;
  outputs: string[];
  automation: string[];
  manualBoundary: string;
}

export type RoofingAgentRoleId =
  | 'case_state_agent'
  | 'evidence_agent'
  | 'path_recommendation_agent'
  | 'package_prep_agent'
  | 'follow_up_agent'
  | 'human_approver';

export interface RoofingAgentRole {
  id: RoofingAgentRoleId;
  label: string;
  owns: string[];
  manualBoundary: string;
  dashboardSignal: string;
}

export interface RoofingSourceOfTruthEntry {
  key: string;
  system: string;
  label: string;
  role: 'canonical_internal' | 'external_reference';
  owns: string[];
}

export interface RoofingOwnerSummary {
  owner: string;
  activeCases: number;
  approvalsWaiting: number;
  blockedCases: number;
  followUpDue: number;
  humanReviewCases: number;
}

export interface RoofingStageRollup {
  stage: RoofingStage;
  label: string;
  count: number;
  defaultOwnerRole: RoofingAgentRoleId;
  goal: string;
  manualBoundary: string;
}

export const roofSystemRuleProfiles: Record<RoofSystemFamily, RoofSystemRuleProfile> = {
  asphalt_shingle: {
    family: 'asphalt_shingle',
    label: 'Asphalt shingle',
    minConfidenceForAutoPath: 0.75,
    minPhotosForRecommendation: 12,
    insuranceCautionLevel: 'medium',
    repairabilityNotes: ['Localized lifted or missing shingles can stay repair-first when scope is bounded.', 'Escalate if matching looks poor or brittleness suggests short-lived repair.'],
    replacementTriggers: ['Roof-wide granule loss', 'Patchwork scope across multiple elevations', 'Broad age-related degradation'],
    mandatoryHumanReviewTriggers: ['Mixed storm and age signals', 'Weak photo coverage', 'Customer expectation conflicts with evidence'],
    customerLanguageConstraints: ['Do not imply claim approval.', 'Frame replacement as recommendation, not guarantee.'],
  },
  tile: {
    family: 'tile',
    label: 'Tile',
    minConfidenceForAutoPath: 0.82,
    minPhotosForRecommendation: 16,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Isolated cracked or slipped tiles may still hide underlayment issues.', 'Repair risks increase when walkability and brittleness are concerns.'],
    replacementTriggers: ['Widespread cracked tiles', 'Hidden scope risk under damaged field tiles', 'Material matching is poor or unavailable'],
    mandatoryHumanReviewTriggers: ['Any underlayment uncertainty', 'Fragility concerns', 'Storm causation not clearly visible'],
    customerLanguageConstraints: ['Avoid blanket statements from surface-only photos.', 'Avoid promising simple tile swaps without scope review.'],
  },
  spf_foam: {
    family: 'spf_foam',
    label: 'SPF foam',
    minConfidenceForAutoPath: 0.85,
    minPhotosForRecommendation: 18,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Localized repairs depend on coating condition and system integrity.', 'Escalate if exposed foam, ponding, or edge detail issues are visible.'],
    replacementTriggers: ['Broad coating failure', 'Exposed foam across multiple areas', 'System integrity concerns beyond a single puncture'],
    mandatoryHumanReviewTriggers: ['Limited specialist context', 'Ponding patterns', 'Unclear coating lifecycle'],
    customerLanguageConstraints: ['Keep language neutral unless specialist review confirms path.'],
  },
  cedar_shake: {
    family: 'cedar_shake',
    label: 'Cedar shake',
    minConfidenceForAutoPath: 0.84,
    minPhotosForRecommendation: 14,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Natural aging can mimic actionable damage.', 'Matching and moisture behavior can make repair less durable than it first appears.'],
    replacementTriggers: ['Widespread splitting or curling', 'Decay across multiple roof areas', 'Matching constraints make isolated repair misleading'],
    mandatoryHumanReviewTriggers: ['Natural aging vs storm ambiguity', 'Moisture or decay uncertainty'],
    customerLanguageConstraints: ['Avoid overcalling impact damage from limited imagery.'],
  },
  metal: {
    family: 'metal',
    label: 'Metal',
    minConfidenceForAutoPath: 0.8,
    minPhotosForRecommendation: 14,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Functional damage matters more than cosmetic denting alone.', 'Fastener, seam, and penetration issues often need detail shots.'],
    replacementTriggers: ['Systemic seam or attachment failures', 'Broad panel damage with functional impact'],
    mandatoryHumanReviewTriggers: ['Cosmetic vs functional damage ambiguity', 'Insurer-facing language needed'],
    customerLanguageConstraints: ['Do not equate visible denting with covered loss automatically.'],
  },
  single_ply: {
    family: 'single_ply',
    label: 'Single ply',
    minConfidenceForAutoPath: 0.83,
    minPhotosForRecommendation: 16,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Detail work at seams, drains, and penetrations matters more than broad visual impressions.'],
    replacementTriggers: ['Multiple seam failures', 'Broad membrane deterioration', 'Ponding-related system risk'],
    mandatoryHumanReviewTriggers: ['Sparse detail photos', 'Drain or flashing uncertainty'],
    customerLanguageConstraints: ['Avoid oversimplifying leak origin from one defect photo.'],
  },
  modified_bitumen: {
    family: 'modified_bitumen',
    label: 'Modified bitumen',
    minConfidenceForAutoPath: 0.83,
    minPhotosForRecommendation: 16,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Localized splits can still sit inside broader membrane fatigue.'],
    replacementTriggers: ['Widespread splits or blisters', 'Systemic flashing/detail failures'],
    mandatoryHumanReviewTriggers: ['Ambiguous membrane age', 'Sparse transition detail'],
    customerLanguageConstraints: ['Keep customer wording bounded unless scope is verified.'],
  },
  built_up: {
    family: 'built_up',
    label: 'Built-up',
    minConfidenceForAutoPath: 0.84,
    minPhotosForRecommendation: 16,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Surface symptoms often need contextual detail before path commitment.'],
    replacementTriggers: ['Broad alligatoring or degradation', 'Repeated failure across details and field'],
    mandatoryHumanReviewTriggers: ['Weak context photos', 'Mixed maintenance and storm narratives'],
    customerLanguageConstraints: ['Avoid strong causation language without human review.'],
  },
  other: {
    family: 'other',
    label: 'Other system',
    minConfidenceForAutoPath: 0.88,
    minPhotosForRecommendation: 18,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Unsupported systems should bias toward conservative drafting.'],
    replacementTriggers: ['Broad system concern with no trusted overlay'],
    mandatoryHumanReviewTriggers: ['Any unsupported roof nuance'],
    customerLanguageConstraints: ['Use neutral language until a human reviews the system.'],
  },
  unknown: {
    family: 'unknown',
    label: 'Unknown roof system',
    minConfidenceForAutoPath: 1,
    minPhotosForRecommendation: 999,
    insuranceCautionLevel: 'high',
    repairabilityNotes: ['Do not auto-route beyond human review when the roof system is unknown.'],
    replacementTriggers: ['None, human review required first'],
    mandatoryHumanReviewTriggers: ['Roof system not identified with usable confidence'],
    customerLanguageConstraints: ['Keep messaging neutral and evidence-gathering only.'],
  },
};

export const roofingAgentRoles: RoofingAgentRole[] = [
  {
    id: 'case_state_agent',
    label: 'Case-state agent',
    owns: ['Case creation', 'Stage transitions', 'Owner assignment', 'Blocked-state visibility', 'Next-action tracking'],
    manualBoundary: 'Escalate when no responsible owner exists or the case requires exception handling.',
    dashboardSignal: 'Shows who owns the case, what stage it is in, and exactly why it is stalled.',
  },
  {
    id: 'evidence_agent',
    label: 'Evidence agent',
    owns: ['Photo completeness checks', 'Inspection note ingestion', 'Measurement link checks', 'Finding normalization'],
    manualBoundary: 'Escalate when evidence is contradictory, too thin, or needs visual judgment beyond safe automation.',
    dashboardSignal: 'Surfaces evidence sufficiency, missing inputs, and annotation pressure.',
  },
  {
    id: 'path_recommendation_agent',
    label: 'Path-recommendation agent',
    owns: ['Repair vs retail vs insurance routing', 'Confidence assessment', 'Human-review escalation'],
    manualBoundary: 'Escalate when path confidence is low, roof-system risk is elevated, or the downside is meaningful.',
    dashboardSignal: 'Shows recommendation confidence, rationale, and why a case stayed conservative.',
  },
  {
    id: 'package_prep_agent',
    label: 'Package-prep agent',
    owns: ['Template selection', 'Package readiness evaluation', 'Draft assembly support', 'Missing-input flags'],
    manualBoundary: 'Stop before final pricing, unusual scope judgment, or reputationally risky customer language.',
    dashboardSignal: 'Shows draft readiness and the exact inputs still blocking a customer-ready package.',
  },
  {
    id: 'follow_up_agent',
    label: 'Follow-up agent',
    owns: ['Next-step drafts', 'Reminder cadence', 'Stall detection', 'Status persistence'],
    manualBoundary: 'Do not handle upset customers, promises, or nuanced live selling beyond approved templates.',
    dashboardSignal: 'Highlights aging cases, missed touches, and next communication due dates.',
  },
  {
    id: 'human_approver',
    label: 'Human approver',
    owns: ['High-stakes judgment', 'Pricing approval', 'Exception handling', 'Sensitive customer-risk decisions'],
    manualBoundary: 'This is the boundary. Risky or binding external decisions stay here.',
    dashboardSignal: 'Shows approval queue pressure and cases that cannot advance without a human decision.',
  },
];

export const roofingStageDefinitions: RoofingStageDefinition[] = [
  {
    id: 'intake_ready',
    label: 'Intake ready',
    goal: 'Create a controlled case and attach known ownership plus external references.',
    defaultOwnerRole: 'case_state_agent',
    outputs: ['Case record created', 'Owner assigned', 'Known external refs linked'],
    automation: ['Create case', 'Link external ids', 'Detect missing owner or inputs'],
    manualBoundary: 'A human must assign ownership when there is no reliable responsible owner.',
  },
  {
    id: 'awaiting_assets',
    label: 'Awaiting assets',
    goal: 'Collect enough photos, notes, and measurements to proceed responsibly.',
    defaultOwnerRole: 'evidence_agent',
    outputs: ['Evidence completeness status', 'Missing asset list', 'Source links stored'],
    automation: ['Count photos', 'Detect missing notes or measurements', 'Flag evidence sufficiency'],
    manualBoundary: 'Field or office staff may still need to fix uploads and attach source links.',
  },
  {
    id: 'evidence_structuring',
    label: 'Evidence structuring',
    goal: 'Turn raw inspection inputs into usable findings and evidence quality signals.',
    defaultOwnerRole: 'evidence_agent',
    outputs: ['Structured findings summary', 'Damage or wear observations', 'Evidence quality score'],
    automation: ['Normalize notes', 'Bucket photos by issue', 'Surface contradictory evidence'],
    manualBoundary: 'Human review is required when the evidence is unclear, contradictory, or too thin.',
  },
  {
    id: 'path_review',
    label: 'Path review',
    goal: 'Recommend repair, retail replacement, insurance claim, or human review.',
    defaultOwnerRole: 'path_recommendation_agent',
    outputs: ['Recommended path', 'Rationale', 'Confidence', 'Escalation flag'],
    automation: ['Evaluate path', 'Calculate confidence', 'Trigger escalation rules'],
    manualBoundary: 'Human review is mandatory when confidence is low or roof-system risk is elevated.',
  },
  {
    id: 'awaiting_human_path_decision',
    label: 'Awaiting human path decision',
    goal: 'Pause risky cases in an explicit owned queue instead of forcing a path.',
    defaultOwnerRole: 'human_approver',
    outputs: ['Named reviewer', 'Visible reason for pause', 'Clear decision request'],
    automation: ['Route to reviewer', 'Preserve rationale', 'Keep queue visible'],
    manualBoundary: 'A human must resolve the path before the workflow advances.',
  },
  {
    id: 'package_preparation',
    label: 'Package preparation',
    goal: 'Assemble the right next-step package for the chosen path.',
    defaultOwnerRole: 'package_prep_agent',
    outputs: ['Package readiness', 'Missing-input flags', 'Draft artifacts linked'],
    automation: ['Select template', 'Check measurement sufficiency', 'Build draft support package'],
    manualBoundary: 'Final pricing and unusual scope judgment stay manual.',
  },
  {
    id: 'awaiting_approval',
    label: 'Awaiting approval',
    goal: 'Hold risky communication or pricing until a human clears it.',
    defaultOwnerRole: 'human_approver',
    outputs: ['Approver assigned', 'Approval reason', 'Revision request or approval'],
    automation: ['Queue approval request', 'Track pending status', 'Prevent risky send'],
    manualBoundary: 'No risky customer communication should go out without approval.',
  },
  {
    id: 'ready_for_customer_next_step',
    label: 'Customer next-step ready',
    goal: 'Make the approved next communication and owner explicit.',
    defaultOwnerRole: 'follow_up_agent',
    outputs: ['Draft message or call objective', 'Owner', 'Due date', 'Send status'],
    automation: ['Create communication draft', 'Schedule follow-up', 'Mark send readiness'],
    manualBoundary: 'High-judgment live calls and promises stay manual.',
  },
  {
    id: 'follow_up_active',
    label: 'Follow-up active',
    goal: 'Persist the next-step cadence until the case moves or someone answers.',
    defaultOwnerRole: 'follow_up_agent',
    outputs: ['Current cadence state', 'Last touch visibility', 'Next follow-up due'],
    automation: ['Detect stalled cases', 'Queue reminders', 'Track customer response state'],
    manualBoundary: 'Escalate upset, sensitive, or unusual conversations to a human.',
  },
  {
    id: 'blocked',
    label: 'Blocked',
    goal: 'Expose exactly why the case cannot move and who must unblock it.',
    defaultOwnerRole: 'case_state_agent',
    outputs: ['Blocked reason', 'Unblock action', 'Named owner'],
    automation: ['Carry forward block reason', 'Keep blocked cases visible'],
    manualBoundary: 'Manual resolution is required because the current automation boundary has been reached.',
  },
  {
    id: 'completed',
    label: 'Completed',
    goal: 'Close the workflow with a committed next step and visible outcome.',
    defaultOwnerRole: 'case_state_agent',
    outputs: ['Outcome recorded', 'Final owner state', 'Closed-loop visibility'],
    automation: ['Stamp completion state', 'Preserve case history'],
    manualBoundary: 'No special boundary, but outcome quality still matters.',
  },
];

export const roofingSourceOfTruth: RoofingSourceOfTruthEntry[] = [
  {
    key: 'internal_workflow_case',
    system: 'Command Deck internal workflow layer',
    label: 'Canonical workflow truth',
    role: 'canonical_internal',
    owns: ['Current stage', 'Path decision state', 'Confidence and escalation flags', 'Approvals state', 'Next action', 'Follow-up status', 'Blocked state'],
  },
  {
    key: 'acculynx',
    system: 'AccuLynx',
    label: 'Customer and job references',
    role: 'external_reference',
    owns: ['Customer identity', 'Job or opportunity refs', 'Assigned salesperson where present'],
  },
  {
    key: 'companycam',
    system: 'CompanyCam',
    label: 'Photo and media source',
    role: 'external_reference',
    owns: ['Photo capture', 'Media links', 'Evidence collections'],
  },
  {
    key: 'roofsnap',
    system: 'RoofSnap',
    label: 'Measurement artifacts',
    role: 'external_reference',
    owns: ['Measurements', 'Geometry references', 'Estimate-supporting artifacts'],
  },
  {
    key: 'communications',
    system: 'RingCentral / CallRail / Google tools',
    label: 'Communication execution layer',
    role: 'external_reference',
    owns: ['Call or message execution', 'Scheduling refs', 'Outbound history pointers'],
  },
];

export const roofingStarterCases: RoofingCase[] = [
  {
    caseId: 'roof-001',
    workflowType: ROOFING_WORKFLOW_ID,
    customerName: 'Maya Patel',
    propertyAddress: '7421 E Whitton Ave, Scottsdale, AZ',
    owner: 'Nora Bennett',
    nextActionOwner: 'Nora Bennett',
    nextActionDueAt: '2026-04-15T16:00:00Z',
    dueLabel: 'Due today',
    currentStage: 'awaiting_approval',
    roofSystemFamily: 'asphalt_shingle',
    roofTypeConfidence: 0.92,
    evidenceStatus: 'sufficient',
    recommendationStatus: 'high_confidence',
    recommendedPath: 'repair',
    recommendationConfidence: 0.82,
    packageStatus: 'drafting',
    communicationStatus: 'drafted',
    approvalStatus: 'pending',
    approvalReason: 'pricing_release',
    handoffStatus: 'not_ready',
    handoffTarget: 'Sales coordinator',
    humanReviewRequired: false,
    missingInputs: [],
    photoCount: 18,
    inspectionNotesPresent: true,
    measurementsStatus: 'available',
    findings: ['Two lifted tabs on rear slope', 'No broad roof-wide failure pattern', 'Leak trace appears localized near pipe boot'],
    nextAction: 'Finalize bounded repair scope and send review draft for approval.',
    lastContactHoursAgo: 6,
    externalLinks: { acculynx: 'ALX-20418', companyCam: 'CC-88102', roofSnap: 'RS-33019' },
  },
  {
    caseId: 'roof-002',
    workflowType: ROOFING_WORKFLOW_ID,
    customerName: 'Daniel Kim',
    propertyAddress: '11820 N 53rd St, Paradise Valley, AZ',
    owner: 'Owen Mercer',
    nextActionOwner: 'Senior reviewer',
    nextActionDueAt: '2026-04-15T18:00:00Z',
    dueLabel: 'Needs review',
    currentStage: 'awaiting_human_path_decision',
    roofSystemFamily: 'tile',
    roofTypeConfidence: 0.88,
    evidenceStatus: 'partial',
    recommendationStatus: 'needs_human_review',
    recommendedPath: 'needs_human_review',
    recommendationConfidence: 0.48,
    packageStatus: 'blocked',
    communicationStatus: 'not_started',
    approvalStatus: 'required',
    approvalReason: 'low_confidence_path',
    handoffStatus: 'not_ready',
    handoffTarget: 'Senior reviewer',
    humanReviewRequired: true,
    blockedReason: 'unclear_damage',
    missingInputs: ['measurements'],
    photoCount: 11,
    inspectionNotesPresent: true,
    measurementsStatus: 'partial',
    findings: ['Multiple cracked field tiles on south elevation', 'Underlayment condition not visible', 'Possible storm context but causation not clear'],
    nextAction: 'Human reviewer to confirm tile scope before customer path recommendation.',
    lastContactHoursAgo: 28,
    externalLinks: { acculynx: 'ALX-20452', companyCam: 'CC-88141' },
  },
  {
    caseId: 'roof-003',
    workflowType: ROOFING_WORKFLOW_ID,
    customerName: 'Sierra Vista Commerce Center',
    propertyAddress: '895 W Fry Blvd, Sierra Vista, AZ',
    owner: 'Builder',
    nextActionOwner: 'Proposal desk',
    nextActionDueAt: '2026-04-15T19:00:00Z',
    dueLabel: 'Tomorrow 9 AM',
    currentStage: 'ready_for_customer_next_step',
    roofSystemFamily: 'spf_foam',
    roofTypeConfidence: 0.95,
    evidenceStatus: 'sufficient',
    recommendationStatus: 'approved',
    recommendedPath: 'retail_replacement',
    recommendationConfidence: 0.86,
    packageStatus: 'ready',
    communicationStatus: 'ready',
    approvalStatus: 'approved',
    approvalReason: 'claim_language',
    handoffStatus: 'ready',
    handoffTarget: 'Proposal desk',
    humanReviewRequired: false,
    missingInputs: [],
    photoCount: 24,
    inspectionNotesPresent: true,
    measurementsStatus: 'available',
    findings: ['Coating wear across multiple sections', 'Exposed foam visible in repeated locations', 'Ponding wear suggests broader system decline'],
    nextAction: 'Assemble replacement rationale and proposal package with cautious coating language.',
    lastContactHoursAgo: 3,
    externalLinks: { acculynx: 'ALX-20477', companyCam: 'CC-88193', roofSnap: 'RS-33104' },
  },
  {
    caseId: 'roof-004',
    workflowType: ROOFING_WORKFLOW_ID,
    customerName: 'Elena Morales',
    propertyAddress: '4112 E Palo Verde Dr, Phoenix, AZ',
    owner: 'Nora Bennett',
    nextActionOwner: 'Nora Bennett',
    nextActionDueAt: '2026-04-15T17:30:00Z',
    dueLabel: 'Needs review',
    currentStage: 'follow_up_active',
    roofSystemFamily: 'cedar_shake',
    roofTypeConfidence: 0.9,
    evidenceStatus: 'partial',
    recommendationStatus: 'needs_human_review',
    recommendedPath: 'needs_human_review',
    recommendationConfidence: 0.51,
    packageStatus: 'blocked',
    communicationStatus: 'follow_up_running',
    approvalStatus: 'required',
    approvalReason: 'customer_risk',
    handoffStatus: 'not_ready',
    handoffTarget: 'Senior reviewer',
    humanReviewRequired: true,
    blockedReason: 'insufficient_confidence',
    missingInputs: ['photos', 'customer_response'],
    photoCount: 13,
    inspectionNotesPresent: true,
    measurementsStatus: 'partial',
    findings: ['Fresh broken shakes on north slope', 'Older field shows curling and moisture exposure', 'Mixed storm and aging signals need separation before path call'],
    nextAction: 'Senior reviewer to separate storm-created functional damage from age-related cedar decline before customer recommendation.',
    lastContactHoursAgo: 52,
    externalLinks: { acculynx: 'ALX-20508', companyCam: 'CC-88244' },
  },
];

export function getRoofingOperationalFlags(input: RoofingCase): RoofingOperationalFlags {
  const isBlocked = input.currentStage === 'blocked' || input.packageStatus === 'blocked' || Boolean(input.blockedReason);
  const isApprovalQueue = input.approvalStatus === 'pending' || input.approvalStatus === 'required' || input.currentStage === 'awaiting_approval';
  const isMissingEvidence = input.evidenceStatus !== 'sufficient' || input.missingInputs.some((item) => item === 'photos' || item === 'inspection_notes' || item === 'measurements');
  const isFollowUpDue = input.communicationStatus === 'follow_up_running' || input.lastContactHoursAgo >= 48 || input.missingInputs.includes('customer_response');
  const isReadyForHandoff = input.handoffStatus === 'ready' || (input.packageStatus === 'ready' && input.approvalStatus === 'approved');

  return {
    isBlocked,
    isApprovalQueue,
    isMissingEvidence,
    isFollowUpDue,
    isReadyForHandoff,
  };
}

export function summarizeRoofingCases(cases: RoofingCase[]): RoofingWorkflowSummary {
  return cases.reduce<RoofingWorkflowSummary>((summary, current) => {
    const flags = getRoofingOperationalFlags(current);

    summary.totalCases += 1;
    summary.stageCounts[current.currentStage] = (summary.stageCounts[current.currentStage] ?? 0) + 1;

    if (current.recommendedPath) {
      summary.pathCounts[current.recommendedPath] += 1;
    }

    if (flags.isBlocked) {
      summary.blockedCases += 1;
    }

    if (current.humanReviewRequired || current.recommendationStatus === 'needs_human_review' || current.recommendedPath === 'needs_human_review') {
      summary.humanReviewCases += 1;
    }

    if (current.currentStage === 'package_preparation' || current.packageStatus === 'drafting' || current.packageStatus === 'ready') {
      summary.readyForPackaging += 1;
    }

    if (flags.isApprovalQueue) {
      summary.approvalsWaiting += 1;
    }

    if (flags.isMissingEvidence) {
      summary.missingEvidenceCases += 1;
    }

    if (flags.isFollowUpDue) {
      summary.followUpDue += 1;
    }

    if (flags.isReadyForHandoff) {
      summary.readyForHandoff += 1;
    }

    return summary;
  }, {
    totalCases: 0,
    blockedCases: 0,
    humanReviewCases: 0,
    readyForPackaging: 0,
    approvalsWaiting: 0,
    missingEvidenceCases: 0,
    followUpDue: 0,
    readyForHandoff: 0,
    pathCounts: {
      repair: 0,
      retail_replacement: 0,
      insurance_claim: 0,
      needs_human_review: 0,
    },
    stageCounts: {},
  });
}

export function getApprovalLabel(input: RoofingCase): string {
  if (input.approvalStatus === 'approved') return 'Approved';
  if (input.approvalStatus === 'rejected') return 'Rejected';
  if (input.approvalStatus === 'not_required') return 'No approval needed';

  const reasonLabels: Record<Exclude<ApprovalReason, 'none'>, string> = {
    pricing_release: 'Pricing release review',
    claim_language: 'Claim-language review',
    scope_exception: 'Scope exception review',
    low_confidence_path: 'Low-confidence path review',
    customer_risk: 'Customer-risk review',
  };

  return input.approvalReason === 'none' ? 'Approval pending' : reasonLabels[input.approvalReason as Exclude<ApprovalReason, 'none'>];
}

export function getHandoffLabel(input: RoofingCase): string {
  if (input.handoffStatus === 'accepted') return `Accepted by ${input.handoffTarget ?? 'next owner'}`;
  if (input.handoffStatus === 'sent') return `Sent to ${input.handoffTarget ?? 'next owner'}`;
  if (input.handoffStatus === 'ready') return `Ready for ${input.handoffTarget ?? 'handoff'}`;
  return 'Not handoff-ready';
}

export function getWorkflowQueueLabel(input: RoofingCase): string {
  const flags = getRoofingOperationalFlags(input);

  if (flags.isApprovalQueue) return 'Approval queue';
  if (flags.isMissingEvidence) return 'Evidence gap';
  if (flags.isReadyForHandoff) return 'Handoff ready';
  if (flags.isFollowUpDue) return 'Follow-up due';

  return 'In active flow';
}

export function getRoofingReviewReason(input: RoofingCase): string {
  const profile = roofSystemRuleProfiles[input.roofSystemFamily];

  if (input.roofSystemFamily === 'unknown' || (input.roofTypeConfidence ?? 0) < 0.7) {
    return 'Roof system is unknown or low-confidence, so the case should stay in human review.';
  }

  if (input.missingInputs.length > 0) {
    return `The case is missing ${input.missingInputs.join(', ').replaceAll('_', ' ')}, so it should not advance as if the package is complete.`;
  }

  if (input.photoCount < profile.minPhotosForRecommendation || !input.inspectionNotesPresent || input.evidenceStatus !== 'sufficient') {
    return 'Evidence does not yet meet the profile threshold for a confident path recommendation.';
  }

  if (input.humanReviewRequired || input.recommendedPath === 'needs_human_review') {
    return `${profile.label} requires human review here because the evidence or path confidence is not strong enough to commit safely.`;
  }

  if (input.recommendedPath === 'insurance_claim') {
    return `${profile.label} cases with claim-oriented routing require cautious wording and approval review.`;
  }

  return `${profile.label} profile supports the current path when evidence stays within approved bounds.`;
}

export function summarizeRoofingOwners(cases: RoofingCase[]): RoofingOwnerSummary[] {
  const ownerMap = new Map<string, RoofingOwnerSummary>();

  for (const roofingCase of cases) {
    const flags = getRoofingOperationalFlags(roofingCase);
    const current = ownerMap.get(roofingCase.nextActionOwner) ?? {
      owner: roofingCase.nextActionOwner,
      activeCases: 0,
      approvalsWaiting: 0,
      blockedCases: 0,
      followUpDue: 0,
      humanReviewCases: 0,
    };

    current.activeCases += 1;
    if (flags.isApprovalQueue) current.approvalsWaiting += 1;
    if (flags.isBlocked) current.blockedCases += 1;
    if (flags.isFollowUpDue) current.followUpDue += 1;
    if (roofingCase.humanReviewRequired || roofingCase.recommendedPath === 'needs_human_review') current.humanReviewCases += 1;

    ownerMap.set(roofingCase.nextActionOwner, current);
  }

  return [...ownerMap.values()].sort((left, right) => {
    if (right.approvalsWaiting !== left.approvalsWaiting) return right.approvalsWaiting - left.approvalsWaiting;
    if (right.blockedCases !== left.blockedCases) return right.blockedCases - left.blockedCases;
    return right.activeCases - left.activeCases;
  });
}

export function getRoofingStageRollup(cases: RoofingCase[]): RoofingStageRollup[] {
  const counts = cases.reduce<Partial<Record<RoofingStage, number>>>((accumulator, roofingCase) => {
    accumulator[roofingCase.currentStage] = (accumulator[roofingCase.currentStage] ?? 0) + 1;
    return accumulator;
  }, {});

  return roofingStageDefinitions.map((stage) => ({
    stage: stage.id,
    label: stage.label,
    count: counts[stage.id] ?? 0,
    defaultOwnerRole: stage.defaultOwnerRole,
    goal: stage.goal,
    manualBoundary: stage.manualBoundary,
  }));
}

export function getApprovalQueueCases(cases: RoofingCase[]): RoofingCase[] {
  return [...cases]
    .filter((roofingCase) => getRoofingOperationalFlags(roofingCase).isApprovalQueue)
    .sort((left, right) => {
      if (left.approvalStatus === 'pending' && right.approvalStatus !== 'pending') return -1;
      if (right.approvalStatus === 'pending' && left.approvalStatus !== 'pending') return 1;
      return right.lastContactHoursAgo - left.lastContactHoursAgo;
    });
}
