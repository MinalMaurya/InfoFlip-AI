const MAX_SOURCE_LENGTH = 20000;
const MAX_HEADLINE_LENGTH = 110;
const MAX_SUMMARY_LENGTH = 420;
const MAX_KEYWORDS = 6;
const MAX_ACTIONS = 3;

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'around', 'been', 'before', 'being', 'below', 'between', 'both',
  'could', 'from', 'into', 'just', 'more', 'most', 'must', 'over', 'same', 'should', 'that', 'their', 'them',
  'there', 'these', 'they', 'this', 'those', 'through', 'under', 'very', 'with', 'your', 'have', 'will',
  'where', 'when', 'what', 'which', 'while', 'would', 'upon', 'than', 'then', 'only', 'once', 'also',
  'across', 'among', 'within', 'without', 'during', 'because', 'public', 'state', 'official', 'information',
  'people', 'alert', 'notice', 'advisory', 'update', 'issued', 'following', 'according', 'report', 'reports',
  'due', 'said', 'team', 'teams', 'today', 'tomorrow', 'safety', 'citizens', 'residents', 'department', 'authorities'
]);

const ACTION_PATTERN = /\b(?:must|should|required|avoid|ensure|report|call|dial|monitor|verify|immediately|follow|remain|activate)\b/i;
const URGENCY_PATTERN = /\b(?:urgent|emergency|critical|alert|warning|immediate|risk|attack|cyclone|flood|phishing|severe)\b|आपातकालीन|आपात स्थिति|चेतावनी|खतरा|बाढ़|चक्रवात|गंभीर|तातडीने|इशारा|धोका|पूर|चक्रीवादळ/giu;
const URGENCY_NEGATORS = new Set(['no', 'not', 'never', 'without', 'denied', 'none', 'नहीं', 'नही', 'मत']);
const ACTION_WORD_PATTERN = /[\p{L}\p{N}]+/gu;

function truncate(text, maxLength) {
  const characters = Array.from(text);
  return characters.length > maxLength
    ? `${characters.slice(0, maxLength).join('').trimEnd()}…`
    : text;
}

function containsUnnegatedUrgencyCue(sentence) {
  for (const match of sentence.matchAll(URGENCY_PATTERN)) {
    const precedingWords = Array.from(
      sentence.slice(0, match.index).matchAll(ACTION_WORD_PATTERN),
      ([word]) => word.toLowerCase()
    ).slice(-3);

    if (!precedingWords.some((word) => URGENCY_NEGATORS.has(word))) {
      return true;
    }
  }

  return false;
}

function detectFocus(text) {
  if (/\b(?:rain(?:fall)?|flood(?:ed|ing|s)?|storms?|cyclones?|weather|disaster|warning)\b|मौसम|बारिश|बाढ़|चक्रवात|पाऊस|पूर|चक्रीवादळ/i.test(text)) {
    return 'Weather safety response';
  }
  if (/\b(?:health|fever|dengue|medical|clinic|hospital|virus|care)\b|स्वास्थ्य|बुखार|बीमारी|आरोग्य|ताप|रुग्णालय/i.test(text)) {
    return 'Public health alert';
  }
  if (/\b(?:security|cyber|phishing|mfa|password|attack|breach)\b|साइबर|पासवर्ड|सुरक्षा|सायबर|संकेतशब्द/i.test(text)) {
    return 'Security compliance brief';
  }
  if (/\b(?:policy|scheme|government|subsidy|tax)\b|नीति|योजना|सरकार|धोरण|शासन/i.test(text)) {
    return 'Policy communication brief';
  }
  return 'No clear topic match';
}

export function deriveQuickInsights(text) {
  if (typeof text !== 'string' || !text.trim()) return null;

  const isTruncated = text.length > MAX_SOURCE_LENGTH;
  const source = text.slice(0, MAX_SOURCE_LENGTH);
  const normalized = source.replace(/\s+/g, ' ').trim();
  const sentences = normalized.split(/(?<=[.!?।॥])\s+/u).filter(Boolean);
  const containsDevanagari = /[\u0900-\u097F]/u.test(normalized);
  const englishHeuristicsSupported = !containsDevanagari;

  const keywordCounts = new Map();
  if (englishHeuristicsSupported) {
    const words = normalized.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    words.forEach((word) => {
      if (word.length > 3 && !STOP_WORDS.has(word)) {
        keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
      }
    });
  }

  const keywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_KEYWORDS)
    .map(([word]) => word);

  const actions = englishHeuristicsSupported
    ? sentences.filter((sentence) => ACTION_PATTERN.test(sentence)).slice(0, MAX_ACTIONS)
    : [];
  const cueSentences = sentences.filter(containsUnnegatedUrgencyCue);
  const headline = sentences[0] || 'Source content ready for transformation';
  const summary = sentences.slice(0, 2).join(' ') || normalized;

  return {
    headline: truncate(headline, MAX_HEADLINE_LENGTH),
    summary: truncate(summary, MAX_SUMMARY_LENGTH),
    keywords,
    actions,
    focus: detectFocus(normalized),
    urgency: cueSentences.length ? 'Potential urgency cue found' : 'No clear urgency cue found',
    englishHeuristicsSupported,
    isTruncated
  };
}
