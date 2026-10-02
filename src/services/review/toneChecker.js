/**
 * Tone Consistency Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Compares generated communication output against the requested tone.
 * Provides transparent review warnings without automatically altering the text.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkToneConsistency(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const requestedTone = context?.config?.tone || outputItem?.requestedTone || context?.requestedTone || 'Informative';
  const lower = text.toLowerCase();

  const urgentKeywords = ['urgent', 'emergency', 'immediate', 'alert', 'warning', 'critical', 'danger', 'action required', '⚠️', '🚨'];
  const casualKeywords = ['hey guys', 'what\'s up', 'omg', 'super cool', 'check this out', 'gonna', 'wanna', 'kinda', 'lol'];
  const sensationalKeywords = ['shocking truth', 'you won\'t believe', 'mind-blowing', 'unbelievable disaster', 'apocalyptic'];

  const hasUrgentIndicators = urgentKeywords.some(w => lower.includes(w));
  const hasCasualIndicators = casualKeywords.some(w => lower.includes(w));
  const hasSensationalIndicators = sensationalKeywords.some(w => lower.includes(w));

  if (hasSensationalIndicators) {
    const msg = 'Content exhibits sensationalized phrasing. Review to ensure balanced communication.';
    return {
      status: CHECK_STATUSES.WARNING,
      message: msg,
      explanation: msg,
      details: { requestedTone, detectedFeatures: ['Sensational language'] }
    };
  }

  if (requestedTone.toLowerCase() === 'urgent') {
    if (!hasUrgentIndicators) {
      const msg = 'Tone requested is "Urgent", but content lacks clear urgency directives or time-sensitive indicators.';
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { requestedTone, detectedFeatures: ['Lacks urgency cues'] }
      };
    }
  }

  if (requestedTone.toLowerCase() === 'formal') {
    if (hasCasualIndicators) {
      const msg = 'Tone requested is "Formal", but content includes overly casual phrases or colloquialisms.';
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { requestedTone, detectedFeatures: ['Casual phrasing detected'] }
      };
    }
  }

  const passMsg = `Tone aligns with the requested "${requestedTone}" profile.`;
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { requestedTone, isAppropriate: true }
  };
}
