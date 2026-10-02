/**
 * Audience Fit Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Evaluates whether communication complexity, vocabulary, and framing
 * match the designated target audience.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkAudienceFit(outputItem, context = {}) {
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const targetAudience = context?.config?.targetAudience || outputItem?.targetAudience || context?.targetAudience || 'General Public';

  const words = text.split(/\s+/).filter(Boolean);
  const avgWordLength = words.length > 0 
    ? words.reduce((acc, w) => acc + w.length, 0) / words.length 
    : 0;

  // Jargon terms to flag for general public
  const technicalJargon = [
    'cyclogenesis',
    'tropospheric',
    'parameterization',
    'baroclinic',
    'vorticity',
    'perturbation',
    'isobaric'
  ];

  const lower = text.toLowerCase();
  const foundJargon = technicalJargon.filter(j => lower.includes(j));

  // Check 1: General public with overly dense / academic jargon
  if (targetAudience.toLowerCase().includes('general public')) {
    if (avgWordLength > 7.5 || foundJargon.length > 0) {
      const msg = foundJargon.length > 0
        ? `Dense technical jargon [${foundJargon.join(', ')}] detected for a General Public audience. Consider simpler phrasing.`
        : 'Vocabulary density is high for a General Public audience. Consider simpler terminology.';
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { targetAudience, avgWordLength: Number(avgWordLength.toFixed(1)), foundJargon }
      };
    }
  }

  // Check 2: Executive audience with overly verbose text
  if (targetAudience.toLowerCase().includes('executive')) {
    if (words.length > 150) {
      const msg = 'Content is lengthy for an Executive audience. Prioritize key takeaways and executive summaries.';
      return {
        status: CHECK_STATUSES.WARNING,
        message: msg,
        explanation: msg,
        details: { targetAudience, wordCount: words.length }
      };
    }
  }

  const passMsg = `Communication complexity and style are suitable for "${targetAudience}".`;
  return {
    status: CHECK_STATUSES.PASS,
    message: passMsg,
    explanation: passMsg,
    details: { targetAudience, avgWordLength: Number(avgWordLength.toFixed(1)) }
  };
}
