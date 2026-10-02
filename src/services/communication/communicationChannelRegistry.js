/**
 * Communication Channel Registry for InfoFlip-AI Module 4
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 * 
 * Registry-based architecture for all 8 supported channels.
 * Enables dynamic registration of new communication channels without modifying core engine.
 */

import { COMMUNICATION_CHANNEL_IDS } from '../../types/communication.js';

export const COMMUNICATION_CHANNEL_REGISTRY = {
  [COMMUNICATION_CHANNEL_IDS.LINKEDIN]: {
    id: COMMUNICATION_CHANNEL_IDS.LINKEDIN,
    name: 'LinkedIn Post',
    shortName: 'LinkedIn',
    badge: 'Professional Network',
    description: 'Professional post with a strong opening, key message, grounded facts, CTA, and relevant hashtags.',
    iconName: 'Share2',
    accentColor: 'indigo',
    maxCharacters: 3000,
    characterLimitWarning: 2800,
    promptInstructions: `Generate a professional, readable LinkedIn post:
- Strong opening hook that immediately engages professional audiences.
- Clear core message summarizing the situation or findings.
- Important verifiable facts and statistics taken directly from the source.
- Appropriate and action-oriented Call to Action (CTA).
- 3-5 grounded hashtags based on the actual topic.
- Avoid unnecessary repetition or duplication.`
  },

  [COMMUNICATION_CHANNEL_IDS.TWITTER]: {
    id: COMMUNICATION_CHANNEL_IDS.TWITTER,
    name: 'X / Twitter Post',
    shortName: 'X / Twitter',
    badge: 'Micro-Broadcast',
    description: 'Concise post or multi-part thread respecting 280-character constraints with critical facts front-loaded.',
    iconName: 'MessageSquare',
    accentColor: 'sky',
    maxCharacters: 280,
    characterLimitWarning: 270,
    promptInstructions: `Generate a concise post or thread for X (Twitter):
- Strong, punchy first sentence highlighting the core development.
- Strictly preserve critical numbers, deadlines, or guidance.
- Respect 280 characters per tweet; provide a numbered thread (1/X, 2/X) when content requires depth.
- Include essential grounded hashtags at the conclusion.`
  },

  [COMMUNICATION_CHANNEL_IDS.WHATSAPP]: {
    id: COMMUNICATION_CHANNEL_IDS.WHATSAPP,
    name: 'WhatsApp Broadcast',
    shortName: 'WhatsApp',
    badge: 'Direct Messaging',
    description: 'Highly scannable bulletin with short paragraphs, highlighted warnings, tasteful emojis, and clear CTA.',
    iconName: 'Smartphone',
    accentColor: 'emerald',
    maxCharacters: 1024,
    characterLimitWarning: 950,
    promptInstructions: `Generate a highly scannable WhatsApp broadcast message:
- Use short, readable paragraphs and clean line spacing.
- Clearly highlight key warnings, dates, or directives (*bold*).
- Use tasteful, appropriate emojis (📢, 📌, ⚠️, 🗓️, ✅) only when useful.
- Conclude with a clear, direct action step or helpline.`
  },

  [COMMUNICATION_CHANNEL_IDS.EMAIL]: {
    id: COMMUNICATION_CHANNEL_IDS.EMAIL,
    name: 'Email Dispatch',
    shortName: 'Email',
    badge: 'Direct Mail',
    description: 'Structured email complete with subject line, preview text, greeting, body, grounded facts, CTA, and closing.',
    iconName: 'Mail',
    accentColor: 'blue',
    maxCharacters: 5000,
    characterLimitWarning: 4500,
    promptInstructions: `Generate a complete, structured email communication:
- Subject Line: Compelling, relevant, professional subject line.
- Preview Text: 1-sentence teaser for email previewers.
- Greeting: Appropriate formal/semi-formal salutation.
- Main Message: Focused core message explaining context and significance.
- Important Facts: Key grounded facts or data points in bullet form.
- CTA: Clear directive or response mechanism.
- Closing: Professional sign-off.`
  },

  [COMMUNICATION_CHANNEL_IDS.SMS]: {
    id: COMMUNICATION_CHANNEL_IDS.SMS,
    name: 'SMS Alert',
    shortName: 'SMS',
    badge: 'Instant Alert',
    description: 'Extremely concise notification preserving only critical facts, under or close to the 160-character threshold.',
    iconName: 'Send',
    accentColor: 'amber',
    maxCharacters: 160,
    characterLimitWarning: 160,
    promptInstructions: `Generate an extremely concise SMS alert:
- Maximum brevity, preserving ONLY critical facts, dates, or actions.
- Target under 160 characters whenever possible.
- Include clear helpline, portal link placeholder, or immediate directive.`
  },

  [COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT]: {
    id: COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT,
    name: 'Public Announcement',
    shortName: 'Announcement',
    badge: 'Official Notice',
    description: 'Formal, accessible public notice with prominent instructions designed for broad public comprehension.',
    iconName: 'Megaphone',
    accentColor: 'purple',
    maxCharacters: 2500,
    characterLimitWarning: 2300,
    promptInstructions: `Generate an official Public Announcement:
- Formal, authoritative tone that remains easily understandable to the general public.
- Prominent heading and situational overview.
- Clear, numbered or bulleted instructions for affected individuals.
- Official contact points, validity period, or emergency helplines strictly from source.`
  },

  [COMMUNICATION_CHANNEL_IDS.CTA]: {
    id: COMMUNICATION_CHANNEL_IDS.CTA,
    name: 'Call-to-Action (CTA)',
    shortName: 'CTA Variants',
    badge: 'Action Conversion',
    description: 'Multiple action-oriented CTA variants strictly grounded in available source content.',
    iconName: 'MousePointerClick',
    accentColor: 'rose',
    maxCharacters: 400,
    characterLimitWarning: 350,
    promptInstructions: `Generate 3-4 action-oriented Call-to-Action (CTA) variants:
- Primary Action: Direct, prominent next step based on source.
- Immediate / Quick Action: Low-barrier immediate step for readers.
- Informational / Community Action: Sharing, registration, or advisory review.
- Time-sensitive Action: If deadlines or dates exist in source, highlight urgency.`
  },

  [COMMUNICATION_CHANNEL_IDS.HASHTAGS]: {
    id: COMMUNICATION_CHANNEL_IDS.HASHTAGS,
    name: 'Hashtag Suggestions',
    shortName: 'Hashtags',
    badge: 'Discovery & Reach',
    description: 'Curated, relevant hashtags derived from actual source entities, topics, and category.',
    iconName: 'Hash',
    accentColor: 'teal',
    maxCharacters: 300,
    characterLimitWarning: 280,
    promptInstructions: `Generate relevant, topic-grounded hashtags:
- Base all hashtags on actual entities, domains, topics, and actions in source.
- Do NOT invent trending keywords that are unrelated to the content.
- Provide a clean list of 6-10 hashtags sorted by relevance.`
  }
};

/**
 * Mapping of aliases for channel identifiers
 */
export const CHANNEL_ALIAS_MAP = {
  'x': COMMUNICATION_CHANNEL_IDS.TWITTER,
  'tweet': COMMUNICATION_CHANNEL_IDS.TWITTER,
  'public-announcement': COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT,
  'call-to-action': COMMUNICATION_CHANNEL_IDS.CTA,
  'tag': COMMUNICATION_CHANNEL_IDS.HASHTAGS,
  'tags': COMMUNICATION_CHANNEL_IDS.HASHTAGS
};

/**
 * Resolves a channel identifier or alias to canonical ID
 * @param {string} id 
 * @returns {string}
 */
export function resolveChannelId(id) {
  if (!id || typeof id !== 'string') return null;
  const clean = id.trim().toLowerCase();
  if (COMMUNICATION_CHANNEL_REGISTRY[clean]) return clean;
  if (CHANNEL_ALIAS_MAP[clean]) return CHANNEL_ALIAS_MAP[clean];
  return null;
}

/**
 * Returns all registered communication channels
 * @returns {Array<object>}
 */
export function getAllCommunicationChannels() {
  return Object.values(COMMUNICATION_CHANNEL_REGISTRY);
}

/**
 * Retrieves a channel definition by canonical ID or alias
 * @param {string} id 
 * @returns {object|null}
 */
export function getCommunicationChannelById(id) {
  const resolved = resolveChannelId(id);
  return resolved ? COMMUNICATION_CHANNEL_REGISTRY[resolved] : null;
}

/**
 * Checks if a channel ID is registered
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidCommunicationChannel(id) {
  return Boolean(resolveChannelId(id));
}

/**
 * Dynamically registers a new communication channel into the registry
 * @param {object} channelDef 
 * @returns {boolean}
 */
export function registerCommunicationChannel(channelDef) {
  if (!channelDef || !channelDef.id || !channelDef.name) {
    throw new Error('Channel definition must contain at least id and name.');
  }
  const id = channelDef.id.trim().toLowerCase();
  COMMUNICATION_CHANNEL_REGISTRY[id] = {
    ...channelDef,
    id,
    shortName: channelDef.shortName || channelDef.name,
    badge: channelDef.badge || 'Communication',
    iconName: channelDef.iconName || 'MessageSquare',
    accentColor: channelDef.accentColor || 'indigo',
    maxCharacters: channelDef.maxCharacters || 2000,
    characterLimitWarning: channelDef.characterLimitWarning || channelDef.maxCharacters || 2000,
    promptInstructions: channelDef.promptInstructions || `Generate content for ${channelDef.name}.`
  };
  return true;
}

/**
 * Unregisters a dynamically registered channel
 * @param {string} id 
 * @returns {boolean}
 */
export function unregisterCommunicationChannel(id) {
  const resolved = resolveChannelId(id);
  if (resolved && COMMUNICATION_CHANNEL_REGISTRY[resolved]) {
    delete COMMUNICATION_CHANNEL_REGISTRY[resolved];
    return true;
  }
  return false;
}
