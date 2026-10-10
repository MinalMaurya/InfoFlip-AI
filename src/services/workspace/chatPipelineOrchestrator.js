/**
 * InfoFlip-AI V0.1.0 — Chat-Centered 6-Module Pipeline Orchestrator
 *
 * Connects the conversational workspace and right-sidebar format/settings selector
 * directly to the existing six modules:
 *   Module 1: Input & Ingestion (ingestionService)
 *   Module 2: AI Content Understanding (analysisService)
 *   Module 3: Content Transformation (transformationService)
 *   Module 4: Communication Generation (communicationService)
 *   Module 5: Quality Review & Human Approval (reviewService)
 *   Module 6: Export & Distribution (exportService)
 */

import { processIngestion, validateInput } from '../ingestionService.js';
import { analyzeContent } from '../analysisService.js';
import {
  transformContent,
  regenerateSingleOutput
} from '../transformation/transformationService.js';
import {
  generateCommunication,
  regenerateSingleChannel
} from '../communication/communicationService.js';
import {
  reviewCommunicationOutputs,
  editOutput,
  approveOutput,
  rejectOutput,
  revalidateOutput,
  prepareModule6ExportPackage
} from '../review/reviewService.js';
import { OUTPUT_FORMAT_IDS } from '../../types/transformation.js';
import { COMMUNICATION_CHANNEL_IDS } from '../../types/communication.js';
import { APPROVAL_STATUSES } from '../../types/review.js';
import { DEFAULT_GENERATION_CONFIG } from '../storage/workspaceStorageService.js';

/**
 * Unified registry of all 13 genuinely supported output formats across Module 3 and Module 4.
 * No unsupported formats are claimed or listed.
 */
export const WORKSPACE_FORMATS = [
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    shortName: 'LinkedIn',
    collectionLabel: 'LinkedIn',
    group: 'Social & Messaging',
    iconName: 'Share2',
    moduleOrigin: 'both',
    description: 'Professional social post with structured insights and call-to-action'
  },
  {
    id: 'twitter',
    name: 'X / Twitter Post',
    shortName: 'X / Twitter',
    collectionLabel: 'X / Twitter',
    group: 'Social & Messaging',
    iconName: 'MessageSquare',
    moduleOrigin: 'both',
    description: 'Concise post or numbered thread with key facts front-loaded'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Message',
    shortName: 'WhatsApp',
    collectionLabel: 'WhatsApp',
    group: 'Social & Messaging',
    iconName: 'Smartphone',
    moduleOrigin: 'module4',
    description: 'Scannable direct bulletin with highlighted warnings and action steps'
  },
  {
    id: 'email',
    name: 'Email Draft',
    shortName: 'Email',
    collectionLabel: 'Email',
    group: 'Social & Messaging',
    iconName: 'Mail',
    moduleOrigin: 'module4',
    description: 'Structured email with subject line, preview text, facts, and CTA'
  },
  {
    id: 'sms',
    name: 'SMS Alert',
    shortName: 'SMS',
    collectionLabel: 'SMS',
    group: 'Social & Messaging',
    iconName: 'Send',
    moduleOrigin: 'module4',
    description: 'Ultra-concise notification under 160 characters for urgent alerts'
  },
  {
    id: 'announcement',
    name: 'Public Announcement',
    shortName: 'Announcement',
    collectionLabel: 'Announcements',
    group: 'Social & Messaging',
    iconName: 'Megaphone',
    moduleOrigin: 'module4',
    description: 'Formal, accessible public notice with numbered instructions'
  },
  {
    id: 'cta',
    name: 'Call-to-Action (CTA)',
    shortName: 'CTA',
    collectionLabel: 'CTA Variants',
    group: 'Social & Messaging',
    iconName: 'MousePointerClick',
    moduleOrigin: 'module4',
    description: 'Action-oriented CTA variants grounded in source directives'
  },
  {
    id: 'hashtags',
    name: 'Hashtag Suggestions',
    shortName: 'Hashtags',
    collectionLabel: 'Hashtags',
    group: 'Social & Messaging',
    iconName: 'Hash',
    moduleOrigin: 'module4',
    description: 'Topic-grounded hashtags derived from extracted entities and domain'
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    shortName: 'Exec Summary',
    collectionLabel: 'Summaries',
    group: 'Briefs & Media',
    iconName: 'FileText',
    moduleOrigin: 'module3',
    description: 'Leadership brief with overview, key points, findings, and implications'
  },
  {
    id: 'advisory',
    name: 'Official Advisory',
    shortName: 'Advisory',
    collectionLabel: 'Advisories',
    group: 'Briefs & Media',
    iconName: 'AlertTriangle',
    moduleOrigin: 'module3',
    description: 'Situational notice with impact assessment, actions, and timelines'
  },
  {
    id: 'infographic',
    name: 'Infographic Content',
    shortName: 'Infographic',
    collectionLabel: 'Infographics',
    group: 'Briefs & Media',
    iconName: 'BarChart3',
    moduleOrigin: 'module3',
    description: 'Visual hierarchy with modular sections, statistics, and callout banner'
  },
  {
    id: 'presentation',
    name: 'Presentation Content',
    shortName: 'Presentation',
    collectionLabel: 'Presentations',
    group: 'Briefs & Media',
    iconName: 'Presentation',
    moduleOrigin: 'module3',
    description: 'Slide deck structure with slide titles, bullets, and speaker notes'
  },
  {
    id: 'video-script',
    name: 'Video Script',
    shortName: 'Video Script',
    collectionLabel: 'Video Scripts',
    group: 'Briefs & Media',
    iconName: 'Video',
    moduleOrigin: 'module3',
    description: 'Time-coded storyboard with visual cues, narration, and captions'
  }
];

export const WORKSPACE_FORMAT_MAP = Object.fromEntries(
  WORKSPACE_FORMATS.map(fmt => [fmt.id, fmt])
);

export const MODULE3_ONLY_FORMAT_IDS = new Set([
  OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
  OUTPUT_FORMAT_IDS.ADVISORY,
  OUTPUT_FORMAT_IDS.INFOGRAPHIC,
  OUTPUT_FORMAT_IDS.PRESENTATION,
  OUTPUT_FORMAT_IDS.VIDEO_SCRIPT
]);

export const MODULE4_CHANNEL_IDS = new Set(Object.values(COMMUNICATION_CHANNEL_IDS));

/**
 * Checks whether a format ID is genuinely supported by the existing application.
 */
export function isSupportedWorkspaceFormat(formatId) {
  if (!formatId || typeof formatId !== 'string') return false;
  return Boolean(WORKSPACE_FORMAT_MAP[formatId.trim().toLowerCase()]);
}

/**
 * Retrieves workspace format metadata by ID.
 */
export function getWorkspaceFormatById(formatId) {
  if (!formatId || typeof formatId !== 'string') return null;
  return WORKSPACE_FORMAT_MAP[formatId.trim().toLowerCase()] || null;
}

/**
 * Partitions an array of requested format IDs into supported and unsupported lists.
 * Ensures unsupported formats are never falsely reported as generated.
 */
export function partitionRequestedFormats(requestedFormats = []) {
  const supported = [];
  const unsupported = [];
  const seen = new Set();

  for (const rawId of requestedFormats) {
    const clean = String(rawId || '').trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    if (isSupportedWorkspaceFormat(clean)) {
      supported.push(clean);
    } else {
      unsupported.push(rawId);
    }
  }

  return { supported, unsupported };
}

/**
 * Converts a Module 3 structured content object into a clean human-readable string
 * for Module 5 review auditing, copying, and Module 6 text/PDF/ZIP export,
 * while preserving the original structured object in `structuredData`.
 */
export function serializeModule3ContentToText(formatId, contentObj) {
  if (!contentObj) return '';
  if (typeof contentObj === 'string') return contentObj;

  switch (formatId) {
    case OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY: {
      const lines = [];
      if (contentObj.title) lines.push(contentObj.title.toUpperCase());
      if (contentObj.executiveOverview) {
        lines.push('', 'EXECUTIVE OVERVIEW:', contentObj.executiveOverview);
      }
      if (Array.isArray(contentObj.keyPoints) && contentObj.keyPoints.length > 0) {
        lines.push('', 'KEY POINTS:');
        contentObj.keyPoints.forEach(p => lines.push(`• ${p}`));
      }
      if (Array.isArray(contentObj.importantFindings) && contentObj.importantFindings.length > 0) {
        lines.push('', 'KEY FINDINGS:');
        contentObj.importantFindings.forEach(f => lines.push(`• ${f}`));
      }
      if (Array.isArray(contentObj.implications) && contentObj.implications.length > 0) {
        lines.push('', 'STRATEGIC IMPLICATIONS:');
        contentObj.implications.forEach(i => lines.push(`→ ${i}`));
      }
      if (Array.isArray(contentObj.recommendedConsiderations) && contentObj.recommendedConsiderations.length > 0) {
        lines.push('', 'RECOMMENDED CONSIDERATIONS:');
        contentObj.recommendedConsiderations.forEach(c => lines.push(`✓ ${c}`));
      }
      return lines.join('\n').trim();
    }

    case OUTPUT_FORMAT_IDS.ADVISORY: {
      const lines = [];
      if (contentObj.title) lines.push(contentObj.title.toUpperCase());
      if (contentObj.situation) {
        lines.push('', 'SITUATION ASSESSMENT:', contentObj.situation);
      }
      if (Array.isArray(contentObj.keyInformation) && contentObj.keyInformation.length > 0) {
        lines.push('', 'KEY INFORMATION:');
        contentObj.keyInformation.forEach(info => lines.push(`• ${info}`));
      }
      if (contentObj.potentialImpact) {
        lines.push('', 'POTENTIAL IMPACT:', contentObj.potentialImpact);
      }
      if (Array.isArray(contentObj.recommendedActions) && contentObj.recommendedActions.length > 0) {
        lines.push('', 'RECOMMENDED ACTIONS:');
        contentObj.recommendedActions.forEach(act => lines.push(`✓ ${act}`));
      }
      if (Array.isArray(contentObj.importantDates) && contentObj.importantDates.length > 0) {
        lines.push('', 'TIMELINES & HELPLINES:');
        contentObj.importantDates.forEach(d => lines.push(`⏱ ${d}`));
      }
      return lines.join('\n').trim();
    }

    case OUTPUT_FORMAT_IDS.INFOGRAPHIC: {
      const lines = [];
      if (contentObj.title) lines.push(contentObj.title.toUpperCase());
      if (contentObj.subtitle) lines.push(contentObj.subtitle);
      if (Array.isArray(contentObj.statistics) && contentObj.statistics.length > 0) {
        lines.push('', 'KEY FIGURES FROM THE SOURCE:');
        contentObj.statistics.forEach(s => lines.push(`• ${s.value} — ${s.label}${s.context ? ` (${s.context})` : ''}`));
      }
      if (Array.isArray(contentObj.sections) && contentObj.sections.length > 0) {
        lines.push('', 'INFOGRAPHIC PANELS:');
        contentObj.sections.forEach((sec, idx) => {
          lines.push(`[${idx + 1}] ${sec.heading || 'Section'}: ${sec.keyPoint || ''}`);
          if (sec.supportingFact) lines.push(`    ${sec.supportingFact}`);
        });
      }
      if (contentObj.callout) {
        lines.push('', `TAKEAWAY: ${contentObj.callout}`);
      }
      return lines.join('\n').trim();
    }

    case OUTPUT_FORMAT_IDS.PRESENTATION: {
      const lines = [];
      if (contentObj.title) lines.push(`PRESENTATION: ${contentObj.title.toUpperCase()}`);
      if (Array.isArray(contentObj.slides)) {
        contentObj.slides.forEach((slide, idx) => {
          lines.push('', `SLIDE ${slide.slideNumber || idx + 1}: ${slide.title || 'Slide'} (${slide.purpose || 'Overview'})`);
          if (Array.isArray(slide.bullets)) {
            slide.bullets.forEach(b => lines.push(`  • ${b}`));
          }
          if (slide.speakerNotes) {
            lines.push(`  [Speaker Notes]: ${slide.speakerNotes}`);
          }
        });
      }
      return lines.join('\n').trim();
    }

    case OUTPUT_FORMAT_IDS.VIDEO_SCRIPT: {
      const lines = [];
      if (contentObj.title) lines.push(`VIDEO SCRIPT: ${contentObj.title.toUpperCase()}`);
      if (contentObj.durationEstimate) lines.push(`Estimated Duration: ${contentObj.durationEstimate}`);
      if (Array.isArray(contentObj.scenes)) {
        contentObj.scenes.forEach((sc, idx) => {
          lines.push('', `SCENE ${sc.sceneNumber || idx + 1} (${sc.duration || '15s'})`);
          if (sc.visual) lines.push(`  Visual: ${sc.visual}`);
          if (sc.narration) lines.push(`  Voiceover: "${sc.narration}"`);
          if (sc.onScreenText) lines.push(`  On-Screen Text: ${sc.onScreenText}`);
        });
      }
      return lines.join('\n').trim();
    }

    default:
      if (contentObj.text) return contentObj.text;
      if (Array.isArray(contentObj.posts)) return contentObj.posts.join('\n\n');
      return JSON.stringify(contentObj, null, 2);
  }
}

/**
 * Resolves follow-up instructions against the active conversation context.
 * Deterministically interprets prompt cues (e.g., "Make the LinkedIn post shorter",
 * "Change tone to Urgent", "Translate to Hindi") without extra AI calls.
 */
export function resolveFollowUpContext({
  prompt = '',
  activeConfig = DEFAULT_GENERATION_CONFIG,
  requestedFormats = []
}) {
  const resolvedConfig = {
    ...DEFAULT_GENERATION_CONFIG,
    ...activeConfig
  };
  let resolvedFormats = Array.isArray(requestedFormats) && requestedFormats.length > 0
    ? [...requestedFormats]
    : [...(activeConfig.selectedFormats || DEFAULT_GENERATION_CONFIG.selectedFormats)];

  const lower = String(prompt || '').toLowerCase();
  const adjustments = [];

  // 1. Detail / length adjustments
  const wantsShorter = /\b(shorter|short|concise|brief|condense|tighten|compact|summarize)\b/.test(lower);
  const wantsDetailed = /\b(longer|detailed|expand|in-depth|comprehensive|elaborate)\b/.test(lower);

  if (wantsShorter) {
    resolvedConfig.detailLevel = 'Concise';
    adjustments.push('Detail: Concise');
  } else if (wantsDetailed) {
    resolvedConfig.detailLevel = 'Detailed';
    adjustments.push('Detail: Detailed');
  }

  // 2. Tone adjustments
  const toneMatchers = [
    { regex: /\burgent\b/, tone: 'Urgent' },
    { regex: /\bformal\b/, tone: 'Formal' },
    { regex: /\bprofessional\b/, tone: 'Professional' },
    { regex: /\bconversational|casual\b/, tone: 'Conversational' },
    { regex: /\bpersuasive\b/, tone: 'Persuasive' },
    { regex: /\btechnical\b/, tone: 'Technical' },
    { regex: /\bacademic\b/, tone: 'Academic' },
    { regex: /\bfriendly\b/, tone: 'Friendly' },
    { regex: /\binformative\b/, tone: 'Informative' }
  ];
  for (const m of toneMatchers) {
    if (m.regex.test(lower)) {
      resolvedConfig.tone = m.tone;
      adjustments.push(`Tone: ${m.tone}`);
      break;
    }
  }

  // 3. Language adjustments
  if (/\bhindi\b|हिंदी/.test(lower)) {
    resolvedConfig.language = 'Hindi';
    adjustments.push('Language: Hindi');
  } else if (/\bmarathi\b|मराठी/.test(lower)) {
    resolvedConfig.language = 'Marathi';
    adjustments.push('Language: Marathi');
  } else if (/\bin english\b|\bto english\b/.test(lower)) {
    resolvedConfig.language = 'English';
    adjustments.push('Language: English');
  }

  // 4. Audience adjustments
  const audienceMatchers = [
    { regex: /\bstudents\b/, audience: 'Students' },
    { regex: /\bexecutives|leadership\b/, audience: 'Executives' },
    { regex: /\bdevelopers|engineers\b/, audience: 'Developers' },
    { regex: /\bresearchers\b/, audience: 'Researchers' },
    { regex: /\bpolicy makers|officials\b/, audience: 'Policy Makers' },
    { regex: /\bemployees|internal staff\b/, audience: 'Employees' },
    { regex: /\bcustomers|clients\b/, audience: 'Customers' },
    { regex: /\bgeneral public|citizens|residents\b/, audience: 'General Public' }
  ];
  for (const a of audienceMatchers) {
    if (a.regex.test(lower)) {
      resolvedConfig.targetAudience = a.audience;
      adjustments.push(`Audience: ${a.audience}`);
      break;
    }
  }

  // 5. Format mentions in follow-up instructions
  // If user specifically asks to adjust a format (e.g. "Make the LinkedIn post shorter"),
  // focus the follow-up refinement on the mentioned format(s).
  const formatMentions = [
    { regex: /\blinkedin\b/, id: 'linkedin' },
    { regex: /\btwitter\b|\btweet\b|\bx post\b/, id: 'twitter' },
    { regex: /\bwhatsapp\b/, id: 'whatsapp' },
    { regex: /\bemail\b/, id: 'email' },
    { regex: /\bsms\b/, id: 'sms' },
    { regex: /\bannouncement\b/, id: 'announcement' },
    { regex: /\bcta\b|\bcall to action\b|\bcall-to-action\b/, id: 'cta' },
    { regex: /\bhashtag/, id: 'hashtags' },
    { regex: /\bexecutive summary\b|\bsummary\b/, id: 'executive-summary' },
    { regex: /\badvisory\b/, id: 'advisory' },
    { regex: /\binfographic\b/, id: 'infographic' },
    { regex: /\bpresentation\b|\bslide/, id: 'presentation' },
    { regex: /\bvideo script\b|\bstoryboard\b/, id: 'video-script' }
  ];

  const mentionedIds = formatMentions.filter(f => f.regex.test(lower)).map(f => f.id);
  if (mentionedIds.length > 0) {
    resolvedFormats = [...mentionedIds];
  }

  return {
    resolvedConfig,
    resolvedFormats,
    mentionedFormatIds: mentionedIds,
    wantsShorter,
    wantsDetailed,
    adjustments
  };
}

/**
 * Applies a safe, source-grounded conciseness refinement when a follow-up prompt
 * explicitly asks to make an output shorter/concise.
 */
function applyConciseRefinement(text) {
  if (!text || typeof text !== 'string') return text;
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length <= 3) return text;
  // Keep opening hook, core factual body, and final helpline/hashtag/CTA block
  const first = paragraphs[0];
  const second = paragraphs[1];
  const last = paragraphs[paragraphs.length - 1];
  const combined = [first, second];
  if (last !== second && last !== first) {
    combined.push(last);
  }
  return combined.join('\n\n');
}

/**
 * Executes a full conversational turn across Modules 1 -> 2 -> 3 -> 4 -> 5.
 *
 * @param {object} params
 * @param {object} params.conversation - Current conversation state
 * @param {string} params.prompt - User prompt or follow-up instruction
 * @param {string} [params.sourceText] - Optional source text pasted in composer
 * @param {File|object} [params.file] - Optional uploaded document or image file
 * @param {Array<string>} [params.requestedFormats] - Formats selected in Right Sidebar
 * @param {object} [params.configOverrides] - Generation settings from Right Sidebar
 * @param {function} [params.onProgress] - Progress callback ({ module, step, title, detail })
 * @param {number} [params.delayMs=30] - Delay for smooth UI progress feedback (0 in unit tests)
 */
export async function executeChatTurn({
  conversation,
  prompt = '',
  sourceText = '',
  file = null,
  requestedFormats = null,
  configOverrides = {},
  onProgress = () => {},
  delayMs = 30
}) {
  const activeConfig = {
    ...DEFAULT_GENERATION_CONFIG,
    ...(conversation?.config || {}),
    ...configOverrides
  };

  const rawRequestedFormats = Array.isArray(requestedFormats)
    ? requestedFormats
    : (activeConfig.selectedFormats || DEFAULT_GENERATION_CONFIG.selectedFormats);

  const { supported: validFormats, unsupported: unsupportedFormats } = partitionRequestedFormats(rawRequestedFormats);

  if (validFormats.length === 0) {
    const unsupportedMsg = unsupportedFormats.length > 0
      ? `Unsupported output format(s): ${unsupportedFormats.join(', ')}. Please select at least one supported format.`
      : 'Please select at least one output format in the right sidebar.';
    throw new Error(unsupportedMsg);
  }

  // Determine whether this turn introduces a new source or is a follow-up on existing conversation source
  const hasExistingSource = Boolean(
    conversation?.activeSource &&
    (conversation.activeSource.extractedText || conversation.activeSource.rawText)
  );

  const trimmedPrompt = String(prompt || '').trim();
  const trimmedSourceText = String(sourceText || '').trim();

  const isFollowUpTurn = hasExistingSource && !file && !trimmedSourceText;

  // Resolve follow-up context adjustments only on follow-up turns
  const followUp = isFollowUpTurn
    ? resolveFollowUpContext({
        prompt: trimmedPrompt,
        activeConfig,
        requestedFormats: validFormats
      })
    : {
        resolvedConfig: { ...activeConfig },
        resolvedFormats: [...validFormats],
        mentionedFormatIds: [],
        wantsShorter: false,
        wantsDetailed: false,
        adjustments: []
      };

  // Explicit configOverrides passed directly to executeChatTurn take precedence
  const finalConfig = {
    ...followUp.resolvedConfig,
    ...configOverrides
  };
  const finalFormats = followUp.resolvedFormats;

  let currentSource = conversation?.activeSource || null;
  let currentAnalysis = conversation?.activeAnalysis || null;

  // =========================================================================
  // MODULE 1: INPUT & INGESTION
  // =========================================================================
  if (!isFollowUpTurn) {
    const rawToIngest = trimmedSourceText || trimmedPrompt;
    let ingestType = 'text';
    if (file) {
      const mime = String(file.type || '').toLowerCase();
      const ext = String(file.name || '').split('.').pop()?.toLowerCase();
      ingestType = (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) ? 'image' : 'file';
    }

    const inputCheck = validateInput({
      type: ingestType,
      rawText: rawToIngest,
      file
    });

    if (!inputCheck.isValid) {
      throw new Error(inputCheck.error);
    }

    onProgress({
      module: 1,
      stage: 'ingest',
      title: 'Module 1: Ingesting & validating source',
      detail: file ? `Validating and extracting ${file.name}...` : 'Normalizing source text and computing metrics...'
    });

    currentSource = await processIngestion({
      type: ingestType,
      rawText: rawToIngest || file?._presetText || '',
      file,
      onProgress: (prog) => {
        onProgress({
          module: 1,
          stage: prog.stage,
          title: `Module 1: ${prog.title}`,
          detail: prog.detail
        });
      }
    });
  } else {
    onProgress({
      module: 1,
      stage: 'reuse-source',
      title: 'Module 1: Using active conversation source',
      detail: `Reusing verified source contract (${currentSource.sourceId}) for follow-up refinement...`
    });
  }

  // =========================================================================
  // MODULE 2: AI CONTENT UNDERSTANDING & ANALYSIS
  // =========================================================================
  if (!isFollowUpTurn || !currentAnalysis) {
    onProgress({
      module: 2,
      stage: 'analyze',
      title: 'Module 2: Analyzing facts, claims & urgency',
      detail: 'Extracting source-grounded facts, entities, and verification safeguards...'
    });

    currentAnalysis = await analyzeContent(currentSource, {
      delayMs,
      onProgress: (prog) => {
        onProgress({
          module: 2,
          stage: prog.stage,
          title: `Module 2: ${prog.title}`,
          detail: prog.detail
        });
      }
    });
  } else {
    onProgress({
      module: 2,
      stage: 'reuse-analysis',
      title: 'Module 2: Applying conversation analysis context',
      detail: `Applying ${currentAnalysis.keyFacts?.length || 0} grounded facts from ${currentAnalysis.analysisId}...`
    });
  }

  // =========================================================================
  // MODULE 3: CONTENT TRANSFORMATION ENGINE
  // =========================================================================
  const requestedMod3Formats = finalFormats.filter(
    f => MODULE3_ONLY_FORMAT_IDS.has(f) || f === 'linkedin' || f === 'twitter'
  );
  // Ensure at least one foundational format runs in Module 3 so Module 4 has upstream context
  const mod3FormatsToRun = requestedMod3Formats.length > 0
    ? requestedMod3Formats
    : [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY];

  onProgress({
    module: 3,
    stage: 'transform',
    title: 'Module 3: Transforming content',
    detail: `Synthesizing structured outputs for ${finalConfig.targetAudience} (${finalConfig.tone})...`
  });

  const transformationResult = await transformContent(
    {
      source: currentSource,
      analysis: currentAnalysis,
      configuration: {
        targetAudience: [finalConfig.targetAudience],
        tone: finalConfig.tone,
        language: finalConfig.language,
        detailLevel: finalConfig.detailLevel,
        objective: finalConfig.objective,
        contentStyle: finalConfig.contentStyle
      },
      requestedOutputs: mod3FormatsToRun
    },
    {
      delayMs,
      onProgress: (prog) => {
        onProgress({
          module: 3,
          stage: prog.stage,
          title: `Module 3: ${prog.title}`,
          detail: prog.detail
        });
      }
    }
  );

  // =========================================================================
  // MODULE 4: SOCIAL & COMMUNICATION GENERATOR
  // =========================================================================
  const requestedMod4Channels = finalFormats.filter(f => MODULE4_CHANNEL_IDS.has(f));
  let communicationResult = null;

  if (requestedMod4Channels.length > 0) {
    onProgress({
      module: 4,
      stage: 'communicate',
      title: 'Module 4: Generating channel communications',
      detail: `Adapting content across ${requestedMod4Channels.length} communication channel(s)...`
    });

    communicationResult = await generateCommunication(
      {
        sourceId: currentSource.sourceId,
        transformationId: transformationResult.transformationId,
        analysisId: currentAnalysis.analysisId,
        sourceContent: currentSource,
        analysis: currentAnalysis,
        transformationOutputs: transformationResult.outputs,
        config: {
          targetAudience: finalConfig.targetAudience,
          tone: finalConfig.tone,
          language: finalConfig.language,
          detailLevel: finalConfig.detailLevel,
          objective: finalConfig.objective,
          style: finalConfig.contentStyle
        },
        requestedChannels: requestedMod4Channels
      },
      {
        delayMs,
        onProgress: (prog) => {
          onProgress({
            module: 4,
            stage: prog.stage,
            title: `Module 4: ${prog.title}`,
            detail: prog.detail
          });
        }
      }
    );
  }

  // Combine requested outputs in the exact order requested by the user
  const combinedOutputsForReview = [];
  const defaultTraceability = (currentAnalysis.keyFacts || []).slice(0, 4).map(f => ({
    fact: typeof f === 'string' ? f : f.fact,
    origin: 'source-extracted',
    sourceId: currentSource.sourceId
  }));

  for (const formatId of finalFormats) {
    const fmtMeta = getWorkspaceFormatById(formatId);
    if (!fmtMeta) continue;

    if (MODULE4_CHANNEL_IDS.has(formatId) && communicationResult) {
      const commItem = communicationResult.outputs.find(o => o.channelId === formatId);
      if (commItem) {
        let finalText = commItem.content;
        if (isFollowUpTurn && followUp.wantsShorter && (followUp.mentionedFormatIds.length === 0 || followUp.mentionedFormatIds.includes(formatId))) {
          finalText = applyConciseRefinement(finalText);
        }
        combinedOutputsForReview.push({
          ...commItem,
          channelId: formatId,
          title: commItem.title || `${fmtMeta.name} — ${currentAnalysis.overview?.mainTopic || 'Content'}`,
          content: finalText
        });
        continue;
      }
    }

    // Otherwise pull from Module 3 transformationResult
    const mod3Item = transformationResult.outputs.find(o => o.format === formatId);
    if (mod3Item && mod3Item.content) {
      let serializedText = serializeModule3ContentToText(formatId, mod3Item.content);
      if (isFollowUpTurn && followUp.wantsShorter && (followUp.mentionedFormatIds.length === 0 || followUp.mentionedFormatIds.includes(formatId))) {
        serializedText = applyConciseRefinement(serializedText);
      }
      combinedOutputsForReview.push({
        outputId: mod3Item.outputId,
        channelId: formatId,
        title: mod3Item.content?.title || `${fmtMeta.name} — ${currentAnalysis.overview?.mainTopic || 'Content'}`,
        content: serializedText,
        structuredData: typeof mod3Item.content === 'object' ? mod3Item.content : null,
        metadata: {
          ...mod3Item.metadata,
          characterCount: serializedText.length,
          wordCount: serializedText.split(/\s+/).filter(Boolean).length
        },
        sourceTraceability: defaultTraceability
      });
    }
  }

  // =========================================================================
  // MODULE 5: QUALITY REVIEW & HUMAN APPROVAL
  // =========================================================================
  onProgress({
    module: 5,
    stage: 'review',
    title: 'Module 5: Running 10-dimension quality & grounding review',
    detail: 'Checking factual consistency, source grounding, safety, and platform compliance...'
  });

  const syntheticCommId = communicationResult?.communicationId || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const reviewResult = await reviewCommunicationOutputs(
    {
      sourceId: currentSource.sourceId,
      analysisId: currentAnalysis.analysisId,
      transformationId: transformationResult.transformationId,
      communicationId: syntheticCommId,
      sourceContent: currentSource,
      analysis: currentAnalysis,
      transformationOutputs: transformationResult.outputs,
      config: finalConfig,
      outputs: combinedOutputsForReview
    },
    { delayMs }
  );

  // Build canonical content items linked to conversationId and messageId
  const userMessageId = `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const assistantMessageId = `msg-asst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const lineage = {
    sourceId: currentSource.sourceId,
    analysisId: currentAnalysis.analysisId,
    transformationId: transformationResult.transformationId,
    communicationId: syntheticCommId,
    reviewId: reviewResult.reviewId
  };

  const canonicalItems = reviewResult.items.map((revItem) => {
    const rawMatch = combinedOutputsForReview.find(o => o.outputId === revItem.outputId);
    return {
      ...revItem,
      itemId: revItem.outputId,
      outputId: revItem.outputId,
      conversationId: conversation.conversationId,
      messageId: assistantMessageId,
      formatId: revItem.channelId,
      channelId: revItem.channelId,
      structuredData: rawMatch?.structuredData || revItem.structuredData || null,
      lineage,
      createdAt: nowIso,
      updatedAt: nowIso
    };
  });

  const userMessage = {
    messageId: userMessageId,
    role: 'user',
    prompt: trimmedPrompt || (file ? `Uploaded ${file.name}` : 'Transform source content'),
    sourceAttachment: !isFollowUpTurn
      ? {
          sourceId: currentSource.sourceId,
          sourceType: currentSource.sourceType,
          fileName: currentSource.fileName || 'Pasted Source Text',
          wordCount: currentSource.metadata?.wordCount || 0,
          characterCount: currentSource.metadata?.characterCount || 0,
          previewSnippet: (currentSource.extractedText || currentSource.rawText || '').slice(0, 220)
        }
      : {
          sourceId: currentSource.sourceId,
          sourceType: currentSource.sourceType,
          fileName: currentSource.fileName || 'Active Conversation Source',
          isFollowUpContext: true,
          adjustments: followUp.adjustments
        },
    requestedFormats: finalFormats,
    configSnapshot: finalConfig,
    createdAt: nowIso
  };

  const assistantMessage = {
    messageId: assistantMessageId,
    role: 'assistant',
    prompt: userMessage.prompt,
    requestedFormats: finalFormats,
    unsupportedFormats,
    configSnapshot: finalConfig,
    outputItemIds: canonicalItems.map(i => i.itemId),
    analysisSummary: {
      analysisId: currentAnalysis.analysisId,
      mainTopic: currentAnalysis.overview?.mainTopic || 'Document Analysis',
      summary: currentAnalysis.overview?.summary || '',
      category: currentAnalysis.overview?.category || 'General',
      urgencyLevel: currentAnalysis.urgency?.level || 'normal',
      keyFactsCount: currentAnalysis.keyFacts?.length || 0,
      keyFacts: (currentAnalysis.keyFacts || []).slice(0, 5),
      highRiskClaimsCount: (currentAnalysis.claims || []).filter(c => c.isHighRisk || c.riskLevel === 'high').length,
      claims: currentAnalysis.claims || []
    },
    lineage,
    createdAt: nowIso
  };

  return {
    userMessage,
    assistantMessage,
    canonicalItems,
    unsupportedFormats,
    sourceData: currentSource,
    analysisData: currentAnalysis,
    transformationResult,
    communicationResult: communicationResult || {
      communicationId: syntheticCommId,
      sourceId: currentSource.sourceId,
      transformationId: transformationResult.transformationId,
      analysisId: currentAnalysis.analysisId,
      outputs: combinedOutputsForReview,
      createdAt: nowIso
    },
    reviewResult,
    resolvedConfig: finalConfig
  };
}

/**
 * Updates a single canonical content item after human editing, re-running Module 5 review checks.
 * Preserves structuredData synchronization if edited as text or structured object.
 */
export function editCanonicalContentItem(item, newContentOrStructured, conversationContext = {}) {
  if (!item) return null;

  let nextText = '';
  let nextStructured = item.structuredData;

  if (typeof newContentOrStructured === 'object' && newContentOrStructured !== null) {
    nextStructured = newContentOrStructured;
    nextText = serializeModule3ContentToText(item.formatId, newContentOrStructured);
  } else {
    nextText = String(newContentOrStructured ?? '');
    if (nextStructured && item.formatId === 'linkedin') {
      nextStructured = { ...nextStructured, text: nextText };
    }
  }

  const reviewed = editOutput(item, nextText, {
    sourceContent: conversationContext.activeSource || {},
    analysis: conversationContext.activeAnalysis || {},
    config: conversationContext.config || {}
  });

  return {
    ...item,
    ...reviewed,
    itemId: item.itemId,
    outputId: item.outputId,
    structuredData: nextStructured,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Approves a single canonical content item via Module 5 `approveOutput`.
 * Preserves truthful verification status (human approval never marks unverified claims as independently verified).
 */
export function approveCanonicalContentItem(item, notes = '') {
  if (!item) return null;
  const approved = approveOutput(item, notes);
  return {
    ...item,
    ...approved,
    itemId: item.itemId,
    outputId: item.outputId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Rejects a single canonical content item via Module 5 `rejectOutput`.
 */
export function rejectCanonicalContentItem(item, reason = 'Needs revision') {
  if (!item) return null;
  const rejected = rejectOutput(item, reason);
  return {
    ...item,
    ...rejected,
    itemId: item.itemId,
    outputId: item.outputId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Regenerates a single canonical content item using its conversation's source, analysis, and active configuration,
 * then re-evaluates it through Module 5 `revalidateOutput`.
 */
export async function regenerateCanonicalContentItem(item, conversation, options = {}) {
  if (!item || !conversation?.activeSource || !conversation?.activeAnalysis) {
    throw new Error('Cannot regenerate without source and analysis context.');
  }

  const formatId = item.formatId || item.channelId;
  const config = conversation.config || DEFAULT_GENERATION_CONFIG;
  const sourceData = conversation.activeSource;
  const analysisData = conversation.activeAnalysis;

  let newContentText = item.content;
  let newStructuredData = item.structuredData;
  let newMetadata = { ...item.metadata };

  if (MODULE4_CHANNEL_IDS.has(formatId)) {
    const regenerated = await regenerateSingleChannel(
      {
        sourceId: sourceData.sourceId,
        transformationId: item.lineage?.transformationId || 'trans-regen',
        analysisId: analysisData.analysisId,
        sourceContent: sourceData,
        analysis: analysisData,
        transformationOutputs: conversation.lastTransformationResult?.outputs || [],
        config: {
          targetAudience: config.targetAudience,
          tone: config.tone,
          language: config.language,
          detailLevel: config.detailLevel,
          objective: config.objective,
          style: config.contentStyle
        }
      },
      item.outputId,
      formatId,
      options
    );
    newContentText = regenerated.content;
    newStructuredData = regenerated.structuredData || null;
    newMetadata = { ...item.metadata, ...regenerated.metadata, isEdited: false };
  } else {
    const regenerated = await regenerateSingleOutput(
      {
        source: sourceData,
        analysis: analysisData,
        configuration: {
          targetAudience: [config.targetAudience],
          tone: config.tone,
          language: config.language,
          detailLevel: config.detailLevel,
          objective: config.objective,
          contentStyle: config.contentStyle
        }
      },
      item.outputId,
      formatId,
      options
    );
    newStructuredData = typeof regenerated.content === 'object' ? regenerated.content : null;
    newContentText = serializeModule3ContentToText(formatId, regenerated.content);
    newMetadata = {
      ...item.metadata,
      ...regenerated.metadata,
      characterCount: newContentText.length,
      wordCount: newContentText.split(/\s+/).filter(Boolean).length,
      isEdited: false
    };
  }

  const revalidated = revalidateOutput(
    {
      ...item,
      content: newContentText,
      structuredData: newStructuredData,
      isEdited: false,
      approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW,
      requiresHumanReview: true,
      metadata: newMetadata
    },
    {
      sourceContent: sourceData,
      analysis: analysisData,
      config
    }
  );

  return {
    ...item,
    ...revalidated,
    itemId: item.itemId,
    outputId: item.outputId,
    content: newContentText,
    structuredData: newStructuredData,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Builds a validated Module 6 export package from a list of canonical content items.
 * Strictly enforces the Module 5 -> Module 6 human approval gate (throws if 0 items are APPROVED).
 */
export function buildTurnExportPackage(items = [], lineage = {}, config = {}) {
  const validItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const firstLineage = validItems[0]?.lineage || lineage || {};

  return prepareModule6ExportPackage({
    sourceId: firstLineage.sourceId || lineage.sourceId || 'src-unknown',
    analysisId: firstLineage.analysisId || lineage.analysisId || 'ana-unknown',
    transformationId: firstLineage.transformationId || lineage.transformationId || 'trans-unknown',
    communicationId: firstLineage.communicationId || lineage.communicationId || 'comm-unknown',
    reviewedOutputs: validItems,
    items: validItems,
    config
  });
}
