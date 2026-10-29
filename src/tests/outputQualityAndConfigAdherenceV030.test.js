/**
 * InfoFlip-AI v0.3.0 Part 2 Test Suite: Output Quality and Configuration Adherence
 *
 * Validates:
 * 1. Format-specific generation instructions and structures for all supported formats.
 * 2. Settings adherence across Language, Target Audience, Tone, Detail Level, Objective, and Style.
 * 3. Length limits and platform constraints (SMS <= 160 chars, Twitter <= 280 chars, Hashtags <= 25 chars).
 * 4. Prevention of cross-format and cross-channel duplication.
 * 5. Structured response validation and safe fallback preservation (Part 1 resilience).
 * 6. Follow-up instruction context resolution across all 7 configuration parameters.
 */

import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import { 
  OUTPUT_FORMAT_IDS, 
  COMMUNICATION_OBJECTIVES, 
  CONTENT_STYLES,
  TARGET_AUDIENCES,
  TRANSFORMATION_TONES
} from '../types/transformation.js';
import { COMMUNICATION_CHANNEL_IDS } from '../types/communication.js';
import { 
  getOutputFormatById, 
  OUTPUT_FORMAT_REGISTRY 
} from '../services/transformation/outputFormatRegistry.js';
import { 
  getCommunicationChannelById, 
  COMMUNICATION_CHANNEL_REGISTRY 
} from '../services/communication/communicationChannelRegistry.js';
import { 
  buildTransformationSystemPrompt, 
  buildTransformationUserPrompt,
  getAudienceDirectives,
  getToneDirectives,
  getDetailDirectives,
  getObjectiveDirectives,
  getStyleDirectives,
  getLanguageDirectives
} from '../services/transformation/transformationPrompts.js';
import { 
  buildCommunicationSystemPrompt, 
  buildCommunicationUserPrompt 
} from '../services/communication/communicationPrompts.js';
import { DeterministicTransformer } from '../services/transformation/deterministicTransformer.js';
import { DeterministicCommunicationProvider } from '../services/communication/deterministicCommunicationProvider.js';
import { GeminiAIProvider } from '../services/ai/geminiProvider.js';
import { 
  WORKSPACE_FORMATS, 
  resolveFollowUpContext, 
  partitionRequestedFormats 
} from '../services/workspace/chatPipelineOrchestrator.js';

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

const SAMPLE_SOURCE = {
  sourceId: 'src-cyclone-01',
  extractedText: 'Cyclone storm alert issued for coastal districts of Maharashtra and Gujarat. Sustained winds of 105 km/h with gusts reaching 120 km/h. Coastal areas advised to evacuate low-lying zones immediately. Maritime operations suspended through Friday. Emergency operations center activated under helpline 112. Power backup and water supply reserves deployed.'
};

const SAMPLE_ANALYSIS = {
  analysisId: 'ana-cyclone-01',
  overview: {
    title: 'Severe Cyclonic Storm Alert',
    mainTopic: 'Severe Cyclonic Storm Alert',
    summary: 'A severe cyclone warning has been issued for coastal Maharashtra and Gujarat with 105 km/h sustained winds.',
    category: 'Disaster Management'
  },
  intent: { primary: 'Advise', secondary: ['Warn', 'Instruct'] },
  tone: { primary: 'Urgent', secondary: ['Authoritative'] },
  urgency: { level: 'high', reasons: ['Immediate severe weather threat to human life and coastal infrastructure'] },
  keyFacts: [
    { fact: 'Sustained winds of 105 km/h with gusts reaching 120 km/h.', importance: 'high' },
    { fact: 'Evacuation advised for all low-lying coastal zones.', importance: 'high' },
    { fact: 'Maritime operations suspended through Friday.', importance: 'medium' },
    { fact: 'Emergency operations center activated under helpline 112.', importance: 'high' }
  ],
  importantNumbers: [
    { value: '105 km/h', label: 'Wind Speed', context: 'Sustained coastal winds' },
    { value: '120 km/h', label: 'Wind Gusts', context: 'Peak gusts' },
    { value: '112', label: 'Helpline', context: 'Emergency response center' }
  ],
  importantDates: [
    { date: 'Friday', context: 'Maritime operations suspension' }
  ],
  entities: {
    organizations: ['Disaster Management Authority', 'Emergency Operations Center'],
    locations: ['Maharashtra', 'Gujarat']
  }
};

export async function runOutputQualityAndConfigAdherenceTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING V0.3.0 OUTPUT QUALITY & CONFIGURATION ADHERENCE SUITE');
  console.log('================================================================\n');

  const transformer = new DeterministicTransformer();
  const commProvider = new DeterministicCommunicationProvider();

  // ---------------------------------------------------------------------------
  // Suite 1: Format-Specific Instructions & Structural Integrity
  // ---------------------------------------------------------------------------
  console.log('--- Suite 1: Format-Specific Instructions & Structural Integrity ---');

  runTest('All 13 workspace formats have registered metadata and distinct IDs', () => {
    assert.equal(WORKSPACE_FORMATS.length, 13, 'Must have exactly 13 workspace formats');
    const ids = WORKSPACE_FORMATS.map(f => f.id);
    assert(ids.includes('linkedin'), 'Includes linkedin');
    assert(ids.includes('twitter'), 'Includes twitter');
    assert(ids.includes('whatsapp'), 'Includes whatsapp');
    assert(ids.includes('email'), 'Includes email');
    assert(ids.includes('sms'), 'Includes sms');
    assert(ids.includes('announcement'), 'Includes announcement');
    assert(ids.includes('cta'), 'Includes cta');
    assert(ids.includes('hashtags'), 'Includes hashtags');
    assert(ids.includes('executive-summary'), 'Includes executive-summary');
    assert(ids.includes('advisory'), 'Includes advisory');
    assert(ids.includes('infographic'), 'Includes infographic');
    assert(ids.includes('presentation'), 'Includes presentation');
    assert(ids.includes('video-script'), 'Includes video-script');
  });

  runTest('LinkedIn channel instructions enforce professional structure and reject engagement bait', () => {
    const linkedinDef = getCommunicationChannelById('linkedin');
    assert(linkedinDef, 'LinkedIn definition exists');
    const instructions = linkedinDef.promptInstructions;
    assert(instructions.includes('Professional, readable structure'), 'Instructs professional structure');
    assert(instructions.includes('Avoid generic engagement bait'), 'Instructs avoiding engagement bait');
    assert(instructions.includes('avoid unsupported claims'), 'Instructs avoiding unsupported claims');
    assert(instructions.includes('3-5 readable, relevant hashtags'), 'Instructs 3-5 readable hashtags');
  });

  runTest('WhatsApp channel instructions enforce concise wording, bolding, and no excessive hashtags', () => {
    const waDef = getCommunicationChannelById('whatsapp');
    assert(waDef, 'WhatsApp definition exists');
    const instructions = waDef.promptInstructions;
    assert(instructions.includes('Concise, conversational wording'), 'Instructs concise conversational wording');
    assert(instructions.toLowerCase().includes('avoid unnecessary bureaucratic headings'), 'Instructs avoiding bureaucratic headings');
    assert(instructions.toLowerCase().includes('limit to 0-1 hashtags'), 'Instructs limiting hashtags to 0-1');
  });

  runTest('Twitter/X instructions enforce 280-char limit, threads, and not cutting off facts', () => {
    const twitterDef = getCommunicationChannelById('twitter');
    assert(twitterDef, 'Twitter definition exists');
    const instructions = twitterDef.promptInstructions;
    assert(instructions.includes('280-character limit'), 'Enforces 280 chars per tweet');
    assert(instructions.includes('numbered thread'), 'Enforces thread when depth required');
    assert(instructions.includes('Never cut off important facts'), 'Prohibits cutting off vital facts or numbers');
  });

  runTest('Article and Summary aliases resolve cleanly to executive-summary format', () => {
    const articleDef = getOutputFormatById('article');
    const summaryDef = getOutputFormatById('summary');
    const execDef = getOutputFormatById('executive-summary');

    assert.equal(articleDef.id, OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY, 'article resolves to executive-summary');
    assert.equal(summaryDef.id, OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY, 'summary resolves to executive-summary');
    assert.equal(articleDef, execDef, 'article references executive-summary definition');
    assert(execDef.promptInstructions.includes('Executive Summary or Article-style brief'), 'Instructions cover Article framing');
    assert(execDef.promptInstructions.includes('Avoid adding opinions or facts absent from the source'), 'Instructions forbid adding facts');
  });

  // ---------------------------------------------------------------------------
  // Suite 2: Setting Adherence (Language, Audience, Tone, Detail, Objective, Style)
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 2: Settings Adherence (All 6 Parameters Applied to Output) ---');

  runTest('Language setting controls output language and Devanagari script for Hindi and Marathi', () => {
    const reqHindi = {
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      configuration: { language: 'Hindi', tone: 'Urgent', detailLevel: 'Balanced', targetAudience: 'General Public' },
      requestedOutputs: ['executive-summary', 'advisory']
    };
    const hindiOutputs = transformer.transform(reqHindi);
    const execHindi = hindiOutputs.find(o => o.format === 'executive-summary');
    const advHindi = hindiOutputs.find(o => o.format === 'advisory');

    assert(/[\u0900-\u097F]/.test(execHindi.content.title), 'Hindi executive summary has Devanagari in title');
    assert(/[\u0900-\u097F]/.test(advHindi.content.title), 'Hindi advisory has Devanagari in title');

    const reqMarathi = {
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      configuration: { language: 'Marathi', tone: 'Urgent', detailLevel: 'Balanced', targetAudience: 'General Public' },
      requestedOutputs: ['executive-summary']
    };
    const marathiOutputs = transformer.transform(reqMarathi);
    const execMarathi = marathiOutputs.find(o => o.format === 'executive-summary');
    assert(/[\u0900-\u097F]/.test(execMarathi.content.title), 'Marathi executive summary has Devanagari in title');

    // Prompt generator verification
    const hindiDirective = getLanguageDirectives('Hindi');
    assert(hindiDirective.includes('HINDI (हिंदी)'), 'Prompt directive enforces Hindi Devanagari');
    const marathiDirective = getLanguageDirectives('Marathi');
    assert(marathiDirective.includes('MARATHI (मराठी)'), 'Prompt directive enforces Marathi Devanagari');
  });

  runTest('Audience setting calibrates explanation depth, tone register, and greetings', () => {
    const execDirective = getAudienceDirectives('Executives');
    assert(execDirective.includes('strategic implications'), 'Executives directive focuses on strategic implications');

    const devDirective = getAudienceDirectives('Developers');
    assert(devDirective.includes('precise technical terminology'), 'Developers directive focuses on technical terminology');

    const studentDirective = getAudienceDirectives('Students');
    assert(studentDirective.includes('accessible educational explanations'), 'Students directive focuses on educational explanations');

    // Email generator reflects audience in greeting
    const emailRes = commProvider.buildEmail({
      mainTopic: 'Cyclone Alert',
      summary: 'Storm update',
      keyFacts: ['105 km/h winds'],
      audience: 'Coastal Residents',
      tone: 'Urgent',
      lang: 'English'
    });
    assert(emailRes.content.includes('Dear Coastal Residents,'), 'Email greeting directly addresses requested audience');
  });

  runTest('Tone setting modifies phrasing, urgent indicators, and prefixes without altering facts', () => {
    const urgentDirective = getToneDirectives('Urgent');
    assert(urgentDirective.includes('high-priority phrasing'), 'Urgent tone requests high-priority phrasing');

    const formalDirective = getToneDirectives('Formal');
    assert(formalDirective.includes('authoritative professional register'), 'Formal tone requests authoritative register');

    // WhatsApp broadcast changes prefix based on tone
    const urgentWA = commProvider.buildWhatsApp({
      mainTopic: 'Cyclone Warning',
      summary: 'Storm coming',
      keyFacts: ['105 km/h winds'],
      tone: 'Urgent',
      lang: 'English'
    });
    assert(urgentWA.content.includes('⚠️ URGENT ADVISORY'), 'Urgent tone produces urgent advisory prefix in WhatsApp');

    const standardWA = commProvider.buildWhatsApp({
      mainTopic: 'Quarterly Review',
      summary: 'Standard meeting',
      keyFacts: ['Quarterly figures'],
      tone: 'Informative',
      lang: 'English'
    });
    assert(standardWA.content.includes('📢 OFFICIAL BROADCAST'), 'Informative tone produces standard broadcast prefix');
  });

  runTest('Detail level controls length, slide count, bullet count, and duration', () => {
    const conciseDirective = getDetailDirectives('Concise');
    assert(conciseDirective.includes('2-3 core points'), 'Concise directive limits to 2-3 points');

    const detailedDirective = getDetailDirectives('Detailed');
    assert(detailedDirective.includes('5-7 key points'), 'Detailed directive expands to 5-7 points');

    // Presentation slides: Concise (3 slides) vs Detailed/Balanced (5 slides)
    const presConcise = transformer.generatePresentation(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Concise'
    });
    assert.equal(presConcise.slides.length, 3, 'Concise presentation generates exactly 3 slides');

    const presBalanced = transformer.generatePresentation(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Balanced'
    });
    assert.equal(presBalanced.slides.length, 5, 'Balanced presentation generates exactly 5 slides');

    // Video script duration and scenes
    const videoConcise = transformer.generateVideoScript(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Concise'
    });
    assert.equal(videoConcise.scenes.length, 3, 'Concise video script has 3 scenes');
    assert.equal(videoConcise.durationEstimate, '45 seconds', 'Concise video script is 45s');

    const videoDetailed = transformer.generateVideoScript(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Detailed'
    });
    assert.equal(videoDetailed.scenes.length, 5, 'Detailed video script has 5 scenes');
    assert.equal(videoDetailed.durationEstimate, '90 seconds', 'Detailed video script is 90s');

    // Executive summary points count
    const execConcise = transformer.generateExecutiveSummary(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Concise'
    });
    assert(execConcise.keyPoints.length <= 2, 'Concise executive summary has at most 2 key points');

    const execDetailed = transformer.generateExecutiveSummary(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Detailed'
    });
    assert(execDetailed.keyPoints.length >= 4, 'Detailed executive summary has 4 or more key points');
  });

  runTest('Objective setting shapes communication intent and output headers', () => {
    const adviseDirective = getObjectiveDirectives('Advise');
    assert(adviseDirective.includes('Objective: ADVISE'), 'Generates Advise objective directive');

    const educateDirective = getObjectiveDirectives('Educate');
    assert(educateDirective.includes('Objective: EDUCATE'), 'Generates Educate objective directive');

    // Executive summary title adapts to objective
    const execAdvise = transformer.generateExecutiveSummary(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Balanced',
      objective: 'Advise'
    });
    assert(execAdvise.title.includes('Strategic Advisory Summary'), 'Title reflects Advise objective');

    const execEducate = transformer.generateExecutiveSummary(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'General Public',
      tone: 'Informative',
      lang: 'English',
      detail: 'Balanced',
      objective: 'Educate'
    });
    assert(execEducate.title.includes('Educational Synthesis & Summary'), 'Title reflects Educate objective');

    // Announcement headline adapts to objective
    const annAdvise = commProvider.buildAnnouncement({
      mainTopic: 'Cyclone Alert',
      summary: 'Storm coming',
      keyFacts: ['105 km/h winds'],
      dates: [{ date: 'Friday', context: 'Storm landing' }],
      urgency: 'high',
      lang: 'English',
      objective: 'Advise'
    });
    assert(annAdvise.content.includes('PUBLIC ADVISORY NOTICE'), 'Announcement headline reflects Advise objective');
  });

  runTest('Style setting shapes presentation format without violating factual ground truth', () => {
    const plainDirective = getStyleDirectives('Plain Text');
    assert(plainDirective.includes('Style: PLAIN TEXT'), 'Generates Plain Text style directive');

    const bulletDirective = getStyleDirectives('Bullet Points');
    assert(bulletDirective.includes('Style: BULLET POINTS'), 'Generates Bullet Points style directive');

    const techDirective = getStyleDirectives('Technical');
    assert(techDirective.includes('Style: TECHNICAL'), 'Generates Technical style directive');

    // Advisory title adapts to Technical style
    const advTech = transformer.generateAdvisory(SAMPLE_SOURCE, SAMPLE_ANALYSIS, {
      audienceStr: 'Engineers',
      tone: 'Technical',
      lang: 'English',
      style: 'Technical'
    });
    assert(advTech.title.includes('TECHNICAL ADVISORY BRIEF'), 'Advisory reflects Technical style');
  });

  // ---------------------------------------------------------------------------
  // Suite 3: Platform Constraints & Length Limits
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 3: Platform Constraints & Length Limits ---');

  runTest('SMS alert strictly enforces <= 160 characters across all variants', () => {
    const longTopicSource = {
      mainTopic: 'Severe Tropical Cyclonic Storm Formation Over Bay of Bengal Affecting Multiple Coastal Districts',
      keyFacts: ['Extremely dangerous sustained gale force winds exceeding 120 km/h with catastrophic flooding rainfall expected over multiple regions.'],
      dates: [{ date: 'Friday morning at 08:00 AM IST' }],
      numbers: [{ value: '120 km/h', label: 'Wind Speed' }],
      lang: 'English',
      sourceId: 'src-test'
    };

    const smsRes = commProvider.buildSMS(longTopicSource);
    assert(smsRes.content.length <= 160, `SMS must be <= 160 chars (got ${smsRes.content.length})`);
    assert(smsRes.structuredData.isUnderLimit === true, 'isUnderLimit is true');
  });

  runTest('Twitter thread enforces <= 280 characters per tweet', () => {
    const twitterRes = commProvider.buildTwitter({
      mainTopic: 'Severe Cyclonic Storm Update For Coastal Areas',
      summary: 'Extensive damage reported across low-lying coastal villages with urgent evacuation orders issued by district administration.',
      keyFacts: [
        'Sustained wind velocities of 105 km/h recorded with gusts touching 120 km/h.',
        'Total precipitation exceeding 210mm recorded over the last 24 hours.'
      ],
      numbers: [{ value: '105 km/h', label: 'Winds' }],
      lang: 'English',
      detail: 'Detailed'
    });

    const posts = twitterRes.structuredData.posts;
    assert(posts.length >= 2, 'Detailed Twitter generates multi-post thread');
    for (let i = 0; i < posts.length; i++) {
      assert(posts[i].length <= 280, `Tweet ${i + 1} exceeds 280 characters: length is ${posts[i].length}`);
    }
  });

  runTest('Hashtag suggestions strictly enforce concise tags (<= 25 characters)', () => {
    const tagsRes = commProvider.buildHashtags({
      mainTopic: 'Cyclone Alert',
      analysis: SAMPLE_ANALYSIS,
      entities: SAMPLE_ANALYSIS.entities,
      sourceId: 'src-1'
    });

    assert(Array.isArray(tagsRes.structuredData.tags), 'Tags are returned as an array');
    assert(tagsRes.structuredData.tags.length > 0, 'Tags list is non-empty');
    for (const tag of tagsRes.structuredData.tags) {
      assert(tag.startsWith('#'), 'Tag starts with #');
      assert(tag.length <= 25, `Tag exceeds 25 characters: ${tag}`);
    }
  });

  // ---------------------------------------------------------------------------
  // Suite 4: Prevention of Cross-Format & Cross-Channel Duplication
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 4: Prevention of Cross-Format & Cross-Channel Duplication ---');

  runTest('Multi-format generation produces distinct, non-identical outputs for each format', () => {
    const multiReq = {
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      configuration: { language: 'English', tone: 'Urgent', detailLevel: 'Balanced', targetAudience: 'General Public' },
      requestedOutputs: ['linkedin', 'twitter', 'executive-summary', 'advisory', 'infographic', 'presentation', 'video-script']
    };

    const outputs = transformer.transform(multiReq);
    assert.equal(outputs.length, 7, 'Produced 7 outputs');

    const serializedSet = new Set();
    for (const out of outputs) {
      const text = JSON.stringify(out.content);
      assert(!serializedSet.has(text), `Duplicate content found for format '${out.format}'`);
      serializedSet.add(text);
    }
  });

  runTest('Multi-channel communication generation produces distinct, non-identical outputs', () => {
    const commReq = {
      sourceId: 'src-1',
      sourceContent: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      transformationOutputs: [],
      config: { language: 'English', tone: 'Urgent', detailLevel: 'Balanced', targetAudience: 'General Public' },
      requestedChannels: ['linkedin', 'twitter', 'whatsapp', 'email', 'sms', 'announcement', 'cta', 'hashtags']
    };

    const commOutputs = commProvider.generate(commReq);
    assert.equal(commOutputs.length, 8, 'Produced 8 channel outputs');

    const contentSet = new Set();
    for (const out of commOutputs) {
      assert(!contentSet.has(out.content), `Duplicate content found for channel '${out.channelId}'`);
      contentSet.add(out.content);
    }
  });

  await runAsyncTest('GeminiAIProvider detects and rejects cross-format duplication from model', async () => {
    const fakeDuplicateJson = {
      outputs: [
        { format: 'executive-summary', content: { title: 'Same Text', executiveOverview: 'Exact same copy', keyPoints: ['Point 1'] } },
        { format: 'advisory', content: { title: 'Same Text', executiveOverview: 'Exact same copy', keyPoints: ['Point 1'] } }
      ]
    };

    const mockFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          content: { parts: [{ text: JSON.stringify(fakeDuplicateJson) }] },
          finishReason: 'STOP'
        }]
      })
    });

    const provider = new GeminiAIProvider('mock-key', { fetchFn: mockFetch });
    // When duplicate content is returned by model, provider must safely catch it and fall back to deterministic engine
    const results = await provider.transform({
      transformationId: 'trans-test',
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      configuration: { language: 'English' },
      requestedOutputs: ['executive-summary', 'advisory']
    });

    assert.equal(results.length, 2, 'Fallback returns 2 outputs');
    assert(results[0].metadata.isFallback === true, 'Safely falls back due to duplicate detection');
    // And the fallback outputs must be distinct
    assert.notEqual(JSON.stringify(results[0].content), JSON.stringify(results[1].content), 'Fallback produces distinct outputs');
  });

  await runAsyncTest('GeminiAIProvider detects and rejects cross-channel duplication from model', async () => {
    const fakeDuplicateCommJson = {
      outputs: [
        { channelId: 'whatsapp', content: 'Identical message broadcast copy' },
        { channelId: 'sms', content: 'Identical message broadcast copy' }
      ]
    };

    const mockFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          content: { parts: [{ text: JSON.stringify(fakeDuplicateCommJson) }] },
          finishReason: 'STOP'
        }]
      })
    });

    const provider = new GeminiAIProvider('mock-key', { fetchFn: mockFetch });
    const results = await provider.communicate({
      sourceId: 'src-1',
      sourceContent: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      requestedChannels: ['whatsapp', 'sms']
    });

    assert.equal(results.length, 2, 'Fallback returns 2 channel outputs');
    assert(results[0].metadata.isFallback === true, 'Safely falls back due to duplicate channel detection');
    assert.notEqual(results[0].content, results[1].content, 'Fallback outputs have distinct content');
  });

  // ---------------------------------------------------------------------------
  // Suite 5: Structured Output Validation & Safe Fallback Preservation
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 5: Structured Output Validation & Fallback Preservation ---');

  await runAsyncTest('Invalid structured output (missing required fields) triggers safe fallback', async () => {
    // Model returns an empty object for executive-summary
    const malformedJson = {
      outputs: [
        { format: 'executive-summary', content: {} }
      ]
    };

    const mockFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          content: { parts: [{ text: JSON.stringify(malformedJson) }] },
          finishReason: 'STOP'
        }]
      })
    });

    const provider = new GeminiAIProvider('mock-key', { fetchFn: mockFetch });
    const results = await provider.transform({
      transformationId: 'trans-test',
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      requestedOutputs: ['executive-summary']
    });

    assert.equal(results.length, 1, 'Returns 1 output via fallback');
    assert.equal(results[0].metadata.isFallback, true, 'Safely marked as fallback');
    assert.equal(results[0].metadata.provider, 'DeterministicFallback', 'Correct provider reported');
    assert(results[0].content.title.length > 0, 'Fallback supplies valid title');
    assert(results[0].content.keyPoints.length > 0, 'Fallback supplies valid keyPoints');
  });

  await runAsyncTest('Gemini quota exhaustion (HTTP 429) triggers instant deterministic fallback without retries', async () => {
    let callCount = 0;
    const mockQuotaFetch = async () => {
      callCount++;
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

    const provider = new GeminiAIProvider('mock-key', { fetchFn: mockQuotaFetch });
    const results = await provider.transform({
      transformationId: 'trans-quota-test',
      source: SAMPLE_SOURCE,
      analysis: SAMPLE_ANALYSIS,
      requestedOutputs: ['advisory']
    }, { bypassQuotaCache: true });

    assert.equal(callCount, 1, 'Hard quota exhaustion stops after exactly 1 attempt (ZERO retries)');
    assert.equal(results.length, 1, 'Fallback returns output');
    assert.equal(results[0].metadata.isFallback, true, 'isFallback is true');
    assert.equal(results[0].metadata.provider, 'DeterministicFallback', 'Reported provider is DeterministicFallback');
    assert.equal(results[0].metadata.fallbackReason, 'Gemini quota exhausted', 'Reason is quota exhausted');
  });

  // ---------------------------------------------------------------------------
  // Suite 6: Follow-up Context Resolution Across All 7 Settings
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 6: Follow-up Context Resolution Across All 7 Settings ---');

  runTest('Follow-up turn resolves detail adjustments ("shorter" -> Concise, "detailed" -> Detailed)', () => {
    const resShort = resolveFollowUpContext({ prompt: 'Please make it shorter and more concise.' });
    assert.equal(resShort.resolvedConfig.detailLevel, 'Concise', 'Resolves Concise detail');

    const resLong = resolveFollowUpContext({ prompt: 'Give me a more detailed and in-depth breakdown.' });
    assert.equal(resLong.resolvedConfig.detailLevel, 'Detailed', 'Resolves Detailed detail');
  });

  runTest('Follow-up turn resolves language adjustments (Hindi, Marathi, English)', () => {
    const resHi = resolveFollowUpContext({ prompt: 'Translate this update to Hindi please.' });
    assert.equal(resHi.resolvedConfig.language, 'Hindi', 'Resolves Hindi language');

    const resMr = resolveFollowUpContext({ prompt: 'मराठी मध्ये रूपांतर करा.' });
    assert.equal(resMr.resolvedConfig.language, 'Marathi', 'Resolves Marathi language');

    const resEn = resolveFollowUpContext({ prompt: 'Switch back to English.' });
    assert.equal(resEn.resolvedConfig.language, 'English', 'Resolves English language');
  });

  runTest('Follow-up turn resolves audience adjustments (Students, Executives, Developers)', () => {
    const resExec = resolveFollowUpContext({ prompt: 'Frame this briefing for our executive leadership.' });
    assert.equal(resExec.resolvedConfig.targetAudience, 'Executives', 'Resolves Executives audience');

    const resDev = resolveFollowUpContext({ prompt: 'Rephrase this for software engineers and developers.' });
    assert.equal(resDev.resolvedConfig.targetAudience, 'Developers', 'Resolves Developers audience');

    const resStudents = resolveFollowUpContext({ prompt: 'Explain this so university students can understand.' });
    assert.equal(resStudents.resolvedConfig.targetAudience, 'Students', 'Resolves Students audience');
  });

  runTest('Follow-up turn resolves tone adjustments (Urgent, Formal, Conversational, Technical)', () => {
    const resUrg = resolveFollowUpContext({ prompt: 'Make the tone urgent and direct.' });
    assert.equal(resUrg.resolvedConfig.tone, 'Urgent', 'Resolves Urgent tone');

    const resFormal = resolveFollowUpContext({ prompt: 'Adopt a formal professional register.' });
    assert.equal(resFormal.resolvedConfig.tone, 'Formal', 'Resolves Formal tone');

    const resConv = resolveFollowUpContext({ prompt: 'Make it conversational and casual.' });
    assert.equal(resConv.resolvedConfig.tone, 'Conversational', 'Resolves Conversational tone');

    const resTech = resolveFollowUpContext({ prompt: 'Use technical specifications.' });
    assert.equal(resTech.resolvedConfig.tone, 'Technical', 'Resolves Technical tone');
  });

  runTest('Follow-up turn resolves objective adjustments (Educate, Advise, Announce, Persuade)', () => {
    const resEdu = resolveFollowUpContext({ prompt: 'Our objective is to educate the community.' });
    assert.equal(resEdu.resolvedConfig.objective, 'Educate', 'Resolves Educate objective');

    const resAdv = resolveFollowUpContext({ prompt: 'We need to advise stakeholders on what to do.' });
    assert.equal(resAdv.resolvedConfig.objective, 'Advise', 'Resolves Advise objective');

    const resAnn = resolveFollowUpContext({ prompt: 'Make this an official announcement.' });
    assert.equal(resAnn.resolvedConfig.objective, 'Announce', 'Resolves Announce objective');

    const resPer = resolveFollowUpContext({ prompt: 'Make this persuasive to get people to act.' });
    assert.equal(resPer.resolvedConfig.objective, 'Persuade', 'Resolves Persuade objective');
  });

  runTest('Follow-up turn resolves style adjustments (Plain Text, Bullet Points, Storytelling, Executive)', () => {
    const resPlain = resolveFollowUpContext({ prompt: 'Format this as plain text without bullets.' });
    assert.equal(resPlain.resolvedConfig.contentStyle, 'Plain Text', 'Resolves Plain Text style');

    const resBullets = resolveFollowUpContext({ prompt: 'Present this in bullet points for easy scanning.' });
    assert.equal(resBullets.resolvedConfig.contentStyle, 'Bullet Points', 'Resolves Bullet Points style');

    const resStory = resolveFollowUpContext({ prompt: 'Use a storytelling narrative arc.' });
    assert.equal(resStory.resolvedConfig.contentStyle, 'Storytelling', 'Resolves Storytelling style');

    const resExecStyle = resolveFollowUpContext({ prompt: 'Create an executive style summary.' });
    assert.equal(resExecStyle.resolvedConfig.contentStyle, 'Executive', 'Resolves Executive style');
  });

  runTest('Follow-up turn isolates mentioned format (e.g. "article" or "summary" targets executive-summary)', () => {
    const resArt = resolveFollowUpContext({ prompt: 'Write an article based on this information.' });
    assert.deepEqual(resArt.resolvedFormats, ['executive-summary'], 'article targets executive-summary');

    const resTweet = resolveFollowUpContext({ prompt: 'Make the tweet more urgent.' });
    assert.deepEqual(resTweet.resolvedFormats, ['twitter'], 'tweet targets twitter');

    const resWA = resolveFollowUpContext({ prompt: 'Send this as a WhatsApp message.' });
    assert.deepEqual(resWA.resolvedFormats, ['whatsapp'], 'whatsapp targets whatsapp');
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`V0.3.0 PART 2 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    throw new Error(`Output Quality and Configuration Adherence test suite failed with ${failedTests} failing test(s).`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runOutputQualityAndConfigAdherenceTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
