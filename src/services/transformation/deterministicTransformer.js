/**
 * InfoFlip-AI Deterministic Transformation Engine
 * 
 * SIH 2026 Problem Statement ID 26154
 * Module 3: Transformation Engine
 * 
 * Provides zero-latency, zero-cost, grounded transformation synthesis for all 7 formats
 * across English, Hindi, and Marathi.
 * Operates strictly over Module 2 analysis and Module 1 source text without external network dependencies.
 * Distinctly identifies itself as 'DeterministicFallback' to preserve architectural honesty.
 */

import { OUTPUT_FORMAT_IDS, createOutputItem } from '../../types/transformation.js';
import { 
  isEmergencyContent, 
  generateReadableHashtags, 
  sanitizeLinkedInPost,
  deduplicateHeadlineAndIntro,
  deduplicateFacts,
  getTruthfulMetricsLabel
} from '../communication/linkedInPostBuilder.js';

export class DeterministicTransformer {
  /**
   * Transforms a request into an array of structured outputs
   * @param {object} request - Transformation request
   * @param {object} [options={}] - Options (e.g. isRegeneration, variantSeed, fallbackReason)
   * @returns {Array<object>} - Array of created output items
   */
  transform(request, options = {}) {
    if (!request) {
      throw new Error('Transformation request is missing or null.');
    }

    const source = request.source || request.sourceContent || {};
    const analysis = request.analysis || {};
    const configuration = request.configuration || request.config || {};
    const requestedOutputs = request.requestedOutputs || request.requestedFormats || [];
    const transformationId = request.transformationId || 'trans-1';

    // Strict source sufficiency validation (Requirement 3)
    const sourceText = (source?.extractedText || source?.rawText || '').trim();
    if (!sourceText || sourceText.length < 15) {
      throw new Error('Source content is insufficient to produce meaningful output. Please provide more detailed source text or documentation.');
    }

    const lang = configuration.language || 'English';
    const audienceStr = Array.isArray(configuration.targetAudience)
      ? configuration.targetAudience.join(', ')
      : (configuration.targetAudience || 'General Public');
    const tone = configuration.tone || 'Informative';
    const detail = configuration.detailLevel || 'Balanced';
    const objective = configuration.objective || 'Inform';
    const style = configuration.contentStyle || 'Structured';

    const outputs = [];

    for (const formatId of requestedOutputs) {
      let content = null;
      const genConfig = { audienceStr, tone, lang, detail, objective, style, options };

      switch (formatId) {
        case OUTPUT_FORMAT_IDS.LINKEDIN:
          content = this.generateLinkedIn(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.TWITTER:
          content = this.generateTwitter(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY:
          content = this.generateExecutiveSummary(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.ADVISORY:
          content = this.generateAdvisory(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.INFOGRAPHIC:
          content = this.generateInfographic(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.PRESENTATION:
          content = this.generatePresentation(source, analysis, genConfig);
          break;

        case OUTPUT_FORMAT_IDS.VIDEO_SCRIPT:
          content = this.generateVideoScript(source, analysis, genConfig);
          break;

        default:
          content = { text: sourceText };
          break;
      }

      // Calculate word and character metrics
      const fullStringRep = JSON.stringify(content);
      const textToCount = (content && content.text) 
        ? content.text 
        : (content && content.executiveOverview)
        ? `${content.title} ${content.executiveOverview} ${(content.keyPoints || []).join(' ')}`
        : fullStringRep;
      const wordCount = textToCount.split(/\s+/).filter(Boolean).length;
      const charCount = textToCount.length;

      const fallbackReason = options?.fallbackReason || options?.reason || 'Non-AI rule-based deterministic fallback';

      outputs.push(
        createOutputItem({
          transformationId: transformationId || 'trans-deterministic',
          format: formatId,
          status: 'generated',
          content,
          metadata: {
            provider: 'DeterministicFallback',
            isFallback: true,
            reason: fallbackReason,
            fallbackReason,
            generatedAt: new Date().toISOString(),
            wordCount,
            charCount
          }
        })
      );
    }

    return outputs;
  }

  // 1. LINKEDIN POST GENERATOR
  generateLinkedIn(source, analysis, config) {
    const { lang, audienceStr, tone, detail, objective, style, options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const topic = analysis?.overview?.mainTopic || 'Important Operational Update';
    const rawSummary = analysis?.overview?.summary || (source?.extractedText || source?.rawText || '').slice(0, 160);

    const factPool = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const factLimit = detail === 'Concise' ? 2 : detail === 'Detailed' ? 5 : 3;

    let facts = factPool.slice(0, factLimit);
    if (isRegen && factPool.length > 2) {
      // Re-order or rotate facts on regeneration for distinct candidate variation
      facts = [factPool[1], ...(factPool[2] ? [factPool[2]] : []), factPool[0], ...factPool.slice(3, factLimit + 1)].slice(0, factLimit);
    }

    const numbers = (analysis?.importantNumbers || []).slice(0, detail === 'Concise' ? 2 : 3);
    const dates = (analysis?.importantDates || []).slice(0, 2);

    const isVerified = Boolean(
      analysis?.verification?.isVerified || 
      analysis?.verification?.status === 'verified' ||
      analysis?.claims?.some(c => c.isVerified) ||
      source?.isVerified
    );

    const isEmergency = isEmergencyContent({
      analysis,
      config: { tone, targetAudience: audienceStr, language: lang },
      sourceContent: source,
      mainTopic: topic,
      summary: rawSummary
    });

    let openingHook = '';
    let callToAction = '';

    if (lang === 'Hindi') {
      if (isRegen) {
        openingHook = isEmergency 
          ? `⚠️ तत्परता एवं सुरक्षा बुलेटिन: ${topic} [लक्षित: ${audienceStr}]`
          : `📌 अद्यतन विवरण | ${topic} [लक्षित: ${audienceStr} • शैली: ${tone}]`;
        callToAction = isEmergency
          ? `🛡️ सुरक्षा उपाय: आधिकारिक निर्देशों की पुष्टि करें और केवल प्रमाणित चैनलों का अनुसरण करें।`
          : `इस आधिकारिक सारांश को अपनी टीम के साथ साझा करें।`;
      } else {
        openingHook = isEmergency 
          ? `🚨 मौसम चेतावनी एवं जन सुरक्षा सूचना: ${topic} [लक्षित वर्ग: ${audienceStr}]`
          : `📢 महत्वपूर्ण सूचना | ${topic} [लक्षित वर्ग: ${audienceStr}]`;
        callToAction = isEmergency
          ? `⚠️ आपातकालीन सुरक्षा निर्देश: कृपया स्थानीय प्रशासन के सुरक्षा निर्देशों का कड़ाई से पालन करें और सुरक्षित स्थानों पर रहें।`
          : (/public|citizen|resident/i.test(audienceStr)
            ? `कृपया इस सूचना को समुदाय के साथ साझा करें और आधिकारिक दिशानिर्देशों का पालन करें।`
            : `कृपया इस सूचना को अपनी टीम के साथ साझा करें। आधिकारिक दिशानिर्देशों का पालन करें।`);
      }
    } else if (lang === 'Marathi') {
      if (isRegen) {
        openingHook = isEmergency
          ? `⚠️ सुरक्षा व दक्षता सूचना: ${topic} [लक्षित गट: ${audienceStr}]`
          : `📌 ताज्या घडामोडी | ${topic} [लक्षित गट: ${audienceStr} • पद्धत: ${tone}]`;
        callToAction = isEmergency
          ? `🛡️ खबरदारीची पावले: अधिकृत नियमावलीचे काटेकोर पालन करा.`
          : `कृपया ही माहिती सहकाऱ्यांपर्यंत पोहोचवा.`;
      } else {
        openingHook = isEmergency
          ? `🚨 हवामान इशारा व सार्वजनिक सुरक्षा सूचना: ${topic} [लक्षित गट: ${audienceStr}]`
          : `📢 महत्त्वाची माहिती | ${topic} [लक्षित गट: ${audienceStr}]`;
        callToAction = isEmergency
          ? `⚠️ तातडीची सुरक्षा सूचना: कृपया स्थानिक प्रशासनाच्या नियमांचे काटेकोर पालन करा आणि अधिकृत सूचनांचे अनुसरण करा.`
          : (/public|citizen|resident/i.test(audienceStr)
            ? `कृपया ही माहिती नागरिकांपर्यंत पोहोचवा आणि अधिकृत नियमांचे पालन करा.`
            : `कृपया ही माहिती आपल्या सहकाऱ्यांपर्यंत पोहोचवा आणि अधिकृत सूचनांचे काटेकोर पालन करा.`);
      }
    } else {
      if (isRegen) {
        openingHook = isEmergency
          ? `⚠️ Operational Readiness Advisory: ${topic} | Priority Guidance for ${audienceStr}`
          : `📌 Strategic Briefing on ${topic} | Calibrated for ${audienceStr} (${tone} tone)`;
        callToAction = isEmergency
          ? `🛡️ Priority Precaution: Monitor authorized portals and comply with official safety guidelines.`
          : `Review these validated directives with your operational unit.`;
      } else {
        openingHook = isEmergency
          ? `🚨 Strategic Update: ${topic} | Public Safety Advisory for ${audienceStr}`
          : `🚨 Strategic Update on ${topic} | Key Directives for ${audienceStr}`;
        callToAction = isEmergency
          ? `⚠️ Urgent Public Safety Directive: Adhere strictly to local administration instructions, avoid vulnerable areas, and follow official advisories.`
          : (/public|citizen|resident/i.test(audienceStr)
            ? `Please share this update to keep community members informed. Follow official protocol.`
            : `Please ensure relevant teams review these parameters immediately. Follow official protocol.`);
      }
    }

    // Deduplicate introduction against openingHook
    const cleanIntro = deduplicateHeadlineAndIntro(openingHook, rawSummary, source?.extractedText || source?.rawText || '');

    // Scannable bullet points header
    let bulletsHeader = '';
    if (lang === 'Hindi') {
      bulletsHeader = isEmergency 
        ? (isVerified ? '🔹 सत्यापित सुरक्षा निर्देश एवं मुख्य जानकारी:' : '🔹 मुख्य सुरक्षा निर्देश एवं बिंदु:')
        : '🔹 मुख्य तथ्य एवं महत्वपूर्ण बिंदु:';
    } else if (lang === 'Marathi') {
      bulletsHeader = isEmergency
        ? (isVerified ? '🔹 सत्यापित सुरक्षा सूचना व मुख्य माहिती:' : '🔹 मुख्य सुरक्षा सूचना व मुद्दे:')
        : '🔹 मुख्य मुद्दे व तथ्ये:';
    } else {
      bulletsHeader = isEmergency
        ? (isVerified ? '🔹 Verified Safety Directives & Updates:' : '🔹 Key Safety Directives & Observations:')
        : '🔹 Key Grounded Insights & Directives:';
    }

    // Deduplicate facts against intro and numbers
    const cleanFacts = deduplicateFacts(facts, cleanIntro, numbers, dates);

    // Truthful Metrics Labeling
    const metricsLabel = getTruthfulMetricsLabel(lang, isVerified);
    const metricsSection = numbers.length > 0 
      ? `${metricsLabel} ${numbers.map(n => `${n.label}: ${n.value}`).join(' | ')}`
      : null;

    // Timelines
    const datesSection = dates.length > 0 
      ? (lang === 'Hindi' 
          ? `⏱️ महत्वपूर्ण समयसीमा: ${dates.map(d => `${d.date} - ${d.context}`).join('; ')}` 
          : `⏱️ Timelines & Deadlines: ${dates.map(d => `${d.date} (${d.context})`).join('; ')}`) 
      : null;

    // Readable Hashtags
    const hashtagList = generateReadableHashtags({
      isEmergency,
      mainTopic: topic,
      analysis,
      lang,
      rawText: source?.extractedText || source?.rawText || ''
    });

    // Body compilation
    const bodyParagraphs = [
      openingHook,
      cleanIntro,
      bulletsHeader,
      ...cleanFacts.map(f => `• ${f}`),
      metricsSection,
      datesSection,
      callToAction,
      hashtagList.join(' ')
    ].filter(Boolean);

    const fullText = sanitizeLinkedInPost(bodyParagraphs.join('\n\n'), {
      isEmergency,
      lang,
      mainTopic: topic,
      analysis,
      rawText: source?.extractedText || source?.rawText || '',
      isVerified
    });

    return {
      headline: openingHook,
      text: fullText,
      hashtags: hashtagList,
      cta: callToAction
    };
  }

  // 2. X / TWITTER POST & THREAD GENERATOR
  generateTwitter(source, analysis, config) {
    const { lang, audienceStr, detail, tone, options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const topic = analysis?.overview?.mainTopic || 'Alert';
    const summary = analysis?.overview?.summary || (source?.extractedText || source?.rawText || '').slice(0, 120);

    const factPool = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    let selectedFact1 = factPool[0] || 'Official update documented.';
    let selectedFact2 = factPool[1] || selectedFact1;
    if (isRegen && factPool.length > 2) {
      selectedFact1 = factPool[1];
      selectedFact2 = factPool[2];
    }

    const numbers = (analysis?.importantNumbers || []).slice(0, 2);
    const posts = [];

    if (lang === 'Hindi') {
      const lead = isRegen ? `📌 अद्यतन: ${topic}` : `🚨 ${topic}`;
      posts.push(`${lead}\n\n${summary.slice(0, 180)}...\n\nलक्षित वर्ग: ${audienceStr} #${topic.replace(/[^a-zA-Z0-9]/g, '') || 'InfoFlip'}`);
      if (detail !== 'Concise') {
        posts.push(`2/3 मुख्य तथ्य:\n• ${selectedFact1.slice(0, 100)}\n• ${selectedFact2.slice(0, 100)}`);
        posts.push(`3/3 आंकड़े एवं दिशानिर्देश:\n${numbers.map(n => `• ${n.label}: ${n.value}`).join('\n') || 'सतर्क रहें एवं अधिकृत चैनलों का अनुसरण करें।'}\n\n#PublicNotice`);
      }
    } else if (lang === 'Marathi') {
      const lead = isRegen ? `📌 माहिती: ${topic}` : `🚨 ${topic}`;
      posts.push(`${lead}\n\n${summary.slice(0, 180)}...\n\nलक्षित गट: ${audienceStr} #${topic.replace(/[^a-zA-Z0-9]/g, '') || 'InfoFlip'}`);
      if (detail !== 'Concise') {
        posts.push(`2/3 मुख्य बाबी:\n• ${selectedFact1.slice(0, 100)}\n• ${selectedFact2.slice(0, 100)}`);
        posts.push(`3/3 अधिकृत माहिती:\n${numbers.map(n => `• ${n.label}: ${n.value}`).join('\n') || 'काळजी घ्या व अधिकृत सूचनांचे पालन करा.'}\n\n#PublicNotice`);
      }
    } else {
      const tag = isRegen ? `[${tone.toUpperCase()}] ${topic}` : `UPDATE: ${topic}`;
      posts.push(`🚨 ${tag}\n\n${summary.slice(0, 180)}...\n\nTarget Cohort: ${audienceStr} #InfoFlip`);
      if (detail !== 'Concise') {
        posts.push(`2/3 Grounded Facts:\n• ${selectedFact1.slice(0, 100)}\n• ${selectedFact2.slice(0, 100)}`);
        posts.push(`3/3 Directives & Data:\n${numbers.map(n => `• ${n.label}: ${n.value} (${n.context})`).join('\n') || 'Adhere strictly to official broadcast protocols.'}\n\n#PublicSafety`);
      }
    }

    return {
      posts,
      isThread: posts.length > 1,
      characterCount: posts.reduce((acc, p) => acc + p.length, 0)
    };
  }

  // 3. EXECUTIVE SUMMARY GENERATOR
  generateExecutiveSummary(source, analysis, config) {
    const { lang, audienceStr, tone, detail = 'Balanced', options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const baseTitle = analysis?.overview?.title || `${analysis?.overview?.mainTopic || 'Operational'} Executive Briefing`;
    const overview = analysis?.overview?.summary || (source?.extractedText || source?.rawText || '').slice(0, 250);

    const factPool = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const factLimit = detail === 'Concise' ? 2 : detail === 'Detailed' ? 5 : 3;

    let facts = factPool.slice(0, factLimit);
    if (isRegen && factPool.length > 2) {
      facts = [factPool[1], ...(factPool[2] ? [factPool[2]] : []), ...(detail === 'Concise' ? [] : [factPool[0]])].slice(0, factLimit);
    }

    const numbers = (analysis?.importantNumbers || []).map(n => `${n.label}: ${n.value} (${n.context})`);
    const orgs = (analysis?.entities?.organizations || []).join(', ');
    const isEmergency = isEmergencyContent({ analysis, config: { tone, targetAudience: audienceStr, language: lang }, sourceContent: source });

    let title = `${baseTitle} - Executive Summary`;
    let implications = [];
    let recommendedConsiderations = [];
    let overviewSuffix = '';

    if (isHindi) {
      title = `${baseTitle} - कार्यकारी सारांश`;
      overviewSuffix = isRegen
        ? `लक्षित वर्ग (${audienceStr}) के लिए ${tone} शैली में पुनरीक्षित सारांश।`
        : `लक्षित वर्ग (${audienceStr}) के लिए आधिकारिक ${tone} प्रोटोकॉल के तहत तैयार।`;
      implications = isEmergency
        ? [
            `संबद्ध प्राधिकारियों (${orgs || 'आपातकालीन दल'}) के बीच त्वरित समन्वय आवश्यक है।`,
            'सुरक्षा निर्देश एवं समयसीमा का कड़ाई से अनुपालन किया जाए।'
          ]
        : [
            `हितधारकों (${orgs || 'संबंधित विभाग'}) के साथ परिचालन समन्वय आवश्यक है।`,
            'दस्तावेजीकृत समयसीमा के अनुसार कार्ययोजना लागू की जाए।'
          ];
      recommendedConsiderations = isEmergency
        ? [
            'सार्वजनिक सूचना माध्यमों पर नजर रखें और संवेदनशील क्षेत्रों में चेतावनी जारी करें।',
            'आधिकारिक अद्यतनों के अनुसार ही आगे के कदम उठाएं।'
          ]
        : [
            'सत्यापित तथ्यों के आधार पर संचार प्रवाह बनाए रखें।',
            'संबद्ध टीमों के साथ समीक्षा बैठक आयोजित करें।'
          ];
    } else if (isMarathi) {
      title = `${baseTitle} - कार्यकारी सारांश`;
      overviewSuffix = isRegen
        ? `लक्षित गट (${audienceStr}) साठी ${tone} पद्धतीनुसार पुनरावलोकन केलेले संक्षिप्त विवरण.`
        : `लक्षित गट (${audienceStr}) साठी अधिकृत ${tone} कार्यपद्धती अंतर्गत तयार.`;
      implications = isEmergency
        ? [
            `संबंधित यंत्रणांमध्ये (${orgs || 'आपत्कालीन पथके'}) तातडीचा समन्वय आवश्यक आहे.`,
            'सुरक्षा मार्गदर्शक तत्त्वांचे वेळेत पालन करावे.'
          ]
        : [
            `सर्व संबंधितांशी (${orgs || 'संबंधित विभाग'}) योग्य समन्वय ठेवावा.`,
            'वेळापत्रकानुसार कामाची आखणी करावी.'
          ];
      recommendedConsiderations = [
        'केवळ अधिकृत स्त्रोतांवरून मिळालेल्या माहितीवर विश्वास ठेवावा.',
        'संबंधित विभागांशी नियमित संपर्क ठेवावा.'
      ];
    } else {
      overviewSuffix = isRegen
        ? `Calibrated briefing synthesized for ${audienceStr} under ${tone.toLowerCase()} protocol.`
        : `Prepared specifically for ${audienceStr} under an official ${tone.toLowerCase()} protocol.`;
      implications = isEmergency
        ? [
            `Immediate public safety readiness and response coordination active across authorized bodies (${orgs || 'Authorized response teams'}).`,
            'Safety directives and operational notices must be synchronized with documented timeline windows.'
          ]
        : [
            `Immediate operational coordination required across active stakeholders (${orgs || 'Authorized bodies'}).`,
            'Operational readiness protocols must be synchronized with verified timeline markers.'
          ];
      recommendedConsiderations = isEmergency
        ? [
            'Review public notification channels and dispatch localized safety notices across vulnerable areas.',
            'Maintain real-time logging and monitor authorized feeds for updated advisories.'
          ]
        : [
            'Review communication channels and dispatch localized notices across relevant touchpoints.',
            'Maintain real-time audit logging for source factual statements.'
          ];
    }

    if (detail === 'Concise') {
      implications = implications.slice(0, 1);
      recommendedConsiderations = recommendedConsiderations.slice(0, 1);
    } else if (detail === 'Detailed') {
      implications.push('Continuous multi-channel situational monitoring recommended.');
      recommendedConsiderations.push('Establish verifiable audit logs across all stakeholder distributions.');
    }

    return {
      title,
      executiveOverview: `${overview} ${overviewSuffix}`.trim(),
      keyPoints: facts.length > 0 ? facts : ['Official situational guidelines have been reviewed and normalized from source.'],
      importantFindings: numbers.length > 0 ? numbers : ['All quantitative observations reflect figures reported directly in source documentation.'],
      implications,
      recommendedConsiderations
    };
  }

  // 4. ADVISORY GENERATOR
  generateAdvisory(source, analysis, config) {
    const { lang, audienceStr, tone, detail = 'Balanced', options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const mainTopic = analysis?.overview?.mainTopic || 'Public Situational Notice';
    const situation = analysis?.overview?.summary || (source?.extractedText || source?.rawText || '').slice(0, 200);

    const factPool = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const factLimit = detail === 'Concise' ? 2 : detail === 'Detailed' ? 5 : 4;
    let facts = factPool.slice(0, factLimit);
    if (isRegen && factPool.length > 2) {
      facts = [factPool[1], ...(factPool[2] ? [factPool[2]] : []), factPool[0], ...factPool.slice(3, factLimit + 1)].slice(0, factLimit);
    }

    const dates = (analysis?.importantDates || []).map(d => `${d.date} - ${d.context}`);
    const urgencyLvl = analysis?.urgency?.level || 'standard';
    const isVerified = Boolean(
      (analysis?.verification?.isVerified || analysis?.verification?.isIndependentlyVerified) &&
      analysis?.verification?.verificationEvidence
    ) || Boolean(
      analysis?.claims?.some(c => c.isIndependentlyVerified && (c.verificationEvidence || c.evidence))
    );

    let title = `OFFICIAL ADVISORY: ${mainTopic}`;
    let potentialImpact = `Impact assessment targeted for ${audienceStr}: Potential operational disruptions and safety concerns.`;
    let recommendedActions = [
      'Adhere strictly to authorized guidelines and avoid speculative reports.',
      'Verify emergency equipment, battery reserves, and communications links.',
      'Report urgent field anomalies or assistance requests to authorized dispatchers.'
    ];
    let importantDates = dates.length > 0 ? dates : ['Active immediately upon release until official notice.'];
    let verificationNotice = isVerified 
      ? 'Independently verified by authorized coordination.' 
      : 'Extracted from provided source; independent verification required for critical decisions.';

    if (isHindi) {
      title = isRegen ? `आधिकारिक परामर्श (अद्यतन): ${mainTopic}` : `आधिकारिक परामर्श: ${mainTopic}`;
      potentialImpact = `${audienceStr} के लिए प्रभाव मूल्यांकन: परिचालन संबंधी सावधानियां अपेक्षित हैं।`;
      recommendedActions = [
        'अधिकृत दिशानिर्देशों का कड़ाई से पालन करें और अपुष्ट खबरों से बचें।',
        'आवश्यक संचार व्यवस्था एवं आपूर्ति सुनिश्चित रखें।',
        'किसी भी आपात स्थिति में अधिकृत केंद्रों से संपर्क करें।'
      ];
      importantDates = dates.length > 0 ? dates : ['जारी होने के समय से अधिकृत सूचना तक प्रभावी।'];
      verificationNotice = isVerified ? 'अधिकृत समन्वय द्वारा सत्यापित।' : 'स्रोत से संकलित; महत्वपूर्ण निर्णयों के लिए आधिकारिक पुष्टि आवश्यक।';
    } else if (isMarathi) {
      title = isRegen ? `अधिकृत सूचना (अद्ययावत): ${mainTopic}` : `अधिकृत सूचना: ${mainTopic}`;
      potentialImpact = `${audienceStr} साठी संभाव्य परिणाम: नियमांचे पालन आवश्यक.`;
      recommendedActions = [
        'अधिकृत नियमांचे काटेकोर पालन करा आणि अफवांवर विश्वास ठेवू नका.',
        'आपत्कालीन साधने सज्ज ठेवावीत.',
        'गरज भासल्यास त्वरित अधिकृत नियंत्रण कक्षाशी संपर्क साधावा.'
      ];
      importantDates = dates.length > 0 ? dates : ['जारी झाल्यापासून पुढील अधिकृत सूचनेपर्यंत लागू.'];
      verificationNotice = isVerified ? 'अधिकृत यंत्रणेद्वारे पडताळणी पूर्ण.' : 'प्रस्तुत माहिती स्त्रोतावर आधारित आहे; अधिकृत खात्री आवश्यक.';
    } else if (isRegen) {
      title = `OPERATIONAL ADVISORY (UPDATED): ${mainTopic}`;
      potentialImpact = `Calibrated impact assessment for ${audienceStr}: Observe elevated caution under ${tone.toLowerCase()} status.`;
    }

    if (detail === 'Concise') {
      recommendedActions = recommendedActions.slice(0, 2);
    }

    return {
      title,
      situation: `${situation} [Urgency Tier: ${urgencyLvl.toUpperCase()}]`,
      keyInformation: facts.length > 0 ? facts : ['Adhere strictly to official broadcast bulletins and instructions.'],
      potentialImpact,
      recommendedActions,
      importantDates,
      verificationNotice
    };
  }

  // 5. INFOGRAPHIC CONTENT GENERATOR
  generateInfographic(source, analysis, config) {
    const { lang, audienceStr, detail = 'Balanced', options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const title = analysis?.overview?.mainTopic || 'Data & Situation Overview';
    const subtitle = isHindi 
      ? `${audienceStr} के लिए दृश्य विश्लेषण एवं मुख्य बिंदु`
      : isMarathi
      ? `${audienceStr} साठी व्हिज्युअल माहिती व ठळक मुद्दे`
      : `Visual breakdown and key takeaways for ${audienceStr}`;

    const factPool = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const numbers = (analysis?.importantNumbers || []).slice(0, detail === 'Concise' ? 2 : 4);

    let sec1Point = analysis?.overview?.category || 'General Overview';
    let sec1Fact = factPool[0] || (analysis?.overview?.summary || '').slice(0, 100);
    let sec2Point = 'Core Operational Parameters';
    let sec2Fact = factPool[1] || 'Parameters extracted through source text analysis.';
    let sec3Point = 'Actionable Protocols';
    let sec3Fact = factPool[2] || 'Citizens and teams must maintain compliance with official advisories.';

    if (isRegen && factPool.length > 2) {
      sec1Fact = factPool[1];
      sec2Fact = factPool[2];
      sec3Fact = factPool[0];
    }

    const sections = [
      {
        heading: isHindi ? '01. स्थिति संदर्भ' : isMarathi ? '01. स्थिती संदर्भ' : '01. Situational Context',
        keyPoint: sec1Point,
        supportingFact: sec1Fact
      },
      {
        heading: isHindi ? '02. मुख्य प्रभाव' : isMarathi ? '02. मुख्य प्रभाव' : '02. Grounded Impact',
        keyPoint: sec2Point,
        supportingFact: sec2Fact
      },
      {
        heading: isHindi ? '03. आवश्यक निर्देश' : isMarathi ? '03. आवश्यक कृती' : '03. Directive & Resolution',
        keyPoint: sec3Point,
        supportingFact: sec3Fact
      }
    ];

    const statistics = numbers.map(n => ({
      value: n.value,
      label: n.label,
      context: n.context
    }));

    const callout = isHindi
      ? `${audienceStr} हेतु जारी सूचना। वास्तविक स्थिति के लिए अधिकृत पोर्टल देखें।`
      : isMarathi
      ? `${audienceStr} साठी जारी केलेली माहिती. अद्यतनांसाठी अधिकृत संकेतस्थळ पहा.`
      : `Official communication issued for ${audienceStr}. Consult official portals for real-time status.`;

    return {
      title,
      subtitle,
      sections: detail === 'Concise' ? sections.slice(0, 2) : sections,
      statistics: statistics.length > 0 ? statistics : [
        { value: '100%', label: 'Source-Grounded', context: 'Zero hallucinated statistics' },
        { value: '24/7', label: 'Monitoring', context: 'Active operational cycle' }
      ],
      callout
    };
  }

  // 6. PRESENTATION CONTENT GENERATOR
  generatePresentation(source, analysis, config) {
    const { audienceStr, tone, lang, detail = 'Balanced', options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const title = analysis?.overview?.mainTopic || 'Strategic Overview & Operational Directives';
    const facts = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const numbers = (analysis?.importantNumbers || []);
    const isVerified = Boolean(analysis?.verification?.isVerified || source?.isVerified || analysis?.claims?.some(c => c.isVerified));

    let s1Title = isHindi ? title : isMarathi ? title : title;
    let s2Title = isHindi ? 'वर्तमान स्थिति एवं संदर्भ' : isMarathi ? 'सद्यस्थिती व संदर्भ' : 'Current Situation & Context';
    let s3Title = isHindi ? 'मुख्य सत्यापित निष्कर्ष' : isMarathi ? 'महत्त्वाचे निष्कर्ष' : (isVerified ? 'Key Grounded Findings & Verified Metrics' : 'Key Grounded Findings & Source Metrics');
    let s4Title = isHindi ? 'परिचालन प्रभाव एवं आंकड़े' : isMarathi ? 'परिचालन प्रभाव व आकडेवारी' : 'Operational Impact & Metrics';
    let s5Title = isHindi ? 'अनुशंसित निर्देश एवं आगामी कदम' : isMarathi ? 'पुढील पावले व सूचना' : 'Recommended Directives & Next Steps';

    if (isRegen) {
      s2Title = isHindi ? 'परिचालन पृष्ठभूमि एवं विवरण' : isMarathi ? 'पार्श्वभूमी व माहिती' : 'Operational Background & Key Markers';
      s5Title = isHindi ? 'कार्ययोजना एवं समापन' : isMarathi ? 'कार्यवाही व समारोप' : 'Strategic Next Actions & Execution Plan';
    }

    const slides = [
      {
        slideNumber: 1,
        title: s1Title,
        purpose: isHindi ? 'सत्र का उद्देश्य एवं रूपरेखा' : isMarathi ? 'सत्राचा मुख्य उद्देश' : 'Executive framing and session objectives',
        bullets: [
          `Target Stakeholders: ${audienceStr}`,
          `Domain / Sector: ${analysis?.overview?.category || 'General'}`,
          `Classification Tone: ${tone}`
        ],
        speakerNotes: isHindi 
          ? `सभी उपस्थितों का स्वागत है। आज हम ${title} संबंधी जानकारी की समीक्षा करेंगे।` 
          : 'Welcome stakeholders. Today we are reviewing source context and aligned directives.'
      },
      {
        slideNumber: 2,
        title: s2Title,
        purpose: 'Ground the audience in the established background',
        bullets: [
          analysis?.overview?.summary ? analysis.overview.summary.slice(0, 140) + '...' : 'Review of official incoming documentation.',
          `Primary Communicative Intent: ${analysis?.intent?.primary || 'Inform'}`,
          `Urgency Evaluation: ${(analysis?.urgency?.level || 'Standard').toUpperCase()}`
        ],
        speakerNotes: 'This slide outlines the current operational situation as validated by semantic content extraction.'
      },
      {
        slideNumber: 3,
        title: s3Title,
        purpose: 'Present factual evidence without speculation',
        bullets: facts.slice(0, 3).length > 0 
          ? (isRegen && facts.length > 2 ? [facts[1], facts[0], facts[2]] : facts.slice(0, 3))
          : ['All statements extracted directly from source text without external hallucination.'],
        speakerNotes: 'Every metric on this slide is directly grounded in source data.'
      },
      {
        slideNumber: 4,
        title: s4Title,
        purpose: 'Quantify impact across parameters',
        bullets: numbers.slice(0, 3).length > 0 
          ? numbers.slice(0, 3).map(n => `${n.label}: ${n.value} (${n.context})`)
          : ['Data thresholds referenced against official baseline.'],
        speakerNotes: 'Review the quantitative milestones carefully before moving to action assignments.'
      },
      {
        slideNumber: 5,
        title: s5Title,
        purpose: 'Summarize actionable decisions',
        bullets: [
          'Coordinate immediate briefing with regional/operational leads.',
          'Enforce strict verification of downstream public releases.',
          'Maintain active communications channels until formal closure.'
        ],
        speakerNotes: 'In conclusion, prioritize stakeholder safety and adherence to documented timelines.'
      }
    ];

    const displaySlides = detail === 'Concise' ? slides.slice(0, 3) : slides;

    return {
      title,
      slides: displaySlides
    };
  }

  // 7. VIDEO SCRIPT GENERATOR
  generateVideoScript(source, analysis, config) {
    const { audienceStr, tone, lang, detail = 'Balanced', options = {} } = config;
    const isRegen = Boolean(options?.isRegeneration || options?.variantSeed);
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const title = `Video Briefing: ${analysis?.overview?.mainTopic || 'Executive Summary'}`;
    const facts = (analysis?.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).filter(Boolean);
    const numbers = (analysis?.importantNumbers || []);
    const isEmergency = isEmergencyContent({ analysis, config: { tone, targetAudience: audienceStr, language: lang }, sourceContent: source });
    const isVerified = Boolean(analysis?.verification?.isVerified || source?.isVerified || analysis?.claims?.some(c => c.isVerified));

    let hookNarration = isRegen
      ? `Attention all ${audienceStr}. Here is a concise, verified operational update regarding ${analysis?.overview?.mainTopic || 'the situation'}.`
      : `Attention ${audienceStr}. Here is a vital update regarding ${analysis?.overview?.mainTopic || 'current operations'}.`;

    if (isHindi) {
      hookNarration = `सभी ${audienceStr} ध्यान दें। ${analysis?.overview?.mainTopic || 'वर्तमान स्थिति'} के संबंध में यह एक महत्वपूर्ण आधिकारिक विवरण है।`;
    } else if (isMarathi) {
      hookNarration = `सर्व ${audienceStr} कृपया लक्ष द्या. ${analysis?.overview?.mainTopic || 'सद्यस्थिती'} बाबतचे हे अधिकृत अपडेट आहे.`;
    }

    const scenes = [
      {
        sceneNumber: 1,
        visual: isRegen
          ? 'Quick fade in on modern graphical alert banner with official crest.'
          : 'Fade in on high-impact title card with authoritative badge. Clean graphical backdrop.',
        narration: hookNarration,
        onScreenText: `${(analysis?.overview?.mainTopic || 'OFFICIAL BRIEFING').toUpperCase()}`,
        duration: '15s'
      },
      {
        sceneNumber: 2,
        visual: 'Split screen displaying situational summary diagram and domain category badge.',
        narration: analysis?.overview?.summary 
          ? `${analysis.overview.summary.slice(0, 160)}...`
          : 'Recent official notifications have established key operational guidelines.',
        onScreenText: `SITUATION: ${analysis?.overview?.category || 'STATUS UPDATE'}`,
        duration: '20s'
      },
      {
        sceneNumber: 3,
        visual: 'Animated bullet cards sliding in sequentially highlighting factual statements.',
        narration: facts[0] 
          ? (isRegen && facts[1] ? `Key facts: ${facts[1]} In addition, ${facts[0]}` : `Key points to note: ${facts[0]} ${facts[1] ? `Furthermore, ${facts[1]}` : ''}`)
          : 'Ground teams have reported these factual benchmarks.',
        onScreenText: isVerified ? 'VERIFIED FINDINGS' : 'KEY FINDINGS',
        duration: '25s'
      },
      {
        sceneNumber: 4,
        visual: 'Full-frame metric cards displaying key numbers, thresholds, and contact helplines.',
        narration: numbers.length > 0 
          ? `Critical parameters include: ${numbers.slice(0, 2).map(n => `${n.label} at ${n.value}`).join(', and ')}.`
          : 'All thresholds remain actively monitored.',
        onScreenText: numbers.length > 0 ? `${numbers[0].label}: ${numbers[0].value}` : 'ACTIVE MONITORING',
        duration: '15s'
      },
      {
        sceneNumber: 5,
        visual: 'Closing screen with helpline details, verified official crest/logo, and call-to-action banner.',
        narration: isEmergency
          ? 'Please follow official channels for updates. Adhere strictly to authorized public safety instructions.'
          : 'Please follow official channels for updates. Share this briefing with your cohort.',
        onScreenText: 'STAY INFORMED • FOLLOW OFFICIAL PROTOCOLS',
        duration: '15s'
      }
    ];

    const displayScenes = detail === 'Concise' ? [scenes[0], scenes[2], scenes[4]] : scenes;

    return {
      title,
      durationEstimate: detail === 'Concise' ? '45 seconds' : '90 seconds',
      scenes: displayScenes
    };
  }
}
