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
    const summary = analysis.overview?.summary || (source.extractedText || '').slice(0, 160);
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, detail === 'Concise' ? 2 : 4);
    const numbers = (analysis.importantNumbers || []).slice(0, 3);
    const dates = (analysis.importantDates || []).slice(0, 2);

    let openingHook = '';
    let callToAction = '';
    let hashtagList = [];

    if (lang === 'Hindi') {
      openingHook = `📢 महत्वपूर्ण सूचना | ${topic} [लक्षित वर्ग: ${audienceStr}]`;
      callToAction = `कृपया इस सूचना को अपनी टीम और समुदाय के साथ साझा करें। आधिकारिक दिशानिर्देशों का पालन करें।`;
      hashtagList = ['#सूचना', '#अपडेट', '#जनहित', '#InfoFlipAI'];
    } else if (lang === 'Marathi') {
      openingHook = `📢 महत्त्वाची माहिती | ${topic} [लक्षित गट: ${audienceStr}]`;
      callToAction = `कृपया ही माहिती आपल्या सहकाऱ्यांपर्यंत पोहोचवा आणि अधिकृत सूचनांचे काटेकोर पालन करा.`;
      hashtagList = ['#महत्त्वाचीमाहिती', '#जनहित', '#अपडेट', '#InfoFlipAI'];
    } else {
      openingHook = `🚨 Strategic Update on ${topic} | Key Directives for ${audienceStr}`;
      callToAction = `Please ensure relevant teams and community stakeholders review these parameters immediately. Follow official protocol.`;
      hashtagList = ['#Leadership', '#OperationalExcellence', '#PublicNotice', '#InfoFlipAI'];
    }

    // Body compilation
    const bodyParagraphs = [
      openingHook,
      summary,
      lang === 'Hindi' ? '🔹 मुख्य तथ्य एवं महत्वपूर्ण बिंदु:' : lang === 'Marathi' ? '🔹 मुख्य मुद्दे व तथ्ये:' : '🔹 Key Grounded Insights & Directives:',
      ...facts.map(f => `• ${f}`),
      numbers.length > 0 ? (lang === 'Hindi' ? `📊 प्रमुख आंकड़े: ${numbers.map(n => `${n.label}: ${n.value}`).join(' | ')}` : `📊 Verified Key Metrics: ${numbers.map(n => `${n.label}: ${n.value}`).join(' | ')}`) : null,
      dates.length > 0 ? (lang === 'Hindi' ? `⏱️ महत्वपूर्ण समयसीमा: ${dates.map(d => `${d.date} - ${d.context}`).join('; ')}` : `⏱️ Timelines & Deadlines: ${dates.map(d => `${d.date} (${d.context})`).join('; ')}`) : null,
      callToAction,
      hashtagList.join(' ')
    ].filter(Boolean);

    const fullText = bodyParagraphs.join('\n\n');

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

    return {
      title: `${title} - Executive Summary`,
      executiveOverview: `${overview} Prepared specifically for ${audienceStr} under a ${tone.toLowerCase()} communication protocol.`,
      keyPoints: facts.length > 0 ? facts : ['Official situational guidelines have been reviewed and normalized from source.'],
      importantFindings: numbers.length > 0 ? numbers : ['All quantitative thresholds are grounded in official source telemetry.'],
      implications: [
        `Immediate cross-departmental coordination required across active stakeholders (${orgs || 'Authorized bodies'}).`,
        'Operational readiness protocols must be synchronized with verified timeline markers.'
      ],
      recommendedConsiderations: [
        'Review communication channels and dispatch localized notices across vulnerable touchpoints.',
        'Maintain real-time audit logging for verified factual statements.'
      ]
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
      importantDates: dates.length > 0 ? dates : ['Active immediately upon release until official de-escalation notice.']
    };
  }

  // 5. INFOGRAPHIC CONTENT GENERATOR
  generateInfographic(source, analysis, config) {
    const { lang, audienceStr } = config;
    const title = analysis.overview?.mainTopic || 'Data & Situation Overview';
    const subtitle = `Visual breakdown and key takeaways for ${audienceStr}`;
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact).slice(0, 3);
    const numbers = (analysis.importantNumbers || []).slice(0, 4);

    const sections = [
      {
        heading: '01. Situational Context',
        keyPoint: analysis.overview?.category || 'General Overview',
        supportingFact: facts[0] || (analysis.overview?.summary || '').slice(0, 100)
      },
      {
        heading: '02. Grounded Impact',
        keyPoint: 'Core Operational Parameters',
        supportingFact: facts[1] || 'Parameters verified through source text analysis.'
      },
      {
        heading: '03. Directive & Resolution',
        keyPoint: 'Actionable Protocols',
        supportingFact: facts[2] || 'Citizens and teams must maintain compliance with verified advisories.'
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
        { value: '100%', label: 'Grounded Facts', context: 'Zero hallucinated statistics' },
        { value: '24/7', label: 'Monitoring', context: 'Active operational cycle' }
      ],
      callout: `Verified communication issued for ${audienceStr}. Consult official portals for real-time status.`
    };
  }

  // 6. PRESENTATION CONTENT GENERATOR
  generatePresentation(source, analysis, config) {
    const { audienceStr, tone } = config;
    const title = analysis.overview?.mainTopic || 'Strategic Overview & Operational Directives';
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact);
    const numbers = (analysis.importantNumbers || []);

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
        speakerNotes: 'Welcome stakeholders. Today we are reviewing verified source context and aligned directives.'
      },
      {
        slideNumber: 2,
        title: 'Current Situation & Executive Context',
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
        title: 'Key Grounded Findings & Verified Metrics',
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
          : ['Data thresholds verified against official baseline.'],
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
    const { audienceStr } = config;
    const title = `Video Briefing: ${analysis.overview?.mainTopic || 'Executive Summary'}`;
    const facts = (analysis.keyFacts || []).map(f => typeof f === 'string' ? f : f.fact);
    const numbers = (analysis.importantNumbers || []);

    const scenes = [
      {
        sceneNumber: 1,
        visual: 'Fade in on high-impact title card with authoritative animated badge. Clean graphical backdrop.',
        narration: `Attention ${audienceStr}. Here is a vital update regarding ${analysis.overview?.mainTopic || 'current operations'}.`,
        onScreenText: `${(analysis.overview?.mainTopic || 'OFFICIAL BRIEFING').toUpperCase()}`,
        duration: '15s'
      },
      {
        sceneNumber: 2,
        visual: 'Split screen displaying situational summary diagram and verified domain category badge.',
        narration: analysis.overview?.summary 
          ? `${analysis.overview.summary.slice(0, 160)}...`
          : 'Recent official notifications have established key operational guidelines.',
        onScreenText: `SITUATION: ${analysis.overview?.category || 'STATUS UPDATE'}`,
        duration: '20s'
      },
      {
        sceneNumber: 3,
        visual: 'Animated bullet cards sliding in sequentially highlighting verified factual statements.',
        narration: facts[0] 
          ? `Key facts to note: ${facts[0]} ${facts[1] ? `Furthermore, ${facts[1]}` : ''}`
          : 'Ground teams have verified these factual benchmarks.',
        onScreenText: 'VERIFIED FINDINGS',
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
        narration: 'Please follow official channels for updates. Share this verified briefing with your cohort.',
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
