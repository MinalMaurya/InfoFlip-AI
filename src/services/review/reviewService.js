/**
 * InfoFlip-AI Review Service Orchestrator
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Orchestrates multi-dimensional review checks, human-in-the-loop editing,
 * approval/rejection lifecycle, and Module 6 export preparation.
 */

import { 
  createReviewItem, 
  createReviewResult, 
  createExportHandoffContract, 
  CHECK_STATUSES, 
  APPROVAL_STATUSES 
} from '../../types/review.js';
import { evaluateOutputItem } from './reviewRules.js';
import { validateReviewInput, validateExportPackage } from './reviewValidator.js';
import { regenerateSingleChannel } from '../communication/communicationService.js';

/**
 * Reviews a complete batch of communication outputs from Module 4
 * 
 * @param {object} payload - Module 4 communication result / handoff payload
 * @param {object} options - Execution options
 * @returns {Promise<object>} - Structured Module 5 Review Result Contract
 */
export async function reviewCommunicationOutputs(payload, options = {}) {
  const onProgress = options.onProgress || (() => {});
  const delay = options.delayMs ?? 10;

  onProgress({ step: 1, title: 'Validating incoming contract', detail: 'Verifying Module 4 outputs and trace IDs...' });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const validation = validateReviewInput(payload);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const commContract = payload.communicationResult || payload.communication || payload;
  const commOutputs = commContract.communicationOutputs || commContract.outputs || payload.communicationOutputs || payload.outputs || [];
  const sourceContent = payload.sourceContent || payload.sourceData || payload.source || commContract.sourceContent || {};
  const analysis = payload.analysis || payload.analysisData || commContract.analysis || {};
  const transformationOutputs = payload.transformationOutputs || payload.transformationResult?.outputs || commContract.transformationOutputs || [];
  const config = payload.config || commContract.config || {};

  const sourceId = payload.sourceId || commContract.sourceId || sourceContent.sourceId || 'src-unknown';
  const transformationId = payload.transformationId || commContract.transformationId || 'trans-unknown';
  const analysisId = payload.analysisId || commContract.analysisId || analysis.analysisId || 'ana-unknown';
  const communicationId = payload.communicationId || commContract.communicationId || 'comm-unknown';

  const context = {
    sourceContent,
    analysis,
    transformationOutputs,
    config
  };

  onProgress({ step: 2, title: 'Running 10 review dimensions', detail: `Evaluating ${commOutputs.length} channel assets across quality dimensions...` });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const reviewedOutputs = [];

  for (const item of commOutputs) {
    const evalResult = evaluateOutputItem(item, context);

    reviewedOutputs.push(
      createReviewItem({
        outputId: item.outputId,
        channelId: item.channelId,
        title: item.title,
        content: item.content,
        originalContent: item.content,
        isEdited: Boolean(item.metadata?.isEdited),
        overallStatus: evalResult.overallStatus,
        approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW,
        checks: evalResult.checks,
        summary: evalResult.summary,
        metadata: item.metadata || {},
        sourceTraceability: item.sourceTraceability || [],
        reviewedAt: new Date().toISOString(),
        requiresHumanReview: true
      })
    );
  }

  onProgress({ step: 3, title: 'Review synthesis complete', detail: 'All outputs processed and categorized.' });

  return createReviewResult({
    sourceId,
    transformationId,
    analysisId,
    communicationId,
    reviewedOutputs,
    items: reviewedOutputs,
    config,
    createdAt: new Date().toISOString()
  });
}

/**
 * Revalidates an individual review item after user edit or regeneration
 * 
 * @param {object} reviewItem 
 * @param {object} context 
 * @returns {object} - Updated review item
 */
export function revalidateOutput(reviewItem, context = {}) {
  if (!reviewItem) return null;
  const evalResult = evaluateOutputItem(reviewItem, context);

  return {
    ...reviewItem,
    overallStatus: evalResult.overallStatus,
    checks: evalResult.checks,
    summary: evalResult.summary,
    reviewedAt: new Date().toISOString()
  };
}

/**
 * Helper to recalculate summary for a reviewResult
 */
function recalculateSummary(items) {
  return {
    totalOutputs: items.length,
    passed: items.filter(o => o.overallStatus === CHECK_STATUSES.PASS).length,
    warnings: items.filter(o => o.overallStatus === CHECK_STATUSES.WARNING).length,
    failed: items.filter(o => o.overallStatus === CHECK_STATUSES.FAIL).length,
    needsHumanReview: items.filter(o => o.approvalStatus !== APPROVAL_STATUSES.APPROVED).length,
    approved: items.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED).length,
    approvedOutputs: items.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED).length,
    rejected: items.filter(o => o.approvalStatus === APPROVAL_STATUSES.REJECTED).length
  };
}

/**
 * Records user content editing, preserves the original version, and revalidates
 * Supports both:
 *   editOutput(reviewResult, outputId, newContent, context)
 *   editOutput(reviewItem, newContent, context)
 */
export function editOutput(target, arg2, arg3, arg4) {
  if (!target) return null;

  // Case A: target is reviewResult
  if (Array.isArray(target.reviewedOutputs) || Array.isArray(target.items)) {
    const outputId = arg2;
    const newContent = arg3;
    const context = arg4 || {};
    const items = [...(target.reviewedOutputs || target.items)];

    const idx = items.findIndex(i => i.outputId === outputId);
    if (idx >= 0) {
      items[idx] = editSingleItem(items[idx], newContent, context);
    }

    return {
      ...target,
      reviewedOutputs: items,
      items,
      summary: recalculateSummary(items)
    };
  }

  // Case B: target is a single reviewItem
  return editSingleItem(target, arg2, arg3);
}

function editSingleItem(reviewItem, newContent, context = {}) {
  const updatedContent = typeof newContent === 'string' ? newContent : '';
  const original = reviewItem.originalContent || reviewItem.content;

  const preItem = {
    ...reviewItem,
    content: updatedContent,
    editedContent: updatedContent,
    originalContent: original,
    isEdited: true,
    editedAt: new Date().toISOString(),
    approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW,
    metadata: {
      ...reviewItem.metadata,
      characterCount: updatedContent.length,
      wordCount: updatedContent.split(/\s+/).filter(Boolean).length,
      isEdited: true
    }
  };

  return revalidateOutput(preItem, context);
}

/**
 * Approves a reviewed output for downstream Module 6 export
 * Supports both:
 *   approveOutput(reviewResult, outputId, notes)
 *   approveOutput(reviewItem, notes)
 */
export function approveOutput(target, arg2, arg3) {
  if (!target) return null;

  // Case A: target is reviewResult
  if (Array.isArray(target.reviewedOutputs) || Array.isArray(target.items)) {
    const outputId = arg2;
    const notes = typeof arg3 === 'string' ? arg3 : (arg3?.notes || arg3?.reviewerNotes || '');
    const items = [...(target.reviewedOutputs || target.items)];

    const idx = items.findIndex(i => i.outputId === outputId);
    if (idx >= 0) {
      items[idx] = approveSingleItem(items[idx], notes);
    }

    return {
      ...target,
      reviewedOutputs: items,
      items,
      summary: recalculateSummary(items)
    };
  }

  // Case B: target is reviewItem
  return approveSingleItem(target, arg2);
}

function approveSingleItem(reviewItem, notes = '') {
  const noteStr = typeof notes === 'string' ? notes : (notes?.notes || notes?.reviewerNotes || '');
  return {
    ...reviewItem,
    approvalStatus: APPROVAL_STATUSES.APPROVED,
    requiresHumanReview: false,
    reviewerNotes: noteStr || reviewItem.reviewerNotes || '',
    reviewedAt: new Date().toISOString(),
    approvalInfo: {
      approvedBy: 'Human Reviewer',
      approvedAt: new Date().toISOString(),
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      hasHumanOverride: reviewItem.overallStatus !== CHECK_STATUSES.PASS
    }
  };
}

/**
 * Rejects a reviewed output requiring revision
 * Supports both:
 *   rejectOutput(reviewResult, outputId, reason)
 *   rejectOutput(reviewItem, reason)
 */
export function rejectOutput(target, arg2, arg3) {
  if (!target) return null;

  // Case A: target is reviewResult
  if (Array.isArray(target.reviewedOutputs) || Array.isArray(target.items)) {
    const outputId = arg2;
    const reason = typeof arg3 === 'string' ? arg3 : (arg3?.reason || 'Quality standards not met');
    const items = [...(target.reviewedOutputs || target.items)];

    const idx = items.findIndex(i => i.outputId === outputId);
    if (idx >= 0) {
      items[idx] = rejectSingleItem(items[idx], reason);
    }

    return {
      ...target,
      reviewedOutputs: items,
      items,
      summary: recalculateSummary(items)
    };
  }

  // Case B: target is reviewItem
  return rejectSingleItem(target, arg2);
}

function rejectSingleItem(reviewItem, reason = 'Quality standards not met') {
  const reasonStr = typeof reason === 'string' ? reason : (reason?.reason || 'Quality standards not met');
  return {
    ...reviewItem,
    approvalStatus: APPROVAL_STATUSES.REJECTED,
    requiresHumanReview: true,
    reviewerNotes: reasonStr,
    reviewedAt: new Date().toISOString(),
    approvalInfo: {
      ...reviewItem.approvalInfo,
      rejectedBy: 'Human Reviewer',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reasonStr
    }
  };
}

/**
 * Regenerates an individual output and re-reviews
 */
export function regenerateOutputReview(target, arg2, arg3) {
  if (!target) return null;

  // Case A: target is reviewResult
  if (Array.isArray(target.reviewedOutputs) || Array.isArray(target.items)) {
    const outputId = arg2;
    const context = arg3 || {};
    const items = [...(target.reviewedOutputs || target.items)];

    const idx = items.findIndex(i => i.outputId === outputId);
    if (idx >= 0) {
      const current = items[idx];
      const rechecked = revalidateOutput({
        ...current,
        approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW,
        requiresHumanReview: true
      }, context);
      items[idx] = rechecked;
    }

    return {
      ...target,
      reviewedOutputs: items,
      items,
      summary: recalculateSummary(items)
    };
  }

  // Case B: single item
  return revalidateOutput({
    ...target,
    approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW,
    requiresHumanReview: true
  }, arg2);
}

/**
 * Creates the validated Module 6 Export Package
 * Only outputs with approvalStatus === 'APPROVED' are included in approvedOutputs.
 * 
 * @param {object} reviewResult 
 * @returns {object} - Module 6 Export Package Contract
 */
export function prepareModule6ExportPackage(reviewResult) {
  if (!reviewResult) {
    throw new Error('Review result is missing.');
  }

  const reviewedOutputs = reviewResult.reviewedOutputs || reviewResult.items || [];
  const approvedOutputs = reviewedOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED);

  if (approvedOutputs.length === 0) {
    throw new Error('No approved outputs available for export. At least one output must be approved.');
  }

  const pkg = createExportHandoffContract({
    sourceId: reviewResult.sourceId,
    analysisId: reviewResult.analysisId,
    transformationId: reviewResult.transformationId,
    communicationId: reviewResult.communicationId,
    reviewedOutputs,
    approvedOutputs,
    reviewSummary: reviewResult.summary || {},
    config: reviewResult.config || {},
    createdAt: new Date().toISOString()
  });

  const check = validateExportPackage(pkg);
  if (!check.isValid) {
    throw new Error(check.error);
  }

  return pkg;
}
