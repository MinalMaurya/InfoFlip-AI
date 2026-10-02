/**
 * Communication Validator for InfoFlip-AI Module 4
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 * 
 * Enforces strict data contracts, supported channels, content constraints,
 * character/word counts, source traceability, and anti-hallucination verification.
 */

import { isValidCommunicationChannel, getCommunicationChannelById } from './communicationChannelRegistry.js';
import { COMMUNICATION_CHANNEL_IDS } from '../../types/communication.js';

/**
 * Accurately counts words in a text string
 * @param {string} text 
 * @returns {number}
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Accurately counts characters in a text string
 * @param {string} text 
 * @returns {number}
 */
export function countCharacters(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.length;
}

/**
 * Validates a Module 4 communication request contract before execution.
 * 
 * @param {object} request 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateCommunicationRequest(request) {
  if (!request) {
    return { isValid: false, error: 'Communication request payload is missing or null.' };
  }

  // 1. Source content check
  const sourceText = request.sourceContent?.extractedText || 
                     request.sourceContent?.rawText || 
                     request.source?.extractedText || 
                     request.source?.rawText || '';

  if (!sourceText || sourceText.trim().length < 10) {
    return {
      isValid: false,
      error: 'Valid source content is required. Return to Input (Module 1).'
    };
  }

  // 2. Analysis check (Module 2)
  if (!request.analysis || (!request.analysis.analysisId && (!Array.isArray(request.analysis.keyFacts) || request.analysis.keyFacts.length === 0))) {
    return {
      isValid: false,
      error: 'Content understanding from Module 2 is required before generating communications.'
    };
  }

  // 3. Transformation outputs check (Module 3)
  const outputs = request.transformationOutputs?.outputs || request.transformationOutputs;
  if (!outputs || (Array.isArray(outputs) && outputs.length === 0 && !request.transformationId)) {
    return {
      isValid: false,
      error: 'Structured transformation from Module 3 is required before communication dispatch.'
    };
  }

  // 4. Requested channels check
  if (!Array.isArray(request.requestedChannels) || request.requestedChannels.length === 0) {
    return {
      isValid: false,
      error: 'At least one communication channel must be requested.'
    };
  }

  // 5. Channel support check (must reject unsupported channels)
  for (const ch of request.requestedChannels) {
    if (!isValidCommunicationChannel(ch)) {
      return {
        isValid: false,
        error: `Unsupported communication channel requested: "${ch}".`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates an individual generated communication output item.
 * 
 * @param {string} channelId 
 * @param {object} item 
 * @returns {{ isValid: boolean, warnings: string[], errors: string[] }}
 */
export function validateCommunicationOutput(channelId, item) {
  const errors = [];
  const warnings = [];

  if (!item) {
    return {
      isValid: false,
      errors: ['Output item is null or undefined.'],
      warnings: []
    };
  }

  // 1. Channel identity check
  if (!item.channelId) {
    errors.push('Output item is missing channelId.');
  }

  // 2. Content presence and type
  if (typeof item.content !== 'string' || item.content.trim().length === 0) {
    errors.push('Output item contains empty or non-string content.');
  }

  // 3. Metadata validation
  if (!item.metadata || typeof item.metadata !== 'object') {
    errors.push('Output item is missing required metadata object.');
  } else {
    if (typeof item.metadata.characterCount !== 'number') {
      errors.push('Metadata missing numeric characterCount.');
    }
    if (typeof item.metadata.wordCount !== 'number') {
      errors.push('Metadata missing numeric wordCount.');
    }
    if (!item.metadata.provider) {
      errors.push('Metadata missing provider identifier.');
    }
    if (typeof item.metadata.isFallback !== 'boolean') {
      errors.push('Metadata missing boolean isFallback indicator.');
    }
  }

  // 4. Source traceability validation (Anti-hallucination requirement)
  if (!Array.isArray(item.sourceTraceability)) {
    errors.push('Source traceability must be an array.');
  } else if (item.sourceTraceability.length === 0) {
    warnings.push('Output item has no linked source traceability facts.');
  }

  // 5. Platform-specific constraints
  const charCount = typeof item.metadata?.characterCount === 'number' 
    ? item.metadata.characterCount 
    : (item.content || '').length;

  if (channelId === COMMUNICATION_CHANNEL_IDS.SMS) {
    if (charCount > 160) {
      warnings.push(`SMS content exceeds recommended 160-character limit (${charCount} characters). May split into multiple segments.`);
    }
  }

  if (channelId === COMMUNICATION_CHANNEL_IDS.TWITTER) {
    const isThread = item.structuredData?.isThread || item.content.includes('1/');
    if (charCount > 280 && !isThread) {
      warnings.push(`Single tweet exceeds 280-character limit (${charCount} characters). Thread format recommended.`);
    }
  }

  if (channelId === COMMUNICATION_CHANNEL_IDS.EMAIL) {
    if (!item.content.toLowerCase().includes('subject')) {
      warnings.push('Email output does not clearly state a Subject Line.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
