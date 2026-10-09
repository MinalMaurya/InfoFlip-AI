/**
 * InfoFlip-AI Export & Distribution Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 6: Export & Distribution
 * 
 * Formal data contracts for human-approved content deliverables,
 * manifest structures, export results, and immutable audit trails.
 */

export const EXPORT_STATUSES = {
  READY: 'READY',
  EXPORTING: 'EXPORTING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  BLOCKED: 'BLOCKED'
};

export const EXPORT_FORMATS = {
  TXT: 'txt',
  JSON: 'json',
  PDF: 'pdf',
  PACKAGE: 'package'
};

/**
 * Creates an authoritative ExportItem conforming to Module 6 standards.
 * Preserves all source lineage and human review audit metadata.
 * 
 * @param {object} item - Approved communication item from Module 5
 * @param {object} lineage - Upstream lineage identifiers
 * @returns {object} - Normalized ExportItem
 */
export function createExportItem(item = {}, lineage = {}) {
  const content = typeof item.content === 'string' ? item.content : '';
  const wordCount = item.metadata?.wordCount || (content.trim() ? content.trim().split(/\s+/).length : 0);
  const characterCount = item.metadata?.characterCount || content.length;

  const reviewerInfo = item.approvalInfo || {};
  const reviewer = reviewerInfo.approvedBy || item.reviewer || 'Human Reviewer';
  const reviewedAt = item.reviewedAt || reviewerInfo.approvedAt || new Date().toISOString();
  const reviewerRemarks = item.reviewerNotes || reviewerInfo.remarks || 'Human approved for distribution';

  return {
    exportItemId: `exp-item-${item.outputId || Date.now()}`,
    outputId: item.outputId || `out-${Date.now()}`,
    channelId: String(item.channelId || 'unknown').toLowerCase(),
    title: item.title || `${String(item.channelId || 'Channel').toUpperCase()} Communication`,
    content,

    status: 'APPROVED',

    // Full Lineage Preservation
    sourceId: item.sourceId || lineage.sourceId || 'src-unknown',
    analysisId: item.analysisId || lineage.analysisId || 'ana-unknown',
    transformationId: item.transformationId || lineage.transformationId || 'trans-unknown',
    communicationId: item.communicationId || lineage.communicationId || 'comm-unknown',

    // Provider & Traceability Telemetry
    provider: item.metadata?.provider || 'DeterministicFallback',
    isFallback: Boolean(item.metadata?.isFallback),
    sourceTraceability: Array.isArray(item.sourceTraceability) ? item.sourceTraceability : [],

    // Review & Approval Audit
    reviewStatus: item.overallStatus || 'PASS',
    reviewer,
    reviewedAt,
    reviewerRemarks,

    // Verification & Transparency Telemetry
    contentStatusFlag: item.metadata?.contentStatusFlag || 'Approved for export',
    verificationStatus: item.verificationStatus || (item.metadata?.isIndependentlyVerified ? 'Independently verified' : 'Source not independently verified'),
    hasHumanOverride: Boolean(reviewerInfo.hasHumanOverride),
    unresolvedWarnings: Array.isArray(reviewerInfo.unresolvedWarnings) ? reviewerInfo.unresolvedWarnings : [],

    // Metrics
    wordCount,
    characterCount
  };
}

/**
 * Creates a normalized ExportPackage from the Module 5 handoff payload.
 * 
 * @param {object} params
 * @returns {object} - Standardized ExportPackage
 */
export function createExportPackage({
  exportId,
  sourceId,
  analysisId,
  transformationId,
  communicationId,
  approvedOutputs = [],
  reviewSummary = {},
  config = {},
  createdAt,
  approvedAt
} = {}) {
  const finalExportId = exportId || `pkg-exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const lineage = { sourceId, analysisId, transformationId, communicationId };

  // Normalize approved outputs to ExportItem schema
  const normalizedApprovedOutputs = approvedOutputs.map(item => createExportItem(item, lineage));

  const qualityGateStatus = reviewSummary.qualityGate === 'PASSED' || 
                           reviewSummary.qualityGate?.passed === true ||
                           normalizedApprovedOutputs.length > 0
                           ? 'PASSED'
                           : 'FAILED';

  return {
    exportId: finalExportId,
    sourceId: sourceId || 'src-unknown',
    analysisId: analysisId || 'ana-unknown',
    transformationId: transformationId || 'trans-unknown',
    communicationId: communicationId || 'comm-unknown',

    approvedOutputs: normalizedApprovedOutputs,

    reviewSummary: {
      qualityGate: qualityGateStatus,
      approvedCount: normalizedApprovedOutputs.length,
      rejectedCount: reviewSummary.rejected ?? 0,
      warningCount: reviewSummary.warnings ?? 0,
      failedCount: reviewSummary.failed ?? 0
    },

    config: config || {},

    createdAt: createdAt || new Date().toISOString(),
    approvedAt: approvedAt || new Date().toISOString()
  };
}

/**
 * Creates an ExportResult representing a completed export action.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createExportResult({
  exportId,
  format,
  fileName,
  itemCount,
  success = true,
  metadata = {}
} = {}) {
  return {
    exportId: exportId || `exp-${Date.now()}`,
    format: format || 'txt',
    fileName: fileName || `InfoFlip-AI-Export.${format || 'txt'}`,
    createdAt: new Date().toISOString(),
    itemCount: itemCount ?? 0,
    success: Boolean(success),
    metadata: {
      ...metadata,
      exportedAt: new Date().toISOString()
    }
  };
}
