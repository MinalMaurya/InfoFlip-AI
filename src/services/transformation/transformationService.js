/**
 * InfoFlip-AI Transformation Service
 * 
 * SIH 2026 Problem Statement ID 26154
 * Module 3: Transformation & Output Engine
 * 
 * Primary service entry point: transformContent(request, options)
 * Orchestrates multi-output synthesis, anti-hallucination validation,
 * partial failure handling, and individual regeneration.
 */

import { getActiveAIProvider } from '../ai/providerRegistry.js';
import { 
  createTransformationRequest, 
  createTransformationResult,
  createOutputItem,
  OUTPUT_STATUSES
} from '../../types/transformation.js';
import { validateOutput } from './transformationValidator.js';
import { getOutputFormatById } from './outputFormatRegistry.js';

/**
 * Validates a transformation request before dispatch
 * @param {object} request 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateTransformationRequest(request) {
  if (!request) {
    return { isValid: false, error: 'Transformation request is missing or null.' };
  }

  const sourceText = request.source?.extractedText || request.source?.rawText || '';
  if (!sourceText || sourceText.trim().length < 15) {
    return {
      isValid: false,
      error: 'No source content available. Return to Input (Module 1).'
    };
  }

  if (!request.analysis || !request.analysis.analysisId) {
    return {
      isValid: false,
      error: 'Content understanding is required before transformation. Return to Understand (Module 2).'
    };
  }

  if (!Array.isArray(request.requestedOutputs) || request.requestedOutputs.length === 0) {
    return {
      isValid: false,
      error: 'Select at least one output format.'
    };
  }

  return { isValid: true };
}

/**
 * Main service entry point for transforming content
 * 
 * @param {object} rawRequest - Raw request payload
 * @param {object} options - Execution options
 * @param {function} options.onProgress - Progress callback ({ step, stage, title, detail, perFormatStatus })
 * @param {number} options.delayMs - Delay interval for simulated smooth animation
 * @returns {Promise<object>} - Structured Module 3 Transformation Result Contract
 */
export async function transformContent(rawRequest, options = {}) {
  const onProgress = options.onProgress || (() => {});
  const delay = options.delayMs ?? 180;

  // Step 1: Reading source and analysis data
  onProgress({
    step: 1,
    stage: 'reading',
    title: 'Reading source and analysis data',
    detail: 'Loading normalized text stream and Module 2 semantic facts...'
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const validation = validateTransformationRequest(rawRequest);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const structuredRequest = createTransformationRequest(rawRequest);

  // Step 2: Applying content understanding
  onProgress({
    step: 2,
    stage: 'understanding',
    title: 'Applying content understanding',
    detail: `Integrating ${structuredRequest.analysis.keyFacts?.length || 0} verified facts, entities, and urgency signals...`
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  // Step 3: Applying user preferences
  onProgress({
    step: 3,
    stage: 'preferences',
    title: 'Applying cohort preferences',
    detail: `Calibrating for ${structuredRequest.configuration.targetAudience?.join(', ')} in ${structuredRequest.configuration.language} (${structuredRequest.configuration.tone} tone)...`
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  // Step 4: Generating outputs with per-format tracking
  const formatsList = structuredRequest.requestedOutputs;
  const perFormatStatus = {};
  formatsList.forEach(f => {
    perFormatStatus[f] = 'pending';
  });

  onProgress({
    step: 4,
    stage: 'generating',
    title: `Generating ${formatsList.length} outputs`,
    detail: `Synthesizing ${formatsList.map(f => getOutputFormatById(f)?.shortName || f).join(', ')}...`,
    perFormatStatus
  });

  const provider = getActiveAIProvider();
  let generatedItems = [];

  try {
    generatedItems = await provider.transform(structuredRequest, options);
  } catch (err) {
    console.error('AI transformation batch failed:', err);
    throw new Error(`We couldn't generate the requested outputs. ${err.message || 'Please try again.'}`);
  }

  // Step 5: Validating results and anti-hallucination guardrails
  onProgress({
    step: 5,
    stage: 'validating',
    title: 'Validating results & grounding',
    detail: 'Verifying structure, completeness, and factual integrity across all formats...'
  });
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  // Process and validate each output item
  const validatedOutputs = [];

  for (const formatId of formatsList) {
    const item = generatedItems.find(i => i.format === formatId);

    if (!item) {
      // Partial failure fallback item
      validatedOutputs.push(
        createOutputItem({
          transformationId: structuredRequest.transformationId,
          format: formatId,
          status: OUTPUT_STATUSES.NEEDS_REGENERATION,
          content: null,
          metadata: {
            provider: provider.name,
            generatedAt: new Date().toISOString(),
            errorReason: 'Output missing from AI generation batch.'
          }
        })
      );
      continue;
    }

    const check = validateOutput(item.format, item.content);
    if (!check.isValid) {
      validatedOutputs.push({
        ...item,
        status: OUTPUT_STATUSES.NEEDS_REGENERATION,
        metadata: {
          ...item.metadata,
          errorReason: check.error || 'Output failed structural validation.'
        }
      });
    } else {
      validatedOutputs.push({
        ...item,
        status: OUTPUT_STATUSES.GENERATED
      });
    }
  }

  // Step 6: Complete
  onProgress({
    step: 6,
    stage: 'complete',
    title: 'Transformation complete',
    detail: `${validatedOutputs.filter(o => o.status === OUTPUT_STATUSES.GENERATED).length} of ${formatsList.length} outputs generated successfully.`
  });

  return createTransformationResult({
    transformationId: structuredRequest.transformationId,
    sourceId: structuredRequest.source.sourceId,
    analysisId: structuredRequest.analysis.analysisId,
    configuration: structuredRequest.configuration,
    outputs: validatedOutputs,
    createdAt: structuredRequest.createdAt
  });
}

/**
 * Regenerates an individual output format without re-running the entire batch
 * 
 * @param {object} baseRequest - Original transformation request
 * @param {string} outputId - Existing output ID to replace
 * @param {string} formatId - Format to regenerate
 * @param {object} options - Options
 * @returns {Promise<object>} - Updated single output item
 */
export async function regenerateSingleOutput(baseRequest, outputId, formatId, options = {}) {
  const singleRequest = {
    ...baseRequest,
    requestedOutputs: [formatId]
  };

  const provider = getActiveAIProvider();
  const results = await provider.transform(singleRequest, options);
  const regeneratedItem = results.find(i => i.format === formatId) || results[0];

  if (!regeneratedItem) {
    throw new Error(`Failed to regenerate output for format ${formatId}.`);
  }

  const check = validateOutput(formatId, regeneratedItem.content);
  return {
    ...regeneratedItem,
    outputId: outputId || regeneratedItem.outputId,
    status: check.isValid ? OUTPUT_STATUSES.GENERATED : OUTPUT_STATUSES.NEEDS_REGENERATION,
    metadata: {
      ...regeneratedItem.metadata,
      generatedAt: new Date().toISOString(),
      errorReason: check.isValid ? null : check.error
    }
  };
}
