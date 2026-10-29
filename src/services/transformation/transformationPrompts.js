/**
 * InfoFlip-AI Transformation Prompt Builder
 * 
 * SIH 2026 Problem Statement 26154
 * Module 3: Transformation Engine
 * 
 * Enforces strict anti-hallucination rules, grounds transformations in Module 2
 * content analysis, and tailors output to audience, tone, language, and style.
 */

import { getOutputFormatById } from './outputFormatRegistry.js';

export function getAudienceDirectives(audienceStr) {
  const aud = String(audienceStr || '').toLowerCase();
  if (aud.includes('executive') || aud.includes('leadership')) {
    return 'Focus on strategic implications, high-level metrics, governance/business impact, and decisive takeaways. Avoid technical minutiae and filler.';
  }
  if (aud.includes('developer') || aud.includes('technical') || aud.includes('engineer')) {
    return 'Use precise technical terminology, concrete parameters, system architecture impact, and explicit technical details.';
  }
  if (aud.includes('student') || aud.includes('youth') || aud.includes('academic')) {
    return 'Use accessible educational explanations, relatable examples, clear foundational concepts, and encourage learning.';
  }
  if (aud.includes('policy') || aud.includes('official') || aud.includes('regulator')) {
    return 'Focus on regulatory context, civic impact, compliance, systemic implications, and structured governance.';
  }
  if (aud.includes('employee') || aud.includes('staff')) {
    return 'Focus on workplace operational updates, internal procedures, actionable employee instructions, and timeline expectations.';
  }
  return 'Use clear, accessible, jargon-free language suitable for the general public, explaining any specialized concepts simply.';
}

export function getToneDirectives(tone) {
  const t = String(tone || 'Informative').toLowerCase();
  if (t.includes('urgent') || t.includes('crisis')) {
    return 'Use direct, high-priority phrasing, clear immediate calls-to-action, and heightened urgency without sensationalism or exaggeration.';
  }
  if (t.includes('formal') || t.includes('professional')) {
    return 'Maintain a dignified, respectful, measured, and authoritative professional register throughout.';
  }
  if (t.includes('conversational') || t.includes('casual') || t.includes('friendly')) {
    return 'Adopt a friendly, warm, approachable tone with natural sentence flow while preserving strict factual grounding.';
  }
  if (t.includes('technical')) {
    return 'Maintain rigorous, objective, and parameter-focused diction suited for specialists.';
  }
  if (t.includes('persuasive')) {
    return 'Highlight grounded benefits, rationale, and motivating reasons without manufacturing claims.';
  }
  return 'Present facts in a balanced, objective, informative, and matter-of-fact tone.';
}

export function getDetailDirectives(detailLevel) {
  const lvl = String(detailLevel || 'Balanced').toLowerCase();
  if (lvl.includes('concise') || lvl.includes('brief') || lvl.includes('short')) {
    return 'Keep output tight and compact. Limit to 2-3 core points, concise paragraphs, and essential facts only. Omit non-essential elaboration.';
  }
  if (lvl.includes('detailed') || lvl.includes('comprehensive') || lvl.includes('long')) {
    return 'Provide thorough depth. Include 5-7 key points, comprehensive background context, detailed implications, and operational specifics.';
  }
  return 'Provide a balanced depth. Include 3-5 core points with clear supporting context and moderate narrative explanation.';
}

export function getObjectiveDirectives(objective) {
  const obj = String(objective || 'Inform').toLowerCase();
  if (obj.includes('educate')) {
    return 'Objective: EDUCATE. Explain concepts, contextualize why and how things work, and foster deeper understanding.';
  }
  if (obj.includes('announce')) {
    return 'Objective: ANNOUNCE. Spotlight new developments, effective dates, schedules, and what has changed.';
  }
  if (obj.includes('explain')) {
    return 'Objective: EXPLAIN. Detail cause-and-effect, mechanism of action, and structured reasoning.';
  }
  if (obj.includes('persuade')) {
    return 'Objective: PERSUADE. Emphasize compelling reasons, decision criteria, and beneficial outcomes grounded in the facts.';
  }
  if (obj.includes('advise')) {
    return 'Objective: ADVISE. Structure output as actionable advice, recommendations, and clear guidance.';
  }
  if (obj.includes('promote')) {
    return 'Objective: PROMOTE. Emphasize positive achievements and highlights directly evidenced in the source.';
  }
  if (obj.includes('summarize')) {
    return 'Objective: SUMMARIZE. Focus on high-density distillation of essential facts, decisions, and conclusions.';
  }
  return 'Objective: INFORM. Report facts neutrally, objectively, and accurately.';
}

export function getStyleDirectives(style) {
  const st = String(style || 'Structured').toLowerCase();
  if (st.includes('plain')) {
    return 'Style: PLAIN TEXT. Write clean, unadorned prose paragraphs without markdown bullet characters or decorative headers.';
  }
  if (st.includes('bullet')) {
    return 'Style: BULLET POINTS. Use structured bullet hierarchies and scannable lists for rapid digestion.';
  }
  if (st.includes('storytelling')) {
    return 'Style: STORYTELLING. Weave facts into a coherent narrative arc (context, development, resolution) while preserving 100% of factual accuracy.';
  }
  if (st.includes('executive')) {
    return 'Style: EXECUTIVE. High-density briefing with executive overview, high-impact metrics, and strategic implications.';
  }
  if (st.includes('technical')) {
    return 'Style: TECHNICAL. Structured specifications, parameter callouts, and clean technical partitions.';
  }
  return 'Style: STRUCTURED. Clear section divisions, logical paragraphing, and readable headings.';
}

export function getLanguageDirectives(language) {
  const lang = String(language || 'English').toLowerCase();
  if (lang.includes('hindi')) {
    return 'Language: HINDI (हिंदी). Write all titles, text, bullets, and narration in natural, grammatically correct Hindi using Devanagari script. Do not output Latin transliteration.';
  }
  if (lang.includes('marathi')) {
    return 'Language: MARATHI (मराठी). Write all titles, text, bullets, and narration in natural, grammatically correct Marathi using Devanagari script. Do not output Latin transliteration.';
  }
  return 'Language: ENGLISH. Write all output in fluent, professional English.';
}

export function buildTransformationSystemPrompt() {
  return `You are the core Transformation Engine of InfoFlip-AI (SIH 2026 Problem Statement 26154).
Your objective is to transform source information and its pre-computed Module 2 semantic analysis into audience-tailored, multi-format communication outputs.

CRITICAL ANTI-HALLUCINATION & INTEGRITY RULES:
1. Grounding: Transform ONLY the information provided in the source and Module 2 analysis.
2. Zero Invention: NEVER invent statistics, figures, deadlines, individuals, organizations, quotes, URLs, or research findings.
3. Missing Information: If key details are missing for a section, write "Not specified in the source." rather than manufacturing facts.
4. Source Consistency: Inferred claims must be presented as contextual guidance, not stated as empirical facts.
5. Safety Directives: NEVER strengthen safety instructions beyond what the source text explicitly states (e.g. do NOT turn "avoid unnecessary travel" into "stay indoors" or mandatory evacuation orders). Do NOT label source statements as independently verified or officially confirmed without proof.
6. Language: Strictly respect the requested language (English, Hindi, or Marathi Devanagari script) accurately and professionally.

FORMAT INDEPENDENCE & ANTI-CROSS-FORMAT DUPLICATION:
- When multiple output formats are selected, each format must follow its own distinct structure and requirements.
- Avoid returning identical text under different format labels.
- Preserve shared source facts across all outputs, but calibrate the wording, structure, and medium-specific conventions for each format independently.
- Keep format-specific instructions separate from source content, and ensure one format does not inherit another format's layout or template.`;
}

export function buildTransformationUserPrompt(request = {}, options = {}) {
  const source = request.source || request.sourceContent || {};
  const analysis = request.analysis || {};
  const configuration = request.configuration || request.config || {};
  const requestedOutputs = request.requestedOutputs || request.requestedFormats || [];

  const targetAudienceStr = Array.isArray(configuration.targetAudience)
    ? configuration.targetAudience.join(', ')
    : (configuration.targetAudience || 'General Public');

  const audienceDirective = getAudienceDirectives(targetAudienceStr);
  const toneDirective = getToneDirectives(configuration.tone);
  const detailDirective = getDetailDirectives(configuration.detailLevel);
  const objectiveDirective = getObjectiveDirectives(configuration.objective);
  const styleDirective = getStyleDirectives(configuration.contentStyle);
  const languageDirective = getLanguageDirectives(configuration.language);

  const formatsInstructions = requestedOutputs.map(formatId => {
    const formatDef = getOutputFormatById(formatId);
    return `### Format: "${formatId}" (${formatDef?.name || formatId})
${formatDef?.promptInstructions || ''}
Expected JSON structure:
${JSON.stringify(formatDef?.expectedStructure || {}, null, 2)}`;
  }).join('\n\n');

  const isRegen = Boolean(options.isRegeneration || options.variantSeed);
  const regenDirective = isRegen ? `
---
REGENERATION VARIATION DIRECTIVE:
- This is a REGENERATION request for a new candidate variation.
- Generate a fresh, distinct variation with alternative phrasing, layout, and rhetorical emphasis.
- Preserve 100% of the grounded source facts and figures without inventing any new claims.` : '';

  return `Please transform the following source into the requested outputs.
${regenDirective}
---
SOURCE CONTENT:
${source.extractedText || source.rawText || 'No source text provided.'}

---
MODULE 2 CONTENT UNDERSTANDING:
- Main Topic: ${analysis.overview?.mainTopic || 'General'}
- Domain / Category: ${analysis.overview?.category || 'General'}
- Communicative Intent: ${analysis.intent?.primary || 'Inform'} (Secondary: ${(analysis.intent?.secondary || []).join(', ')})
- Source Tone: ${analysis.tone?.primary || 'Neutral'}
- Urgency: ${analysis.urgency?.level || 'not_detected'} (Reasons: ${(analysis.urgency?.reasons || []).join('; ')})
- Grounded Key Facts from Source:
${(analysis.keyFacts || []).map(f => `  * [${f.importance || 'fact'}] ${typeof f === 'string' ? f : f.fact}`).join('\n')}
- Grounded Entities from Source:
  * Organizations: ${(analysis.entities?.organizations || []).join(', ') || 'None specified'}
  * Locations: ${(analysis.entities?.locations || []).join(', ') || 'None specified'}
  * Key Dates & Deadlines: ${(analysis.importantDates || []).map(d => `${d.date} (${d.context})`).join('; ') || 'None specified'}
  * Key Metrics & Quantities: ${(analysis.importantNumbers || []).map(n => `${n.value} - ${n.label} (${n.context})`).join('; ') || 'None specified'}

---
USER CONFIGURATION & ACTIVE DIRECTIVES:
- Target Audience: ${targetAudienceStr}
  * Directive: ${audienceDirective}
- Desired Tone: ${configuration.tone || 'Informative'}
  * Directive: ${toneDirective}
- Output Language: ${configuration.language || 'English'}
  * Directive: ${languageDirective}
- Level of Detail: ${configuration.detailLevel || 'Balanced'}
  * Directive: ${detailDirective}
- Primary Objective: ${configuration.objective || 'Inform'}
  * Directive: ${objectiveDirective}
- Content Style: ${configuration.contentStyle || 'Structured'}
  * Directive: ${styleDirective}

---
REQUESTED OUTPUT FORMATS (GENERATE DISTINCT OUTPUTS FOR EACH):
${formatsInstructions}

Return strictly a valid JSON object matching this schema:
{
  "outputs": [
    {
      "format": "string (one of the requested format IDs)",
      "content": object // structured object matching the format's expected structure
    }
  ]
}`;
}
