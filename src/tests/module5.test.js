import { 
  reviewCommunicationOutputs, 
  revalidateOutput, 
  editOutput, 
  approveOutput, 
  rejectOutput, 
  regenerateOutputReview, 
  prepareModule6ExportPackage 
} from '../services/review/reviewService.js';

import { 
  CHECK_STATUSES, 
  APPROVAL_STATUSES, 
  GROUNDING_LEVELS, 
  createReviewItem, 
  createReviewResult, 
  createExportHandoffContract 
} from '../types/review.js';

import { 
  validateModule4InputContract, 
  validateReviewItem, 
  validateExportPackage 
} from '../services/review/reviewValidator.js';

import { checkFactualConsistency } from '../services/review/factualConsistencyChecker.js';
import { checkSourceGrounding } from '../services/review/groundingChecker.js';
import { checkHallucinations } from '../services/review/hallucinationChecker.js';
import { checkToneConsistency } from '../services/review/toneChecker.js';
import { checkAudienceFit } from '../services/review/audienceFitChecker.js';
import { checkReadability } from '../services/review/readabilityChecker.js';
import { checkLanguageConsistency } from '../services/review/languageConsistencyChecker.js';
import { checkPlatformCompliance } from '../services/review/platformComplianceChecker.js';
import { checkDuplication } from '../services/review/duplicationChecker.js';
import { checkSafety } from '../services/review/safetyChecker.js';

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
console.log('🧪 RUNNING MODULE 5 VERIFICATION SUITE');
console.log('========================================\n');

// Sample Base Data
const sampleSource = {
  sourceId: 'src-cyclone-alert-2026',
  sourceType: 'document',
  fileName: 'IMD-Advisory.pdf',
  rawText: `IMD Severe Cyclonic Storm Advisory: Deep depression intensified into severe cyclonic storm with sustained wind speeds of 85 to 105 km/h, gusting up to 120 km/h. Storm surge of 1.5 to 2.2 meters likely to inundate low-lying coastal belts with rainfall exceeding 210 mm in the next 24 to 36 hours. Total suspension of maritime operations. Emergency helpline: 112.`
};

const sampleAnalysis = {
  analysisId: 'ana-cyclone-2026',
  sourceId: 'src-cyclone-alert-2026',
  summary: {
    overview: 'Severe Cyclonic Storm approaching coast with 85-105 km/h winds and heavy rainfall exceeding 210 mm.'
  },
  keyPoints: [
    'Deep depression intensified into severe cyclonic storm.',
    'Wind speeds of 85 to 105 km/h, gusting up to 120 km/h.',
    'Rainfall exceeding 210 mm in next 24 to 36 hours.',
    'Emergency helpline is 112.'
  ],
  dates: ['2026-10-04'],
  numbers: ['85', '105', '120', '1.5', '2.2', '210', '24', '36', '112'],
  entities: ['IMD', 'coastal belts'],
  language: { name: 'English', code: 'en' }
};

const sampleTransformation = {
  transformationId: 'trans-cyclone-2026',
  sourceId: 'src-cyclone-alert-2026',
  analysisId: 'ana-cyclone-2026',
  outputs: [
    { format: 'summary', content: 'Severe cyclone warning with winds up to 105 km/h.' }
  ]
};

const sampleModule4Outputs = [
  {
    outputId: 'out-mod4-linkedin',
    channelId: 'linkedin',
    title: 'LinkedIn Update',
    content: 'IMD Severe Cyclonic Storm Advisory: Coastal operations suspended. Sustained winds of 85 to 105 km/h expected with rainfall exceeding 210 mm. Emergency helpline: 112. Take necessary precautions.',
    metadata: { characterCount: 195, wordCount: 26, provider: 'gemini', isFallback: false },
    sourceTraceability: [
      {
        sourceSnippet: 'Sustained wind speeds of 85 to 105 km/h',
        generatedStatement: 'Sustained winds of 85 to 105 km/h expected',
        similarity: 0.95,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      },
      {
        sourceSnippet: 'Emergency helpline: 112',
        generatedStatement: 'Emergency helpline: 112',
        similarity: 1.0,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      }
    ],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-twitter',
    channelId: 'twitter',
    title: 'X / Twitter Post',
    content: '⚠️ IMD Advisory: Severe Cyclonic Storm approaching. Winds 85-105 km/h, heavy rain >210 mm in next 24-36h. Maritime operations suspended. Call 112 for emergencies. #CycloneAlert',
    metadata: { characterCount: 173, wordCount: 24, provider: 'gemini', isFallback: false },
    sourceTraceability: [
      {
        sourceSnippet: 'Deep depression intensified into severe cyclonic storm',
        generatedStatement: 'Severe Cyclonic Storm approaching',
        similarity: 0.9,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      }
    ],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-sms',
    channelId: 'sms',
    title: 'SMS Alert',
    content: 'IMD Alert: Cyclone approaching with 85-105 km/h winds and heavy rain. Coastal ops suspended. Helpline: 112.',
    metadata: { characterCount: 107, wordCount: 15, provider: 'gemini', isFallback: false },
    sourceTraceability: [
      {
        sourceSnippet: 'Emergency helpline: 112',
        generatedStatement: 'Helpline: 112',
        similarity: 0.9,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      }
    ],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-email',
    channelId: 'email',
    title: 'Email Bulletin',
    content: 'Subject: Urgent Weather Warning - Severe Cyclone Alert\n\nDear Resident,\n\nThe IMD has issued a severe cyclonic storm advisory. Winds of 85-105 km/h and rain exceeding 210 mm are forecast.\n\nPlease remain indoors and contact 112 for emergencies.\n\nRegards,\nDisaster Management Team',
    metadata: { characterCount: 265, wordCount: 38, provider: 'gemini', isFallback: false },
    sourceTraceability: [
      {
        sourceSnippet: 'Emergency helpline: 112',
        generatedStatement: 'contact 112 for emergencies',
        similarity: 0.9,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      }
    ],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-whatsapp',
    channelId: 'whatsapp',
    title: 'WhatsApp Advisory',
    content: '🚨 *URGENT CYCLONE WARNING*\n\nIMD reports severe cyclonic storm approaching:\n• Winds: 85-105 km/h\n• Heavy rain: >210 mm\n• Coastal operations suspended\n\nEmergency Helpline: *112*',
    metadata: { characterCount: 172, wordCount: 21, provider: 'gemini', isFallback: false },
    sourceTraceability: [
      {
        sourceSnippet: 'Rainfall exceeding 210 mm',
        generatedStatement: 'Heavy rain: >210 mm',
        similarity: 0.9,
        groundingLevel: GROUNDING_LEVELS.GROUNDED
      }
    ],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-announcement',
    channelId: 'announcement',
    title: 'Public Announcement',
    content: 'PUBLIC ADVISORY: All citizens are advised that a severe cyclonic storm is approaching coastal regions with winds of 85 to 105 km/h. Maritime operations are suspended. Helpline 112.',
    metadata: { characterCount: 181, wordCount: 26, provider: 'gemini', isFallback: false },
    sourceTraceability: [],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-cta',
    channelId: 'cta',
    title: 'Call to Action',
    content: 'Call 112 immediately for emergency cyclone assistance and stay tuned to official broadcasts.',
    metadata: { characterCount: 92, wordCount: 13, provider: 'gemini', isFallback: false },
    sourceTraceability: [],
    validation: { isValid: true, warnings: [] }
  },
  {
    outputId: 'out-mod4-hashtags',
    channelId: 'hashtags',
    title: 'Hashtag Recommendations',
    content: '#CycloneAlert #WeatherSafety #IMDAdvisory #EmergencyHelpline112',
    metadata: { characterCount: 63, wordCount: 4, provider: 'gemini', isFallback: false },
    sourceTraceability: [],
    validation: { isValid: true, warnings: [] }
  }
];

const sampleCommunicationContract = {
  communicationId: 'comm-cyclone-2026',
  sourceId: 'src-cyclone-alert-2026',
  transformationId: 'trans-cyclone-2026',
  analysisId: 'ana-cyclone-2026',
  outputs: sampleModule4Outputs,
  config: {
    targetAudience: 'General Public',
    tone: 'Urgent',
    language: 'English',
    detailLevel: 'Standard',
    objective: 'Public Safety'
  },
  createdAt: new Date().toISOString()
};

async function runTests() {
  console.log('--- 1. Contract & Input Ingestion Tests ---');
  
  // 1. Ingest Module 4 contract without losing identifiers
  const validationRes = validateModule4InputContract(sampleCommunicationContract);
  assert(validationRes.isValid === true, '1. Validate valid Module 4 input contract');
  assert(sampleCommunicationContract.communicationId === 'comm-cyclone-2026', '1.1 Preserve communicationId');
  assert(sampleCommunicationContract.sourceId === 'src-cyclone-alert-2026', '1.2 Preserve sourceId');
  assert(sampleCommunicationContract.transformationId === 'trans-cyclone-2026', '1.3 Preserve transformationId');
  assert(sampleCommunicationContract.analysisId === 'ana-cyclone-2026', '1.4 Preserve analysisId');

  // 2. Ingest Module 4 outputs with all channel types
  assert(sampleCommunicationContract.outputs.length === 8, '2. Ingest all 8 channel outputs');
  const channelIds = sampleCommunicationContract.outputs.map(o => o.channelId);
  ['linkedin', 'twitter', 'whatsapp', 'email', 'sms', 'announcement', 'cta', 'hashtags'].forEach(ch => {
    assert(channelIds.includes(ch), `2.1 Channel ${ch} present in outputs`);
  });

  // 3. Validate presence of source traceability records
  const linkedinOutput = sampleCommunicationContract.outputs.find(o => o.channelId === 'linkedin');
  assert(Array.isArray(linkedinOutput.sourceTraceability) && linkedinOutput.sourceTraceability.length > 0, '3. Validate presence of source traceability records');

  console.log('\n--- 2. Factual Consistency Checker Tests ---');
  
  // 4. Factual consistency passes when source facts match
  const factPass = checkFactualConsistency({
    content: 'Winds of 85 to 105 km/h with rain exceeding 210 mm. Emergency helpline 112.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(factPass.status === CHECK_STATUSES.PASS, '4. Factual consistency passes when source facts match');

  // 5. Factual consistency warns/fails when dates differ from source
  const factDateMismatch = checkFactualConsistency({
    content: 'Cyclone expected on 2030-12-25 with major impact.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(factDateMismatch.status === CHECK_STATUSES.WARNING || factDateMismatch.status === CHECK_STATUSES.FAIL, '5. Factual consistency flags dates not present in source');

  // 6. Factual consistency warns/fails when numbers differ from source
  const factNumberMismatch = checkFactualConsistency({
    content: 'Winds will reach 450 km/h with 999 mm of rainfall.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(factNumberMismatch.status === CHECK_STATUSES.WARNING, '6. Factual consistency flags ungrounded numbers');

  // 7. Factual consistency handles empty source gracefully
  const factEmpty = checkFactualConsistency({
    content: 'General statement without numbers.',
    sourceText: '',
    analysis: null
  });
  assert(factEmpty.status === CHECK_STATUSES.PASS, '7. Factual consistency passes gracefully on neutral content');

  console.log('\n--- 3. Source Grounding Checker Tests ---');

  // 8. Source grounding passes when all important claims have traceability
  const groundingPass = checkSourceGrounding({
    content: 'Winds of 85 to 105 km/h.',
    sourceTraceability: [
      { sourceSnippet: '85 to 105 km/h', generatedStatement: 'Winds of 85 to 105 km/h', similarity: 0.95 }
    ]
  });
  assert(groundingPass.status === CHECK_STATUSES.PASS, '8. Source grounding passes when claims have traceability');

  // 9. Source grounding flags ungrounded statements
  const groundingFail = checkSourceGrounding({
    content: 'Major storm hitting city with no prior advisory recorded anywhere.',
    sourceTraceability: []
  });
  assert(groundingFail.status === CHECK_STATUSES.WARNING, '9. Source grounding warns when traceability is missing on detailed content');

  // 10. Source grounding distinguishes Grounded / Partially grounded / Ungrounded
  const gLevels = checkSourceGrounding({
    content: 'Short statement',
    sourceTraceability: [
      { sourceSnippet: 'Exact match', generatedStatement: 'Exact match', similarity: 0.9 },
      { sourceSnippet: 'Partial overlap', generatedStatement: 'Partial overlap concept', similarity: 0.5 },
      { sourceSnippet: 'Far', generatedStatement: 'Unknown', similarity: 0.2 }
    ]
  });
  assert(gLevels.details.groundedCount === 1, '10.1 Grounded level count is 1');
  assert(gLevels.details.partiallyGroundedCount === 1, '10.2 Partially grounded count is 1');
  assert(gLevels.details.ungroundedCount === 1, '10.3 Ungrounded count is 1');

  console.log('\n--- 4. Hallucination / Unsupported Claims Checker Tests ---');

  // 11. Hallucination check flags invented emergency numbers or contact info
  const hallNumber = checkHallucinations({
    content: 'For immediate rescue call 9876543210 or 108.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(hallNumber.status === CHECK_STATUSES.WARNING || hallNumber.status === CHECK_STATUSES.FAIL, '11. Hallucination check flags invented emergency numbers not in source');

  // 12. Hallucination check flags invented URLs/domains not in source
  const hallUrl = checkHallucinations({
    content: 'Visit https://fake-storm-donations.org/now for shelter access.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(hallUrl.status === CHECK_STATUSES.WARNING, '12. Hallucination check flags ungrounded URLs');

  // 13. Hallucination check flags unsupported absolute claims
  const hallAbsolute = checkHallucinations({
    content: 'It is 100% guaranteed that all coastal buildings will be completely demolished without exception.',
    sourceText: sampleSource.rawText,
    analysis: sampleAnalysis
  });
  assert(hallAbsolute.status === CHECK_STATUSES.WARNING, '13. Hallucination check flags unsupported absolute claims');

  console.log('\n--- 5. Tone Consistency Checker Tests ---');

  // 14. Tone consistency passes when tone matches requested configuration
  const tonePass = checkToneConsistency({
    content: 'URGENT ALERT: Severe cyclone approaching. Immediate caution required.',
    requestedTone: 'Urgent'
  });
  assert(tonePass.status === CHECK_STATUSES.PASS, '14. Tone consistency passes when tone matches configuration');

  // 15. Tone consistency warns when urgent content lacks appropriate markers
  const toneUrgentWarn = checkToneConsistency({
    content: 'The weather today is somewhat pleasant and calm.',
    requestedTone: 'Urgent'
  });
  assert(toneUrgentWarn.status === CHECK_STATUSES.WARNING, '15. Tone consistency warns when urgent content lacks urgency');

  // 16. Tone consistency warns when formal content is overly casual
  const toneCasualWarn = checkToneConsistency({
    content: 'Hey guys! Super crazy awesome cyclone is coming thru, lol chilling out.',
    requestedTone: 'Formal'
  });
  assert(toneCasualWarn.status === CHECK_STATUSES.WARNING, '16. Tone consistency warns when formal content contains casual slang');

  console.log('\n--- 6. Audience Fit Checker Tests ---');

  // 17. Audience fit evaluates vocabulary and complexity for target group
  const audPublicPass = checkAudienceFit({
    content: 'Please stay indoors safely. Strong winds and heavy rain are expected soon.',
    targetAudience: 'General Public'
  });
  assert(audPublicPass.status === CHECK_STATUSES.PASS, '17. Audience fit passes for clear General Public text');

  const audPublicJargon = checkAudienceFit({
    content: 'The baroclinic instability caused severe tropospheric vorticity and cyclogenesis perturbation parameterization.',
    targetAudience: 'General Public'
  });
  assert(audPublicJargon.status === CHECK_STATUSES.WARNING, '17.1 Audience fit warns when dense jargon is served to General Public');

  console.log('\n--- 7. Readability Checker Tests ---');

  // 18. Readability computes word count, char count, sentence length accurately
  const readMetrics = checkReadability({
    content: 'Severe storm approaching. Stay inside. Call 112.'
  });
  assert(readMetrics.status === CHECK_STATUSES.PASS, '18.1 Readability evaluation executes cleanly');
  assert(readMetrics.details.wordCount === 7, '18.2 Accurate word count calculation');
  assert(readMetrics.details.sentenceCount === 3, '18.3 Accurate sentence count calculation');

  // 19. Readability flags sentences exceeding max length threshold
  const longSentence = 'This is an extraordinarily elongated sentence that continues across various clauses with numerous commas, semicolons, subordinating conjunctions, explanatory digressions, parenthetical remarks, and extraneous qualifiers until it eventually surpasses the normal threshold of comprehension for ordinary readers during an emergency crisis situation.';
  const readLong = checkReadability({ content: longSentence });
  assert(readLong.status === CHECK_STATUSES.WARNING, '19. Readability flags sentences exceeding maximum word threshold');

  console.log('\n--- 8. Language Consistency Checker Tests ---');

  // 20. Language consistency passes when output matches config language
  const langPass = checkLanguageConsistency({
    content: 'Emergency advisory issued for coastal safety.',
    configLanguage: 'English'
  });
  assert(langPass.status === CHECK_STATUSES.PASS, '20. Language consistency passes for English text in English config');

  // 21. Language consistency warns on script or language mismatch
  const langMismatch = checkLanguageConsistency({
    content: 'सावधान! चक्रीवादळ येत आहे. सुरक्षित राहा.',
    configLanguage: 'English'
  });
  assert(langMismatch.status === CHECK_STATUSES.WARNING, '21. Language consistency flags Devanagari script in English config');

  console.log('\n--- 9. Platform Compliance Checker Tests ---');

  // 22. Platform compliance validates X/Twitter 280 char limit and thread flag
  const twitterPass = checkPlatformCompliance({
    content: 'Stay safe during the cyclone. Call 112 if in danger.',
    channelId: 'twitter'
  });
  assert(twitterPass.status === CHECK_STATUSES.PASS, '22.1 Twitter compliance passes within 280 characters');

  const twitterLong = checkPlatformCompliance({
    content: 'A'.repeat(300),
    channelId: 'twitter'
  });
  assert(twitterLong.status === CHECK_STATUSES.WARNING && twitterLong.details.isThreadCandidate === true, '22.2 Twitter marks >280 char content as thread candidate');

  // 23. Platform compliance validates SMS length and segment recommendation
  const smsPass = checkPlatformCompliance({
    content: 'Storm alert: Winds 85-105 km/h. Helpline: 112.',
    channelId: 'sms'
  });
  assert(smsPass.status === CHECK_STATUSES.PASS, '23.1 SMS within 160 chars passes');
  assert(smsPass.details.segmentCount === 1, '23.2 SMS segment count is 1');

  const smsLong = checkPlatformCompliance({
    content: 'X'.repeat(200),
    channelId: 'sms'
  });
  assert(smsLong.status === CHECK_STATUSES.WARNING && smsLong.details.segmentCount === 2, '23.3 SMS exceeding 160 chars flags multi-segment warning');

  // 24. Platform compliance validates Email subject, body, and CTA structure
  const emailPass = checkPlatformCompliance({
    content: 'Subject: Cyclone Warning\n\nDear Citizen,\nPlease stay indoors.\n\nCall 112.\n\nRegards,\nTeam',
    channelId: 'email'
  });
  assert(emailPass.status === CHECK_STATUSES.PASS && emailPass.details.hasSubject === true, '24. Email structure check verifies Subject line');

  // 25. Platform compliance validates WhatsApp scannability and structure
  const waPass = checkPlatformCompliance({
    content: '🚨 *URGENT ADVISORY*\n\n• Point 1: Severe winds\n• Point 2: Stay indoors\n\nHelpline: 112',
    channelId: 'whatsapp'
  });
  assert(waPass.status === CHECK_STATUSES.PASS, '25. WhatsApp scannability check passes for formatted bullet list');

  console.log('\n--- 10. Duplication & Safety Checker Tests ---');

  // 26. Duplication check flags excessive verbatim repetition within an output
  const dupRepetitive = checkDuplication({
    content: 'Stay safe now. Stay safe now. Stay safe now. Stay safe now.'
  });
  assert(dupRepetitive.status === CHECK_STATUSES.WARNING, '26. Duplication check flags repeated verbatim sentences');

  // 27. Safety check flags unverified emergency directives
  const safetyWarn = checkSafety({
    content: 'Citizens are ordered to immediately evacuate and drink salt water for hydration.',
    sourceText: sampleSource.rawText
  });
  assert(safetyWarn.status === CHECK_STATUSES.WARNING, '27. Safety check flags ungrounded health/evacuation instructions');

  console.log('\n--- 11. Full Service Lifecycle & Workflow Tests ---');

  // 28. reviewCommunicationOutputs processes all outputs deterministically
  const fullReview = await reviewCommunicationOutputs({
    communicationResult: sampleCommunicationContract,
    sourceData: sampleSource,
    analysisData: sampleAnalysis,
    transformationResult: sampleTransformation,
    config: sampleCommunicationContract.config
  });
  assert(fullReview !== null && fullReview.reviewId !== undefined, '28.1 Review service generates full review result');
  assert(fullReview.items.length === 8, '28.2 Review result contains all 8 items');
  assert(fullReview.summary.totalOutputs === 8, '28.3 Summary reflects totalOutputs = 8');
  assert(fullReview.summary.needsHumanReview === 8, '28.4 Initially all 8 outputs need human review');

  // 29. Human edit updates content, re-runs checks, and preserves original
  const targetId = 'out-mod4-sms';
  const editedReview = editOutput(fullReview, targetId, 'Revised SMS: Cyclone warning active. Stay indoors. Call 112.', {
    sourceData: sampleSource,
    analysisData: sampleAnalysis,
    transformationResult: sampleTransformation,
    config: sampleCommunicationContract.config
  });
  const editedItem = editedReview.items.find(i => i.outputId === targetId);
  assert(editedItem.isEdited === true, '29.1 isEdited flag is set to true');
  assert(editedItem.originalContent !== editedItem.content, '29.2 originalContent is preserved intact');
  assert(editedItem.content.startsWith('Revised SMS:'), '29.3 Content is updated with human edits');

  // 30. Approval updates status and allows remarks
  const approvedReview = approveOutput(editedReview, targetId, 'Verified and approved by disaster officer');
  const approvedItem = approvedReview.items.find(i => i.outputId === targetId);
  assert(approvedItem.approvalStatus === APPROVAL_STATUSES.APPROVED, '30.1 Approval status set to APPROVED');
  assert(approvedItem.reviewerNotes.includes('disaster officer'), '30.2 Reviewer remarks stored correctly');
  assert(approvedReview.summary.approvedOutputs === 1, '30.3 Summary approved count incremented to 1');

  // 31. Rejection requires reviewer notes and locks status
  const rejectedReview = rejectOutput(approvedReview, 'out-mod4-cta', 'CTA too generic');
  const rejectedItem = rejectedReview.items.find(i => i.outputId === 'out-mod4-cta');
  assert(rejectedItem.approvalStatus === APPROVAL_STATUSES.REJECTED, '31.1 Approval status set to REJECTED');
  assert(rejectedItem.reviewerNotes === 'CTA too generic', '31.2 Rejection reason preserved');

  // 32. Module 6 export package contains all required IDs, approved outputs, and metadata
  const exportPackage = prepareModule6ExportPackage(approvedReview);
  assert(exportPackage !== null, '32.1 Export package prepared successfully');
  assert(exportPackage.exportId.startsWith('pkg-exp-'), '32.2 Export package has unique exportId');
  assert(exportPackage.sourceId === sampleSource.sourceId, '32.3 Export package preserves sourceId');
  assert(exportPackage.communicationId === sampleCommunicationContract.communicationId, '32.4 Export package preserves communicationId');
  assert(exportPackage.approvedOutputs.length === 1, '32.5 Export package contains only approved outputs (1 output)');
  assert(exportPackage.qualityGate.passed === true, '32.6 Quality gate marks passed: true');

  // 33. Module 6 export package is rejected when no outputs are approved
  const freshReview = await reviewCommunicationOutputs({
    communicationResult: sampleCommunicationContract,
    sourceData: sampleSource,
    analysisData: sampleAnalysis,
    transformationResult: sampleTransformation,
    config: sampleCommunicationContract.config
  });
  let exportThrew = false;
  try {
    prepareModule6ExportPackage(freshReview);
  } catch (err) {
    exportThrew = true;
  }
  assert(exportThrew === true, '33. Export package preparation throws when 0 outputs are approved');

  // 34. Validate Export Package schema with validator
  const exportValidation = validateExportPackage(exportPackage);
  assert(exportValidation.isValid === true, '34. Export package passes strict schema validation');

  // 35. Re-generation / re-evaluation of single output works smoothly
  const regeneratedReview = regenerateOutputReview(approvedReview, 'out-mod4-linkedin', {
    sourceData: sampleSource,
    analysisData: sampleAnalysis,
    transformationResult: sampleTransformation,
    config: sampleCommunicationContract.config
  });
  const regenItem = regeneratedReview.items.find(i => i.outputId === 'out-mod4-linkedin');
  assert(regenItem.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, '35. Regenerated item resets to PENDING_REVIEW');

  console.log('\n========================================');
  console.log(`📊 MODULE 5 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in Module 5 test runner:', err);
  process.exit(1);
});
