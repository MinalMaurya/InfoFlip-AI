/**
 * Duplication Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Identifies unnecessary repeated phrasing within a single output or across
 * upstream transformation outputs, while preserving legitimate repeated factual points.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkDuplication(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  // Split on newlines OR sentence terminators
  const lines = text
    .split(/(?<=[.?!])\s+|\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 10);

  // 1. Detect internal sentence-level duplication
  const seenLines = new Set();
  const duplicateLines = [];

  for (const line of lines) {
    const normalized = line.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.length > 8) {
      if (seenLines.has(normalized)) {
        duplicateLines.push(line);
      } else {
        seenLines.add(normalized);
      }
    }
  }

  if (duplicateLines.length >= 1) {
    const msg = `${duplicateLines.length} redundant duplicate sentence(s) detected within the output content.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: msg,
      explanation: msg,
      details: { duplicateLines }
    };
  }

  // 2. Cross-module verbatim duplication check
  const mod3Outputs = Array.isArray(context?.transformationOutputs) ? context.transformationOutputs : [];
  let verbatimCloneFound = false;

  for (const mod3 of mod3Outputs) {
    const mod3Text = typeof mod3?.content === 'string' ? mod3.content : JSON.stringify(mod3?.content || '');
    if (mod3Text.length > 80 && text.trim() === mod3Text.trim()) {
      verbatimCloneFound = true;
      break;
    }
  }

  if (verbatimCloneFound) {
    const msg = 'Content is identical to upstream Module 3 output without platform specialization.';
    return {
      status: CHECK_STATUSES.WARNING,
      message: msg,
      explanation: msg,
      details: { verbatimCloneFound }
    };
  }

  const passMsg = 'No excessive internal or cross-module redundancy detected.';
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { duplicateLines: [], verbatimCloneFound: false }
  };
}
