/**
 * Source Grounding Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Verifies that communication statements have corresponding source traceability records.
 * Categorizes grounding into: Grounded | Partially grounded | Ungrounded.
 */

import { CHECK_STATUSES, GROUNDING_LEVELS } from '../../types/review.js';

export function checkSourceGrounding(outputItem, context = {}) {
  const traceability = Array.isArray(outputItem?.sourceTraceability) 
    ? outputItem.sourceTraceability 
    : (Array.isArray(context?.sourceTraceability) ? context.sourceTraceability : []);

  const content = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Short adaptation formats (CTA, hashtags) may have implicit grounding from source
  const isShortAdaptation = ['cta', 'hashtags', 'announcement'].includes(String(outputItem?.channelId).toLowerCase());

  if (traceability.length === 0) {
    if (wordCount < 10 || isShortAdaptation) {
      const msg = 'Adaptation content derived from source context.';
      return {
        status: CHECK_STATUSES.PASS,
        level: GROUNDING_LEVELS.GROUNDED,
        message: msg,
        explanation: msg,
        details: { traceabilityCount: 0, groundedCount: 0, partiallyGroundedCount: 0, ungroundedCount: 0 }
      };
    }
    const warnMsg = 'No explicit source traceability records found for this communication asset.';
    return {
      status: CHECK_STATUSES.WARNING,
      level: GROUNDING_LEVELS.UNGROUNDED,
      message: warnMsg,
      explanation: warnMsg,
      details: { traceabilityCount: 0, groundedCount: 0, partiallyGroundedCount: 0, ungroundedCount: 1 }
    };
  }

  let groundedCount = 0;
  let partiallyGroundedCount = 0;
  let ungroundedCount = 0;

  for (const record of traceability) {
    const sim = typeof record?.similarity === 'number' ? record.similarity : null;
    const level = record?.groundingLevel;

    if (level === GROUNDING_LEVELS.GROUNDED || (sim !== null && sim >= 0.7)) {
      groundedCount++;
    } else if (level === GROUNDING_LEVELS.PARTIALLY_GROUNDED || (sim !== null && sim >= 0.4)) {
      partiallyGroundedCount++;
    } else if (level === GROUNDING_LEVELS.UNGROUNDED || (sim !== null && sim < 0.4)) {
      ungroundedCount++;
    } else {
      groundedCount++;
    }
  }

  const details = {
    traceabilityCount: traceability.length,
    groundedCount,
    partiallyGroundedCount,
    ungroundedCount,
    records: traceability
  };

  if (ungroundedCount > 0 && groundedCount === 0 && partiallyGroundedCount === 0) {
    const failMsg = 'Traceability records cannot be reconciled with the ingested source content.';
    return {
      status: CHECK_STATUSES.FAIL,
      level: GROUNDING_LEVELS.UNGROUNDED,
      message: failMsg,
      explanation: failMsg,
      details
    };
  }

  if (ungroundedCount > 0 || partiallyGroundedCount > 0) {
    const warnMsg = `Asset is partially grounded (${groundedCount} grounded, ${partiallyGroundedCount} partial, ${ungroundedCount} ungrounded).`;
    return {
      status: CHECK_STATUSES.WARNING,
      level: GROUNDING_LEVELS.PARTIALLY_GROUNDED,
      message: warnMsg,
      explanation: warnMsg,
      details
    };
  }

  const passMsg = `All ${groundedCount} statements have verified source traceability records.`;
  return {
    status: CHECK_STATUSES.PASS,
    level: GROUNDING_LEVELS.GROUNDED,
    message: passMsg,
    explanation: passMsg,
    details
  };
}
