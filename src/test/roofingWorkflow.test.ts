import { describe, expect, it } from 'vitest';
import {
  getApprovalLabel,
  getApprovalQueueCases,
  getHandoffLabel,
  getRoofingOperationalFlags,
  getRoofingReviewReason,
  getRoofingStageRollup,
  getWorkflowQueueLabel,
  roofSystemRuleProfiles,
  roofingStarterCases,
  summarizeRoofingCases,
  summarizeRoofingOwners,
} from '@/features/roofingWorkflow';

describe('roofing workflow pilot data', () => {
  it('summarizes starter cases into useful operator counts', () => {
    const summary = summarizeRoofingCases(roofingStarterCases);

    expect(summary.totalCases).toBe(4);
    expect(summary.pathCounts.repair).toBe(1);
    expect(summary.pathCounts.retail_replacement).toBe(1);
    expect(summary.pathCounts.needs_human_review).toBe(2);
    expect(summary.humanReviewCases).toBe(2);
    expect(summary.readyForPackaging).toBe(2);
    expect(summary.approvalsWaiting).toBe(3);
    expect(summary.missingEvidenceCases).toBe(2);
    expect(summary.followUpDue).toBe(1);
    expect(summary.readyForHandoff).toBe(1);
  });

  it('forces conservative reasoning when roof system confidence is weak', () => {
    const lowConfidenceCase = {
      ...roofingStarterCases[0],
      roofSystemFamily: 'unknown' as const,
      roofTypeConfidence: 0.42,
      recommendedPath: 'repair' as const,
      missingInputs: [],
    };

    expect(getRoofingReviewReason(lowConfidenceCase)).toContain('human review');
    expect(roofSystemRuleProfiles.unknown.minConfidenceForAutoPath).toBe(1);
  });

  it('surfaces queue, approval, and handoff state from operational flags', () => {
    expect(getWorkflowQueueLabel(roofingStarterCases[0])).toBe('Approval queue');
    expect(getApprovalLabel(roofingStarterCases[0])).toBe('Pricing release review');
    expect(getHandoffLabel(roofingStarterCases[2])).toContain('Proposal desk');

    const followUpFlags = getRoofingOperationalFlags(roofingStarterCases[3]);
    expect(followUpFlags.isFollowUpDue).toBe(true);
    expect(followUpFlags.isMissingEvidence).toBe(true);
  });

  it('rolls up stages, owners, and approval queues into operator primitives', () => {
    const stageRollup = getRoofingStageRollup(roofingStarterCases);
    const ownerSummary = summarizeRoofingOwners(roofingStarterCases);
    const approvalQueue = getApprovalQueueCases(roofingStarterCases);

    expect(stageRollup.find((stage) => stage.stage === 'awaiting_approval')?.count).toBe(1);
    expect(stageRollup.find((stage) => stage.stage === 'follow_up_active')?.count).toBe(1);

    expect(ownerSummary.find((owner) => owner.owner === 'Senior reviewer')).toMatchObject({
      activeCases: 1,
      approvalsWaiting: 1,
      blockedCases: 1,
      humanReviewCases: 1,
    });

    expect(ownerSummary.find((owner) => owner.owner === 'Nora Bennett')).toMatchObject({
      activeCases: 2,
      followUpDue: 1,
      approvalsWaiting: 2,
    });

    expect(approvalQueue.map((roofingCase) => roofingCase.caseId)).toEqual(['roof-001', 'roof-004', 'roof-002']);
  });
});
