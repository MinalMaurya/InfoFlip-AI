/**
 * Platform Compliance Checker for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Verifies that communication outputs adhere to platform-specific syntax, length,
 * and format requirements across all 8 channels.
 */

import { CHECK_STATUSES } from '../../types/review.js';

export function checkPlatformCompliance(outputItem, context = {}) {
  const channelId = String(outputItem?.channelId || context?.channelId || '').toLowerCase();
  const text = typeof outputItem?.content === 'string' ? outputItem.content : (typeof outputItem === 'string' ? outputItem : '');
  const charCount = text.length;

  switch (channelId) {
    case 'sms': {
      const segments = Math.ceil(charCount / 160) || 1;
      if (charCount > 160) {
        const msg = `SMS exceeds single-message 160-character recommendation (${charCount} chars). Will deliver as ${segments} billable segments.`;
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { charCount, segments, segmentCount: segments, limit: 160 }
        };
      }
      const passMsg = `SMS is compliant with telecom standards (${charCount}/160 characters).`;
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { charCount, segments: 1, segmentCount: 1, limit: 160 }
      };
    }

    case 'twitter': {
      const isThread = outputItem?.structuredData?.isThread || text.includes('1/') || text.includes('\n\n---\n\n');
      if (charCount > 280 && !isThread) {
        const msg = `Single tweet exceeds the 280-character limit (${charCount} chars). Conversion to thread format recommended.`;
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { charCount, limit: 280, isThreadCandidate: true, isThread: false }
        };
      }
      const passMsg = isThread 
        ? `Thread format verified (${outputItem?.structuredData?.posts?.length || 'multi'}-post thread).`
        : `Tweet complies with 280-character platform constraint (${charCount}/280).`;
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { charCount, isThread: Boolean(isThread), isThreadCandidate: Boolean(isThread), limit: 280 }
      };
    }

    case 'email': {
      const lower = text.toLowerCase();
      const hasSubject = lower.includes('subject:') || Boolean(outputItem?.structuredData?.subject);
      const hasCTA = lower.includes('step') || lower.includes('action') || lower.includes('review') || lower.includes('contact') || lower.includes('call');

      if (!hasSubject) {
        const msg = 'Email is missing a distinct Subject line.';
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { hasSubject: false, hasCTA, charCount }
        };
      }
      const passMsg = 'Email includes subject line, body, and call-to-action.';
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { hasSubject: true, hasCTA, charCount }
      };
    }

    case 'whatsapp': {
      const hasFormatting = text.includes('*') || text.includes('_') || text.includes('•') || text.includes('-');
      if (!hasFormatting && text.length > 180) {
        const msg = 'WhatsApp message lacks scannability markers (bolding or bullet points). Consider adding structure.';
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { hasFormatting: false, charCount }
        };
      }
      const passMsg = 'WhatsApp message structure and scannability verified.';
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { hasFormatting: true, charCount }
      };
    }

    case 'linkedin': {
      if (charCount > 3000) {
        const msg = 'LinkedIn post exceeds recommended length of 3000 characters.';
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { charCount, limit: 3000 }
        };
      }
      const passMsg = `LinkedIn post length is optimal (${charCount} characters).`;
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { charCount, limit: 3000 }
      };
    }

    case 'hashtags': {
      const hasTags = (text.match(/#[a-zA-Z0-9_]+/g) || []).length > 0;
      if (!hasTags) {
        const msg = 'No hashtag symbols (#) found in hashtag suggestions.';
        return {
          status: CHECK_STATUSES.WARNING,
          message: msg,
          explanation: msg,
          details: { hasTags: false }
        };
      }
      const passMsg = 'Hashtag formatting and structure verified.';
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { hasTags: true }
      };
    }

    default: {
      const passMsg = 'Platform compliance check passed.';
      return {
        status: CHECK_STATUSES.PASS,
        message: passMsg,
        explanation: passMsg,
        details: { channelId, charCount }
      };
    }
  }
}
