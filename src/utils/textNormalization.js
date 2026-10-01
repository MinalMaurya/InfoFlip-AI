/**
 * InfoFlip-AI Text Normalization and Analytics Utilities
 */

/**
 * Normalizes raw input text into clean standard format
 * @param {string} raw 
 * @returns {string}
 */
export function normalizeText(raw = '') {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    // Normalize Windows/Mac line endings to standard Unix
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove control characters except standard whitespace and newlines
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize unicode composite characters
    .normalize('NFKC')
    // Collapse 3 or more consecutive newlines into 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Calculates comprehensive text metrics for source preview & data contracts
 * @param {string} text 
 */
export function calculateTextMetrics(text = '') {
  const clean = normalizeText(text);

  if (!clean) {
    return {
      wordCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      paragraphCount: 0,
      sentenceCount: 0,
      readingTimeMinutes: 0,
      detectedLanguage: 'English'
    };
  }

  // Word count using unicode word boundary matching
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const characterCount = clean.length;
  const characterCountNoSpaces = clean.replace(/\s+/g, '').length;

  // Paragraph count
  const paragraphs = clean.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // Sentence count
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Estimated reading time at average 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Basic script / language heuristic
  let detectedLanguage = 'English';
  // Devanagari script range: \u0900-\u097F
  const devanagariMatches = (clean.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariMatches > 10) {
    // Check for Marathi unique vocabulary or unique character ळ (\u0933)
    if (/[\u0933]/.test(clean) || /(?:आहे|झाले|केले|महाराष्ट्र|सांगितले|पावसाचा|राहावे|केल्याचे|आणि|मध्ये|करावे|नाही|येथे)/.test(clean)) {
      detectedLanguage = 'Marathi';
    } else {
      detectedLanguage = 'Hindi';
    }
  }

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    paragraphCount,
    sentenceCount,
    readingTimeMinutes,
    detectedLanguage
  };
}
