/**
 * Output Format Registry for InfoFlip-AI Module 3
 * 
 * Defines metadata, generation rules, expected structures, and validation hooks
 * for all 7 supported transformation formats.
 * Designed to allow Modules 4 and 5 to extend formats without rewriting Module 3.
 */

import { OUTPUT_FORMAT_IDS } from '../../types/transformation.js';

export const OUTPUT_FORMAT_REGISTRY = {
  [OUTPUT_FORMAT_IDS.LINKEDIN]: {
    id: OUTPUT_FORMAT_IDS.LINKEDIN,
    name: 'LinkedIn Post',
    shortName: 'LinkedIn',
    badge: 'Social / Professional',
    description: 'Professional social post with engaging hook, structured insights, and call-to-action.',
    iconName: 'Share2',
    accentColor: 'indigo',
    allowedStyles: ['Professional', 'Structured', 'Storytelling', 'Executive', 'Social Media'],
    expectedStructure: {
      type: 'object',
      properties: {
        text: 'string',
        headline: 'string',
        hashtags: 'array of strings',
        cta: 'string'
      }
    },
    promptInstructions: `Generate a polished LinkedIn post:
- Start with an attention-grabbing, professional opening hook.
- Structure key insights using readable spacing and clean paragraph breaks.
- Synthesize factual points into clear business / community implications.
- Maintain professional, credible tone.
- Conclude with an engaging call-to-action (CTA) and 3-5 relevant hashtags.
- Do NOT invent facts or statistics not present in the source.`
  },

  [OUTPUT_FORMAT_IDS.TWITTER]: {
    id: OUTPUT_FORMAT_IDS.TWITTER,
    name: 'X / Twitter Post',
    shortName: 'X / Twitter',
    badge: 'Micro-Update',
    description: 'High-impact concise post or thread with character awareness and key facts first.',
    iconName: 'MessageSquare',
    accentColor: 'sky',
    allowedStyles: ['Concise', 'Plain Text', 'Bullet Points', 'Social Media'],
    expectedStructure: {
      type: 'object',
      properties: {
        posts: 'array of strings (numbered thread if >1 post)',
        isThread: 'boolean',
        characterCount: 'number'
      }
    },
    promptInstructions: `Generate a concise post or thread for X (Twitter):
- Lead with the most important finding or announcement.
- If content exceeds standard length, break into a coherent thread (Post 1/3, Post 2/3, etc.).
- Maintain strict character awareness (concise, clear, impactful).
- Include essential numbers, helplines, or deadlines verbatim from source.
- Conclude with relevant hashtags.`
  },

  [OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY]: {
    id: OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
    name: 'Executive Summary',
    shortName: 'Exec Summary',
    badge: 'Leadership Briefing',
    description: 'High-level decision brief featuring overview, key points, findings, implications, and considerations.',
    iconName: 'FileText',
    accentColor: 'emerald',
    allowedStyles: ['Executive', 'Structured', 'Bullet Points', 'Professional'],
    expectedStructure: {
      type: 'object',
      properties: {
        title: 'string',
        executiveOverview: 'string',
        keyPoints: 'array of strings',
        importantFindings: 'array of strings',
        implications: 'array of strings',
        recommendedConsiderations: 'array of strings'
      }
    },
    promptInstructions: `Generate a formal Executive Summary:
- Title: Clear, executive-level subject line.
- Executive Overview: 2-3 sentence strategic summary.
- Key Points: 3-5 grounded bullet points representing core situation.
- Important Findings: Verifiable quantitative metrics and data points from source.
- Implications: Operational, organizational, or civic impact.
- Recommended Considerations: Objective considerations based strictly on source context. Do NOT invent recommendations.`
  },

  [OUTPUT_FORMAT_IDS.ADVISORY]: {
    id: OUTPUT_FORMAT_IDS.ADVISORY,
    name: 'Official Advisory',
    shortName: 'Advisory',
    badge: 'Public Notice',
    description: 'Clear situational notice with impact assessment, recommended actions, and urgent timelines.',
    iconName: 'AlertTriangle',
    accentColor: 'amber',
    allowedStyles: ['Structured', 'Technical', 'Plain Text', 'Urgent'],
    expectedStructure: {
      type: 'object',
      properties: {
        title: 'string',
        situation: 'string',
        keyInformation: 'array of strings',
        potentialImpact: 'string',
        recommendedActions: 'array of strings',
        importantDates: 'array of strings'
      }
    },
    promptInstructions: `Generate an Official Advisory:
- Title: Formal directive or advisory heading.
- Situation: Factual description of current status or hazard.
- Key Information: Crucial operational guidelines and parameters.
- Potential Impact: Vulnerable regions, systems, or cohorts affected.
- Recommended Actions: Concrete dos & don'ts and safety steps.
- Important Dates / Deadlines: Time-sensitive windows and contact helplines.`
  },

  [OUTPUT_FORMAT_IDS.INFOGRAPHIC]: {
    id: OUTPUT_FORMAT_IDS.INFOGRAPHIC,
    name: 'Infographic Content',
    shortName: 'Infographic',
    badge: 'Visual Data',
    description: 'Structured visual hierarchy with modular sections, highlighted statistics, and callout banner.',
    iconName: 'BarChart3',
    accentColor: 'purple',
    allowedStyles: ['Structured', 'Bullet Points', 'Technical'],
    expectedStructure: {
      type: 'object',
      properties: {
        title: 'string',
        subtitle: 'string',
        sections: 'array of { heading, keyPoint, supportingFact }',
        statistics: 'array of { value, label, context }',
        callout: 'string'
      }
    },
    promptInstructions: `Generate structured content for an Infographic (ready for visual rendering in Module 5):
- Title & Subtitle: High-impact main header and framing subhead.
- Sections: 3-4 distinct panels with heading, core key point, and supporting fact.
- Statistics: 3-4 numeric badges with value, metric label, and short context from source.
- Callout: Highlighted takeaway banner or final directive.`
  },

  [OUTPUT_FORMAT_IDS.PRESENTATION]: {
    id: OUTPUT_FORMAT_IDS.PRESENTATION,
    name: 'Presentation Content',
    shortName: 'Presentation',
    badge: 'Slide Deck',
    description: 'Structured slide deck with clear titles, slide purposes, bullet points, and speaker notes.',
    iconName: 'Presentation',
    accentColor: 'violet',
    allowedStyles: ['Structured', 'Executive', 'Bullet Points', 'Professional'],
    expectedStructure: {
      type: 'object',
      properties: {
        title: 'string',
        slides: 'array of { slideNumber, title, purpose, bullets, speakerNotes }'
      }
    },
    promptInstructions: `Generate structured Slide Content for a presentation (ready for PPT export in Module 5):
- Title: Presentation master title.
- Slides: 4-6 sequential slides covering Introduction, Context, Key Findings/Data, Strategic Actions, and Conclusion.
- For each slide provide: slideNumber, title, purpose, bullets (3-4 concise bullet points), and speakerNotes (spoken talking points).`
  },

  [OUTPUT_FORMAT_IDS.VIDEO_SCRIPT]: {
    id: OUTPUT_FORMAT_IDS.VIDEO_SCRIPT,
    name: 'Video Script',
    shortName: 'Video Script',
    badge: 'Storyboard / Audio',
    description: 'Time-coded script and storyboard with visual directions, narration, and on-screen text.',
    iconName: 'Video',
    accentColor: 'rose',
    allowedStyles: ['Storytelling', 'Conversational', 'Structured', 'Social Media'],
    expectedStructure: {
      type: 'object',
      properties: {
        title: 'string',
        durationEstimate: 'string',
        scenes: 'array of { sceneNumber, visual, narration, onScreenText, duration }'
      }
    },
    promptInstructions: `Generate a structured Video Script and Storyboard (ready for video synthesis in Module 5):
- Title & Duration Estimate (e.g. 60-90 seconds).
- Scenes: 4-5 sequential scenes (Hook, Situation Overview, Core Facts, Action Directives, Outro).
- For each scene provide: sceneNumber, visual (camera/animation directions), narration (voiceover script), onScreenText (graphics/captions), and duration (e.g. "15s").`
  }
};

/**
 * Returns array of all registered format definitions
 */
export function getAllOutputFormats() {
  return Object.values(OUTPUT_FORMAT_REGISTRY);
}

/**
 * Retrieves registry entry for a specific format ID
 */
export function getOutputFormatById(formatId) {
  return OUTPUT_FORMAT_REGISTRY[formatId] || null;
}
