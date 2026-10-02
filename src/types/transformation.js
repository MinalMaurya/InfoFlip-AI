/**
 * InfoFlip-AI Transformation Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 3: Transformation & Output Engine
 */

export const OUTPUT_FORMAT_IDS = {
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  EXECUTIVE_SUMMARY: 'executive-summary',
  ADVISORY: 'advisory',
  INFOGRAPHIC: 'infographic',
  PRESENTATION: 'presentation',
  VIDEO_SCRIPT: 'video-script'
};

export const TARGET_AUDIENCES = [
  'General Public',
  'Students',
  'Professionals',
  'Executives',
  'Researchers',
  'Developers',
  'Customers',
  'Policy Makers',
  'Employees',
  'Technical Audience'
];

export const TRANSFORMATION_TONES = [
  'Professional',
  'Formal',
  'Informative',
  'Conversational',
  'Persuasive',
  'Technical',
  'Academic',
  'Friendly',
  'Neutral',
  'Urgent'
];

export const TRANSFORMATION_LANGUAGES = [
  { id: 'English', label: 'English', flag: '🇬🇧', code: 'en' },
  { id: 'Hindi', label: 'Hindi (हिंदी)', flag: '🇮🇳', code: 'hi' },
  { id: 'Marathi', label: 'Marathi (मराठी)', flag: '🇮🇳', code: 'mr' }
];

export const DETAIL_LEVELS = {
  CONCISE: 'Concise',
  BALANCED: 'Balanced',
  DETAILED: 'Detailed'
};

export const COMMUNICATION_OBJECTIVES = [
  'Inform',
  'Educate',
  'Announce',
  'Explain',
  'Persuade',
  'Advise',
  'Promote',
  'Summarize',
  'Engage'
];

export const CONTENT_STYLES = [
  'Plain Text',
  'Structured',
  'Bullet Points',
  'Professional',
  'Storytelling',
  'Executive',
  'Technical',
  'Social Media'
];

export const OUTPUT_STATUSES = {
  GENERATED: 'generated',
  ERROR: 'error',
  NEEDS_REGENERATION: 'needs_regeneration'
};

/**
 * Creates the structured Transformation Request Contract specified in Section 7.
 * @param {object} params
 * @returns {object}
 */
export function createTransformationRequest({
  transformationId,
  source = {},
  analysis = {},
  configuration = {},
  requestedOutputs = [],
  createdAt
}) {
  return {
    transformationId: transformationId || `trans-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,

    source: {
      sourceId: source.sourceId || 'src-unknown',
      sourceType: source.sourceType || 'text',
      fileName: source.fileName || null,
      rawText: source.rawText || source.extractedText || '',
      extractedText: source.extractedText || source.rawText || ''
    },

    analysis: {
      analysisId: analysis.analysisId || 'ana-unknown',
      overview: analysis.overview || {},
      intent: analysis.intent || {},
      language: analysis.language || {},
      tone: analysis.tone || {},
      audience: analysis.audience || {},
      keyFacts: Array.isArray(analysis.keyFacts) ? analysis.keyFacts : [],
      entities: analysis.entities || {},
      topics: Array.isArray(analysis.topics) ? analysis.topics : [],
      keywords: analysis.keywords || {},
      importantDates: Array.isArray(analysis.importantDates) ? analysis.importantDates : [],
      importantNumbers: Array.isArray(analysis.importantNumbers) ? analysis.importantNumbers : [],
      claims: Array.isArray(analysis.claims) ? analysis.claims : [],
      urgency: analysis.urgency || {}
    },

    configuration: {
      targetAudience: Array.isArray(configuration.targetAudience) 
        ? configuration.targetAudience 
        : [configuration.targetAudience || 'General Public'],
      tone: configuration.tone || 'Informative',
      language: configuration.language || 'English',
      detailLevel: configuration.detailLevel || DETAIL_LEVELS.BALANCED,
      objective: configuration.objective || 'Inform',
      contentStyle: configuration.contentStyle || 'Structured'
    },

    requestedOutputs: Array.isArray(requestedOutputs) && requestedOutputs.length > 0
      ? requestedOutputs
      : [OUTPUT_FORMAT_IDS.LINKEDIN, OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY],

    createdAt: createdAt || new Date().toISOString()
  };
}

/**
 * Creates a single generated output item conforming to Section 22 contract.
 * @param {object} params
 * @returns {object}
 */
export function createOutputItem({
  outputId,
  transformationId,
  format,
  status = OUTPUT_STATUSES.GENERATED,
  content = {},
  metadata = {}
}) {
  return {
    outputId: outputId || `out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    transformationId: transformationId || 'trans-unknown',
    format: format || 'unknown',
    status: status,
    content: content,
    metadata: {
      provider: metadata.provider || 'DeterministicFallback',
      isFallback: metadata.isFallback ?? true,
      reason: metadata.reason || null,
      generatedAt: metadata.generatedAt || new Date().toISOString(),
      isEdited: metadata.isEdited || false,
      wordCount: typeof metadata.wordCount === 'number' ? metadata.wordCount : 0,
      charCount: typeof metadata.charCount === 'number' ? metadata.charCount : 0,
      errorReason: metadata.errorReason || null
    }
  };
}

/**
 * Creates the structured Module 3 Data Contract specified in Section 22.
 * Prepared for consumption by Module 4 and Module 5.
 * @param {object} params
 * @returns {object}
 */
export function createTransformationResult({
  transformationId,
  sourceId,
  analysisId,
  configuration = {},
  outputs = [],
  createdAt
}) {
  return {
    transformationId: transformationId || `trans-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceId: sourceId || 'src-unknown',
    analysisId: analysisId || 'ana-unknown',

    configuration: {
      targetAudience: Array.isArray(configuration.targetAudience)
        ? configuration.targetAudience
        : [configuration.targetAudience || 'General Public'],
      tone: configuration.tone || 'Informative',
      language: configuration.language || 'English',
      detailLevel: configuration.detailLevel || DETAIL_LEVELS.BALANCED,
      objective: configuration.objective || 'Inform',
      contentStyle: configuration.contentStyle || 'Structured'
    },

    outputs: Array.isArray(outputs) ? outputs : [],

    createdAt: createdAt || new Date().toISOString()
  };
}
