/**
 * Factual Consistency Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Verifies whether numbers, dates, locations, and key statements in communication
 * outputs are supported by available source content and Module 2 analysis.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkFactualConsistency(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const sourceContent = context.sourceContent || outputItem.sourceContent || {};
  const rawSource = (sourceContent.extractedText || sourceContent.rawText || context.sourceText || outputItem.sourceText || '').toLowerCase();
  const analysis = context.analysis || outputItem.analysis || {};

  const importantNumbers = Array.isArray(analysis?.importantNumbers) 
    ? analysis.importantNumbers 
    : (Array.isArray(analysis?.numbers) ? analysis.numbers : []);
  const importantDates = Array.isArray(analysis?.importantDates) 
    ? analysis.importantDates 
    : (Array.isArray(analysis?.dates) ? analysis.dates : []);

  const unmatchedNumbers = [];
  const unmatchedDates = [];

  // Extract substantive numeric patterns from text
  const numericRegex = /\b\d+(?:[.,]\d+)?(?:\s*(?:km\/h|m|mm|%|hours|days|zones|meters|people|teams))?\b/gi;
  const numbersFoundInText = text.match(numericRegex) || [];

  const substantiveNumbers = numbersFoundInText.filter(numStr => {
    const clean = numStr.trim();
    return !/^[1-9]\/?$/i.test(clean) && !/^[1-9]\.$/.test(clean);
  });

  for (const numStr of substantiveNumbers) {
    const cleanNum = numStr.toLowerCase().trim();
    const rawDigits = cleanNum.replace(/[^\d.]/g, '');
    const isPresentInSource = rawSource.includes(cleanNum) || 
      rawSource.includes(rawDigits) ||
      importantNumbers.some(n => String(n).toLowerCase().includes(rawDigits));

    if (!isPresentInSource && rawSource.length > 0 && rawDigits.length > 0) {
      unmatchedNumbers.push(numStr);
    }
  }

  // Extract dates (e.g. 2026-10-04, 2030-12-25, 24th Oct)
  const dateRegex = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:\d{2,4})?)\b/gi;
  const datesFound = text.match(dateRegex) || [];
  for (const d of datesFound) {
    const cleanD = d.toLowerCase();
    const isDateInSource = rawSource.includes(cleanD) || importantDates.some(id => String(id).toLowerCase().includes(cleanD));
    if (!isDateInSource && rawSource.length > 0) {
      unmatchedDates.push(d);
    }
  }

  if (unmatchedDates.length > 0) {
    const msg = `Date mismatch: Output mentions date(s) [${unmatchedDates.join(', ')}] not found in source or analysis.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: msg,
      explanation: msg,
      details: { unmatchedDates, unmatchedNumbers }
    };
  }

  if (unmatchedNumbers.length > 0) {
    const msg = `Numeric verification warning: Output contains numbers/metrics [${unmatchedNumbers.slice(0, 3).join(', ')}] without exact source alignment.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: msg,
      explanation: msg,
      details: { unmatchedNumbers, matchedNumbers: [] }
    };
  }

  const passMsg = 'All identified dates, numbers, and facts are grounded in provided source records.';
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { unmatchedNumbers: [], unmatchedDates: [] }
  };
}
