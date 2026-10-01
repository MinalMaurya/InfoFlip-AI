import { 
  validateSourceInputForAnalysis, 
  analyzeContent, 
  SAMPLE_ANALYSIS 
} from '../services/analysisService.js';
import { 
  createAnalysisPayload, 
  ANALYSIS_CATEGORIES, 
  ANALYSIS_INTENTS, 
  ANALYSIS_TONES, 
  URGENCY_LEVELS, 
  EVIDENCE_LEVELS 
} from '../types/analysis.js';
import { 
  isStatementGrounded, 
  determineEvidenceLevel, 
  validateClaims, 
  filterGroundedEntities 
} from '../utils/hallucinationGuard.js';
import { DeterministicNLPProvider } from '../services/ai/deterministicNLPProvider.js';
import { createSourcePayload } from '../types/source.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n========================================');
console.log('🧪 RUNNING MODULE 2 VERIFICATION SUITE');
console.log('========================================\n');

// SUITE 1: INPUT VALIDATION (Module 1 Source Payload)
console.log('--- Suite 1: Input Validation ---');
{
  // 1.1 Null / Undefined source
  const resNull = validateSourceInputForAnalysis(null);
  assert(!resNull.isValid, 'Rejects null source payload');
  assert(resNull.error.includes('No source data'), 'Returns friendly missing source error');

  // 1.2 Empty text payload
  const emptySource = createSourcePayload({
    sourceType: 'text',
    rawText: '   '
  });
  const resEmpty = validateSourceInputForAnalysis(emptySource);
  assert(!resEmpty.isValid, 'Rejects empty text payload');

  // 1.3 Very short text (< 15 characters)
  const shortSource = createSourcePayload({
    sourceType: 'text',
    rawText: 'Too short text'
  });
  const resShort = validateSourceInputForAnalysis(shortSource);
  assert(!resShort.isValid, 'Rejects source text shorter than 15 characters');
  assert(resShort.error.includes('minimum 15 characters'), 'Error specifies 15 character threshold');

  // 1.4 Valid structured source payload
  const validSource = createSourcePayload({
    sourceType: 'pdf',
    fileName: 'weather_report.pdf',
    extractedText: 'Cyclone storm alert issued for coastal districts. Immediate suspension of fishing required.'
  });
  const resValid = validateSourceInputForAnalysis(validSource);
  assert(resValid.isValid, 'Accepts valid structured Module 1 source payload');
  assert(resValid.cleanedText.length > 50, 'Cleans and normalizes extracted source text');
}

// SUITE 2: HALLUCINATION SAFEGUARDS & GROUNDING
console.log('\n--- Suite 2: Hallucination Safeguards & Grounding ---');
{
  const sourceText = 'India Meteorological Department issued a red alert for coastal districts with sustained wind speeds of 105 km/h over the next 24 hours.';

  // 2.1 Statement Grounding Check
  const groundedStatement = 'sustained wind speeds of 105 km/h';
  assert(isStatementGrounded(groundedStatement, sourceText), 'Confirms grounded statement is present in source');

  const hallucinatedStatement = 'All airports in Mumbai and Delhi have been closed until Tuesday next week.';
  assert(!isStatementGrounded(hallucinatedStatement, sourceText), 'Detects ungrounded / hallucinated statement');

  // 2.2 Evidence Level Categorization
  assert(
    determineEvidenceLevel('105 km/h', sourceText) === EVIDENCE_LEVELS.DETECTED,
    'Classifies verbatim source token as Detected'
  );
  assert(
    determineEvidenceLevel('Maritime Operators', sourceText) === EVIDENCE_LEVELS.INFERRED,
    'Classifies semantic inference as Inferred'
  );
  assert(
    determineEvidenceLevel('Not detected', sourceText) === EVIDENCE_LEVELS.NOT_DETECTED,
    'Preserves Not detected status for unknown signals'
  );

  // 2.3 Claims Demotion & Separation
  const inputClaims = [
    { statement: 'Sustained wind speeds of 105 km/h over the next 24 hours.', type: 'source-stated' },
    { statement: 'Global aviation routes are completely cancelled indefinitely.', type: 'source-stated' }
  ];
  const validatedClaims = validateClaims(inputClaims, sourceText);
  assert(validatedClaims[0].type === 'source-stated', 'Maintains source-stated type for verified grounded claims');
  assert(validatedClaims[1].type === 'ai-inferred', 'Demotes ungrounded claim from source-stated to ai-inferred');
  assert(!validatedClaims[1].isGrounded, 'Marks ungrounded claim as isGrounded: false');

  // 2.4 Entity Grounding Filter
  const mixedEntities = ['India Meteorological Department', '105 km/h', 'NASA Mars Rover', 'Amazon Alexa'];
  const groundedEntities = filterGroundedEntities(mixedEntities, sourceText);
  assert(groundedEntities.includes('India Meteorological Department'), 'Retains grounded entities');
  assert(!groundedEntities.includes('NASA Mars Rover'), 'Filters out hallucinated entity (NASA Mars Rover)');
  assert(!groundedEntities.includes('Amazon Alexa'), 'Filters out hallucinated entity (Amazon Alexa)');
}

// SUITE 3: DETERMINISTIC NLP ENGINE & ANALYSIS ACCURACY
console.log('\n--- Suite 3: Deterministic NLP Engine ---');
{
  const nlpProvider = new DeterministicNLPProvider();

  // 3.1 Weather advisory source
  const weatherSource = {
    sourceId: 'src-test-weather',
    sourceType: 'pdf',
    fileName: 'IMD_Advisory.pdf',
    extractedText: 'URGENT METEOROLOGICAL ALERT: Severe cyclonic storm approaching coastal districts at 18 km/h with 105 km/h winds and heavy rainfall exceeding 210mm. Immediate suspension of maritime operations. Emergency helpline 112 is active.'
  };

  const weatherAnalysis = await nlpProvider.analyze(weatherSource);
  assert(weatherAnalysis.overview.category === 'Meteorological / Disaster Management', 'Correctly classifies weather domain');
  assert(weatherAnalysis.intent.primary === 'Advise', 'Identifies primary intent as Advise');
  assert(weatherAnalysis.urgency.level === 'high', 'Detects high urgency due to immediate storm alert');
  assert(weatherAnalysis.urgency.reasons.length > 0, 'Provides grounded reasons for high urgency');
  assert(weatherAnalysis.importantNumbers.some(n => n.value.includes('105')), 'Extracts 105 km/h wind figure');
  assert(weatherAnalysis.importantNumbers.some(n => n.value.includes('112')), 'Extracts 112 emergency helpline number');
  assert(weatherAnalysis.claims.length >= 2, 'Generates separated claims array');

  // 3.2 Cyber security source
  const cyberSource = {
    sourceId: 'src-test-cyber',
    sourceType: 'text',
    rawText: 'SECURITY PROTOCOL DIRECTIVE: Critical phishing campaign detected targeting corporate passwords. Multi-factor authentication (MFA) is mandatory for all employee accounts before Friday 5:00 PM.'
  };

  const cyberAnalysis = await nlpProvider.analyze(cyberSource);
  assert(cyberAnalysis.overview.category === 'Technology', 'Correctly classifies cyber security as Technology domain');
  assert(cyberAnalysis.intent.primary === 'Instruct', 'Identifies directive intent as Instruct');
  assert(weatherAnalysis.tone.primary === 'Urgent' || weatherAnalysis.tone.primary === 'Informative', 'Assigns valid primary tone');
}

// SUITE 4: DATA CONTRACT SCHEMA COMPLIANCE (Section 5)
console.log('\n--- Suite 4: Data Contract Schema Compliance ---');
{
  const samplePayload = createAnalysisPayload({
    sourceId: 'src-sample-test',
    overview: {
      title: 'Official Municipal Water Quality Directive',
      summary: 'Municipal authorities declare routine pipeline maintenance.',
      mainTopic: 'Municipal Water Quality',
      category: 'Government'
    },
    intent: {
      primary: 'Inform',
      secondary: ['Announce']
    },
    language: {
      name: 'English',
      code: 'en'
    },
    tone: {
      primary: 'Formal',
      secondary: ['Informative']
    },
    audience: {
      detected: ['General Public', 'Residents'],
      confidence: 0.91,
      evidenceLevel: EVIDENCE_LEVELS.DETECTED
    },
    keyFacts: [
      { fact: 'Water supply suspended between 2:00 PM and 6:00 PM.', importance: 'high' }
    ],
    entities: {
      organizations: ['Municipal Corporation'],
      locations: ['Zone 4']
    },
    topics: ['Water Maintenance', 'Infrastructure'],
    keywords: {
      primary: ['water', 'maintenance'],
      secondary: ['pipeline', 'supply']
    },
    importantDates: [
      { date: 'Friday', context: 'Maintenance window', isDeadline: false }
    ],
    importantNumbers: [
      { value: '4 hours', label: 'Duration', context: 'Expected shutoff period' }
    ],
    claims: [
      { statement: 'Water supply will pause for 4 hours.', type: 'source-stated' }
    ],
    urgency: {
      level: 'medium',
      reasons: ['Advance scheduled utility disruption']
    },
    confidence: {
      overall: 0.93,
      topicConfidence: 0.95,
      intentConfidence: 0.92,
      audienceConfidence: 0.88
    },
    sourceTraceability: {
      sourceId: 'src-sample-test',
      sourceType: 'text',
      analyzedCharacters: 450,
      analyzedWords: 68
    }
  });

  // Verify all top-level keys
  assert(samplePayload.analysisId.startsWith('ana-'), 'analysisId has proper ana- prefix');
  assert(samplePayload.sourceId === 'src-sample-test', 'sourceId is linked correctly');
  assert(typeof samplePayload.overview === 'object', 'overview object exists');
  assert(ANALYSIS_CATEGORIES.includes(samplePayload.overview.category), 'category is a member of ANALYSIS_CATEGORIES');
  assert(typeof samplePayload.intent === 'object', 'intent object exists');
  assert(ANALYSIS_INTENTS.includes(samplePayload.intent.primary), 'primary intent is a member of ANALYSIS_INTENTS');
  assert(typeof samplePayload.language === 'object', 'language object exists');
  assert(typeof samplePayload.tone === 'object', 'tone object exists');
  assert(ANALYSIS_TONES.includes(samplePayload.tone.primary), 'tone is a member of ANALYSIS_TONES');
  assert(typeof samplePayload.audience === 'object', 'audience object exists');
  assert(Array.isArray(samplePayload.audience.detected), 'audience.detected is an array');
  assert(Array.isArray(samplePayload.keyFacts), 'keyFacts is an array');
  assert(samplePayload.keyFacts[0].importance === 'high', 'keyFacts item maintains importance badge');
  assert(typeof samplePayload.entities === 'object', 'entities object exists');
  assert(Array.isArray(samplePayload.entities.organizations), 'entities.organizations is an array');
  assert(Array.isArray(samplePayload.topics), 'topics is an array');
  assert(typeof samplePayload.keywords === 'object', 'keywords object exists');
  assert(Array.isArray(samplePayload.importantDates), 'importantDates is an array');
  assert(Array.isArray(samplePayload.importantNumbers), 'importantNumbers is an array');
  assert(Array.isArray(samplePayload.claims), 'claims is an array');
  assert(samplePayload.claims[0].type === 'source-stated', 'claims item distinguishes source-stated');
  assert(typeof samplePayload.urgency === 'object', 'urgency object exists');
  assert(Object.values(URGENCY_LEVELS).includes(samplePayload.urgency.level), 'urgency level is valid');
  assert(typeof samplePayload.confidence === 'object', 'confidence object exists');
  assert(typeof samplePayload.confidence.overall === 'number', 'confidence overall is numeric');
  assert(typeof samplePayload.sourceTraceability === 'object', 'sourceTraceability object exists');
  assert(Boolean(samplePayload.createdAt), 'createdAt timestamp is generated');
}

// SUITE 5: ANALYSIS PIPELINE PROGRESSION & SAMPLES
console.log('\n--- Suite 5: Analysis Pipeline Progression ---');
{
  const stepsEncountered = [];
  const validSource = {
    sourceId: 'src-flow-test',
    sourceType: 'text',
    rawText: 'Notice for all researchers: Laboratory equipment maintenance scheduled for 10:00 AM tomorrow.'
  };

  const analysisResult = await analyzeContent(validSource, {
    delayMs: 1, // rapid execution for test runner
    onProgress: (prog) => {
      stepsEncountered.push(prog.step);
    }
  });

  assert(stepsEncountered.length === 6, `Emits all 6 pipeline progress stages (got ${stepsEncountered.length})`);
  assert(stepsEncountered[0] === 1 && stepsEncountered[5] === 6, 'Stages sequence in order from 1 to 6');
  assert(analysisResult.analysisId.length > 0, 'Pipeline produces valid analysisId');
  assert(analysisResult.sourceTraceability.analyzedCharacters > 0, 'Records analyzed character count');

  // Verify Preloaded Sample Analysis integrity
  assert(SAMPLE_ANALYSIS.analysisId === 'ana-sih-weather-demo', 'SAMPLE_ANALYSIS has fixed id');
  assert(SAMPLE_ANALYSIS.keyFacts.length >= 6, 'SAMPLE_ANALYSIS contains rich key facts');
  assert(SAMPLE_ANALYSIS.importantNumbers.length >= 5, 'SAMPLE_ANALYSIS contains rich metrics');
  assert(SAMPLE_ANALYSIS.claims.some(c => c.type === 'ai-inferred'), 'SAMPLE_ANALYSIS illustrates ai-inferred claim');
}

console.log('\n========================================');
console.log(`MODULE 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
