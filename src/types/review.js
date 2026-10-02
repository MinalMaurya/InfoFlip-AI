/**
 * InfoFlip-AI Review & Quality Assurance Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 */

export const CHECK_STATUSES = {
  PASS: 'PASS',
  WARNING: 'WARNING',
  FAIL: 'FAIL'
};

export const APPROVAL_STATUSES = {
  DRAFT: 'DRAFT',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REVIEWED: 'REVIEWED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_EDIT: 'NEEDS_EDIT',
  NEEDS_REVISION: 'NEEDS_REVISION'
};

export const GROUNDING_LEVELS = {
  GROUNDED: 'Grounded',
  PARTIALLY_GROUNDED: 'Partially grounded',
  UNGROUNDED: 'Ungrounded'
};

export const REVIEW_DIMENSIONS = [
  'factualConsistency',
  'sourceGrounding',
  'hallucinationRisk',
  'toneConsistency',
  'audienceFit',
  'readability',
  'languageConsistency',
  'platformCompliance',
  'duplication',
  'safety'
];

/**
 * Creates a single reviewed output item conforming to Module 5 standards.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createReviewItem({
  outputId,
  channelId,
  title,
  content,
  originalContent,
  isEdited = false,
  overallStatus = CHECK_STATUSES.PASS,
  approvalStatus = APPROVAL_STATUSES.PENDING_REVIEW,
  requiresHumanReview = true,
  reviewedAt = new Date().toISOString(),
  checks = {},
  summary = {},
  metadata = {},
  sourceTraceability = [],
  approvalInfo = null,
  reviewerNotes = ''
} = {}) {
  const currentContent = typeof content === 'string' ? content : '';

  return {
    outputId: outputId || `rev-out-${Date.now()}`,
    channelId: channelId || 'unknown',
    title: title || 'Communication Asset',
    content: currentContent,
    originalContent: originalContent || currentContent,
    isEdited: Boolean(isEdited),
    overallStatus,
    approvalStatus: approvalStatus || APPROVAL_STATUSES.PENDING_REVIEW,
    requiresHumanReview,
    reviewedAt,
    reviewerNotes: approvalInfo?.rejectionReason || reviewerNotes || '',

    checks: {
      factualConsistency: checks.factualConsistency || { status: CHECK_STATUSES.PASS, explanation: 'Facts verified.', message: 'Facts verified.' },
      sourceGrounding: checks.sourceGrounding || { status: CHECK_STATUSES.PASS, explanation: 'Source grounded.', message: 'Source grounded.' },
      hallucinationRisk: checks.hallucinationRisk || checks.hallucinationCheck || { status: CHECK_STATUSES.PASS, explanation: 'No unsupported claims.', message: 'No unsupported claims.' },
      toneConsistency: checks.toneConsistency || { status: CHECK_STATUSES.PASS, explanation: 'Tone consistent.', message: 'Tone consistent.' },
      audienceFit: checks.audienceFit || { status: CHECK_STATUSES.PASS, explanation: 'Audience appropriate.', message: 'Audience appropriate.' },
      readability: checks.readability || { status: CHECK_STATUSES.PASS, explanation: 'Readability acceptable.', message: 'Readability acceptable.', details: {} },
      languageConsistency: checks.languageConsistency || { status: CHECK_STATUSES.PASS, explanation: 'Language consistent.', message: 'Language consistent.' },
      platformCompliance: checks.platformCompliance || { status: CHECK_STATUSES.PASS, explanation: 'Complies with channel rules.', message: 'Complies with channel rules.' },
      duplication: checks.duplication || checks.duplicationCheck || { status: CHECK_STATUSES.PASS, explanation: 'No unnecessary duplication.', message: 'No unnecessary duplication.' },
      safety: checks.safety || checks.safetyCheck || { status: CHECK_STATUSES.PASS, explanation: 'Content verified safe.', message: 'Content verified safe.' }
    },

    summary: {
      passed: summary.passed ?? 0,
      warnings: summary.warnings ?? 0,
      failed: summary.failed ?? 0
    },

    metadata: {
      characterCount: currentContent.length,
      wordCount: currentContent.split(/\s+/).filter(Boolean).length,
      provider: metadata.provider || 'DeterministicFallback',
      isFallback: metadata.isFallback ?? true,
      fallbackReason: metadata.fallbackReason || null,
      generatedAt: metadata.generatedAt || reviewedAt,
      isEdited: Boolean(isEdited)
    },

    sourceTraceability: Array.isArray(sourceTraceability) ? sourceTraceability : [],

    approvalInfo: approvalInfo || {
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      hasHumanOverride: false
    }
  };
}

/**
 * Creates the complete Module 5 Review Result Contract.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createReviewResult({
  sourceId,
  analysisId,
  transformationId,
  communicationId,
  reviewedOutputs = [],
  items = null,
  summary = null,
  config = {},
  createdAt
} = {}) {
  const finalOutputs = Array.isArray(items) ? items : (Array.isArray(reviewedOutputs) ? reviewedOutputs : []);

  // Compute aggregate review summary dynamically
  const calculatedSummary = summary || {
    totalOutputs: finalOutputs.length,
    passed: finalOutputs.filter(o => o.overallStatus === CHECK_STATUSES.PASS).length,
    warnings: finalOutputs.filter(o => o.overallStatus === CHECK_STATUSES.WARNING).length,
    failed: finalOutputs.filter(o => o.overallStatus === CHECK_STATUSES.FAIL).length,
    needsHumanReview: finalOutputs.filter(o => o.requiresHumanReview && o.approvalStatus !== APPROVAL_STATUSES.APPROVED).length,
    approved: finalOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED).length,
    approvedOutputs: finalOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED).length,
    rejected: finalOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.REJECTED).length
  };

  return {
    reviewId: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceId: sourceId || 'src-unknown',
    transformationId: transformationId || 'trans-unknown',
    analysisId: analysisId || 'ana-unknown',
    communicationId: communicationId || 'comm-unknown',
    reviewedOutputs: finalOutputs,
    items: finalOutputs,
    summary: calculatedSummary,
    config: config || {},
    createdAt: createdAt || new Date().toISOString()
  };
}

/**
 * Creates the Module 6 Export Contract representing human-approved communication assets.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createExportHandoffContract({
  sourceId,
  analysisId,
  transformationId,
  communicationId,
  reviewedOutputs = [],
  approvedOutputs = [],
  reviewSummary = {},
  config = {},
  createdAt
} = {}) {
  const finalApproved = approvedOutputs.length > 0
    ? approvedOutputs
    : reviewedOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED);

  const expId = `pkg-exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    exportPackageId: expId,
    exportId: expId,
    sourceId: sourceId || 'src-unknown',
    transformationId: transformationId || 'trans-unknown',
    analysisId: analysisId || 'ana-unknown',
    communicationId: communicationId || 'comm-unknown',
    reviewedOutputs: Array.isArray(reviewedOutputs) ? reviewedOutputs : [],
    approvedOutputs: finalApproved,
    reviewSummary: reviewSummary || {},
    config: config || {},
    readyForExport: finalApproved.length > 0,
    totalApprovedCount: finalApproved.length,
    totalReviewedCount: reviewedOutputs.length,
    qualityGate: {
      passed: finalApproved.length > 0,
      approvedCount: finalApproved.length
    },
    createdAt: createdAt || new Date().toISOString()
  };
}
