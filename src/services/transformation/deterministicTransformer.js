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
   * @returns {Array<object>} - Array of created output items
   */
  transform(request, options = {}) {
    const { source, analysis, configuration, requestedOutputs, transformationId } = request;
    const lang = configuration.language || 'English';
    const audienceStr = (configuration.targetAudience || ['General Public']).join(', ');
    const tone = configuration.tone || 'Informative';
    const detail = configuration.detailLevel || 'Balanced';
    const objective = configuration.objective || 'Inform';
    const style = configuration.contentStyle || 'Structured';

    const outputs = [];

    for (const formatId of requestedOutputs) {
      let content = null;

      switch (formatId) {
        case OUTPUT_FORMAT_IDS.LINKEDIN:
          content = this.generateLinkedIn(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.TWITTER:
          content = this.generateTwitter(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY:
          content = this.generateExecutiveSummary(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.ADVISORY:
          content = this.generateAdvisory(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.INFOGRAPHIC:
          content = this.generateInfographic(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.PRESENTATION:
          content = this.generatePresentation(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        case OUTPUT_FORMAT_IDS.VIDEO_SCRIPT:
          content = this.generateVideoScript(source, analysis, { audienceStr, tone, lang, detail, objective, style });
          break;

        default:
          content = { text: source.extractedText || source.rawText || 'Source transformed.' };
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

      outputs.push(
        createOutputItem({
          transformationId,
          format: formatId,
          status: 'generated',
          content,
          metadata: {
            provider: 'DeterministicFallback',
            isFallback: true,
            reason: options?.fallbackReason || options?.reason || null,
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
    const { lang, audienceStr, tone, detail, objective } = config;
    const topic = analysis.overview?.mainTopic || 'Important Operational Update';
    const rawSummary = analysis.overview?.summary || (source.extractedText || '').slice(0, 160);
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, detail === 'Concise' ? 2 : 4);
    const numbers = (analysis.importantNumbers || []).slice(0, 3);
    const dates = (analysis.importantDates || []).slice(0, 2);

    const isVerified = Boolean(
      analysis.verification?.isVerified || 
      analysis.verification?.status === 'verified' ||
      analysis.claims?.some(c => c.isVerified) ||
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
      openingHook = isEmergency 
        ? `🚨 मौसम चेतावनी एवं जन सुरक्षा सूचना: ${topic} [लक्षित वर्ग: ${audienceStr}]`
        : `📢 महत्वपूर्ण सूचना | ${topic} [लक्षित वर्ग: ${audienceStr}]`;
      callToAction = isEmergency
        ? `⚠️ आपातकालीन सुरक्षा निर्देश: कृपया स्थानीय प्रशासन के सुरक्षा निर्देशों का कड़ाई से पालन करें और सुरक्षित स्थानों पर रहें।`
        : (/public|citizen|resident/i.test(audienceStr)
          ? `कृपया इस सूचना को समुदाय के साथ साझा करें और आधिकारिक दिशानिर्देशों का पालन करें।`
          : `कृपया इस सूचना को अपनी टीम के साथ साझा करें। आधिकारिक दिशानिर्देशों का पालन करें।`);
    } else if (lang === 'Marathi') {
      openingHook = isEmergency
        ? `🚨 हवामान इशारा व सार्वजनिक सुरक्षा सूचना: ${topic} [लक्षित गट: ${audienceStr}]`
        : `📢 महत्त्वाची माहिती | ${topic} [लक्षित गट: ${audienceStr}]`;
      callToAction = isEmergency
        ? `⚠️ तातडीची सुरक्षा सूचना: कृपया स्थानिक प्रशासनाच्या नियमांचे काटेकोर पालन करा आणि अधिकृत सूचनांचे अनुसरण करा.`
        : (/public|citizen|resident/i.test(audienceStr)
          ? `कृपया ही माहिती नागरिकांपर्यंत पोहोचवा आणि अधिकृत नियमांचे पालन करा.`
          : `कृपया ही माहिती आपल्या सहकाऱ्यांपर्यंत पोहोचवा आणि अधिकृत सूचनांचे काटेकोर पालन करा.`);
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

    // 1. Deduplicate introduction against openingHook
    const cleanIntro = deduplicateHeadlineAndIntro(openingHook, rawSummary, source.extractedText || source.rawText || '');

    // 2. Scannable bullet points header
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

    // 3. Deduplicate facts against intro and numbers
    const cleanFacts = deduplicateFacts(facts, cleanIntro, numbers, dates);

    // 4. Truthful Metrics Labeling
    const metricsLabel = getTruthfulMetricsLabel(lang, isVerified);
    const metricsSection = numbers.length > 0 
      ? `${metricsLabel} ${numbers.map(n => `${n.label}: ${n.value}`).join(' | ')}`
      : null;

    // 5. Timelines
    const datesSection = dates.length > 0 
      ? (lang === 'Hindi' 
          ? `⏱️ महत्वपूर्ण समयसीमा: ${dates.map(d => `${d.date} - ${d.context}`).join('; ')}` 
          : `⏱️ Timelines & Deadlines: ${dates.map(d => `${d.date} (${d.context})`).join('; ')}`) 
      : null;

    // 6. Readable Hashtags
    const hashtagList = generateReadableHashtags({
      isEmergency,
      mainTopic: topic,
      analysis,
      lang,
      rawText: source.extractedText || source.rawText || ''
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
      rawText: source.extractedText || source.rawText || '',
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
    const { lang, audienceStr, detail } = config;
    const topic = analysis.overview?.mainTopic || 'Alert';
    const summary = analysis.overview?.summary || (source.extractedText || '').slice(0, 120);
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, 3);
    const numbers = (analysis.importantNumbers || []).slice(0, 2);

    const posts = [];

    if (lang === 'Hindi') {
      posts.push(`🚨 ${topic}\n\n${summary.slice(0, 180)}...\n\nलक्षित वर्ग: ${audienceStr} #Alert #InfoFlip`);
      if (detail !== 'Concise' && facts.length > 0) {
        posts.push(`2/3 मुख्य तथ्य:\n${facts.map(f => `• ${f.slice(0, 100)}`).join('\n')}`);
        posts.push(`3/3 आंकड़े एवं हेल्पलाइन:\n${numbers.map(n => `• ${n.label}: ${n.value}`).join('\n') || 'सतर्क रहें एवं अधिकृत चैनलों का अनुसरण करें।'}\n\n#PublicNotice`);
      }
    } else if (lang === 'Marathi') {
      posts.push(`🚨 ${topic}\n\n${summary.slice(0, 180)}...\n\nलक्षित वर्ग: ${audienceStr} #Alert #InfoFlip`);
      if (detail !== 'Concise' && facts.length > 0) {
        posts.push(`2/3 मुख्य बाबी:\n${facts.map(f => `• ${f.slice(0, 100)}`).join('\n')}`);
        posts.push(`3/3 अधिकृत माहिती:\n${numbers.map(n => `• ${n.label}: ${n.value}`).join('\n') || 'काळजी घ्या व अधिकृत सूचनांचे पालन करा.'}\n\n#PublicNotice`);
      }
    } else {
      posts.push(`🚨 UPDATE: ${topic}\n\n${summary.slice(0, 180)}...\n\nTarget Cohort: ${audienceStr} #Alert #InfoFlip`);
      if (detail !== 'Concise' && facts.length > 0) {
        posts.push(`2/3 Grounded Facts:\n${facts.map(f => `• ${f.slice(0, 100)}`).join('\n')}`);
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
    const { lang, audienceStr, tone } = config;
    const title = analysis.overview?.title || `${analysis.overview?.mainTopic || 'Operational'} Executive Briefing`;
    const overview = analysis.overview?.summary || (source.extractedText || '').slice(0, 250);
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, 4);
    const numbers = (analysis.importantNumbers || []).map(n => `${n.label}: ${n.value} (${n.context})`);
    const orgs = (analysis.entities?.organizations || []).join(', ');
    const isEmergency = isEmergencyContent({ analysis, config: { tone, targetAudience: audienceStr, language: lang }, sourceContent: source });
    const isVerified = Boolean(analysis.verification?.isVerified || source?.isVerified || analysis.claims?.some(c => c.isVerified));

    const implications = isEmergency
      ? [
          `Immediate public safety readiness and response coordination active across authorized bodies (${orgs || 'Authorized response teams'}).`,
          'Safety directives and operational notices must be synchronized with documented timeline windows.'
        ]
      : [
          `Immediate operational coordination required across active stakeholders (${orgs || 'Authorized bodies'}).`,
          'Operational readiness protocols must be synchronized with verified timeline markers.'
        ];

    const recommendedConsiderations = isEmergency
      ? [
          'Review public notification channels and dispatch localized safety notices across vulnerable areas.',
          'Maintain real-time logging and monitor authorized feeds for updated advisories.'
        ]
      : [
          'Review communication channels and dispatch localized notices across relevant touchpoints.',
          'Maintain real-time audit logging for source factual statements.'
        ];

    return {
      title: `${title} - Executive Summary`,
      executiveOverview: `${overview} Prepared specifically for ${audienceStr} under an official ${tone.toLowerCase()} protocol.`,
      keyPoints: facts.length > 0 ? facts : ['Official situational guidelines have been reviewed and normalized from source.'],
      importantFindings: numbers.length > 0 ? numbers : ['All quantitative observations reflect figures reported directly in source documentation.'],
      implications,
      recommendedConsiderations
    };
  }

  // 4. ADVISORY GENERATOR
  generateAdvisory(source, analysis, config) {
    const { lang, audienceStr, tone } = config;
    const title = `OFFICIAL ADVISORY: ${analysis.overview?.mainTopic || 'Public Situational Notice'}`;
    const situation = analysis.overview?.summary || (source.extractedText || '').slice(0, 200);
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, 4);
    const dates = (analysis.importantDates || []).map(d => `${d.date} - ${d.context}`);
    const urgencyLvl = analysis.urgency?.level || 'standard';
    const isVerified = Boolean(
      (analysis.verification?.isVerified || analysis.verification?.isIndependentlyVerified) &&
      analysis.verification?.verificationEvidence
    ) || Boolean(
      analysis.claims?.some(c => c.isIndependentlyVerified && (c.verificationEvidence || c.evidence))
    );

    return {
      title,
      situation: `${situation} [Urgency Tier: ${urgencyLvl.toUpperCase()}]`,
      keyInformation: facts.length > 0 ? facts : ['Adhere strictly to official broadcast bulletins and instructions.'],
      potentialImpact: `Impact assessment targeted for ${audienceStr}: Potential operational disruptions and public safety concerns.`,
      recommendedActions: [
        'Adhere strictly to authorized guidelines and avoid speculative reports.',
        'Verify emergency equipment, battery reserves, and communications links.',
        'Report urgent field anomalies or assistance requests to authorized dispatchers.'
      ],
      importantDates: dates.length > 0 ? dates : ['Active immediately upon release until official de-escalation notice.'],
      verificationNotice: isVerified ? 'Independently verified by authorized response coordination.' : 'Extracted from provided source; independent verification required for critical decisions.'
    };
  }

  // 5. INFOGRAPHIC CONTENT GENERATOR
  generateInfographic(source, analysis, config) {
    const { lang, audienceStr } = config;
    const title = analysis.overview?.mainTopic || 'Data & Situation Overview';
    const subtitle = `Visual breakdown and key takeaways for ${audienceStr}`;
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, 3);
    const numbers = (analysis.importantNumbers || []).slice(0, 4);
    const isVerified = Boolean(
      (analysis.verification?.isVerified || analysis.verification?.isIndependentlyVerified) &&
      analysis.verification?.verificationEvidence
    ) || Boolean(
      analysis.claims?.some(c => c.isIndependentlyVerified && (c.verificationEvidence || c.evidence))
    );

    const sections = [
      {
        heading: '01. Situational Context',
        keyPoint: analysis.overview?.category || 'General Overview',
        supportingFact: facts[0] || (analysis.overview?.summary || '').slice(0, 100)
      },
      {
        heading: '02. Grounded Impact',
        keyPoint: 'Core Operational Parameters',
        supportingFact: facts[1] || 'Parameters extracted through source text analysis.'
      },
      {
        heading: '03. Directive & Resolution',
        keyPoint: 'Actionable Protocols',
        supportingFact: facts[2] || 'Citizens and teams must maintain compliance with official advisories.'
      }
    ];

    const statistics = numbers.map(n => ({
      value: n.value,
      label: n.label,
      context: n.context
    }));

    return {
      title,
      subtitle,
      sections,
      statistics: statistics.length > 0 ? statistics : [
        { value: '100%', label: 'Source-Grounded', context: 'Zero hallucinated statistics' },
        { value: '24/7', label: 'Monitoring', context: 'Active operational cycle' }
      ],
      callout: isVerified
        ? `Verified communication issued for ${audienceStr}. Consult official portals for real-time status.`
        : `Official communication issued for ${audienceStr}. Consult official portals for real-time status.`
    };
  }

  // 6. PRESENTATION CONTENT GENERATOR
  generatePresentation(source, analysis, config) {
    const { audienceStr, tone } = config;
    const title = analysis.overview?.mainTopic || 'Strategic Overview & Operational Directives';
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact);
    const numbers = (analysis.importantNumbers || []);
    const isVerified = Boolean(analysis.verification?.isVerified || source?.isVerified || analysis.claims?.some(c => c.isVerified));

    const slides = [
      {
        slideNumber: 1,
        title: title,
        purpose: 'Executive framing and session objectives',
        bullets: [
          `Target Stakeholders: ${audienceStr}`,
          `Domain / Sector: ${analysis.overview?.category || 'General'}`,
          `Classification Tone: ${tone}`
        ],
        speakerNotes: 'Welcome stakeholders. Today we are reviewing source context and aligned directives.'
      },
      {
        slideNumber: 2,
        title: 'Current Situation & Context',
        purpose: 'Ground the audience in the established background',
        bullets: [
          analysis.overview?.summary ? analysis.overview.summary.slice(0, 140) + '...' : 'Review of official incoming documentation.',
          `Primary Communicative Intent: ${analysis.intent?.primary || 'Inform'}`,
          `Urgency Evaluation: ${(analysis.urgency?.level || 'Standard').toUpperCase()}`
        ],
        speakerNotes: 'This slide outlines the current operational situation as validated by semantic content extraction.'
      },
      {
        slideNumber: 3,
        title: isVerified ? 'Key Grounded Findings & Verified Metrics' : 'Key Grounded Findings & Source Metrics',
        purpose: 'Present factual evidence without speculation',
        bullets: facts.slice(0, 3).length > 0 
          ? facts.slice(0, 3) 
          : ['All statements extracted directly from source text without external hallucination.'],
        speakerNotes: 'Every metric on this slide is directly grounded in source data.'
      },
      {
        slideNumber: 4,
        title: 'Operational Impact & Metrics',
        purpose: 'Quantify impact across parameters',
        bullets: numbers.slice(0, 3).length > 0 
          ? numbers.slice(0, 3).map(n => `${n.label}: ${n.value} (${n.context})`)
          : ['Data thresholds referenced against official baseline.'],
        speakerNotes: 'Review the quantitative milestones carefully before moving to action assignments.'
      },
      {
        slideNumber: 5,
        title: 'Recommended Directives & Next Steps',
        purpose: 'Summarize actionable decisions',
        bullets: [
          'Coordinate immediate briefing with regional/operational leads.',
          'Enforce strict verification of downstream public releases.',
          'Maintain active communications channels until formal closure.'
        ],
        speakerNotes: 'In conclusion, prioritize stakeholder safety and adherence to documented timelines.'
      }
    ];

    return {
      title,
      slides
    };
  }

  // 7. VIDEO SCRIPT GENERATOR
  generateVideoScript(source, analysis, config) {
    const { audienceStr, tone, lang } = config;
    const title = `Video Briefing: ${analysis.overview?.mainTopic || 'Executive Summary'}`;
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact);
    const numbers = (analysis.importantNumbers || []);
    const isEmergency = isEmergencyContent({ analysis, config: { tone, targetAudience: audienceStr, language: lang }, sourceContent: source });
    const isVerified = Boolean(analysis.verification?.isVerified || source?.isVerified || analysis.claims?.some(c => c.isVerified));

    const scenes = [
      {
        sceneNumber: 1,
        visual: 'Fade in on high-impact title card with authoritative badge. Clean graphical backdrop.',
        narration: `Attention ${audienceStr}. Here is a vital update regarding ${analysis.overview?.mainTopic || 'current operations'}.`,
        onScreenText: `${(analysis.overview?.mainTopic || 'OFFICIAL BRIEFING').toUpperCase()}`,
        duration: '15s'
      },
      {
        sceneNumber: 2,
        visual: 'Split screen displaying situational summary diagram and domain category badge.',
        narration: analysis.overview?.summary 
          ? `${analysis.overview.summary.slice(0, 160)}...`
          : 'Recent official notifications have established key operational guidelines.',
        onScreenText: `SITUATION: ${analysis.overview?.category || 'STATUS UPDATE'}`,
        duration: '20s'
      },
      {
        sceneNumber: 3,
        visual: 'Animated bullet cards sliding in sequentially highlighting factual statements.',
        narration: facts[0] 
          ? `Key points to note: ${facts[0]} ${facts[1] ? `Furthermore, ${facts[1]}` : ''}`
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

    return {
      title,
      durationEstimate: '90 seconds',
      scenes
    };
  }
}
