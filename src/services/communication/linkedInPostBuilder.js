/**
 * InfoFlip-AI LinkedIn Post Builder & Normalizer
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 * 
 * Dedicated engine for generating high-quality LinkedIn communication assets.
 * Specifically optimizes urgent public-safety, weather-alert, and disaster-response content:
 * - Eliminates repetitive headings (e.g., "Key Development" followed by "Strategic Update").
 * - Prohibits generic engagement questions ("What are your thoughts on this?") for emergency content.
 * - Prioritizes clear safety instructions, verified facts, and concise formatting over promotional language.
 * - Enforces 3–5 readable, concise hashtags (<= 25 chars, e.g., #WeatherAlert, #PublicSafety, #DisasterPreparedness).
 * - Preserves strict source grounding, lineage, and multilingual fallback (English, Hindi, Marathi).
 * - Never invents alert levels, forecast periods, statistics, deployments, or statements.
 */

/**
 * Evaluates whether the content represents an urgent public-safety, weather-alert,
 * or disaster-response situation.
 * 
 * @param {object} params
 * @returns {boolean}
 */
export function isEmergencyContent({ analysis = {}, config = {}, sourceContent = {}, mainTopic = '', summary = '' } = {}) {
  // 1. Urgency level from analysis
  const urgencyLvl = String(analysis?.urgency?.level || '').toLowerCase();
  if (['high', 'urgent', 'critical', 'emergency'].includes(urgencyLvl)) {
    return true;
  }

  // 2. Requested or detected tone
  const requestedTone = String(config?.tone || '').toLowerCase();
  const primaryTone = String(analysis?.tone?.primary || '').toLowerCase();
  if (requestedTone.includes('urgent') || requestedTone.includes('emergency') ||
      primaryTone.includes('urgent') || primaryTone.includes('emergency')) {
    return true;
  }

  // If urgency is explicitly low and tone is not urgent, only treat as emergency if category or mainTopic explicitly indicates disaster/weather alert
  const category = String(analysis?.overview?.category || '').toLowerCase();
  if (urgencyLvl === 'low' && !requestedTone.includes('urgent') && !primaryTone.includes('urgent')) {
    const isExplicitCrisis = /\b(?:disaster|emergency|severe weather|cyclone alert|flood alert)\b/i.test(`${category} ${mainTopic}`);
    if (!isExplicitCrisis) {
      return false;
    }
  }

  // 3. Category / Domain
  if (/\b(?:disaster|meteorolog|weather|emergency|public safety|crisis|hazard|flood|cyclone|storm)\b/i.test(category)) {
    return true;
  }

  // 4. Intent signals
  const intentPrimary = String(analysis?.intent?.primary || '').toLowerCase();
  if (intentPrimary.includes('alert') || intentPrimary.includes('warn')) {
    return true;
  }
  const intentSec = Array.isArray(analysis?.intent?.secondary)
    ? analysis.intent.secondary.join(' ').toLowerCase()
    : '';
  if (intentSec.includes('public safety') || intentSec.includes('emergency') || intentSec.includes('alert')) {
    return true;
  }

  // 5. Text & keyword pattern matching across topic, summary, rawText, and facts
  const textToScan = [
    mainTopic,
    summary,
    analysis?.overview?.mainTopic || '',
    analysis?.overview?.title || '',
    analysis?.overview?.summary || '',
    sourceContent?.rawText || sourceContent?.extractedText || '',
    Array.isArray(analysis?.topics) ? analysis.topics.join(' ') : '',
    Array.isArray(analysis?.keyFacts) ? analysis.keyFacts.map(f => typeof f === 'string' ? f : f.fact).join(' ') : ''
  ].join(' ').toLowerCase();

  const emergencyPattern = /\b(?:cyclone|cyclonic|flood|flash flood|storm|heavy rainfall|weather warning|weather alert|tsunami|earthquake|landslide|evacuation|wildfire|hurricane|disaster|emergency alert|severe weather|public safety warning|advisory|emergency response|gale|storm surge)\b|मौसम|चेतावनी|बाढ़|चक्रवात|आपदा|आपातकालीन|आपत्कालीन|चक्रीवादळ|पूर|हवामान|धोका|इशारा/iu;

  return emergencyPattern.test(textToScan);
}

/**
 * Extracts a verified emergency helpline number from raw text, facts, or numbers.
 * NEVER invents or hallucinates a number if absent.
 * 
 * @param {string} rawText 
 * @param {Array<string>} keyFacts 
 * @param {Array<object>} numbers 
 * @returns {string|null}
 */
export function extractHelpline(rawText = '', keyFacts = [], numbers = []) {
  const combined = `${rawText} ${keyFacts.join(' ')}`;
  const match = combined.match(/\b(?:helpline|emergency assistance|emergency helpline|national helpline|call|dial)\b[^\d\n]{0,25}(\d{3,5})\b/i);
  if (match) return match[1];

  if (Array.isArray(numbers)) {
    const numObj = numbers.find(n => /helpline|emergency|assistance/i.test(n.label || n.context || ''));
    if (numObj && numObj.value) return String(numObj.value);
  }

  return null;
}

/**
 * Generates 3 to 5 readable, concise, grounded hashtags (<= 25 chars each).
 * Strictly avoids unreadable, concatenated monster strings like #SevereWeatherWarningEmergencyFlashFloodResponse.
 * 
 * @param {object} params
 * @returns {Array<string>}
 */
export function generateReadableHashtags({
  isEmergency = false,
  mainTopic = '',
  analysis = {},
  lang = 'English',
  rawText = ''
} = {}) {
  const isHindi = lang === 'Hindi';
  const isMarathi = lang === 'Marathi';

  const tags = [];
  const addTag = (tag) => {
    if (!tag) return;
    const clean = tag.startsWith('#') ? tag : `#${tag}`;
    // Length check: between 3 and 25 characters inclusive
    if (clean.length >= 3 && clean.length <= 25 && !tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      tags.push(clean);
    }
  };

  const combined = `${mainTopic} ${rawText} ${analysis?.overview?.category || ''}`.toLowerCase();

  if (isEmergency) {
    // Topic-specific emergency tags
    if (/cyclone|cyclonic/i.test(combined)) {
      addTag('#CycloneAlert');
    }
    if (/flood|flash flood|heavy rain|rainfall/i.test(combined)) {
      addTag('#FloodAlert');
    }
    if (/weather|monsoon|storm|wind/i.test(combined)) {
      addTag('#WeatherAlert');
    }

    addTag('#PublicSafety');
    addTag('#DisasterPreparedness');

    if (isHindi) {
      addTag('#मौसमचेतावनी');
      addTag('#सुरक्षाअलर्ट');
      addTag('#आपदाप्रबंधन');
    } else if (isMarathi) {
      addTag('#हवामानइशारा');
      addTag('#सार्वजनिकसुरक्षा');
      addTag('#आपत्कालीनमदत');
    } else {
      addTag('#EmergencyResponse');
      addTag('#VerifiedInfo');
    }
  } else {
    // Non-emergency: extract clean keywords from primary keywords
    if (Array.isArray(analysis?.keywords?.primary)) {
      for (const kw of analysis.keywords.primary) {
        const cleanKw = String(kw).replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
        if (cleanKw.length >= 3 && cleanKw.length <= 20) {
          addTag(`#${cleanKw}`);
        }
      }
    }

    if (isHindi) {
      addTag('#महत्वपूर्णअपडेट');
      addTag('#समाचार');
    } else if (isMarathi) {
      addTag('#महत्त्वाचीमाहिती');
      addTag('#अपडेट');
    } else {
      addTag('#PublicInformation');
      addTag('#ProfessionalUpdate');
    }
    addTag('#VerifiedInfo');
  }

  // Ensure between 3 and 5 hashtags
  const fallbackEmergencyTags = ['#WeatherAlert', '#PublicSafety', '#DisasterPreparedness', '#EmergencyResponse'];
  const fallbackStandardTags = ['#PublicInformation', '#VerifiedInfo', '#ProfessionalUpdate', '#InfoFlip'];

  const pool = isEmergency ? fallbackEmergencyTags : fallbackStandardTags;
  for (const fb of pool) {
    if (tags.length >= 3) break;
    addTag(fb);
  }

  return tags.slice(0, 5);
}

/**
 * Normalizes text for comparison by removing emojis, punctuation, collapsing whitespace, and lowercasing.
 * 
 * @param {string} str
 * @returns {string}
 */
export function normalizeTextForComparison(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[:|!?,.;\-—_()[\]{}*#~`"'/\\<>«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Checks if an introduction repeats the headline almost word-for-word.
 * 
 * @param {string} headline 
 * @param {string} intro 
 * @returns {boolean}
 */
export function isHeadlineRepeatedInIntro(headline, intro) {
  if (!headline || !intro) return false;
  const normH = normalizeTextForComparison(headline);
  const normI = normalizeTextForComparison(intro);
  if (!normH || !normI) return false;

  if (normH === normI) return true;
  if (normH.includes(normI) && normI.length / normH.length > 0.45) return true;
  if (normI.includes(normH) && normH.length / normI.length > 0.45) return true;

  // Substantive word overlap
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'about', 'under', 'across', 'key',
    'update', 'directives', 'strategic', 'official', 'important', 'notice',
    'advisory', 'public', 'safety', 'warning', 'alert', 'information', 'here',
    'is', 'a', 'an', 'to', 'in', 'on', 'of', 'at', 'by'
  ]);
  const wordsH = normH.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
  const wordsI = normI.split(' ').filter(w => w.length > 2 && !stopWords.has(w));

  if (wordsH.length > 0 && wordsI.length > 0) {
    const setH = new Set(wordsH);
    const matches = wordsI.filter(w => setH.has(w)).length;
    const overlapRatio = matches / Math.min(wordsH.length, wordsI.length);
    if (overlapRatio >= 0.7) return true;
  }

  return false;
}

/**
 * Deduplicates headline and introduction. If the introduction repeats the headline,
 * extracts genuine distinct context or returns a clean, non-repetitive summary.
 * 
 * @param {string} headline 
 * @param {string} intro 
 * @param {string} fallbackContext 
 * @returns {string}
 */
export function deduplicateHeadlineAndIntro(headline, intro, fallbackContext = '') {
  let cleanIntro = (intro || '').trim();

  // Strip repeated title or prefix at the beginning of intro
  cleanIntro = cleanIntro
    .replace(/^(?:[🚨📌📢⚠️ℹ️]\s*)?(?:Strategic Update|Key Development|Public Safety Advisory|Official Advisory|Important Update|महत्वपूर्ण अपडेट|महत्त्वाची माहिती)[^:\n]*[:|]?\s*/i, '')
    .trim();

  if (!isHeadlineRepeatedInIntro(headline, cleanIntro)) {
    return cleanIntro;
  }

  // If intro has multiple sentences, see if later sentences contain distinct info
  const sentences = cleanIntro.split(/(?<=[.?!।])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const distinctSentences = sentences.filter(s => !isHeadlineRepeatedInIntro(headline, s) && s.length > 15);

  if (distinctSentences.length > 0) {
    return distinctSentences.join(' ');
  }

  // Check fallback context (e.g. source extractedText or overview.summary)
  if (fallbackContext) {
    const fbSentences = fallbackContext.split(/(?<=[.?!।])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    const candidate = fbSentences.find(s => !isHeadlineRepeatedInIntro(headline, s) && s.length > 25);
    if (candidate) {
      return candidate;
    }
  }

  return '';
}

/**
 * Deduplicates facts against the introduction and against each other.
 * Avoids presenting the exact same claim across intro, bullet points, and metrics.
 * Preserves important safety instructions and source traceability.
 * 
 * @param {Array<string>} facts 
 * @param {string} intro 
 * @param {Array<object>} numbers 
 * @param {Array<object>} dates 
 * @returns {Array<string>}
 */
export function deduplicateFacts(facts = [], intro = '', numbers = [], dates = []) {
  if (!Array.isArray(facts)) return [];

  const normIntro = normalizeTextForComparison(intro);
  const seenNormFacts = [];
  const cleanFacts = [];

  for (const rawFact of facts) {
    const fact = typeof rawFact === 'string' ? rawFact.trim() : (rawFact?.fact || '').trim();
    if (!fact || fact.length < 5) continue;

    const normFact = normalizeTextForComparison(fact);
    if (!normFact) continue;

    // Check if substantially identical to intro
    if (normIntro.length > 20) {
      const factWords = normFact.split(' ').filter(w => w.length > 3);
      if (factWords.length > 0) {
        const matches = factWords.filter(w => normIntro.includes(w)).length;
        if (matches / factWords.length >= 0.75) {
          // Fact is already fully stated in intro; skip to avoid repetition
          continue;
        }
      }
    }

    // Check if duplicate of already included bullet
    const isDuplicate = seenNormFacts.some(seen => {
      if (seen === normFact) return true;
      const seenWords = seen.split(' ').filter(w => w.length > 3);
      const curWords = normFact.split(' ').filter(w => w.length > 3);
      if (seenWords.length === 0 || curWords.length === 0) return false;
      const matches = curWords.filter(w => seenWords.includes(w)).length;
      return matches / Math.min(seenWords.length, curWords.length) >= 0.75;
    });

    if (!isDuplicate) {
      seenNormFacts.push(normFact);
      cleanFacts.push(fact);
    }
  }

  // If deduplication removed everything, preserve the first fact to avoid empty list
  if (cleanFacts.length === 0 && facts.length > 0) {
    const first = typeof facts[0] === 'string' ? facts[0] : facts[0]?.fact;
    if (first) cleanFacts.push(first);
  }

  return cleanFacts;
}

/**
 * Returns truthful metrics label based on verification status.
 * Never claims "Verified" unless independently verified in metadata.
 * 
 * @param {string} lang 
 * @param {boolean} isVerified 
 * @returns {string}
 */
export function getTruthfulMetricsLabel(lang = 'English', isVerified = false) {
  if (isVerified) {
    if (lang === 'Hindi') return '📊 सत्यापित प्रमुख आंकड़े:';
    if (lang === 'Marathi') return '📊 पडताळणी केलेली प्रमुख आकडेवारी:';
    return '📊 Verified Key Metrics:';
  }

  if (lang === 'Hindi') return '📊 स्रोत से प्राप्त प्रमुख आंकड़े:';
  if (lang === 'Marathi') return '📊 स्रोतातील प्रमुख आकडेवारी:';
  return '📊 Key figures from the source:';
}

/**
 * Removes duplicate or repetitive headings communicating the same information.
 * E.g., removes "Key Development" followed by "Strategic Update".
 * Normalizes punctuation, whitespace, emoji prefixes, and capitalization when comparing.
 * 
 * @param {string} text 
 * @returns {string}
 */
export function removeRepetitiveHeadings(text) {
  if (!text || typeof text !== 'string') return text || '';

  const paragraphs = text.split('\n\n').map(p => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) return text;

  const isHeadingLike = (p) => {
    if (p.length > 200) return false;
    return /^(?:[📌🚨📢ℹ️⚠️]\s*)?(?:Key Development|Strategic Update|Crucial Update|Important Update|Public Advisory|Weather Alert|महत्वपूर्ण अपडेट|महत्वपूर्ण सूचना|महत्त्वाची माहिती)[:|]/i.test(p) ||
           /^(?:🚨|📌|📢)\s*(?:Strategic Update|Key Development|Weather Advisory|Public Safety)/i.test(p);
  };

  // If both paragraph 0 and paragraph 1 are headings communicating redundant title info
  if (isHeadingLike(paragraphs[0]) && isHeadingLike(paragraphs[1])) {
    paragraphs.splice(1, 1);
  }

  // Also check if paragraph 1 is a duplicate of paragraph 0 after normalization
  if (paragraphs.length >= 2) {
    const norm0 = normalizeTextForComparison(paragraphs[0]);
    const norm1 = normalizeTextForComparison(paragraphs[1]);
    if (norm0 && norm1 && (norm0 === norm1 || norm0.includes(norm1) || norm1.includes(norm0))) {
      // If paragraph 1 repeats paragraph 0 almost word for word
      if (Math.min(norm0.length, norm1.length) / Math.max(norm0.length, norm1.length) > 0.6) {
        paragraphs.splice(1, 1);
      }
    }
  }

  const cleaned = paragraphs.map(p => {
    return p
      .replace(/(?:📌\s*Key Development:[^\n]+)\s*\n+\s*(?:🚨\s*Strategic Update[^\n]+)/gi, (m) => m.split('\n')[0])
      .replace(/(?:🚨\s*Strategic Update:[^\n]+)\s*\n+\s*(?:📌\s*Key Development[^\n]+)/gi, (m) => m.split('\n')[0]);
  });

  return cleaned.join('\n\n');
}

/**
 * Sanitizes LinkedIn content for emergency content by removing generic engagement questions
 * and enforcing concise safety instructions, truthful verification labels, and quality hashtags.
 * 
 * @param {string} content 
 * @param {object} options
 * @returns {string}
 */
export function sanitizeLinkedInPost(content, options = {}) {
  if (!content || typeof content !== 'string') return content || '';

  const {
    isEmergency = false,
    lang = 'English',
    mainTopic = '',
    helpline = null,
    analysis = {},
    rawText = '',
    isVerified = false
  } = options;

  let text = removeRepetitiveHeadings(content);

  // 1. Truthful verification labels: Replace unverified "Verified" metrics claims
  if (!isVerified) {
    text = text
      .replace(/📊\s*Verified Key Metrics:/gi, '📊 Key figures from the source:')
      .replace(/Verified Key Metrics:/gi, 'Key figures from the source:')
      .replace(/📊\s*सत्यापित प्रमुख आंकड़े:/gi, '📊 स्रोत से प्राप्त प्रमुख आंकड़े:')
      .replace(/📊\s*पडताळणी केलेली प्रमुख आकडेवारी:/gi, '📊 स्रोतातील प्रमुख आकडेवारी:');
  }

  if (isEmergency) {
    // 2. Remove generic engagement questions
    const genericQuestionRegex = /(?:What are your thoughts on this\??\s*How is your organization addressing this\??\s*Join the conversation below\.?|What are your thoughts on this\??|How is your organization addressing this\??|Join the conversation below\.?|Share your (?:thoughts|opinions|perspectives) in the comments\.?|Let us know what you think\.?|इस महत्वपूर्ण विषय पर अपनी राय साझा करें और प्रतिक्रिया दें[।.]?|इस महत्वपूर्ण विषय पर अपनी राय साझा करें[^।\n]*[।.]?|या महत्त्वाच्या विषयावर आपले मत खाली नक्की नोंदवा[.]?)/gi;

    let emergencyDirective = '';
    if (lang === 'Hindi') {
      emergencyDirective = `⚠️ आपातकालीन सुरक्षा निर्देश: कृपया स्थानीय प्रशासन के सुरक्षा निर्देशों का कड़ाई से पालन करें, सुरक्षित स्थानों पर रहें और आधिकारिक सूचना माध्यमों पर नज़र रखें।${helpline ? ` आपातकालीन सहायता हेतु राष्ट्रीय हेल्पलाइन ${helpline} से संपर्क करें।` : ''}`;
    } else if (lang === 'Marathi') {
      emergencyDirective = `⚠️ तातडीची सुरक्षा सूचना: कृपया स्थानिक प्रशासनाच्या सुरक्षा नियमांचे काटेकोर पालन करा, धोकादायक भागांपासून दूर राहा आणि अधिकृत माध्यमांकडे लक्ष ठेवा.${helpline ? ` मदतीसाठी आपत्कालीन हेल्पलाइन ${helpline} शी संपर्क साधा.` : ''}`;
    } else {
      emergencyDirective = `⚠️ Urgent Public Safety Directive: Adhere strictly to local administration instructions, avoid vulnerable areas, and follow official advisories.${helpline ? ` For emergency assistance, contact Helpline ${helpline}.` : ' Stay tuned to authorized emergency channels.'}`;
    }

    if (genericQuestionRegex.test(text)) {
      text = text.replace(genericQuestionRegex, emergencyDirective);
    }

    // 3. Remove corporate jargon from emergency notices
    const corporatePhrases = [
      /Please ensure relevant teams and community stakeholders review these parameters immediately\.\s*Follow official protocol\./gi,
      /Please ensure relevant teams and community stakeholders review these parameters immediately\./gi,
      /relevant teams and community stakeholders/gi,
      /operational excellence/gi,
      /cross-departmental coordination/gi,
      /operational readiness protocols/gi
    ];
    for (const cRegex of corporatePhrases) {
      if (cRegex.test(text)) {
        text = text.replace(cRegex, emergencyDirective);
      }
    }

    // 4. Strip corporate hashtags (#Leadership, #OperationalExcellence, etc.) from emergency notices
    text = text
      .replace(/#(?:Leadership|OperationalExcellence|BusinessGrowth|Corporate|Marketing|Sales)\b/gi, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    // 5. Normalize hashtags: strip tags > 25 chars and ensure 3-5 readable tags
    const paragraphs = text.split('\n\n');
    const lastParagraphIndex = paragraphs.length - 1;
    const lastParagraph = paragraphs[lastParagraphIndex] || '';

    if (lastParagraph.includes('#')) {
      const existingTags = lastParagraph.match(/#[^\s#]+/g) || [];
      const validTags = existingTags.filter(t => t.length <= 25 && t.length >= 3 && !/leadership|operationalexcellence/i.test(t));

      if (validTags.length < 3 || existingTags.some(t => t.length > 25 || /leadership|operationalexcellence/i.test(t))) {
        const readableTags = generateReadableHashtags({ isEmergency: true, mainTopic, analysis, lang, rawText });
        paragraphs[lastParagraphIndex] = readableTags.join(' ');
        text = paragraphs.join('\n\n');
      }
    }
  }

  return text;
}

/**
 * Builds the complete structured LinkedIn output item conforming strictly to Module 4 contract.
 * 
 * @param {object} params
 * @returns {object}
 */
export function buildLinkedInPost({
  mainTopic = 'Important Update',
  summary = '',
  keyFacts = [],
  audience = 'General Public',
  tone = 'Informative',
  lang = 'English',
  mod3Map = {},
  sourceId = 'src-1',
  analysis = {},
  dates = [],
  numbers = [],
  urgency = 'low',
  rawText = ''
} = {}) {
  const isHindi = lang === 'Hindi';
  const isMarathi = lang === 'Marathi';

  const isEmergency = isEmergencyContent({
    analysis,
    config: { tone, targetAudience: audience, language: lang },
    sourceContent: { rawText },
    mainTopic,
    summary
  });

  const isVerified = Boolean(
    (analysis?.verification?.isIndependentlyVerified || analysis?.verification?.isVerified) &&
    analysis?.verification?.verificationEvidence
  ) || Boolean(
    analysis?.claims?.some(c => c.isIndependentlyVerified && (c.verificationEvidence || c.evidence))
  );

  const helpline = extractHelpline(rawText, keyFacts, numbers);

  // 1. Single Relevant Title (Hook) - strictly avoid dual headings
  let hook = '';
  if (isEmergency) {
    if (isHindi) {
      hook = /चेतावनी|अलर्ट|परामर्श/i.test(mainTopic)
        ? `🚨 ${mainTopic}`
        : `🚨 मौसम चेतावनी एवं जन सुरक्षा परामर्श: ${mainTopic}`;
    } else if (isMarathi) {
      hook = /इशारा|अलर्ट|सूचना/i.test(mainTopic)
        ? `🚨 ${mainTopic}`
        : `🚨 हवामान इशारा व सार्वजनिक सुरक्षा सूचना: ${mainTopic}`;
    } else {
      hook = /alert|warning|advisory/i.test(mainTopic)
        ? `🚨 ${mainTopic}`
        : `🚨 Public Safety Advisory: ${mainTopic}`;
    }
  } else {
    if (isHindi) {
      hook = `📌 महत्वपूर्ण अपडेट: ${mainTopic}`;
    } else if (isMarathi) {
      hook = `📌 महत्त्वाची माहिती: ${mainTopic}`;
    } else {
      hook = `📌 Professional Briefing: ${mainTopic}`;
    }
  }

  // 2. Short Introduction - extract actual substantive summary, deduplicate against headline
  let intro = summary;
  const mod3LinkedIn = mod3Map['linkedin'];
  if (mod3LinkedIn && typeof mod3LinkedIn.text === 'string' && mod3LinkedIn.text.length > 20) {
    const paragraphs = mod3LinkedIn.text.split('\n\n').map(p => p.trim()).filter(Boolean);
    // Find substantive summary paragraph (skip any opening hook lines)
    const substantive = paragraphs.find(p => 
      !/^(?:🚨|📌|📢)?\s*(?:Strategic Update|Key Development|महत्वपूर्ण सूचना|महत्त्वाची माहिती)/i.test(p) &&
      !p.startsWith(hook)
    );
    if (substantive && substantive.length > 25) {
      intro = substantive;
    }
  }

  // Deduplicate intro against headline
  const cleanIntro = deduplicateHeadlineAndIntro(hook, intro, summary || rawText);

  // 3. Scannable Bullet Points Header
  let keyFactsHeader = '';
  if (isEmergency) {
    if (isHindi) {
      keyFactsHeader = isVerified ? 'सत्यापित सुरक्षा निर्देश एवं मुख्य जानकारी:' : 'सुरक्षा निर्देश एवं मुख्य जानकारी:';
    } else if (isMarathi) {
      keyFactsHeader = isVerified ? 'सत्यापित सुरक्षा सूचना व महत्त्वाची माहिती:' : 'सुरक्षा सूचना व महत्त्वाची माहिती:';
    } else {
      keyFactsHeader = isVerified ? 'Verified Safety Directives & Critical Updates:' : 'Key Safety Directives & Critical Updates:';
    }
  } else {
    if (isHindi) {
      keyFactsHeader = 'मुख्य महत्वपूर्ण बिंदु:';
    } else if (isMarathi) {
      keyFactsHeader = 'प्रमुख ठळक मुद्दे:';
    } else {
      keyFactsHeader = 'Key highlights to know:';
    }
  }

  // 4. Scannable Bullet Points (Deduplicated against intro and numbers)
  const cleanFacts = deduplicateFacts(keyFacts, cleanIntro, numbers, dates);
  const bullets = cleanFacts.slice(0, 4).map(f => `• ${f}`).join('\n');

  // 5. Numbers / Metrics line with truthful labeling
  let metricsSection = '';
  if (Array.isArray(numbers) && numbers.length > 0) {
    const metricsLabel = getTruthfulMetricsLabel(lang, isVerified);
    metricsSection = `${metricsLabel} ${numbers.slice(0, 3).map(n => `${n.label}: ${n.value}`).join(' | ')}`;
  }

  // 6. Call-to-Action (Action directive for emergency, discussion for non-emergency)
  let cta = '';
  if (isEmergency) {
    if (isHindi) {
      cta = `⚠️ आपातकालीन सुरक्षा निर्देश: कृपया स्थानीय प्रशासन के सुरक्षा निर्देशों का कड़ाई से पालन करें, सुरक्षित स्थानों पर रहें और आधिकारिक सूचना माध्यमों पर नज़र रखें।${helpline ? ` आपातकालीन सहायता हेतु राष्ट्रीय हेल्पलाइन ${helpline} से संपर्क करें।` : ''}`;
    } else if (isMarathi) {
      cta = `⚠️ तातडीची सुरक्षा सूचना: कृपया स्थानिक प्रशासनाच्या सुरक्षा नियमांचे काटेकोर पालन करा, धोकादायक भागांपासून दूर राहा आणि अधिकृत माध्यमांकडे लक्ष ठेवा.${helpline ? ` मदतीसाठी आपत्कालीन हेल्पलाइन ${helpline} शी संपर्क साधा.` : ''}`;
    } else {
      cta = `⚠️ Urgent Public Safety Directive: Adhere strictly to local administration instructions, avoid vulnerable areas, and follow official advisories.${helpline ? ` For emergency assistance, contact Helpline ${helpline}.` : ' Stay tuned to authorized emergency channels.'}`;
    }
  } else {
    if (isHindi) {
      cta = 'इस महत्वपूर्ण विषय पर अपने विचार और संगठनात्मक अनुभव नीचे साझा करें।';
    } else if (isMarathi) {
      cta = 'या महत्त्वाच्या विषयावर आपले विचार आणि अनुभव खाली नक्की नोंदवा.';
    } else {
      cta = 'What strategies is your organization adopting to navigate these developments? Join the professional discussion below.';
    }
  }

  // 7. 3 to 5 Readable, Relevant Hashtags
  const tagsArray = generateReadableHashtags({
    isEmergency,
    mainTopic,
    analysis,
    lang,
    rawText
  });
  const tagsStr = tagsArray.join(' ');

  // Assemble full text
  const bodyParts = [
    hook,
    cleanIntro,
    bullets ? `${keyFactsHeader}\n${bullets}` : null,
    metricsSection || null,
    cta,
    tagsStr
  ].filter(Boolean);

  const rawContent = bodyParts.join('\n\n');
  const content = sanitizeLinkedInPost(rawContent, {
    isEmergency,
    lang,
    mainTopic,
    helpline,
    analysis,
    rawText,
    isVerified
  });

  const cardTitle = isEmergency
    ? (isHindi ? 'सार्वजनिक सुरक्षा सूचना' : isMarathi ? 'सार्वजनिक सुरक्षा सूचना' : 'Emergency & Public Safety Advisory')
    : 'LinkedIn Professional Post';

  return {
    title: cardTitle,
    content,
    structuredData: {
      hook,
      intro: cleanIntro,
      keyPoints: cleanFacts.slice(0, 4),
      cta,
      hashtags: tagsArray,
      isEmergency,
      isVerified,
      audience,
      tone,
      language: lang
    },
    traceability: cleanFacts.slice(0, 4).map(f => ({
      fact: f,
      sourceId,
      origin: 'analysis.keyFacts'
    }))
  };
}
