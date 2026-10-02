/**
 * InfoFlip-AI Communication Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 */

export const COMMUNICATION_CHANNEL_IDS = {
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
  ANNOUNCEMENT: 'announcement',
  CTA: 'cta',
  HASHTAGS: 'hashtags'
};

export const ALL_COMMUNICATION_CHANNELS = Object.values(COMMUNICATION_CHANNEL_IDS);

export const CHANNEL_CHARACTER_LIMITS = {
  [COMMUNICATION_CHANNEL_IDS.SMS]: 160,
  [COMMUNICATION_CHANNEL_IDS.TWITTER]: 280,
  [COMMUNICATION_CHANNEL_IDS.WHATSAPP]: 1024,
  [COMMUNICATION_CHANNEL_IDS.LINKEDIN]: 3000,
  [COMMUNICATION_CHANNEL_IDS.EMAIL]: 5000,
  [COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT]: 2000,
  [COMMUNICATION_CHANNEL_IDS.CTA]: 250,
  [COMMUNICATION_CHANNEL_IDS.HASHTAGS]: 200
};

/**
 * Creates the structured Communication Request Contract for Module 4.
 * Consumes Module 3 outputs, Module 2 analysis, and Module 1 source content.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createCommunicationRequest({
  communicationId,
  sourceId,
  transformationId,
  analysisId,
  sourceContent = {},
  analysis = {},
  transformationOutputs = [],
  config = {},
  requestedChannels = []
} = {}) {
  // Normalize transformation outputs to array
  const normalizedOutputs = Array.isArray(transformationOutputs)
    ? transformationOutputs
    : (transformationOutputs?.outputs && Array.isArray(transformationOutputs.outputs))
    ? transformationOutputs.outputs
    : [];

  return {
    communicationId: communicationId || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceId: sourceId || sourceContent?.sourceId || 'src-unknown',
    transformationId: transformationId || transformationOutputs?.transformationId || 'trans-unknown',
    analysisId: analysisId || analysis?.analysisId || 'ana-unknown',

    sourceContent: {
      sourceId: sourceId || sourceContent?.sourceId || 'src-unknown',
      sourceType: sourceContent?.sourceType || 'text',
      fileName: sourceContent?.fileName || null,
      rawText: sourceContent?.rawText || sourceContent?.extractedText || '',
      extractedText: sourceContent?.extractedText || sourceContent?.rawText || ''
    },

    analysis: {
      analysisId: analysisId || analysis?.analysisId || 'ana-unknown',
      overview: analysis?.overview || {},
      intent: analysis?.intent || {},
      language: analysis?.language || {},
      tone: analysis?.tone || {},
      audience: analysis?.audience || {},
      keyFacts: Array.isArray(analysis?.keyFacts) ? analysis.keyFacts : [],
      entities: analysis?.entities || {},
      topics: Array.isArray(analysis?.topics) ? analysis.topics : [],
      keywords: analysis?.keywords || {},
      importantDates: Array.isArray(analysis?.importantDates) ? analysis.importantDates : [],
      importantNumbers: Array.isArray(analysis?.importantNumbers) ? analysis.importantNumbers : [],
      claims: Array.isArray(analysis?.claims) ? analysis.claims : [],
      urgency: analysis?.urgency || {}
    },

    transformationOutputs: normalizedOutputs,

    config: {
      targetAudience: typeof config?.targetAudience === 'string'
        ? config.targetAudience
        : (Array.isArray(config?.targetAudience) ? config.targetAudience.join(', ') : 'General Public'),
      tone: config?.tone || 'Informative',
      language: config?.language || 'English',
      detailLevel: config?.detailLevel || 'Balanced',
      objective: config?.objective || 'Inform',
      style: config?.style || config?.contentStyle || 'Structured'
    },

    requestedChannels: Array.isArray(requestedChannels) && requestedChannels.length > 0
      ? requestedChannels
      : ALL_COMMUNICATION_CHANNELS
  };
}

/**
 * Creates a single communication output item conforming to Module 4 contract.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createCommunicationOutputItem({
  outputId,
  channelId,
  title,
  content = '',
  structuredData = null,
  metadata = {},
  sourceTraceability = [],
  validation = {}
} = {}) {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  const wordCount = typeof metadata?.wordCount === 'number' 
    ? metadata.wordCount 
    : contentStr.split(/\s+/).filter(Boolean).length;
  const characterCount = typeof metadata?.characterCount === 'number'
    ? metadata.characterCount
    : contentStr.length;

  return {
    outputId: outputId || `out-comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    channelId: channelId || 'unknown',
    title: title || `${channelId || 'Channel'} Communication`,
    content: contentStr,
    ...(structuredData ? { structuredData } : {}),

    metadata: {
      characterCount,
      wordCount,
      provider: metadata?.provider || 'DeterministicFallback',
      isFallback: metadata?.isFallback ?? true,
      fallbackReason: metadata?.fallbackReason || metadata?.reason || null,
      generatedAt: metadata?.generatedAt || new Date().toISOString(),
      isEdited: metadata?.isEdited || false
    },

    sourceTraceability: Array.isArray(sourceTraceability) ? sourceTraceability : [],
    validation: {
      isValid: validation?.isValid ?? true,
      warnings: Array.isArray(validation?.warnings) ? validation.warnings : []
    }
  };
}

/**
 * Creates the complete Module 4 Communication Result Contract.
 * 
 * @param {object} params
 * @returns {object}
 */
export function createCommunicationResult({
  communicationId,
  sourceId,
  transformationId,
  analysisId,
  outputs = [],
  createdAt
} = {}) {
  return {
    communicationId: communicationId || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceId: sourceId || 'src-unknown',
    transformationId: transformationId || 'trans-unknown',
    analysisId: analysisId || 'ana-unknown',
    outputs: Array.isArray(outputs) ? outputs : [],
    createdAt: createdAt || new Date().toISOString()
  };
}
