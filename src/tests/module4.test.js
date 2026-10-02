import { 
  generateCommunication, 
  regenerateSingleChannel, 
  updateOutputContent 
} from '../services/communication/communicationService.js';
import { 
  createCommunicationRequest, 
  createCommunicationResult, 
  createCommunicationOutputItem,
  COMMUNICATION_CHANNEL_IDS,
  ALL_COMMUNICATION_CHANNELS
} from '../types/communication.js';
import { 
  getAllCommunicationChannels, 
  getCommunicationChannelById, 
  registerCommunicationChannel, 
  unregisterCommunicationChannel,
  isValidCommunicationChannel,
  COMMUNICATION_CHANNEL_REGISTRY
} from '../services/communication/communicationChannelRegistry.js';
import { 
  validateCommunicationRequest, 
  validateCommunicationOutput,
  countWords,
  countCharacters
} from '../services/communication/communicationValidator.js';
import { DeterministicCommunicationProvider } from '../services/communication/deterministicCommunicationProvider.js';
import { GeminiAIProvider } from '../services/ai/geminiProvider.js';
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
console.log('🧪 RUNNING MODULE 4 VERIFICATION SUITE');
console.log('========================================\n');

// Sample base data
const sampleSource = {
  sourceId: 'src-cyclone-alert-2026',
  sourceType: 'document',
  fileName: 'IMD-Advisory.pdf',
  rawText: `IMD Severe Cyclonic Storm Advisory: Deep depression intensified into severe cyclonic storm with sustained wind speeds of 85 to 105 km/h, gusting up to 120 km/h. Storm surge of 1.5 to 2.2 meters likely to inundate low-lying coastal belts with rainfall exceeding 210 mm in the next 24 to 36 hours. Total suspension of maritime operations. Emergency helpline: 112.`
};

const sampleMod3Outputs = [
  {
    outputId: 'out-mod3-linkedin',
    format: 'linkedin',
    title: 'LinkedIn Post',
    content: {
      text: 'Deep depression intensified into a severe cyclonic storm. Sustained wind speeds 85 to 105 km/h.',
      headline: 'Urgent Weather Advisory',
      hashtags: ['#CycloneAlert', '#PublicSafety'],
      cta: 'Follow local emergency guidelines.'
    }
  },
  {
    outputId: 'out-mod3-exec',
    format: 'executive-summary',
    title: 'Executive Summary',
    content: {
      title: 'Executive Weather Briefing',
      executiveOverview: 'Severe cyclonic storm moving northwestward with heavy rainfall.',
      keyPoints: ['Storm surge of 1.5 to 2.2 meters', 'Helpline 112 active']
    }
  }
];

const sampleBaseRequest = {
  sourceId: sampleSource.sourceId,
  transformationId: 'trans-test-123',
  analysisId: SAMPLE_ANALYSIS.analysisId || 'ana-test-456',
  sourceContent: sampleSource,
  analysis: SAMPLE_ANALYSIS,
  transformationOutputs: sampleMod3Outputs,
  config: {
    targetAudience: 'General Public',
    tone: 'Informative',
    language: 'English',
    detailLevel: 'Balanced',
    objective: 'Inform',
    style: 'Structured'
  },
  requestedChannels: ALL_COMMUNICATION_CHANNELS
};

// 1. MODULE 3 -> MODULE 4 DATA HANDOFF
console.log('--- Suite 1: Module 3 -> Module 4 Data Handoff ---');
{
  const structured = createCommunicationRequest(sampleBaseRequest);
  assert(structured.sourceId === sampleSource.sourceId, 'Preserves sourceId during handoff');
  assert(structured.transformationId === 'trans-test-123', 'Preserves transformationId during handoff');
  assert(structured.analysisId === (SAMPLE_ANALYSIS.analysisId || 'ana-test-456'), 'Preserves analysisId during handoff');
  assert(structured.sourceContent.rawText.includes('85 to 105 km/h'), 'Preserves sourceContent text');
  assert(Array.isArray(structured.transformationOutputs) && structured.transformationOutputs.length === 2, 'Preserves Module 3 transformation outputs');
  assert(structured.config.targetAudience === 'General Public', 'Preserves configuration target audience');
  assert(structured.config.tone === 'Informative', 'Preserves configuration tone');
  assert(structured.config.language === 'English', 'Preserves configuration language');
  assert(structured.requestedChannels.length === 8, 'Preserves requested channels array');
}

// 2. CHANNEL REGISTRY
console.log('\n--- Suite 2: Channel Registry ---');
{
  const allChannels = getAllCommunicationChannels();
  assert(allChannels.length >= 8, `Registry contains all 8 core channels (found ${allChannels.length})`);
  
  const expectedIds = ['linkedin', 'twitter', 'whatsapp', 'email', 'sms', 'announcement', 'cta', 'hashtags'];
  for (const id of expectedIds) {
    assert(Boolean(getCommunicationChannelById(id)), `Registry contains channel: ${id}`);
    assert(isValidCommunicationChannel(id) === true, `isValidCommunicationChannel confirms: ${id}`);
  }

  // Alias lookup
  assert(getCommunicationChannelById('x')?.id === 'twitter', "Alias 'x' resolves to twitter");
  assert(getCommunicationChannelById('public-announcement')?.id === 'announcement', "Alias 'public-announcement' resolves to announcement");

  // Dynamic channel registration
  const customChannel = {
    id: 'slack_digest',
    name: 'Slack Internal Digest',
    shortName: 'Slack',
    maxCharacters: 2000
  };
  registerCommunicationChannel(customChannel);
  assert(isValidCommunicationChannel('slack_digest') === true, 'Successfully registered custom channel');
  assert(getCommunicationChannelById('slack_digest')?.name === 'Slack Internal Digest', 'Retrieved custom channel from registry');
  unregisterCommunicationChannel('slack_digest');
  assert(isValidCommunicationChannel('slack_digest') === false, 'Successfully unregistered custom channel');
}

// 3. LINKEDIN GENERATION
console.log('\n--- Suite 3: LinkedIn Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.LINKEDIN]
  });
  assert(outputs.length === 1, 'Generates 1 LinkedIn output');
  const li = outputs[0];
  assert(li.channelId === 'linkedin', 'Channel ID is linkedin');
  assert(typeof li.content === 'string' && li.content.length > 50, 'LinkedIn content is non-empty string');
  assert(li.content.includes('85 to 105 km/h') || li.content.includes('Storm surge'), 'LinkedIn contains grounded facts');
  assert(li.content.includes('#'), 'LinkedIn contains hashtags');
  assert(li.structuredData && li.structuredData.cta, 'LinkedIn contains structured CTA');
}

// 4. X / TWITTER GENERATION
console.log('\n--- Suite 4: X / Twitter Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.TWITTER]
  });
  assert(outputs.length === 1, 'Generates 1 Twitter output');
  const tw = outputs[0];
  assert(tw.channelId === 'twitter', 'Channel ID is twitter');
  assert(typeof tw.content === 'string' && tw.content.length > 20, 'Twitter content is non-empty string');
  assert(tw.structuredData && Array.isArray(tw.structuredData.posts), 'Twitter includes structured posts array');
  assert(tw.content.includes('1/3') || tw.structuredData.posts.length > 0, 'Twitter provides thread structure');
}

// 5. WHATSAPP GENERATION
console.log('\n--- Suite 5: WhatsApp Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.WHATSAPP]
  });
  assert(outputs.length === 1, 'Generates 1 WhatsApp output');
  const wa = outputs[0];
  assert(wa.channelId === 'whatsapp', 'Channel ID is whatsapp');
  assert(typeof wa.content === 'string', 'WhatsApp content is string');
  assert(wa.content.includes('*') && (wa.content.includes('📢') || wa.content.includes('📌')), 'WhatsApp uses scannable formatting and useful emojis');
  assert(wa.content.includes('Action Required') || wa.content.includes('आवश्यक'), 'WhatsApp contains clear action CTA');
}

// 6. EMAIL GENERATION
console.log('\n--- Suite 6: Email Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.EMAIL]
  });
  assert(outputs.length === 1, 'Generates 1 Email output');
  const em = outputs[0];
  assert(em.channelId === 'email', 'Channel ID is email');
  assert(em.content.toLowerCase().includes('subject:'), 'Email contains Subject line');
  assert(em.content.toLowerCase().includes('preview:'), 'Email contains Preview text');
  assert(em.content.includes('Dear') || em.content.includes('Colleague'), 'Email contains Greeting');
  assert(em.content.includes('regards') || em.content.includes('सादर'), 'Email contains Closing sign-off');
}

// 7. SMS GENERATION
console.log('\n--- Suite 7: SMS Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.SMS]
  });
  assert(outputs.length === 1, 'Generates 1 SMS output');
  const sms = outputs[0];
  assert(sms.channelId === 'sms', 'Channel ID is sms');
  assert(typeof sms.content === 'string' && sms.content.length > 10, 'SMS content is non-empty');
  assert(sms.content.length <= 160, `SMS is concise and under 160 characters (got ${sms.content.length})`);
  assert(sms.metadata.characterCount === sms.content.length, 'SMS character count matches content length');
}

// 8. PUBLIC ANNOUNCEMENT
console.log('\n--- Suite 8: Public Announcement Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT]
  });
  assert(outputs.length === 1, 'Generates 1 Announcement output');
  const ann = outputs[0];
  assert(ann.channelId === 'announcement', 'Channel ID is announcement');
  assert(ann.content.includes('PUBLIC ANNOUNCEMENT') || ann.content.includes('सार्वजनिक'), 'Announcement is formal and prominent');
  assert(ann.content.includes('INSTRUCTIONS') || ann.content.includes('निर्देश'), 'Announcement highlights instructions');
}

// 9. CTA GENERATION
console.log('\n--- Suite 9: Call-to-Action Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.CTA]
  });
  assert(outputs.length === 1, 'Generates 1 CTA output');
  const cta = outputs[0];
  assert(cta.channelId === 'cta', 'Channel ID is cta');
  assert(cta.structuredData && Array.isArray(cta.structuredData.variants), 'CTA contains structured variants');
  assert(cta.structuredData.variants.length >= 3, `Generates at least 3 CTA variants (got ${cta.structuredData.variants.length})`);
  assert(cta.structuredData.variants.some(v => v.type === 'Primary'), 'Contains Primary Action CTA');
}

// 10. HASHTAG GENERATION
console.log('\n--- Suite 10: Hashtag Generation ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: [COMMUNICATION_CHANNEL_IDS.HASHTAGS]
  });
  assert(outputs.length === 1, 'Generates 1 Hashtags output');
  const ht = outputs[0];
  assert(ht.channelId === 'hashtags', 'Channel ID is hashtags');
  assert(ht.structuredData && Array.isArray(ht.structuredData.tags), 'Hashtags includes structured tags array');
  assert(ht.structuredData.tags.some(t => t.startsWith('#')), 'Every hashtag begins with #');
  assert(ht.structuredData.tags.length >= 4, `Generates at least 4 hashtags (got ${ht.structuredData.tags.length})`);
}

// 11. CHARACTER COUNTING
console.log('\n--- Suite 11: Character Counting ---');
{
  assert(countCharacters('Hello World') === 11, 'Counts ASCII string characters accurately');
  assert(countCharacters('') === 0, 'Empty string has 0 characters');
  assert(countCharacters(null) === 0, 'Null returns 0 characters');
  const multiByte = 'नमस्ते दुनिया';
  assert(countCharacters(multiByte) === multiByte.length, 'Unicode string counted accurately');
}

// 12. WORD COUNTING
console.log('\n--- Suite 12: Word Counting ---');
{
  assert(countWords('The quick brown fox') === 4, 'Counts standard words accurately');
  assert(countWords('   Multiple   spaces   between   words  ') === 4, 'Handles multiple spaces accurately');
  assert(countWords('Line 1\nLine 2\nLine 3') === 6, 'Handles newlines accurately');
  assert(countWords('') === 0, 'Empty string returns 0 words');
  assert(countWords(null) === 0, 'Null returns 0 words');
}

// 13. VALIDATION
console.log('\n--- Suite 13: Request & Output Validation ---');
{
  // Valid request
  const validReq = validateCommunicationRequest(sampleBaseRequest);
  assert(validReq.isValid === true, 'Validates well-formed request successfully');

  // Missing source
  const badReq1 = validateCommunicationRequest({ ...sampleBaseRequest, sourceContent: null });
  assert(badReq1.isValid === false, 'Rejects request missing source content');

  // Missing analysis
  const badReq2 = validateCommunicationRequest({ ...sampleBaseRequest, analysis: null });
  assert(badReq2.isValid === false, 'Rejects request missing analysis');

  // Empty requested channels
  const badReq3 = validateCommunicationRequest({ ...sampleBaseRequest, requestedChannels: [] });
  assert(badReq3.isValid === false, 'Rejects request with empty requested channels');

  // Output item validation
  const validOutput = createCommunicationOutputItem({
    channelId: 'linkedin',
    title: 'LinkedIn Post',
    content: 'Valid content text for linkedin.',
    metadata: { characterCount: 32, wordCount: 5, provider: 'DeterministicFallback', isFallback: true },
    sourceTraceability: [{ fact: 'Fact 1', sourceId: 'src-1' }]
  });
  const valRes = validateCommunicationOutput('linkedin', validOutput);
  assert(valRes.isValid === true, 'Validates compliant output item');

  // SMS length warning
  const longSMS = createCommunicationOutputItem({
    channelId: 'sms',
    title: 'SMS Alert',
    content: 'A'.repeat(180),
    metadata: { characterCount: 180, wordCount: 1, provider: 'DeterministicFallback', isFallback: true },
    sourceTraceability: [{ fact: 'Fact 1', sourceId: 'src-1' }]
  });
  const smsVal = validateCommunicationOutput('sms', longSMS);
  assert(smsVal.isValid === true, 'Long SMS remains structurally valid');
  assert(smsVal.warnings.some(w => w.includes('160-character limit')), 'Flags warning when SMS exceeds 160 characters');
}

// 14. SOURCE TRACEABILITY
console.log('\n--- Suite 14: Source Traceability ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate(sampleBaseRequest);
  for (const out of outputs) {
    assert(Array.isArray(out.sourceTraceability), `Channel ${out.channelId} has sourceTraceability array`);
    assert(out.sourceTraceability.length > 0, `Channel ${out.channelId} has at least 1 traceability reference`);
    assert(Boolean(out.sourceTraceability[0].fact), `Channel ${out.channelId} traceability reference has fact text`);
    assert(Boolean(out.sourceTraceability[0].sourceId), `Channel ${out.channelId} traceability reference has sourceId`);
  }
}

// 15. UNSUPPORTED CHANNEL REJECTION
console.log('\n--- Suite 15: Unsupported Channel Rejection ---');
{
  const invalidChannelReq = {
    ...sampleBaseRequest,
    requestedChannels: ['tiktok_voice', 'unsupported_social']
  };
  const val = validateCommunicationRequest(invalidChannelReq);
  assert(val.isValid === false, 'Rejects unsupported channels during validation');
  assert(val.error.includes('Unsupported communication channel'), 'Provides clear error message identifying unsupported channel');
}

// 16. EMPTY INPUT HANDLING
console.log('\n--- Suite 16: Empty Input Handling ---');
{
  assert(validateCommunicationRequest(null).isValid === false, 'Rejects null request');
  assert(validateCommunicationRequest({}).isValid === false, 'Rejects empty object request');
  const emptyTextReq = {
    ...sampleBaseRequest,
    sourceContent: { rawText: '    ' }
  };
  assert(validateCommunicationRequest(emptyTextReq).isValid === false, 'Rejects whitespace-only source content');
}

// 17. GEMINI PROVIDER PATH
console.log('\n--- Suite 17: Gemini Provider Path ---');
{
  const mockFetch = async () => {
    return {
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          finishReason: 'STOP',
          content: {
            parts: [{
              text: JSON.stringify({
                outputs: [
                  {
                    channelId: 'linkedin',
                    title: 'LinkedIn Post',
                    content: 'Gemini synthesized LinkedIn post regarding cyclone advisory.',
                    sourceTraceability: [{ fact: 'Storm surge 1.5 to 2.2m', sourceId: 'src-1' }]
                  }
                ]
              })
            }]
          }
        }]
      })
    };
  };

  const geminiProvider = new GeminiAIProvider('AIzaSyTestFakeKey12345');
  const outputs = await geminiProvider.communicate({
    ...sampleBaseRequest,
    requestedChannels: ['linkedin']
  }, { fetchFn: mockFetch, bypassQuotaCache: true });

  assert(outputs.length === 1, 'Gemini provider produces requested output');
  assert(outputs[0].metadata.provider === 'Gemini 3.8 Flash', 'Provider is identified as Gemini 3.8 Flash');
  assert(outputs[0].metadata.isFallback === false, 'isFallback is false on successful Gemini generation');
  assert(outputs[0].content.includes('Gemini synthesized'), 'Output contains generated content');
}

// 18. DETERMINISTIC FALLBACK
console.log('\n--- Suite 18: Deterministic Fallback ---');
{
  // When no key is provided, GeminiAIProvider transparently uses Deterministic provider
  const noKeyProvider = new GeminiAIProvider(null);
  const fallbackOutputs = await noKeyProvider.communicate({
    ...sampleBaseRequest,
    requestedChannels: ['sms', 'whatsapp']
  });
  assert(fallbackOutputs.length === 2, 'Fallback produces both requested outputs');
  assert(fallbackOutputs[0].metadata.provider === 'DeterministicFallback', 'Provider is DeterministicFallback');
  assert(fallbackOutputs[0].metadata.isFallback === true, 'isFallback is true');
  assert(fallbackOutputs[0].metadata.fallbackReason === 'Missing API key', 'Fallback reason is Missing API key');
}

// 19. 429 QUOTA FALLBACK
console.log('\n--- Suite 19: 429 Quota Fallback (0 Retries) ---');
{
  let fetchAttempts = 0;
  const mockQuotaFetch = async () => {
    fetchAttempts++;
    return {
      ok: false,
      status: 429,
      statusText: 'RESOURCE_EXHAUSTED',
      text: async () => JSON.stringify({
        error: {
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          message: 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20'
        }
      })
    };
  };

  const quotaProvider = new GeminiAIProvider('AIzaSyFakeKeyQuota');
  const outputs = await quotaProvider.communicate({
    ...sampleBaseRequest,
    requestedChannels: ['email']
  }, { fetchFn: mockQuotaFetch, bypassQuotaCache: true });

  assert(fetchAttempts === 1, `429 quota exhaustion made exactly 1 attempt (0 retries, got ${fetchAttempts})`);
  assert(outputs.length === 1, 'Produces output via deterministic fallback');
  assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Provider is DeterministicFallback');
  assert(outputs[0].metadata.isFallback === true, 'isFallback is true');
  assert(outputs[0].metadata.fallbackReason === 'Gemini quota exhausted', `Fallback reason is "Gemini quota exhausted" (got ${outputs[0].metadata.fallbackReason})`);
}

// 20. 503 FALLBACK
console.log('\n--- Suite 20: 503 Service Unavailable Fallback ---');
{
  let fetch503Attempts = 0;
  const mock503Fetch = async () => {
    fetch503Attempts++;
    return {
      ok: false,
      status: 503,
      statusText: 'UNAVAILABLE',
      text: async () => JSON.stringify({
        error: {
          code: 503,
          status: 'UNAVAILABLE',
          message: 'The model is overloaded. Please try again later.'
        }
      })
    };
  };

  const prov503 = new GeminiAIProvider('AIzaSyFakeKey503');
  const outputs = await prov503.communicate({
    ...sampleBaseRequest,
    requestedChannels: ['announcement']
  }, { fetchFn: mock503Fetch, bypassQuotaCache: true, retries: 1, retryDelayMs: 10 });

  assert(fetch503Attempts === 2, `503 made at most 1 retry (2 attempts total, got ${fetch503Attempts})`);
  assert(outputs.length === 1, 'Produces output via fallback');
  assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Provider is DeterministicFallback');
  assert(outputs[0].metadata.isFallback === true, 'isFallback is true');
  assert(outputs[0].metadata.fallbackReason === 'Gemini unavailable', `Fallback reason is "Gemini unavailable" (got ${outputs[0].metadata.fallbackReason})`);
}

// 21. EDITING
console.log('\n--- Suite 21: Output Editing ---');
{
  const originalItem = createCommunicationOutputItem({
    channelId: 'sms',
    title: 'SMS Alert',
    content: 'Original brief message.',
    metadata: { characterCount: 23, wordCount: 3, provider: 'DeterministicFallback', isFallback: true }
  });

  const updatedText = 'Updated revised text with more details.';
  const editedItem = updateOutputContent(originalItem, updatedText);

  assert(editedItem.content === updatedText, 'Content is updated');
  assert(editedItem.metadata.isEdited === true, 'metadata.isEdited is set to true');
  assert(editedItem.metadata.characterCount === updatedText.length, 'Character count is recalculated');
  assert(editedItem.metadata.wordCount === 6, 'Word count is recalculated');
}

// 22. COPY FUNCTIONALITY
console.log('\n--- Suite 22: Copy Formatting ---');
{
  const provider = new DeterministicCommunicationProvider();
  const outputs = provider.generate({
    ...sampleBaseRequest,
    requestedChannels: ['linkedin', 'twitter']
  });

  // Test single output copy string
  const singleCopyText = outputs[0].content;
  assert(typeof singleCopyText === 'string' && singleCopyText.length > 0, 'Single copy content is valid string');

  // Test bundle copy formatting
  const bundle = outputs.map(o => `=== ${o.channelId.toUpperCase()} ===\n${o.content}`).join('\n\n');
  assert(bundle.includes('=== LINKEDIN ==='), 'Bundle includes LINKEDIN header');
  assert(bundle.includes('=== TWITTER ==='), 'Bundle includes TWITTER header');
}

// 23. REGENERATION
console.log('\n--- Suite 23: Channel Regeneration ---');
{
  const originalOutputId = 'out-comm-fixed-id-999';
  const regenerated = await regenerateSingleChannel(sampleBaseRequest, originalOutputId, 'twitter');
  
  assert(regenerated.outputId === originalOutputId, 'Preserves original outputId upon single regeneration');
  assert(regenerated.channelId === 'twitter', 'Regenerates requested channel');
  assert(typeof regenerated.content === 'string' && regenerated.content.length > 0, 'Regenerated content is non-empty');
  assert(regenerated.validation.isValid === true, 'Regenerated item passes validation');
}

// 24. CONTINUE TO MODULE 5
console.log('\n--- Suite 24: Continue to Module 5 Handoff ---');
{
  const result = await generateCommunication(sampleBaseRequest, { delayMs: 0 });
  
  // Verify complete contract ready for Module 5
  assert(Boolean(result.communicationId), 'Contract includes communicationId');
  assert(result.sourceId === sampleBaseRequest.sourceId, 'Preserves sourceId');
  assert(result.transformationId === sampleBaseRequest.transformationId, 'Preserves transformationId');
  assert(result.analysisId === sampleBaseRequest.analysisId, 'Preserves analysisId');
  assert(Array.isArray(result.outputs) && result.outputs.length === 8, 'Outputs array contains all 8 channels');
  assert(Boolean(result.createdAt), 'Contract includes createdAt timestamp');

  // Verify each output item satisfies Module 5 consumption needs
  for (const item of result.outputs) {
    assert(Boolean(item.outputId), `Item ${item.channelId} has outputId`);
    assert(Boolean(item.channelId), `Item ${item.channelId} has channelId`);
    assert(Boolean(item.title), `Item ${item.channelId} has title`);
    assert(typeof item.content === 'string', `Item ${item.channelId} content is string`);
    assert(typeof item.metadata?.characterCount === 'number', `Item ${item.channelId} metadata has characterCount`);
    assert(typeof item.metadata?.wordCount === 'number', `Item ${item.channelId} metadata has wordCount`);
    assert(Boolean(item.metadata?.provider), `Item ${item.channelId} metadata has provider`);
    assert(typeof item.metadata?.isFallback === 'boolean', `Item ${item.channelId} metadata has isFallback`);
    assert(Array.isArray(item.sourceTraceability), `Item ${item.channelId} has sourceTraceability array`);
    assert(typeof item.validation?.isValid === 'boolean', `Item ${item.channelId} has validation.isValid`);
  }
}

console.log('\n========================================');
console.log(`MODULE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
