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

export function buildTransformationSystemPrompt() {
  return `You are the core Transformation Engine of InfoFlip-AI (SIH 2026 Problem Statement 26154).
Your objective is to transform source information and its pre-computed Module 2 semantic analysis into audience-tailored, multi-format communication outputs.

CRITICAL ANTI-HALLUCINATION RULES:
1. Grounding: Transform ONLY the information provided in the source and Module 2 analysis.
2. Zero Invention: NEVER invent statistics, figures, deadlines, individuals, organizations, quotes, URLs, or research findings.
3. Missing Information: If key details are missing for a section, write "Not specified in the source." rather than manufacturing facts.
4. Source Consistency: Inferred claims must be presented as contextual guidance, not stated as empirical facts.
5. Safety Directives: NEVER strengthen safety instructions beyond what the source text explicitly states (e.g. do NOT turn "avoid unnecessary travel" into "stay indoors" or mandatory evacuation orders). Do NOT label source statements as independently verified or officially confirmed without proof.
6. Language: Respect the requested language (English, Hindi, or Marathi) accurately and professionally.`;
}

export function buildTransformationUserPrompt(request = {}, options = {}) {
  const source = request.source || request.sourceContent || {};
  const analysis = request.analysis || {};
  const configuration = request.configuration || request.config || {};
  const requestedOutputs = request.requestedOutputs || request.requestedFormats || [];

  const targetAudienceStr = Array.isArray(configuration.targetAudience)
    ? configuration.targetAudience.join(', ')
    : (configuration.targetAudience || 'General Public');

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
USER CONFIGURATION:
- Target Audience: ${targetAudienceStr}
- Desired Tone: ${configuration.tone}
- Output Language: ${configuration.language}
- Level of Detail: ${configuration.detailLevel} (Concise / Balanced / Detailed)
- Primary Objective: ${configuration.objective}
- Content Style: ${configuration.contentStyle}

---
REQUESTED OUTPUT FORMATS:
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
