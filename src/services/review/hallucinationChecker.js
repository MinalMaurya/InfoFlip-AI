/**
 * Hallucination / Unsupported Claim Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Detects claims or tokens that appear unsupported by source, analysis, or transformation data.
 * Employs calibrated language: "Potential unsupported claim detected" rather than asserting certainty.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkHallucinationRisk(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const sourceContent = context.sourceContent || outputItem.sourceContent || {};
  const rawSource = (sourceContent.extractedText || sourceContent.rawText || context.sourceText || outputItem.sourceText || '').toLowerCase();
  const analysis = context.analysis || outputItem.analysis || {};

  const unsupportedSignals = [];

  // Check 1: Suspicious external links not present in source
  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
  const urlsInText = text.match(urlRegex) || [];
  for (const url of urlsInText) {
    if (!rawSource.includes(url.toLowerCase())) {
      unsupportedSignals.push(`Unverified external link: ${url}`);
    }
  }

  // Check 2: Absolute statistical certainty claims not found in source
  const certaintyPhrases = [
    'guaranteed to',
    '100% guaranteed',
    'without exception',
    'completely demolished',
    'every single resident',
    'zero chance',
    'proven fact that everyone'
  ];

  for (const phrase of certaintyPhrases) {
    if (text.toLowerCase().includes(phrase) && !rawSource.includes(phrase)) {
      unsupportedSignals.push(`Unsupported absolute claim: "${phrase}"`);
    }
  }

  // Check 3: Phone numbers not in source
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phones = text.match(phoneRegex) || [];
  for (const ph of phones) {
    const cleanPh = ph.replace(/[^\d]/g, '');
    if (!rawSource.includes(cleanPh)) {
      unsupportedSignals.push(`Unverified phone number: ${ph}`);
    }
  }

  if (unsupportedSignals.length > 0) {
    const warnMsg = `Potential unsupported claim detected: ${unsupportedSignals.join('; ')}.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: warnMsg,
      explanation: warnMsg,
      details: { unsupportedSignals }
    };
  }

  const passMsg = 'No obvious unsupported assertions or external fabrication patterns detected.';
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { unsupportedSignals: [] }
  };
}

export const checkHallucinations = checkHallucinationRisk;
