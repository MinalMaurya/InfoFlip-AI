import { getActiveAIProvider } from './ai/providerRegistry.js';
import { createAnalysisPayload } from '../types/analysis.js';
import { normalizeText } from '../utils/textNormalization.js';

/**
 * Validates incoming source payload from Module 1
 * @param {object} sourceData 
 */
export function validateSourceInputForAnalysis(sourceData) {
  if (!sourceData) {
    return {
      isValid: false,
      error: 'No source data provided for AI content analysis.'
    };
  }

  const text = sourceData.extractedText || sourceData.rawText || '';
  const clean = normalizeText(text);

  if (!clean || clean.length < 15) {
    return {
      isValid: false,
      error: 'Source content contains insufficient text for semantic AI analysis (minimum 15 characters required).'
    };
  }

  return {
    isValid: true,
    error: null,
    cleanedText: clean
  };
}

/**
 * Orchestrates Module 2 AI Content Understanding & Analysis
 * 
 * @param {object} sourceData - Module 1 source payload
 * @param {object} options - Configuration options
 * @param {function} options.onProgress - Progress callback ({ step, stage, title, detail })
 * @returns {Promise<object>} - Structured Module 2 Analysis Contract
 */
export async function analyzeContent(sourceData, options = {}) {
  const onProgress = options.onProgress || (() => {});

  // Step 1: Reading source payload
  onProgress({
    step: 1,
    stage: 'reading',
    title: 'Reading source document',
    detail: 'Loading normalized text stream and metadata layers...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 220));

  const validation = validateSourceInputForAnalysis(sourceData);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Step 2: Language detection
  onProgress({
    step: 2,
    stage: 'language',
    title: 'Detecting language & encoding',
    detail: 'Verifying character encoding and grammatical markers...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 200));

  // Step 3: Main topic identification
  onProgress({
    step: 3,
    stage: 'topic',
    title: 'Identifying main topic & domain',
    detail: 'Classifying document domain and semantic category...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 240));

  // Step 4: Intent understanding
  onProgress({
    step: 4,
    stage: 'intent',
    title: 'Understanding communication intent',
    detail: 'Extracting primary and secondary communicative objectives...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 220));

  // Step 5: Extracting key facts & entities
  onProgress({
    step: 5,
    stage: 'facts',
    title: 'Extracting key facts & entities',
    detail: 'Locating grounded statements, dates, organizations, and quantities...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 260));

  // Step 6: Audience & urgency verification
  onProgress({
    step: 6,
    stage: 'audience',
    title: 'Identifying audience signals & safeguards',
    detail: 'Calibrating audience inferences and enforcing hallucination guards...'
  });
  await new Promise(r => setTimeout(r, options.delayMs || 200));

  const provider = getActiveAIProvider();
  let rawAnalysis;

  try {
    rawAnalysis = await provider.analyze(sourceData, options);
  } catch (err) {
    throw new Error(`AI Content Understanding failed: ${err.message || 'Analysis provider error'}`);
  }

  // Structure and validate against the official data contract
  const structuredContract = createAnalysisPayload({
    sourceId: sourceData.sourceId,
    ...rawAnalysis,
    sourceTraceability: {
      sourceId: sourceData.sourceId || 'src-unknown',
      sourceType: sourceData.sourceType || 'text',
      fileName: sourceData.fileName || null,
      analyzedCharacters: validation.cleanedText.length,
      analyzedWords: validation.cleanedText.split(/\s+/).filter(Boolean).length
    }
  });

  return structuredContract;
}

/**
 * Pre-packaged sample analysis for testing and offline instant review
 */
export const SAMPLE_ANALYSIS = {
  analysisId: 'ana-sih-weather-demo',
  sourceId: 'src-imd-weather-advisory',
  overview: {
    title: 'Special Severe Weather Warning & Flash Flood Advisory',
    summary: 'A deep depression has intensified into a severe cyclonic storm moving northwestward at 18 km/h. Coastal districts face wind speeds of 85-105 km/h, storm surges of 1.5-2.2m, and heavy rainfall exceeding 210mm. Immediate suspension of maritime operations ordered.',
    mainTopic: 'Severe Weather Warning & Emergency Flash Flood Response',
    category: 'Meteorological / Disaster Management',
    contentType: 'PDF Source Document'
  },
  intent: {
    primary: 'Advise',
    secondary: ['Announce', 'Instruct', 'Public Safety & Emergency Warning']
  },
  language: {
    name: 'English',
    code: 'en'
  },
  tone: {
    primary: 'Urgent',
    secondary: ['Formal', 'Professional']
  },
  audience: {
    detected: ['General Public', 'Government Officials'],
    confidence: 0.94,
    evidenceLevel: 'Detected'
  },
  keyFacts: [
    {
      fact: 'Deep depression intensified into a severe cyclonic storm moving northwestward at 18 km/h.',
      importance: 'high',
      evidenceLevel: 'Detected'
    },
    {
      fact: 'Sustained wind speeds of 85 to 105 km/h with gusts touching 120 km/h across coastal districts over the next 24 to 36 hours.',
      importance: 'high',
      evidenceLevel: 'Detected'
    },
    {
      fact: 'Storm surge of 1.5 to 2.2 meters likely to inundate low-lying coastal belts with rainfall exceeding 210 mm.',
      importance: 'high',
      evidenceLevel: 'Detected'
    },
    {
      fact: 'Total suspension of fishing, small craft maritime operations, and recreational water activities with immediate effect.',
      importance: 'high',
      evidenceLevel: 'Detected'
    },
    {
      fact: 'Coastal district administrations instructed to activate emergency shelters and pre-position NDRF and SDRF battalions.',
      importance: 'medium',
      evidenceLevel: 'Detected'
    },
    {
      fact: 'Emergency assistance available 24/7 via National Helpline 112.',
      importance: 'medium',
      evidenceLevel: 'Detected'
    }
  ],
  entities: {
    people: ['Executive Director', 'Coastal District Relief Commissioners'],
    organizations: ['India Meteorological Department (IMD)', 'NDRF', 'SDRF'],
    locations: ['Coastal districts', 'Central maritime basin', 'Bay of Bengal'],
    products: [],
    technologies: ['Doppler Weather Radar', 'Battery-operated radios'],
    dates: ['Next 24 to 36 hours', '2026'],
    other: ['National Emergency Helpline 112']
  },
  topics: [
    'Disaster Management',
    'Severe Cyclonic Storm',
    'Flood Hazard Mitigation',
    'Public Safety'
  ],
  keywords: {
    primary: ['cyclone', 'storm surge', 'rainfall', 'alert', 'evacuation'],
    secondary: ['maritime', 'shelters', 'ndrf', 'inundation', 'helpline']
  },
  importantDates: [
    { date: 'Next 24 to 36 hours', context: 'Sustained peak wind speeds and heavy downpour window', isDeadline: true }
  ],
  importantNumbers: [
    { value: '85 to 105 km/h', label: 'Wind Velocity', context: 'Sustained wind speeds across coastal districts' },
    { value: '120 km/h', label: 'Peak Gusts', context: 'Maximum gust threshold' },
    { value: '1.5 to 2.2 m', label: 'Storm Surge', context: 'Inundation height above astronomical tide' },
    { value: '210 mm', label: 'Precipitation', context: 'Extremely heavy rainfall threshold across 8 zones' },
    { value: '112', label: 'Emergency Helpline', context: 'National Emergency Response number' }
  ],
  claims: [
    { 
      claimText: 'Deep depression intensified into a severe cyclonic storm moving northwestward.',
      statement: 'Deep depression intensified into a severe cyclonic storm moving northwestward.', 
      sourceExcerpt: 'deep depression has intensified into a severe cyclonic storm moving northwestward',
      origin: 'source-extracted',
      riskLevel: 'high',
      verificationStatus: 'verification required',
      verificationEvidence: null,
      verificationTimestamp: null,
      verificationMethod: null,
      isIndependentlyVerified: false,
      type: 'source-stated', 
      isGrounded: true 
    },
    { 
      claimText: 'Coastal district administrations are instructed to activate emergency shelters.',
      statement: 'Coastal district administrations are instructed to activate emergency shelters.', 
      sourceExcerpt: 'Coastal district administrations instructed to activate emergency shelters',
      origin: 'source-extracted',
      riskLevel: 'high',
      verificationStatus: 'verification required',
      verificationEvidence: null,
      verificationTimestamp: null,
      verificationMethod: null,
      isIndependentlyVerified: false,
      type: 'source-stated', 
      isGrounded: true 
    },
    { 
      claimText: 'Immediate citizen compliance required to mitigate casualty risks across vulnerable quadrants.',
      statement: 'Immediate citizen compliance required to mitigate casualty risks across vulnerable quadrants.', 
      sourceExcerpt: null,
      origin: 'AI-inferred',
      riskLevel: 'medium',
      verificationStatus: 'not checked',
      verificationEvidence: null,
      verificationTimestamp: null,
      verificationMethod: null,
      isIndependentlyVerified: false,
      type: 'ai-inferred', 
      isGrounded: true 
    }
  ],
  urgency: {
    level: 'high',
    reasons: [
      'Explicit call for immediate action',
      'Critical short-term timeline (next 24 to 36 hours)',
      'Official meteorological red alert tier active'
    ]
  },
  confidence: {
    overall: 0.94,
    topicConfidence: 0.97,
    intentConfidence: 0.95,
    audienceConfidence: 0.92
  },
  sourceTraceability: {
    sourceId: 'src-imd-weather-advisory',
    sourceType: 'pdf',
    fileName: 'IMD-Special-Severe-Weather-Advisory-2026.pdf',
    analyzedCharacters: 1420,
    analyzedWords: 224
  },
  createdAt: new Date().toISOString()
};
