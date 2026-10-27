/**
 * InfoFlip-AI v0.3.0 — Part 1: Content Generation Reliability Test Suite
 * 
 * Comprehensive tests covering:
 * 1. Successful generation across all 13 supported output formats
 * 2. Settings adherence (Language, Audience, Tone, Detail Level, Objective, Style)
 * 3. Multi-format distinct outputs in a single turn
 * 4. Regeneration novelty, candidate variation, and version history preservation
 * 5. Provider quota errors (HTTP 429) & network timeouts (zero retries, clean fallback)
 * 6. Invalid or empty provider responses (no false success claims)
 * 7. Reliable deterministic fallback behavior & source sufficiency validation
 * 8. QA review, approve/reject lifecycle, and collection filtering
 */

import { DeterministicTransformer } from '../services/transformation/deterministicTransformer.js';
import { DeterministicCommunicationProvider } from '../services/communication/deterministicCommunicationProvider.js';
import { 
  callGeminiGenerateContent, 
  GeminiAIProvider, 
  resetQuotaExhaustionStatus, 
  getQuotaExhaustionStatus 
} from '../services/ai/geminiProvider.js';
import {
  executeChatTurn,
  regenerateCanonicalContentItem,
  regenerateCanonicalContentItems,
  WORKSPACE_FORMATS
} from '../services/workspace/chatPipelineOrchestrator.js';
import {
  approveOutput,
  rejectOutput,
  reviewCommunicationOutputs
} from '../services/review/reviewService.js';
import { APPROVAL_STATUSES, CHECK_STATUSES } from '../types/review.js';
import { OUTPUT_FORMAT_IDS } from '../types/transformation.js';
import { COMMUNICATION_CHANNEL_IDS } from '../types/communication.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

const sampleGroundedSource = {
  sourceId: 'src-cyclone-v030',
  sourceType: 'text',
  fileName: 'IMD_Cyclone_Bulletin_44.txt',
  extractedText: `The India Meteorological Department (IMD) has issued severe weather bulletin 44 regarding Cyclonic Storm Vardah. The cyclone is currently located 180 km southeast of Chennai, moving west-northwestward with sustained wind speeds of 90 to 110 km/h. Coastal districts are advised that a storm surge of 1.5 meters is expected by 18:00 IST on 15 November 2026. Over 1,200 emergency relief shelters have been established across Tamil Nadu and Andhra Pradesh. National Emergency Helpline 1078 is operational 24/7 for citizen assistance. Fishermen are strictly warned not to venture into southwest Bay of Bengal.`
};

const sampleAnalysis = {
  analysisId: 'ana-cyclone-v030',
  overview: {
    title: 'Cyclone Vardah Advisory',
    mainTopic: 'Severe Cyclonic Storm Vardah',
    summary: 'Cyclonic Storm Vardah is approaching Chennai with 90 to 110 km/h winds and expected 1.5m storm surge. 1,200 shelters ready, Helpline 1078 active.',
    category: 'Disaster Management',
    contentType: 'Official Advisory'
  },
  urgency: { level: 'high', reasons: ['Severe weather imminent', 'Life safety risk'] },
  tone: { primary: 'Urgent', secondary: ['Authoritative'] },
  intent: { primary: 'Alert', secondary: ['Public Safety', 'Evacuation Guidance'] },
  keyFacts: [
    'Cyclone Vardah is located 180 km southeast of Chennai with 90 to 110 km/h winds.',
    'Storm surge of 1.5 meters expected along coastal districts by 18:00 IST.',
    'Over 1,200 emergency relief shelters have been established across Tamil Nadu and Andhra Pradesh.',
    'National Emergency Helpline 1078 is operational 24/7 for citizen assistance.'
  ],
  importantDates: [
    { date: '15 November 2026', context: 'Expected storm surge landfall', isDeadline: true }
  ],
  importantNumbers: [
    { value: '90 to 110 km/h', label: 'Wind Speed', context: 'Sustained cyclonic wind' },
    { value: '1.5 meters', label: 'Storm Surge', context: 'Coastal water height' },
    { value: '1,200', label: 'Relief Shelters', context: 'Shelters ready' },
    { value: '1078', label: 'Emergency Helpline', context: 'National Helpline 24/7' }
  ],
  entities: {
    locations: ['Chennai', 'Tamil Nadu', 'Andhra Pradesh', 'Bay of Bengal'],
    organizations: ['India Meteorological Department', 'IMD']
  },
  claims: [
    { claimText: 'Cyclone Vardah has sustained wind speeds of 90 to 110 km/h', isIndependentlyVerified: true, verificationEvidence: 'IMD Bulletin 44' }
  ],
  verification: {
    isIndependentlyVerified: true,
    verificationEvidence: 'IMD Official Bulletin 44'
  }
};

console.log('====================================================');
console.log('🧪 INFOFLIP-AI V0.3.0 CONTENT GENERATION RELIABILITY');
console.log('====================================================');

// =========================================================================
// SUITE 1: SUCCESSFUL GENERATION OF ALL 13 SUPPORTED OUTPUT FORMATS
// =========================================================================
console.log('\n--- Suite 1: Successful Generation of All 13 Supported Output Formats ---');
{
  const mod3Transformer = new DeterministicTransformer();
  const mod4Provider = new DeterministicCommunicationProvider();

  // 1. Module 3 Formats
  const mod3Formats = [
    OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
    OUTPUT_FORMAT_IDS.ADVISORY,
    OUTPUT_FORMAT_IDS.INFOGRAPHIC,
    OUTPUT_FORMAT_IDS.PRESENTATION,
    OUTPUT_FORMAT_IDS.VIDEO_SCRIPT
  ];

  const mod3Outputs = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    transformationId: 'trans-v030-1',
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative' },
    requestedFormats: mod3Formats
  });

  assert(mod3Outputs.length === 5, 'Generates all 5 Module 3 formats');
  const mod3Map = {};
  mod3Outputs.forEach(o => { mod3Map[o.format] = o; });

  // Verify Executive Summary structure
  const exec = mod3Map[OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY];
  assert(exec && exec.content?.title && Array.isArray(exec.content?.keyPoints), 'Executive summary has title and key points array');
  assert(exec.content.keyPoints.length >= 2, 'Executive summary contains multiple key points');

  // Verify Advisory structure
  const adv = mod3Map[OUTPUT_FORMAT_IDS.ADVISORY];
  assert(adv && adv.content?.title && Array.isArray(adv.content?.recommendedActions), 'Advisory has title and recommended actions array');

  // Verify Infographic structure
  const info = mod3Map[OUTPUT_FORMAT_IDS.INFOGRAPHIC];
  assert(info && info.content?.title && Array.isArray(info.content?.sections), 'Infographic has title and structured sections array');

  // Verify Presentation structure
  const pres = mod3Map[OUTPUT_FORMAT_IDS.PRESENTATION];
  assert(pres && Array.isArray(pres.content?.slides) && pres.content.slides.length >= 3, 'Presentation has structured slides array');

  // Verify Video Script structure
  const vid = mod3Map[OUTPUT_FORMAT_IDS.VIDEO_SCRIPT];
  assert(vid && Array.isArray(vid.content?.scenes) && vid.content.scenes.length >= 3, 'Video script has structured scenes array');

  // 2. Module 4 Formats
  const mod4Channels = [
    COMMUNICATION_CHANNEL_IDS.LINKEDIN,
    COMMUNICATION_CHANNEL_IDS.TWITTER,
    COMMUNICATION_CHANNEL_IDS.WHATSAPP,
    COMMUNICATION_CHANNEL_IDS.EMAIL,
    COMMUNICATION_CHANNEL_IDS.SMS,
    COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT,
    COMMUNICATION_CHANNEL_IDS.CTA,
    COMMUNICATION_CHANNEL_IDS.HASHTAGS
  ];

  const mod4Outputs = mod4Provider.generate({
    sourceId: sampleGroundedSource.sourceId,
    transformationId: 'trans-v030-1',
    analysisId: sampleAnalysis.analysisId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    transformationOutputs: mod3Outputs,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative' },
    requestedChannels: mod4Channels
  });

  assert(mod4Outputs.length === 8, 'Generates all 8 Module 4 channels');
  const mod4Map = {};
  mod4Outputs.forEach(o => { mod4Map[o.channelId] = o; });

  // Verify LinkedIn structure
  const li = mod4Map[COMMUNICATION_CHANNEL_IDS.LINKEDIN];
  assert(li && typeof li.content === 'string' && li.content.includes('#'), 'LinkedIn contains formatted text and hashtags');

  // Verify Twitter structure
  const tw = mod4Map[COMMUNICATION_CHANNEL_IDS.TWITTER];
  assert(tw && Array.isArray(tw.structuredData?.posts) && tw.structuredData.posts.length >= 2, 'Twitter contains multi-post thread');

  // Verify WhatsApp structure
  const wa = mod4Map[COMMUNICATION_CHANNEL_IDS.WHATSAPP];
  assert(wa && wa.content.includes('*') && wa.content.includes('Action Required'), 'WhatsApp contains scannable bolding and action CTA');

  // Verify Email structure
  const em = mod4Map[COMMUNICATION_CHANNEL_IDS.EMAIL];
  assert(em && em.content.includes('Subject:') && em.content.includes('Preview:') && em.content.includes('Dear'), 'Email contains complete newsletter structure');

  // Verify SMS structure
  const sms = mod4Map[COMMUNICATION_CHANNEL_IDS.SMS];
  assert(sms && sms.content.length <= 160, `SMS is under 160 characters (got ${sms.content.length})`);

  // Verify Announcement structure
  const ann = mod4Map[COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT];
  assert(ann && ann.content.includes('PUBLIC ANNOUNCEMENT') && ann.content.includes('INSTRUCTIONS'), 'Announcement has prominent formal header');

  // Verify CTA structure
  const cta = mod4Map[COMMUNICATION_CHANNEL_IDS.CTA];
  assert(cta && Array.isArray(cta.structuredData?.variants) && cta.structuredData.variants.length >= 3, 'CTA contains structured action variants');

  // Verify Hashtags structure
  const ht = mod4Map[COMMUNICATION_CHANNEL_IDS.HASHTAGS];
  assert(ht && Array.isArray(ht.structuredData?.tags) && ht.structuredData.tags.every(t => t.startsWith('#') && t.length <= 25), 'Hashtags are clean, readable, and <= 25 chars');

  // Total supported formats count verification
  const totalVerifiedFormats = mod3Formats.length + mod4Channels.length;
  assert(totalVerifiedFormats === 13, 'Exactly 13 supported output formats verified');
  assert(WORKSPACE_FORMATS.length === 13, 'WORKSPACE_FORMATS registry aligns with all 13 supported formats');
}

// =========================================================================
// SUITE 2: SETTINGS ADHERENCE (LANGUAGE, AUDIENCE, TONE, DETAIL, OBJECTIVE)
// =========================================================================
console.log('\n--- Suite 2: Settings Adherence (Language, Audience, Tone, Detail, Objective) ---');
{
  const mod3Transformer = new DeterministicTransformer();
  const mod4Provider = new DeterministicCommunicationProvider();

  // 1. Language Adherence: Hindi
  const hindiOutputsMod3 = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'Hindi', targetAudience: 'General Public', tone: 'Urgent' },
    requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY, OUTPUT_FORMAT_IDS.ADVISORY]
  });
  const hindiExec = hindiOutputsMod3.find(o => o.format === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY);
  const hindiAdv = hindiOutputsMod3.find(o => o.format === OUTPUT_FORMAT_IDS.ADVISORY);
  assert(hindiExec.content.title.includes('कार्यकारी सारांश'), 'Hindi Executive Summary uses Hindi title (कार्यकारी सारांश)');
  assert(hindiAdv.content.title.includes('परामर्श'), 'Hindi Advisory uses Hindi title (परामर्श)');

  const hindiOutputsMod4 = mod4Provider.generate({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'Hindi', targetAudience: 'General Public', tone: 'Urgent' },
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.EMAIL, COMMUNICATION_CHANNEL_IDS.SMS]
  });
  const hindiEmail = hindiOutputsMod4.find(o => o.channelId === COMMUNICATION_CHANNEL_IDS.EMAIL);
  const hindiSMS = hindiOutputsMod4.find(o => o.channelId === COMMUNICATION_CHANNEL_IDS.SMS);
  assert(hindiEmail.content.includes('विषय:') && hindiEmail.content.includes('सादर,'), 'Hindi Email uses Devanagari subject and closing sign-off');
  assert(hindiSMS.content.includes('सूचना:') || hindiSMS.content.includes('अपडेट:'), 'Hindi SMS uses Devanagari alert tag');

  // 2. Language Adherence: Marathi
  const marathiOutputsMod3 = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'Marathi', targetAudience: 'General Public', tone: 'Informative' },
    requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY, OUTPUT_FORMAT_IDS.ADVISORY]
  });
  const marathiExec = marathiOutputsMod3.find(o => o.format === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY);
  const marathiAdv = marathiOutputsMod3.find(o => o.format === OUTPUT_FORMAT_IDS.ADVISORY);
  assert(marathiExec.content.title.includes('कार्यकारी सारांश'), 'Marathi Executive Summary uses Marathi title');
  assert(marathiAdv.content.title.includes('सल्ला') || marathiAdv.content.title.includes('सूचना'), 'Marathi Advisory uses Marathi title (सल्ला / सूचना)');

  // 3. Target Audience Adherence
  const targetedOutputs = mod4Provider.generate({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'Coastal Fisherfolk & Port Authorities', tone: 'Formal' },
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.EMAIL, COMMUNICATION_CHANNEL_IDS.TWITTER]
  });
  const targetedEmail = targetedOutputs.find(o => o.channelId === COMMUNICATION_CHANNEL_IDS.EMAIL);
  const targetedTwitter = targetedOutputs.find(o => o.channelId === COMMUNICATION_CHANNEL_IDS.TWITTER);
  assert(targetedEmail.content.includes('Dear Coastal Fisherfolk & Port Authorities,'), 'Target audience is explicitly addressed in Email greeting');
  assert(targetedTwitter.content.includes('[For Coastal Fisherfolk & Port Authorities]'), 'Target audience is tagged in Twitter thread');

  // 4. Detail Level Adherence: Concise vs Detailed
  const conciseOutputs = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative', detailLevel: 'Concise' },
    requestedFormats: [OUTPUT_FORMAT_IDS.PRESENTATION]
  });
  const detailedOutputs = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative', detailLevel: 'Detailed' },
    requestedFormats: [OUTPUT_FORMAT_IDS.PRESENTATION]
  });
  const conciseSlides = conciseOutputs[0].content.slides.length;
  const detailedSlides = detailedOutputs[0].content.slides.length;
  assert(conciseSlides < detailedSlides, `Concise presentation (${conciseSlides} slides) has fewer slides than Detailed presentation (${detailedSlides} slides)`);
}

// =========================================================================
// SUITE 3: MULTI-FORMAT DISTINCT OUTPUTS IN A SINGLE TURN
// =========================================================================
console.log('\n--- Suite 3: Multi-Format Distinct Outputs in a Single Turn ---');
{
  const formatsToTest = ['executive-summary', 'linkedin', 'twitter', 'sms', 'announcement'];
  const conv = {
    conversationId: 'conv-multiformat-v030',
    title: 'Multi-Format Turn',
    activeSource: sampleGroundedSource,
    activeAnalysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative', detailLevel: 'Balanced' },
    messages: []
  };

  const turnResult = await executeChatTurn({
    conversation: conv,
    prompt: 'Generate emergency updates in multiple formats',
    selectedFormatIds: formatsToTest,
    generationConfig: conv.config,
    delayMs: 0
  });

  assert(turnResult.assistantMessage.outputItemIds.length === 5, 'Single turn produces all 5 requested format output items');
  const items = turnResult.canonicalItems;

  // Check each item has distinct text
  const contents = items.map(i => i.content);
  const uniqueContents = new Set(contents);
  assert(uniqueContents.size === 5, 'All 5 outputs in single turn have distinct, format-appropriate content');

  // Check that no output is empty
  assert(items.every(i => typeof i.content === 'string' && i.content.length > 20), 'Zero outputs are empty or whitespace in multi-format turn');

  // Check formatIds correspond to requested formats
  const producedFormatIds = items.map(i => i.formatId);
  for (const requestedId of formatsToTest) {
    assert(producedFormatIds.includes(requestedId), `Produced output items include requested format: ${requestedId}`);
  }
}

// =========================================================================
// SUITE 4: REGENERATION NOVELTY & VERSION HISTORY PRESERVATION
// =========================================================================
console.log('\n--- Suite 4: Regeneration Novelty & Version History Preservation ---');
{
  const conv = {
    conversationId: 'conv-regen-v030',
    title: 'Regeneration Test',
    activeSource: sampleGroundedSource,
    activeAnalysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative', detailLevel: 'Balanced' },
    messages: []
  };

  const initialTurn = await executeChatTurn({
    conversation: conv,
    prompt: 'Generate LinkedIn post and Executive Summary',
    selectedFormatIds: ['linkedin', 'executive-summary'],
    generationConfig: conv.config,
    delayMs: 0
  });

  const liItem = initialTurn.canonicalItems.find(i => i.formatId === 'linkedin');
  const execItem = initialTurn.canonicalItems.find(i => i.formatId === 'executive-summary');

  assert(liItem.version === 1, 'Initial LinkedIn item starts at version 1');
  assert(Array.isArray(liItem.versionHistory) && liItem.versionHistory.length === 0, 'Initial versionHistory is empty array');

  // 1. Regenerate LinkedIn
  const regeneratedLi = await regenerateCanonicalContentItem(liItem, conv);

  assert(regeneratedLi.outputId === liItem.outputId, 'Regenerated item preserves original outputId');
  assert(regeneratedLi.version === 2, 'Regeneration increments version counter to 2');
  assert(regeneratedLi.versionHistory.length === 1, 'versionHistory contains 1 archived previous version');
  assert(regeneratedLi.versionHistory[0].version === 1, 'Archived version record has version 1');
  assert(regeneratedLi.versionHistory[0].content === liItem.content, 'Archived version record faithfully preserves original content');
  assert(regeneratedLi.content !== liItem.content, 'Regenerated LinkedIn candidate produces novel variant phrasing');

  // 2. Sibling output isolation
  assert(execItem.version === 1, 'Sibling Executive Summary item was not modified during LinkedIn regeneration');
  assert(execItem.content.length > 50, 'Sibling Executive Summary content remains intact');

  // 3. Version preservation of approved content
  const approvedLi = approveOutput(regeneratedLi, 'Approved by Public Safety Officer');
  assert(approvedLi.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Item is approved');

  // Regenerate approved item (with user confirmation / protectApproved: false)
  const regenApprovedLi = await regenerateCanonicalContentItem(approvedLi, conv, { protectApproved: false });
  assert(regenApprovedLi.version === 3, 'Regeneration of approved item increments version to 3');
  assert(regenApprovedLi.versionHistory.length === 2, 'versionHistory now archives 2 previous versions');
  assert(regenApprovedLi.previousApprovedVersion !== null, 'previousApprovedVersion preserves approved snapshot');
  assert(regenApprovedLi.previousApprovedVersion.content === approvedLi.content, 'previousApprovedVersion contains exact approved text');
  assert(regenApprovedLi.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, 'Status cleanly resets to PENDING_REVIEW after regenerating approved output');
}

// =========================================================================
// SUITE 5: PROVIDER QUOTA ERRORS (HTTP 429) & NETWORK TIMEOUTS
// =========================================================================
console.log('\n--- Suite 5: Provider Quota Errors (HTTP 429) & Network Timeouts ---');
{
  resetQuotaExhaustionStatus();

  // 1. Quota Exhaustion (RESOURCE_EXHAUSTED / 429)
  let fetchCallCount = 0;
  const mockQuotaFetch = async () => {
    fetchCallCount++;
    return {
      ok: false,
      status: 429,
      statusText: 'RESOURCE_EXHAUSTED',
      text: async () => JSON.stringify({
        error: {
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          message: 'Quota exceeded for quota metric GenerateRequestsPerDayPerProjectPerModel-FreeTier'
        }
      })
    };
  };

  const providerWithMockQuota = new GeminiAIProvider({
    apiKey: 'mock-test-key-12345',
    fetchFn: mockQuotaFetch
  });

  const quotaResult = await providerWithMockQuota.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    configuration: { targetAudience: 'General Public', language: 'English', tone: 'Informative' },
    requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]
  }, { retries: 0 });

  assert(fetchCallCount === 1, 'Quota exhaustion stops immediately with ZERO retries (not repeatedly retried)');
  assert(quotaResult.length === 1, 'Deterministic fallback succeeds and returns requested output');
  assert(quotaResult[0].metadata.isFallback === true, 'Quota fallback is clearly flagged with isFallback: true');
  assert(quotaResult[0].metadata.provider === 'DeterministicFallback', 'Provider is truthfully reported as DeterministicFallback');
  assert(quotaResult[0].metadata.reason === 'Gemini quota exhausted', 'Metadata reason reports "Gemini quota exhausted"');

  const quotaStatus = getQuotaExhaustionStatus();
  assert(quotaStatus.isExhausted === true, 'Session quota exhaustion status is recorded as exhausted');

  // Fast-fallback on subsequent call
  let secondCallNetworkHit = false;
  const mockSecondFetch = async () => {
    secondCallNetworkHit = true;
    return { ok: true, text: async () => '{}' };
  };
  const providerSecond = new GeminiAIProvider({
    apiKey: 'mock-test-key-12345',
    fetchFn: mockSecondFetch
  });
  const fastFallbackResult = await providerSecond.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    configuration: { targetAudience: 'General Public', language: 'English', tone: 'Informative' },
    requestedFormats: [OUTPUT_FORMAT_IDS.ADVISORY]
  });
  assert(!secondCallNetworkHit, 'Subsequent turn fast-falls back without making doomed network requests');
  assert(fastFallbackResult[0].metadata.isFallback === true, 'Fast fallback correctly flagged as fallback');

  // 2. Network Timeout (AbortError / 408)
  resetQuotaExhaustionStatus();
  const mockTimeoutFetch = async (_url, options) => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  };

  const providerWithMockTimeout = new GeminiAIProvider({
    apiKey: 'mock-test-key-12345',
    fetchFn: mockTimeoutFetch
  });

  const timeoutResult = await providerWithMockTimeout.communicate({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.LINKEDIN]
  }, { timeoutMs: 100, bypassQuotaCache: true });

  assert(timeoutResult.length === 1, 'Timeout triggers deterministic fallback without crashing');
  assert(timeoutResult[0].metadata.isFallback === true, 'Timeout result flagged with isFallback: true');
  assert(timeoutResult[0].metadata.provider === 'DeterministicFallback', 'Timeout result truthfully reports DeterministicFallback provider');
  assert(timeoutResult[0].metadata.fallbackReason === 'Gemini timeout', 'Fallback reason accurately reports "Gemini timeout"');
}

// =========================================================================
// SUITE 6: INVALID OR EMPTY PROVIDER RESPONSES
// =========================================================================
console.log('\n--- Suite 6: Invalid or Empty Provider Responses ---');
{
  resetQuotaExhaustionStatus();

  // 1. Empty candidate text from provider
  const mockEmptyCandidateFetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({
      candidates: [
        {
          finishReason: 'STOP',
          content: { parts: [{ text: '   ' }] }
        }
      ]
    })
  });

  const providerEmptyCandidate = new GeminiAIProvider({
    apiKey: 'mock-test-key-12345',
    fetchFn: mockEmptyCandidateFetch
  });

  const emptyCandidateResult = await providerEmptyCandidate.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]
  }, { bypassQuotaCache: true, retries: 0 });

  assert(emptyCandidateResult[0].metadata.isFallback === true, 'Empty provider candidate text triggers deterministic fallback');
  assert(emptyCandidateResult[0].metadata.provider === 'DeterministicFallback', 'Empty response never claims successful AI generation');
  assert(emptyCandidateResult[0].content !== null && emptyCandidateResult[0].content.title, 'Fallback produces meaningful grounded content');

  // 2. Empty structured output item content
  const mockEmptyContentFetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({
      candidates: [
        {
          finishReason: 'STOP',
          content: {
            parts: [{
              text: JSON.stringify({
                outputs: [
                  { format: 'executive-summary', content: '' } // Empty string content
                ]
              })
            }]
          }
        }
      ]
    })
  });

  const providerEmptyContent = new GeminiAIProvider({
    apiKey: 'mock-test-key-12345',
    fetchFn: mockEmptyContentFetch
  });

  const emptyContentResult = await providerEmptyContent.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]
  }, { bypassQuotaCache: true, retries: 0 });

  assert(emptyContentResult[0].metadata.isFallback === true, 'Empty content in JSON output triggers fallback');
  assert(emptyContentResult[0].metadata.provider === 'DeterministicFallback', 'Does not report successful AI generation for empty output');
  assert(emptyContentResult[0].content?.title, 'Fallback produces genuine content');
}

// =========================================================================
// SUITE 7: DETERMINISTIC FALLBACK RELIABILITY & SOURCE SUFFICIENCY
// =========================================================================
console.log('\n--- Suite 7: Deterministic Fallback Reliability & Source Sufficiency ---');
{
  const mod3Transformer = new DeterministicTransformer();
  const mod4Provider = new DeterministicCommunicationProvider();

  // 1. Insufficient source: completely empty text and no analysis
  let mod3ThrewEmpty = false;
  try {
    await mod3Transformer.transform({
      sourceId: 'src-empty',
      sourceContent: { extractedText: '' },
      analysis: {},
      requestedFormats: [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]
    });
  } catch (err) {
    mod3ThrewEmpty = true;
    assert(err.message.includes('insufficient') || err.message.includes('15 characters'), `Descriptive error on empty source: ${err.message}`);
  }
  assert(mod3ThrewEmpty, 'Module 3 transformer throws helpful error on empty source instead of fabricating facts');

  let mod4ThrewEmpty = false;
  try {
    mod4Provider.generate({
      sourceId: 'src-empty',
      sourceContent: { extractedText: '' },
      analysis: {},
      requestedChannels: [COMMUNICATION_CHANNEL_IDS.LINKEDIN]
    });
  } catch (err) {
    mod4ThrewEmpty = true;
    assert(err.message.includes('insufficient') || err.message.includes('15 characters'), `Descriptive error on empty source: ${err.message}`);
  }
  assert(mod4ThrewEmpty, 'Module 4 provider throws helpful error on empty source instead of fabricating facts');

  // 2. Insufficient source: too brief (< 15 characters)
  let mod3ThrewBrief = false;
  try {
    await mod3Transformer.transform({
      sourceId: 'src-brief',
      sourceContent: { extractedText: 'Hello' },
      analysis: {},
      requestedFormats: [OUTPUT_FORMAT_IDS.ADVISORY]
    });
  } catch (err) {
    mod3ThrewBrief = true;
    assert(err.message.includes('too brief') || err.message.includes('15 characters') || err.message.includes('insufficient'), `Descriptive error on brief source: ${err.message}`);
  }
  assert(mod3ThrewBrief, 'Module 3 transformer rejects source < 15 chars without analysis');

  // 3. Sufficient source produces grounded output with isFallback: true
  const validFallbackOutputs = await mod3Transformer.transform({
    sourceId: sampleGroundedSource.sourceId,
    sourceContent: sampleGroundedSource,
    analysis: sampleAnalysis,
    requestedFormats: [OUTPUT_FORMAT_IDS.ADVISORY]
  });
  const adv = validFallbackOutputs[0];
  assert(adv.metadata.isFallback === true, 'Fallback output explicitly labeled with isFallback: true');
  assert(adv.metadata.provider === 'DeterministicFallback', 'Provider explicitly identifies as DeterministicFallback');
  assert(adv.content.recommendedActions.length > 0, 'Advisory contains grounded instructions without generic placeholder');
}

// =========================================================================
// SUITE 8: QA REVIEW, APPROVE/REJECT, AND COLLECTIONS WORKFLOWS
// =========================================================================
console.log('\n--- Suite 8: QA Review, Approve/Reject, and Collections Workflows ---');
{
  const conv = {
    conversationId: 'conv-qa-v030',
    title: 'QA and Collections Test',
    activeSource: sampleGroundedSource,
    activeAnalysis: sampleAnalysis,
    config: { language: 'English', targetAudience: 'General Public', tone: 'Informative' },
    messages: []
  };

  const turnResult = await executeChatTurn({
    conversation: conv,
    prompt: 'Create deliverables for review',
    selectedFormatIds: ['linkedin', 'twitter', 'executive-summary'],
    generationConfig: conv.config,
    delayMs: 0
  });

  const [liItem, twItem, execItem] = turnResult.canonicalItems;

  // 1. QA Checks Verification
  assert(liItem.checks && typeof liItem.checks === 'object', 'Item includes QA checks dictionary');
  assert(Object.keys(liItem.checks).length === 10, 'Quality review evaluates all 10 dimensions');
  assert(liItem.summary && typeof liItem.summary.passed === 'number', 'Item includes QA summary metrics');

  // 2. Approve Single Output
  const approvedLi = approveOutput(liItem, 'Approved for coastal broadcast');
  assert(approvedLi.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Target LinkedIn item status is APPROVED');
  assert(approvedLi.requiresHumanReview === false, 'requiresHumanReview is false after approval');
  assert(approvedLi.approvalInfo?.approvedBy === 'Human Reviewer', 'approvalInfo records reviewer');
  assert(twItem.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, 'Sibling Twitter item remains PENDING_REVIEW');

  // 3. Reject Single Output
  const rejectedTw = rejectOutput(twItem, 'Adjust hashtag density');
  assert(rejectedTw.approvalStatus === APPROVAL_STATUSES.REJECTED, 'Target Twitter item status is REJECTED');
  assert(rejectedTw.reviewerNotes === 'Adjust hashtag density', 'Rejection notes recorded');
  assert(approvedLi.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Approved LinkedIn item remains unaffected');

  // 4. Collection Categorization
  const itemsMap = {
    [approvedLi.itemId]: approvedLi,
    [rejectedTw.itemId]: rejectedTw,
    [execItem.itemId]: execItem
  };

  const socialItems = Object.values(itemsMap).filter(i => ['linkedin', 'twitter'].includes(i.formatId));
  const reportItems = Object.values(itemsMap).filter(i => ['executive-summary'].includes(i.formatId));
  const approvedCollection = Object.values(itemsMap).filter(i => i.approvalStatus === APPROVAL_STATUSES.APPROVED);
  const pendingCollection = Object.values(itemsMap).filter(i => i.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW);
  const rejectedCollection = Object.values(itemsMap).filter(i => i.approvalStatus === APPROVAL_STATUSES.REJECTED);

  assert(socialItems.length === 2, 'Social & Messaging collection filters exactly 2 items');
  assert(reportItems.length === 1, 'Documents & Reports collection filters exactly 1 item');
  assert(approvedCollection.length === 1, 'Approved collection filters exactly 1 item');
  assert(pendingCollection.length === 1, 'Pending collection filters exactly 1 item');
  assert(rejectedCollection.length === 1, 'Rejected collection filters exactly 1 item');
}

console.log('\n====================================================');
console.log(`V0.3.0 RELIABILITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
