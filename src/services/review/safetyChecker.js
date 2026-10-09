/**
 * Content Safety & Sensitivity Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Screens communication assets for potentially dangerous claims,
 * unsupported safety instructions, or misleading medical/emergency guidance.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkSafetyAndSensitivity(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const lower = text.toLowerCase();
  const sourceContent = context?.sourceContent || outputItem?.sourceContent || {};
  const rawSource = (sourceContent?.extractedText || sourceContent?.rawText || context?.sourceText || outputItem?.sourceText || '').toLowerCase();

  const safetyAlerts = [];

  // 1. High-risk safety terms present in text but absent from source
  const riskyTerms = [
    'take immediate medication',
    'evacuate entire city',
    'immediately evacuate',
    'mandatory evacuation',
    'stay indoors',
    'drink salt water',
    'do not dial 911',
    'ignore official warnings',
    'quarantine area',
    'curfew imposed'
  ];

  for (const term of riskyTerms) {
    if (lower.includes(term) && !rawSource.includes(term)) {
      if (term === 'stay indoors' && rawSource.includes('avoid unnecessary travel')) {
        safetyAlerts.push(`High-risk unauthorized directive: "${term}" (unsupported strengthening of source instruction "avoid unnecessary travel")`);
      } else if (term === 'mandatory evacuation') {
        safetyAlerts.push(`High-risk unauthorized directive: "${term}" (mandatory evacuation absent from source)`);
      } else {
        safetyAlerts.push(`High-risk unauthorized directive: "${term}"`);
      }
    }
  }

  // 2. Fabricated emergency helpline numbers
  const emergencyNums = (text.match(/\b(?:112|911|100|101|108|1091)\b/g) || []);
  for (const num of emergencyNums) {
    if (rawSource.length > 0 && !rawSource.includes(num)) {
      safetyAlerts.push(`Unverified emergency helpline: ${num}`);
    }
  }

  if (safetyAlerts.length > 0) {
    const warnMsg = `Safety warning: ${safetyAlerts.join('; ')}. Ensure official verification.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: warnMsg,
      explanation: warnMsg,
      details: { safetyAlerts }
    };
  }

  const passMsg = 'Content does not contain unauthorized safety directives or ungrounded emergency claims.';
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { safetyAlerts: [] }
  };
}

export const checkSafety = checkSafetyAndSensitivity;
