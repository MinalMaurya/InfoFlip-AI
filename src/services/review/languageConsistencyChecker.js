/**
 * Language Consistency Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Verifies script and vocabulary consistency with the configured target language.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkLanguageConsistency(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const requestedLang = context?.config?.language || outputItem?.configLanguage || context?.configLanguage || 'English';

  // Devanagari Unicode range \u0900-\u097F
  const devanagariMatches = text.match(/[\u0900-\u097F]/g) || [];
  const latinMatches = text.match(/[a-zA-Z]/g) || [];

  const devanagariCount = devanagariMatches.length;
  const latinCount = latinMatches.length;
  const totalLetters = devanagariCount + latinCount;

  if (totalLetters === 0) {
    const msg = 'Language check passed.';
    return {
      status: CHECK_STATUSES.PASS,
      message: msg,
      explanation: msg,
      details: { requestedLang, devanagariCount, latinCount }
    };
  }

  const devanagariRatio = devanagariCount / totalLetters;
  const latinRatio = latinCount / totalLetters;

  if (['hindi', 'marathi'].includes(requestedLang.toLowerCase())) {
    if (devanagariRatio < 0.25 && latinRatio > 0.65) {
      const msg = `Target language is ${requestedLang}, but content appears predominantly in Latin script (${Math.round(latinRatio * 100)}%). Review translation accuracy.`;
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { requestedLang, devanagariRatio, latinRatio }
      };
    }
  } else if (requestedLang.toLowerCase() === 'english') {
    if (devanagariRatio > 0.20) {
      const msg = `Target language is English, but unexpected Devanagari phrasing (${Math.round(devanagariRatio * 100)}%) was detected.`;
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { requestedLang, devanagariRatio, latinRatio }
      };
    }
  }

  const passMsg = `Language script and phrasing match the requested "${requestedLang}" configuration.`;
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { requestedLang, devanagariRatio, latinRatio }
  };
}
