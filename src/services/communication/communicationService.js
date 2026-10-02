/**
 * InfoFlip-AI Communication Service
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 * 
 * Orchestrates platform-specific communication generation, registry lookup,
 * validation, source traceability, and individual channel regeneration.
 */

import { getActiveAIProvider } from '../ai/providerRegistry.js';
import { 
  createCommunicationRequest, 
  createCommunicationResult,
  createCommunicationOutputItem,
  ALL_COMMUNICATION_CHANNELS
} from '../../types/communication.js';
import { 
  validateCommunicationRequest, 
  validateCommunicationOutput,
  countWords,
  countCharacters
} from './communicationValidator.js';
import { 
  getCommunicationChannelById, 
  resolveChannelId 
} from './communicationChannelRegistry.js';
import { DeterministicCommunicationProvider } from './deterministicCommunicationProvider.js';

/**
 * Main service entry point for generating communication assets
 * 
 * @param {object} rawRequest - Raw request payload conforming to Module 4 input contract
 * @param {object} options - Execution options
 * @param {function} [options.onProgress] - Progress callback
 * @param {number} [options.delayMs=120] - Simulated delay for smooth UI feedback
 * @returns {Promise<object>} - Structured Module 4 Communication Result Contract
 */
export async function generateCommunication(rawRequest, options = {}) {
  const onProgress = options.onProgress || (() => {});
  const delay = options.delayMs ?? 120;

  // Step 1: Reading input, analysis, and Module 3 transformation outputs
  onProgress({
    step: 1,
    stage: 'reading',
    title: 'Reading structured outputs & context',
    detail: 'Loading Module 3 transformations, verified facts, and ground truth...'
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const validation = validateCommunicationRequest(rawRequest);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const structuredRequest = createCommunicationRequest(rawRequest);

  // Step 2: Calibrating channel strategies & tone
  onProgress({
    step: 2,
    stage: 'strategy',
    title: 'Calibrating channel strategies',
    detail: `Preparing formats for ${structuredRequest.config.targetAudience} in ${structuredRequest.config.language} (${structuredRequest.config.tone} tone)...`
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  // Step 3: Generating platform-specific assets
  const channelsList = structuredRequest.requestedChannels;
  const perChannelStatus = {};
  channelsList.forEach(ch => {
    perChannelStatus[ch] = 'pending';
  });

  onProgress({
    step: 3,
    stage: 'generating',
    title: `Generating ${channelsList.length} communication channels`,
    detail: `Synthesizing ${channelsList.map(c => getCommunicationChannelById(c)?.shortName || c).join(', ')}...`,
    perChannelStatus
  });

  const provider = getActiveAIProvider();
  let generatedItems = [];

  try {
    if (provider && typeof provider.communicate === 'function') {
      generatedItems = await provider.communicate(structuredRequest, options);
    } else {
      const fallback = new DeterministicCommunicationProvider();
      generatedItems = fallback.generate(structuredRequest, options);
    }
  } catch (err) {
    console.warn('AI communication generation failed, invoking deterministic provider fallback:', err.message);
    const fallback = new DeterministicCommunicationProvider();
    generatedItems = fallback.generate(structuredRequest, {
      ...options,
      fallbackReason: err.message?.includes('quota') ? 'Gemini quota exhausted' : 'Gemini unavailable'
    });
  }

  // Step 4: Validating results & constraints
  onProgress({
    step: 4,
    stage: 'validating',
    title: 'Validating channel constraints & source traceability',
    detail: 'Verifying character counts, word limits, and factual grounding...'
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  // Process and validate each output item
  const validatedOutputs = [];

  for (const requestedCh of channelsList) {
    const canonicalId = resolveChannelId(requestedCh) || requestedCh;
    let item = generatedItems.find(i => resolveChannelId(i.channelId) === canonicalId);

    if (!item) {
      // Partial fallback for missing channel
      const singleFallback = new DeterministicCommunicationProvider();
      const fallbackArr = singleFallback.generate({
        ...structuredRequest,
        requestedChannels: [canonicalId]
      }, { ...options, fallbackReason: 'Generated via localized fallback' });
      item = fallbackArr[0];
    }

    if (item) {
      const val = validateCommunicationOutput(canonicalId, item);
      validatedOutputs.push({
        ...item,
        channelId: canonicalId,
        metadata: {
          ...item.metadata,
          characterCount: countCharacters(item.content),
          wordCount: countWords(item.content)
        },
        validation: {
          isValid: val.isValid,
          warnings: val.warnings
        }
      });
    }
  }

  // Step 5: Complete
  onProgress({
    step: 5,
    stage: 'complete',
    title: 'Communication generation complete',
    detail: `${validatedOutputs.length} channel assets ready for preview, editing, and copy.`
  });

  return createCommunicationResult({
    communicationId: structuredRequest.communicationId,
    sourceId: structuredRequest.sourceId,
    transformationId: structuredRequest.transformationId,
    analysisId: structuredRequest.analysisId,
    outputs: validatedOutputs,
    createdAt: new Date().toISOString()
  });
}

/**
 * Regenerates an individual communication channel without re-running the entire suite
 * 
 * @param {object} baseRequest - Original communication request
 * @param {string} outputId - Existing output ID to replace
 * @param {string} channelId - Channel to regenerate
 * @param {object} options - Options
 * @returns {Promise<object>} - Updated single output item
 */
export async function regenerateSingleChannel(baseRequest, outputId, channelId, options = {}) {
  const canonicalId = resolveChannelId(channelId) || channelId;
  const singleRequest = {
    ...baseRequest,
    requestedChannels: [canonicalId]
  };

  const provider = getActiveAIProvider();
  let results = [];

  if (provider && typeof provider.communicate === 'function') {
    results = await provider.communicate(singleRequest, options);
  } else {
    const fallback = new DeterministicCommunicationProvider();
    results = fallback.generate(singleRequest, options);
  }

  const regeneratedItem = results.find(i => resolveChannelId(i.channelId) === canonicalId) || results[0];
  if (!regeneratedItem) {
    throw new Error(`Failed to regenerate output for channel ${channelId}.`);
  }

  const val = validateCommunicationOutput(canonicalId, regeneratedItem);

  return {
    ...regeneratedItem,
    outputId: outputId || regeneratedItem.outputId,
    channelId: canonicalId,
    metadata: {
      ...regeneratedItem.metadata,
      characterCount: countCharacters(regeneratedItem.content),
      wordCount: countWords(regeneratedItem.content),
      generatedAt: new Date().toISOString()
    },
    validation: {
      isValid: val.isValid,
      warnings: val.warnings
    }
  };
}

/**
 * Updates content for an output item following manual user editing
 * 
 * @param {object} outputItem 
 * @param {string} newContent 
 * @returns {object}
 */
export function updateOutputContent(outputItem, newContent) {
  if (!outputItem) return null;
  const contentStr = typeof newContent === 'string' ? newContent : '';
  const charCount = countCharacters(contentStr);
  const wordCount = countWords(contentStr);

  const updated = {
    ...outputItem,
    content: contentStr,
    metadata: {
      ...outputItem.metadata,
      characterCount: charCount,
      wordCount: wordCount,
      isEdited: true
    }
  };

  const val = validateCommunicationOutput(outputItem.channelId, updated);
  updated.validation = {
    isValid: val.isValid,
    warnings: val.warnings
  };

  return updated;
}
