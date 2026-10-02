import { 
  transformContent, 
  validateTransformationRequest, 
  regenerateSingleOutput 
} from '../services/transformation/transformationService.js';
import { 
  createTransformationRequest, 
  createTransformationResult,
  createOutputItem,
  OUTPUT_FORMAT_IDS,
  TARGET_AUDIENCES,
  TRANSFORMATION_TONES,
  TRANSFORMATION_LANGUAGES,
  DETAIL_LEVELS,
  COMMUNICATION_OBJECTIVES,
  CONTENT_STYLES,
  OUTPUT_STATUSES
} from '../types/transformation.js';
import { 
  getAllOutputFormats, 
  getOutputFormatById, 
  OUTPUT_FORMAT_REGISTRY 
} from '../services/transformation/outputFormatRegistry.js';
import { validateOutput } from '../services/transformation/transformationValidator.js';
import { DeterministicTransformer } from '../services/transformation/deterministicTransformer.js';
import { GeminiAIProvider } from '../services/ai/geminiProvider.js';
import { DeterministicNLPProvider } from '../services/ai/deterministicNLPProvider.js';
import { SAMPLE_ANALYSIS } from '../services/analysisService.js';

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
console.log('🧪 RUNNING MODULE 3 VERIFICATION SUITE');
console.log('========================================\n');

// SUITE 1: USER CONFIGURATION & OPTIONS
console.log('--- Suite 1: User Configuration & Parameter Validation ---');
{
  assert(TARGET_AUDIENCES.includes('General Public'), 'Target audiences include General Public');
  assert(TARGET_AUDIENCES.includes('Executives'), 'Target audiences include Executives');
  assert(TARGET_AUDIENCES.includes('Developers'), 'Target audiences include Developers');
  assert(TARGET_AUDIENCES.includes('Technical Audience'), 'Target audiences include Technical Audience');
  assert(TRANSFORMATION_TONES.includes('Professional'), 'Transformation tones include Professional');
  assert(TRANSFORMATION_TONES.includes('Urgent'), 'Transformation tones include Urgent');
  assert(TRANSFORMATION_LANGUAGES.some(l => l.id === 'English'), 'Supports English language');
  assert(TRANSFORMATION_LANGUAGES.some(l => l.id === 'Hindi'), 'Supports Hindi language');
  assert(TRANSFORMATION_LANGUAGES.some(l => l.id === 'Marathi'), 'Supports Marathi language');
  assert(DETAIL_LEVELS.CONCISE === 'Concise', 'Supports Concise detail level');
  assert(DETAIL_LEVELS.BALANCED === 'Balanced', 'Supports Balanced detail level');
  assert(DETAIL_LEVELS.DETAILED === 'Detailed', 'Supports Detailed detail level');
  assert(COMMUNICATION_OBJECTIVES.includes('Inform'), 'Supports Inform objective');
  assert(COMMUNICATION_OBJECTIVES.includes('Advise'), 'Supports Advise objective');
  assert(CONTENT_STYLES.includes('Structured'), 'Supports Structured style');
}

// SUITE 2: OUTPUT FORMAT REGISTRY
console.log('\n--- Suite 2: Output Format Registry ---');
{
  const allFormats = getAllOutputFormats();
  assert(allFormats.length === 7, `Registry contains all 7 formats (found ${allFormats.length})`);

  const expectedIds = [
    OUTPUT_FORMAT_IDS.LINKEDIN,
    OUTPUT_FORMAT_IDS.TWITTER,
    OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
    OUTPUT_FORMAT_IDS.ADVISORY,
    OUTPUT_FORMAT_IDS.INFOGRAPHIC,
    OUTPUT_FORMAT_IDS.PRESENTATION,
    OUTPUT_FORMAT_IDS.VIDEO_SCRIPT
  ];

  for (const id of expectedIds) {
    const def = getOutputFormatById(id);
    assert(def !== null, `Format definition exists for "${id}"`);
    assert(typeof def.name === 'string' && def.name.length > 0, `Format "${id}" has a valid display name`);
    assert(typeof def.promptInstructions === 'string' && def.promptInstructions.length > 20, `Format "${id}" contains prompt instructions`);
    assert(typeof def.expectedStructure === 'object', `Format "${id}" defines expected structure`);
  }
}

// SUITE 3: TRANSFORMATION REQUEST VALIDATION & CONTRACTS
console.log('\n--- Suite 3: Transformation Request Validation ---');
{
  // 3.1 Null request
  const nullCheck = validateTransformationRequest(null);
  assert(!nullCheck.isValid, 'Rejects null transformation request');

  // 3.2 Missing source
  const noSourceCheck = validateTransformationRequest({
    source: { rawText: '  ' },
    analysis: { analysisId: 'ana-123' },
    requestedOutputs: ['linkedin']
  });
  assert(!noSourceCheck.isValid, 'Rejects request with empty source text');
  assert(noSourceCheck.error.includes('No source content available'), 'Returns friendly missing source error');

  // 3.3 Missing analysis
  const noAnalysisCheck = validateTransformationRequest({
    source: { rawText: 'This is a valid source report exceeding 15 characters.' },
    analysis: null,
    requestedOutputs: ['linkedin']
  });
  assert(!noAnalysisCheck.isValid, 'Rejects request without Module 2 analysis');
  assert(noAnalysisCheck.error.includes('Content understanding is required'), 'Returns friendly missing analysis error');

  // 3.4 Missing requested outputs
  const noOutputsCheck = validateTransformationRequest({
    source: { rawText: 'This is a valid source report exceeding 15 characters.' },
    analysis: { analysisId: 'ana-123' },
    requestedOutputs: []
  });
  assert(!noOutputsCheck.isValid, 'Rejects request with no selected output formats');
  assert(noOutputsCheck.error.includes('Select at least one output format'), 'Returns friendly missing format error');

  // 3.5 Valid request
  const validCheck = validateTransformationRequest({
    source: { rawText: 'This is a valid source report exceeding 15 characters.' },
    analysis: { analysisId: 'ana-123' },
    requestedOutputs: ['linkedin', 'presentation']
  });
  assert(validCheck.isValid, 'Accepts valid transformation request');

  // 3.6 Request contract factory
  const contract = createTransformationRequest({
    source: { sourceId: 'src-test-01', rawText: 'Test text exceeding threshold.' },
    analysis: { analysisId: 'ana-test-01' },
    configuration: { targetAudience: 'Executives', tone: 'Formal' },
    requestedOutputs: ['executive-summary']
  });
  assert(contract.transformationId.startsWith('trans-'), 'Generates unique transformationId with trans- prefix');
  assert(contract.source.sourceId === 'src-test-01', 'Preserves sourceId');
  assert(contract.analysis.analysisId === 'ana-test-01', 'Preserves analysisId');
  assert(Array.isArray(contract.configuration.targetAudience), 'Normalizes targetAudience to array');
  assert(contract.createdAt.length > 0, 'Includes createdAt timestamp');
}

// SUITE 4: FORMAT-SPECIFIC STRUCTURAL VALIDATION
console.log('\n--- Suite 4: Format-Specific Structural Validation ---');
{
  // 4.1 LinkedIn
  assert(!validateOutput('linkedin', null).isValid, 'Rejects null LinkedIn content');
  assert(!validateOutput('linkedin', { text: 'Too short' }).isValid, 'Rejects too short LinkedIn content');
  assert(validateOutput('linkedin', { text: 'A'.repeat(80) }).isValid, 'Accepts valid LinkedIn content');

  // 4.2 Twitter
  assert(!validateOutput('twitter', { posts: [] }).isValid, 'Rejects empty Twitter posts array');
  assert(validateOutput('twitter', { posts: ['Alert: Storm approaching. Dial 112 for emergency help.'] }).isValid, 'Accepts valid Twitter post');

  // 4.3 Executive Summary
  assert(!validateOutput('executive-summary', {}).isValid, 'Rejects empty Executive Summary');
  assert(validateOutput('executive-summary', {
    title: 'Executive Brief',
    executiveOverview: 'Overview statement.',
    keyPoints: ['Point 1'],
    importantFindings: ['Finding 1'],
    implications: ['Implication 1'],
    recommendedConsiderations: ['Consideration 1']
  }).isValid, 'Accepts structurally complete Executive Summary');

  // 4.4 Advisory
  assert(!validateOutput('advisory', {}).isValid, 'Rejects empty Advisory');
  assert(validateOutput('advisory', {
    title: 'Advisory Warning',
    situation: 'Storm hazard',
    keyInformation: ['Guideline 1'],
    potentialImpact: 'High',
    recommendedActions: ['Action 1'],
    importantDates: ['Tomorrow']
  }).isValid, 'Accepts structurally complete Advisory');

  // 4.5 Infographic
  assert(!validateOutput('infographic', {}).isValid, 'Rejects empty Infographic');
  assert(validateOutput('infographic', {
    title: 'Infographic',
    subtitle: 'Sub',
    sections: [{ heading: 'H', keyPoint: 'K', supportingFact: 'S' }],
    statistics: [{ value: '100%', label: 'L', context: 'C' }],
    callout: 'Banner'
  }).isValid, 'Accepts structurally complete Infographic');

  // 4.6 Presentation
  assert(!validateOutput('presentation', { title: 'T', slides: [] }).isValid, 'Rejects Presentation with empty slides');
  assert(validateOutput('presentation', {
    title: 'Presentation Deck',
    slides: [
      { slideNumber: 1, title: 'Title', purpose: 'Intro', bullets: ['Bullet 1'], speakerNotes: 'Notes' }
    ]
  }).isValid, 'Accepts structurally complete Presentation slide deck');

  // 4.7 Video Script
  assert(!validateOutput('video-script', { title: 'T', scenes: [] }).isValid, 'Rejects Video Script with empty scenes');
  assert(validateOutput('video-script', {
    title: 'Video Script',
    durationEstimate: '60s',
    scenes: [
      { sceneNumber: 1, visual: 'Fade in', narration: 'Voiceover text', onScreenText: 'Text', duration: '15s' }
    ]
  }).isValid, 'Accepts structurally complete Video Script');
}

// SUITE 5: DETERMINISTIC ENGINE & FACTUAL GROUNDING
console.log('\n--- Suite 5: Deterministic Engine & Anti-Hallucination Grounding ---');
{
  const transformer = new DeterministicTransformer();

  const testRequest = {
    transformationId: 'trans-suite-test',
    source: {
      sourceId: 'src-weather-doc',
      sourceType: 'pdf',
      fileName: 'IMD-Advisory.pdf',
      extractedText: 'Cyclone storm alert issued for coastal districts. Sustained winds of 105 km/h touching 120 km/h gusts. Rainfall exceeding 210mm. Immediate evacuation and suspension of maritime operations. Emergency helpline 112 active.'
    },
    analysis: SAMPLE_ANALYSIS,
    configuration: {
      targetAudience: ['Residents', 'Fishermen'],
      tone: 'Urgent',
      language: 'English',
      detailLevel: 'Detailed',
      objective: 'Advise',
      contentStyle: 'Structured'
    },
    requestedOutputs: [
      OUTPUT_FORMAT_IDS.LINKEDIN,
      OUTPUT_FORMAT_IDS.TWITTER,
      OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
      OUTPUT_FORMAT_IDS.ADVISORY,
      OUTPUT_FORMAT_IDS.INFOGRAPHIC,
      OUTPUT_FORMAT_IDS.PRESENTATION,
      OUTPUT_FORMAT_IDS.VIDEO_SCRIPT
    ]
  };

  const outputs = transformer.transform(testRequest);
  assert(outputs.length === 7, 'Generates all 7 requested outputs from single source');

  // 5.1 Provider transparency
  assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Correctly flags provider as DeterministicFallback');
  assert(outputs[0].metadata.isFallback === true, 'Explicitly marks isFallback: true for fallback engine');

  // 5.2 LinkedIn output check
  const linkedinOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.LINKEDIN);
  assert(linkedinOut && linkedinOut.content.headline.includes('Strategic Update'), 'LinkedIn contains professional headline hook');
  assert(linkedinOut.content.text.includes('105 km/h') || linkedinOut.content.text.includes('112'), 'LinkedIn preserves verified source figures without hallucination');

  // 5.3 Twitter thread check
  const twitterOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.TWITTER);
  assert(twitterOut && Array.isArray(twitterOut.content.posts), 'Twitter output generates posts array');
  assert(twitterOut.content.isThread === true, 'Generates multi-post thread under detailed setting');

  // 5.4 Executive Summary check
  const execOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY);
  assert(execOut.content.keyPoints.length >= 3, 'Executive summary includes grounded key points');
  assert(execOut.content.importantFindings.length >= 2, 'Executive summary includes quantitative findings');

  // 5.5 Advisory check
  const advisoryOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.ADVISORY);
  assert(advisoryOut.content.recommendedActions.length >= 3, 'Advisory contains recommended actions');
  assert(advisoryOut.content.importantDates.length >= 1, 'Advisory contains timeline/deadline window');

  // 5.6 Infographic check
  const infoOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.INFOGRAPHIC);
  assert(infoOut.content.sections.length >= 3, 'Infographic generates 3 visual sections');
  assert(infoOut.content.statistics.length >= 2, 'Infographic incorporates numeric statistics');

  // 5.7 Presentation check
  const presOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.PRESENTATION);
  assert(presOut.content.slides.length === 5, 'Presentation generates 5 sequential slides');
  assert(presOut.content.slides[0].speakerNotes.length > 0, 'Presentation slides include speaker notes');

  // 5.8 Video script check
  const videoOut = outputs.find(o => o.format === OUTPUT_FORMAT_IDS.VIDEO_SCRIPT);
  assert(videoOut.content.scenes.length === 5, 'Video script generates 5 storyboard scenes');
  assert(videoOut.content.scenes[0].visual.length > 0, 'Video scenes include visual camera cues');
  assert(videoOut.content.scenes[0].narration.length > 0, 'Video scenes include voiceover narration');

  // 5.9 Vernacular Language checks (Hindi & Marathi)
  const hindiRequest = {
    ...testRequest,
    configuration: { ...testRequest.configuration, language: 'Hindi' },
    requestedOutputs: [OUTPUT_FORMAT_IDS.LINKEDIN, OUTPUT_FORMAT_IDS.TWITTER]
  };
  const hindiOutputs = transformer.transform(hindiRequest);
  assert(hindiOutputs[0].content.text.includes('सूचना') || hindiOutputs[0].content.text.includes('दिशानिर्देश'), 'Synthesizes Hindi phrasing in LinkedIn output');

  const marathiRequest = {
    ...testRequest,
    configuration: { ...testRequest.configuration, language: 'Marathi' },
    requestedOutputs: [OUTPUT_FORMAT_IDS.LINKEDIN, OUTPUT_FORMAT_IDS.TWITTER]
  };
  const marathiOutputs = transformer.transform(marathiRequest);
  assert(marathiOutputs[0].content.text.includes('माहिती') || marathiOutputs[0].content.text.includes('सूचना'), 'Synthesizes Marathi phrasing in LinkedIn output');
}

// SUITE 6: TRANSFORMATION SERVICE PROGRESSION & SINGLE REGENERATION
console.log('\n--- Suite 6: Service Orchestrator & Partial Failure Recovery ---');
{
  const stepsEncountered = [];
  const request = {
    source: {
      sourceId: 'src-pipeline-test',
      sourceType: 'text',
      rawText: 'Emergency maintenance shutdown across main computing clusters between 2:00 AM and 4:00 AM UTC.'
    },
    analysis: SAMPLE_ANALYSIS,
    configuration: {
      targetAudience: ['Engineers'],
      tone: 'Technical',
      language: 'English',
      detailLevel: 'Concise',
      objective: 'Inform',
      contentStyle: 'Structured'
    },
    requestedOutputs: [OUTPUT_FORMAT_IDS.LINKEDIN, OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]
  };

  const result = await transformContent(request, {
    delayMs: 1, // rapid execution for testing
    onProgress: (prog) => {
      stepsEncountered.push(prog.step);
    }
  });

  assert(stepsEncountered.length === 6, `Service orchestrator emits all 6 progress steps (got ${stepsEncountered.length})`);
  assert(stepsEncountered[0] === 1 && stepsEncountered[5] === 6, 'Stages sequence in order from 1 to 6');
  assert(result.outputs.length === 2, 'Result contains both requested outputs');
  assert(result.outputs.every(o => o.status === OUTPUT_STATUSES.GENERATED), 'All outputs marked with status "generated"');
  assert(result.transformationId.startsWith('trans-'), 'Produces valid transformationId');

  // Single output regeneration without batch re-run
  const initialExec = result.outputs.find(o => o.format === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY);
  const regeneratedExec = await regenerateSingleOutput(
    request,
    initialExec.outputId,
    OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
    { delayMs: 1 }
  );

  assert(regeneratedExec.outputId === initialExec.outputId, 'Preserves outputId during single format regeneration');
  assert(regeneratedExec.status === OUTPUT_STATUSES.GENERATED, 'Regenerated output is valid');
  assert(regeneratedExec.format === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY, 'Regenerated output matches requested format');

  // AI Provider Abstraction Interface check
  const geminiProvider = new GeminiAIProvider();
  assert(typeof geminiProvider.transform === 'function', 'GeminiAIProvider implements transform() method');
  assert(typeof geminiProvider.analyze === 'function', 'GeminiAIProvider implements analyze() method');

  const deterministicProvider = new DeterministicNLPProvider();
  assert(typeof deterministicProvider.transform === 'function', 'DeterministicNLPProvider implements transform() method');
}

console.log('\n========================================');
console.log(`MODULE 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
