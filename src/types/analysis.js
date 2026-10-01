/**
 * InfoFlip-AI Analysis Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 2: AI Content Understanding & Analysis
 */

export const ANALYSIS_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Government',
  'Business',
  'Research',
  'Policy',
  'Meteorological / Disaster Management',
  'General',
  'Unknown'
];

export const ANALYSIS_INTENTS = [
  'Inform',
  'Educate',
  'Announce',
  'Explain',
  'Persuade',
  'Advise',
  'Report',
  'Instruct',
  'Promote',
  'Analyze',
  'Public Safety & Emergency Warning'
];

export const ANALYSIS_TONES = [
  'Professional',
  'Formal',
  'Informative',
  'Technical',
  'Conversational',
  'Persuasive',
  'Neutral',
  'Urgent',
  'Academic'
];

export const URGENCY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NOT_DETECTED: 'not_detected'
};

export const EVIDENCE_LEVELS = {
  DETECTED: 'Detected',       // Directly supported by source text
  INFERRED: 'Inferred',       // Reasonably inferred from semantics
  NOT_DETECTED: 'Not detected' // Insufficient evidence
};

/**
 * Creates the structured Module 2 analysis contract object specified in Section 5.
 * Prepared for consumption by Module 3 (Transformation Engine).
 */
export function createAnalysisPayload({
  analysisId,
  sourceId,
  overview = {},
  intent = {},
  language = {},
  tone = {},
  audience = {},
  keyFacts = [],
  entities = {},
  topics = [],
  keywords = {},
  importantDates = [],
  importantNumbers = [],
  claims = [],
  urgency = {},
  confidence = {},
  sourceTraceability = {},
  createdAt
}) {
  return {
    analysisId: analysisId || `ana-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceId: sourceId || 'src-unknown',

    overview: {
      title: overview.title || 'Untitled Source',
      summary: overview.summary || 'Summary unavailable.',
      mainTopic: overview.mainTopic || 'General Overview',
      category: overview.category || 'General',
      contentType: overview.contentType || 'Article / Document'
    },

    intent: {
      primary: intent.primary || 'Inform',
      secondary: Array.isArray(intent.secondary) ? intent.secondary : []
    },

    language: {
      name: language.name || 'English',
      code: language.code || 'en'
    },

    tone: {
      primary: tone.primary || 'Informative',
      secondary: Array.isArray(tone.secondary) ? tone.secondary : []
    },

    audience: {
      detected: Array.isArray(audience.detected) && audience.detected.length > 0 
        ? audience.detected 
        : ['General Public'],
      confidence: typeof audience.confidence === 'number' ? audience.confidence : 0.85,
      evidenceLevel: audience.evidenceLevel || EVIDENCE_LEVELS.INFERRED
    },

    keyFacts: Array.isArray(keyFacts) 
      ? keyFacts.map(f => ({
          fact: typeof f === 'string' ? f : f.fact,
          importance: f.importance || 'medium',
          evidenceLevel: f.evidenceLevel || EVIDENCE_LEVELS.DETECTED
        }))
      : [],

    entities: {
      people: Array.isArray(entities.people) ? entities.people : [],
      organizations: Array.isArray(entities.organizations) ? entities.organizations : [],
      locations: Array.isArray(entities.locations) ? entities.locations : [],
      products: Array.isArray(entities.products) ? entities.products : [],
      technologies: Array.isArray(entities.technologies) ? entities.technologies : [],
      dates: Array.isArray(entities.dates) ? entities.dates : [],
      other: Array.isArray(entities.other) ? entities.other : []
    },

    topics: Array.isArray(topics) ? topics : [],

    keywords: {
      primary: Array.isArray(keywords.primary) ? keywords.primary : [],
      secondary: Array.isArray(keywords.secondary) ? keywords.secondary : []
    },

    importantDates: Array.isArray(importantDates) ? importantDates : [],

    importantNumbers: Array.isArray(importantNumbers) ? importantNumbers : [],

    claims: Array.isArray(claims) ? claims.map(c => ({
      statement: typeof c === 'string' ? c : c.statement,
      type: c.type === 'ai-inferred' ? 'ai-inferred' : 'source-stated'
    })) : [],

    urgency: {
      level: urgency.level || URGENCY_LEVELS.NOT_DETECTED,
      reasons: Array.isArray(urgency.reasons) ? urgency.reasons : []
    },

    confidence: {
      overall: typeof confidence.overall === 'number' ? confidence.overall : 0.88,
      topicConfidence: typeof confidence.topicConfidence === 'number' ? confidence.topicConfidence : 0.92,
      intentConfidence: typeof confidence.intentConfidence === 'number' ? confidence.intentConfidence : 0.89,
      audienceConfidence: typeof confidence.audienceConfidence === 'number' ? confidence.audienceConfidence : 0.82
    },

    sourceTraceability: {
      sourceId: sourceTraceability.sourceId || sourceId || 'src-unknown',
      sourceType: sourceTraceability.sourceType || 'text',
      fileName: sourceTraceability.fileName || null,
      analyzedCharacters: sourceTraceability.analyzedCharacters || 0,
      analyzedWords: sourceTraceability.analyzedWords || 0
    },

    createdAt: createdAt || new Date().toISOString()
  };
}
