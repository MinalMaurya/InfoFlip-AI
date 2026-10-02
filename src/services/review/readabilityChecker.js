/**
 * Readability Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Computes deterministic readability metrics and flags overly complex sentences.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkReadability(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const clean = text.trim();

  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = clean.length;

  // Split into sentences (by . ! ? or newlines)
  const rawSentences = clean
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const sentenceCount = Math.max(rawSentences.length, 1);
  const avgSentenceLength = Number((wordCount / sentenceCount).toFixed(1));

  // Identify sentences with > 28 words
  const longSentences = rawSentences.filter(s => {
    const sWords = s.split(/\s+/).filter(Boolean).length;
    return sWords > 28;
  });

  const details = {
    wordCount,
    characterCount,
    sentenceCount,
    avgSentenceLength,
    longSentenceCount: longSentences.length,
    longSentences: longSentences.slice(0, 3)
  };

  if (longSentences.length >= 1 || avgSentenceLength > 32) {
    const warnMsg = `${longSentences.length} complex sentence(s) exceed recommended 28-word limit. Consider simplifying.`;
    return {
      status: CHECK_STATUSES.WARNING,
      message: warnMsg,
      explanation: warnMsg,
      details
    };
  }

  const passMsg = `Readability is optimal (${avgSentenceLength} words/sentence across ${sentenceCount} sentences).`;
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details
  };
}
