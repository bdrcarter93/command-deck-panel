import { describe, expect, it } from 'vitest';
import { getRoofingReviewReason, roofingStarterCases, summarizeRoofingCases } from './roofingWorkflow';

describe('roofing workflow profiles', () => {
  it('tracks the added cedar-shake review case in summary counts', () => {
    const summary = summarizeRoofingCases(roofingStarterCases);

    expect(summary.totalCases).toBe(4);
    expect(summary.humanReviewCases).toBe(2);
    expect(summary.blockedCases).toBe(2);
    expect(summary.pathCounts.needs_human_review).toBe(2);
  });

  it('keeps cedar shake mixed-causation cases in human review', () => {
    const cedarCase = roofingStarterCases.find((item) => item.roofSystemFamily === 'cedar_shake');

    expect(cedarCase).toBeDefined();
    expect(getRoofingReviewReason(cedarCase!)).toContain('missing photos');
  });
});
