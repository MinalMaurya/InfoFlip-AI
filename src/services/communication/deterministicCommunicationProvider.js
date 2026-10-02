/**
 * Deterministic Communication Provider for InfoFlip-AI Module 4
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 4: Social & Communication Generator
 * 
 * Provides zero-cost, instant, anti-hallucinatory communication generation for all 8 channels.
 * Operates strictly over Module 3 outputs, Module 2 analysis, and Module 1 source content.
 * Clearly identifies provider as 'DeterministicFallback'.
 */

import { 
  COMMUNICATION_CHANNEL_IDS, 
  createCommunicationOutputItem 
} from '../../types/communication.js';
import { getCommunicationChannelById } from './communicationChannelRegistry.js';

export class DeterministicCommunicationProvider {
  /**
   * Generates communication outputs for requested channels
   * @param {object} request - Module 4 communication request
   * @param {object} options - Execution options
   * @returns {Array<object>} - Array of communication output items
   */
  generate(request, options = {}) {
    const {
      sourceId = 'src-1',
      transformationId = 'trans-1',
      analysisId = 'ana-1',
      sourceContent = {},
      analysis = {},
      transformationOutputs = [],
      config = {},
      requestedChannels = []
    } = request;

    const lang = config.language || 'English';
    const audience = config.targetAudience || 'General Public';
    const tone = config.tone || 'Informative';
    const fallbackReason = options.fallbackReason || options.reason || null;

    // Extract core grounding materials
    const rawText = sourceContent.extractedText || sourceContent.rawText || '';
    const mainTopic = analysis.overview?.mainTopic || analysis.overview?.title || 'Important Update';
    const summary = analysis.overview?.summary || rawText.slice(0, 200);
    
    // Key facts list
    const keyFacts = Array.isArray(analysis.keyFacts) && analysis.keyFacts.length > 0
      ? analysis.keyFacts.map(f => (typeof f === 'string' ? f : f.fact)).filter(Boolean)
      : [rawText.slice(0, 150)];

    // Dates and Numbers
    const dates = Array.isArray(analysis.importantDates) ? analysis.importantDates : [];
    const numbers = Array.isArray(analysis.importantNumbers) ? analysis.importantNumbers : [];
    const entities = analysis.entities || {};
    const urgency = analysis.urgency?.level || 'low';

    // Module 3 outputs index
    const mod3Map = {};
    if (Array.isArray(transformationOutputs)) {
      transformationOutputs.forEach(out => {
        if (out?.format) mod3Map[out.format] = out.content;
      });
    }

    const outputs = [];

    for (const channelId of requestedChannels) {
      let content = '';
      let title = '';
      let structuredData = null;
      const traceabilityFacts = [];

      switch (channelId) {
        case COMMUNICATION_CHANNEL_IDS.LINKEDIN: {
          const res = this.buildLinkedIn({ mainTopic, summary, keyFacts, audience, tone, lang, mod3Map, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.TWITTER: {
          const res = this.buildTwitter({ mainTopic, summary, keyFacts, numbers, lang, mod3Map, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.WHATSAPP: {
          const res = this.buildWhatsApp({ mainTopic, summary, keyFacts, dates, numbers, urgency, lang, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.EMAIL: {
          const res = this.buildEmail({ mainTopic, summary, keyFacts, audience, tone, dates, lang, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.SMS: {
          const res = this.buildSMS({ mainTopic, keyFacts, dates, numbers, lang, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT: {
          const res = this.buildAnnouncement({ mainTopic, summary, keyFacts, dates, urgency, lang, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.CTA: {
          const res = this.buildCTA({ mainTopic, keyFacts, dates, lang, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        case COMMUNICATION_CHANNEL_IDS.HASHTAGS: {
          const res = this.buildHashtags({ mainTopic, analysis, entities, sourceId });
          content = res.content;
          title = res.title;
          structuredData = res.structuredData;
          traceabilityFacts.push(...res.traceability);
          break;
        }

        default: {
          const def = getCommunicationChannelById(channelId);
          title = def?.name || `${channelId.toUpperCase()} Communication`;
          content = `${mainTopic}\n\n${summary}\n\nKey Points:\n${keyFacts.slice(0, 3).map(f => `• ${f}`).join('\n')}`;
          traceabilityFacts.push({ fact: keyFacts[0] || summary, sourceId, origin: 'analysis.keyFacts' });
          break;
        }
      }

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;

      outputs.push(
        createCommunicationOutputItem({
          outputId: `out-${channelId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          channelId,
          title,
          content,
          structuredData,
          metadata: {
            characterCount,
            wordCount,
            provider: 'DeterministicFallback',
            isFallback: true,
            fallbackReason,
            generatedAt: new Date().toISOString(),
            isEdited: false
          },
          sourceTraceability: traceabilityFacts,
          validation: {
            isValid: true,
            warnings: []
          }
        })
      );
    }

    return outputs;
  }

  // 1. LINKEDIN POST
  buildLinkedIn({ mainTopic, summary, keyFacts, audience, tone, lang, mod3Map, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    let hook = `📌 Key Development: ${mainTopic}`;
    let intro = summary;
    let keyFactsHeader = 'Key highlights to know:';
    let cta = `What are your thoughts on this? How is your organization addressing this? Join the conversation below.`;
    let tags = `#${mainTopic.replace(/[^a-zA-Z0-9]/g, '')} #PublicInformation #InfoFlip`;

    if (isHindi) {
      hook = `📌 महत्वपूर्ण अपडेट: ${mainTopic}`;
      intro = `${summary} (लक्षित दर्शक: ${audience})`;
      keyFactsHeader = 'मुख्य महत्वपूर्ण बिंदु:';
      cta = 'इस महत्वपूर्ण विषय पर अपनी राय साझा करें और प्रतिक्रिया दें।';
      tags = `#${mainTopic.replace(/[^a-zA-Z0-9]/g, '')} #महत्वपूर्ण #समाचार`;
    } else if (isMarathi) {
      hook = `📌 महत्त्वाची माहिती: ${mainTopic}`;
      intro = `${summary} (लक्षित गट: ${audience})`;
      keyFactsHeader = 'प्रमुख ठळक मुद्दे:';
      cta = 'या महत्त्वाच्या विषयावर आपले मत खाली नक्की नोंदवा.';
      tags = `#${mainTopic.replace(/[^a-zA-Z0-9]/g, '')} #माहिती #महत्त्वाचे`;
    }

    // Reuse Module 3 LinkedIn if present for seamless consistency
    const mod3LinkedIn = mod3Map['linkedin'];
    if (mod3LinkedIn && typeof mod3LinkedIn.text === 'string' && mod3LinkedIn.text.length > 20) {
      intro = mod3LinkedIn.text.split('\n\n')[0] || summary;
    }

    const bullets = keyFacts.slice(0, 4).map(f => `• ${f}`).join('\n');
    const content = `${hook}\n\n${intro}\n\n${keyFactsHeader}\n${bullets}\n\n${cta}\n\n${tags}`;

    return {
      title: 'LinkedIn Professional Post',
      content,
      structuredData: {
        hook,
        intro,
        keyPoints: keyFacts.slice(0, 4),
        cta,
        hashtags: tags.split(' ')
      },
      traceability: keyFacts.slice(0, 4).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 2. X / TWITTER POST & THREAD
  buildTwitter({ mainTopic, summary, keyFacts, numbers, lang, mod3Map, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const numStr = numbers.length > 0 ? ` (${numbers[0].value} ${numbers[0].label || ''})` : '';

    let tweet1 = '';
    let tweet2 = '';
    let tweet3 = '';

    if (isHindi) {
      tweet1 = `1/3 📢 ${mainTopic}${numStr}: ${summary.slice(0, 160)}...`;
      tweet2 = `2/3 🔍 मुख्य तथ्य:\n• ${keyFacts[0] || 'सत्यापित जानकारी'}\n• ${keyFacts[1] || 'आधिकारिक निर्देश'}`;
      tweet3 = `3/3 ℹ️ पूरी जानकारी का पालन करें और दूसरों के साथ साझा करें। #InfoFlip #${mainTopic.replace(/[^a-zA-Z0-9]/g, '')}`;
    } else if (isMarathi) {
      tweet1 = `1/3 📢 ${mainTopic}${numStr}: ${summary.slice(0, 160)}...`;
      tweet2 = `2/3 🔍 प्रमुख मुद्दे:\n• ${keyFacts[0] || 'सत्यापित माहिती'}\n• ${keyFacts[1] || 'अधिकृत सूचना'}`;
      tweet3 = `3/3 ℹ️ ही माहिती लक्षात ठेवा आणि इतरांसोबत शेअर करा. #InfoFlip #${mainTopic.replace(/[^a-zA-Z0-9]/g, '')}`;
    } else {
      tweet1 = `1/3 📢 ${mainTopic}${numStr}: ${summary.slice(0, 180)}`;
      tweet2 = `2/3 🔍 Key Highlights:\n• ${keyFacts[0] || 'Verified information'}\n• ${keyFacts[1] || 'Official guidance'}`;
      tweet3 = `3/3 ℹ️ Follow official guidelines and share with those affected. #${mainTopic.replace(/[^a-zA-Z0-9]/g, '')} #Update`;
    }

    const posts = [tweet1, tweet2, tweet3];
    const content = posts.join('\n\n---\n\n');

    return {
      title: 'X / Twitter Thread',
      content,
      structuredData: {
        posts,
        isThread: true,
        postCount: posts.length
      },
      traceability: keyFacts.slice(0, 2).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 3. WHATSAPP BROADCAST
  buildWhatsApp({ mainTopic, summary, keyFacts, dates, numbers, urgency, lang, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const dateNotice = dates.length > 0 ? `\n🗓️ *${isHindi ? 'महत्वपूर्ण तिथि' : isMarathi ? 'महत्त्वाची तारीख' : 'Important Date'}:* ${dates[0].date}` : '';
    const numberNotice = numbers.length > 0 ? `\n📊 *${isHindi ? 'संख्या / आंकड़ा' : isMarathi ? 'आकडेवारी' : 'Key Metric'}:* ${numbers[0].value} - ${numbers[0].label || numbers[0].context}` : '';

    let header = `*📢 OFFICIAL BROADCAST: ${mainTopic.toUpperCase()}*`;
    let section1 = `*📌 Overview:* ${summary}`;
    let section2 = `*🔍 Crucial Details:*\n${keyFacts.slice(0, 3).map(f => `• ${f}`).join('\n')}`;
    let cta = `*✅ Action Required:* Please note this guidance and circulate only verified information to family and colleagues.`;

    if (isHindi) {
      header = `*📢 आधिकारिक सूचना: ${mainTopic}*`;
      section1 = `*📌 सारांश:* ${summary}`;
      section2 = `*🔍 मुख्य बिंदु:*\n${keyFacts.slice(0, 3).map(f => `• ${f}`).join('\n')}`;
      cta = `*✅ आवश्यक कदम:* कृपया इस आधिकारिक सूचना को ध्यान से पढ़ें और केवल सत्यापित जानकारी ही साझा करें।`;
    } else if (isMarathi) {
      header = `*📢 अधिकृत निवेदन: ${mainTopic}*`;
      section1 = `*📌 थोडक्यात माहिती:* ${summary}`;
      section2 = `*🔍 महत्त्वाचे मुद्दे:*\n${keyFacts.slice(0, 3).map(f => `• ${f}`).join('\n')}`;
      cta = `*✅ आवश्यक कृती:* कृपया ही अधिकृत माहिती काळजीपूर्वक वाचा आणि सर्वांपर्यंत पोहोचवा.`;
    }

    const content = `${header}\n\n${section1}\n\n${section2}${dateNotice}${numberNotice}\n\n${cta}`;

    return {
      title: 'WhatsApp Broadcast Message',
      content,
      structuredData: {
        header,
        overview: summary,
        keyDetails: keyFacts.slice(0, 3),
        actionRequired: cta
      },
      traceability: keyFacts.slice(0, 3).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 4. EMAIL DISPATCH
  buildEmail({ mainTopic, summary, keyFacts, audience, tone, dates, lang, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const deadline = dates.length > 0 ? ` Note that relevant dates include ${dates[0].date}.` : '';

    let subject = `Subject: [Update] ${mainTopic}`;
    let preview = `Preview: Essential information and key actions regarding ${mainTopic}.`;
    let greeting = `Dear ${audience || 'Colleague'},`;
    let opening = `We are writing to provide you with an important briefing on ${mainTopic}.\n\n${summary}`;
    let factsHeading = `Key factual points for your review:`;
    let factsBullets = keyFacts.slice(0, 4).map(f => `• ${f}`).join('\n');
    let cta = `Recommended Next Step: Please review the verified details above and ensure any required coordination is completed.${deadline}`;
    let closing = `Best regards,\nInfoFlip Communication Desk`;

    if (isHindi) {
      subject = `विषय: [महत्वपूर्ण अपडेट] ${mainTopic}`;
      preview = `पूर्वावलोकन: ${mainTopic} के संबंध में आवश्यक जानकारी और कदम।`;
      greeting = `प्रिय ${audience || 'साथी'},`;
      opening = `हम आपको ${mainTopic} के बारे में यह आधिकारिक विवरण साझा कर रहे हैं।\n\n${summary}`;
      factsHeading = `सत्यापित मुख्य बिंदु:`;
      cta = `आगामी कदम: कृपया दिए गए विवरण की समीक्षा करें और आवश्यक निर्देशों का पालन करें।${deadline}`;
      closing = `सादर,\nइन्फोफ्लिप संचार विभाग`;
    } else if (isMarathi) {
      subject = `विषय: [महत्त्वाचे अपडेट] ${mainTopic}`;
      preview = `पूर्वावलोकन: ${mainTopic} संदर्भात महत्त्वाची माहिती आणि सूचना.`;
      greeting = `सस्नेह नमस्कार ${audience || 'मित्रहो'},`;
      opening = `आम्ही आपणास ${mainTopic} बाबतची अधिकृत माहिती देत आहोत.\n\n${summary}`;
      factsHeading = `सत्यापित प्रमुख मुद्दे:`;
      cta = `पुढील पाऊल: कृपया वरील माहितीची खात्री करून आवश्यक ती कार्यवाही करावी.${deadline}`;
      closing = `आपला नम्र,\nइन्फोफ्लिप संप्रेषण कक्ष`;
    }

    const content = `${subject}\n${preview}\n\n${greeting}\n\n${opening}\n\n${factsHeading}\n${factsBullets}\n\n${cta}\n\n${closing}`;

    return {
      title: 'Email Newsletter / Dispatch',
      content,
      structuredData: {
        subject: subject.replace('Subject: ', ''),
        previewText: preview.replace('Preview: ', ''),
        greeting,
        opening,
        keyFacts: keyFacts.slice(0, 4),
        cta,
        closing
      },
      traceability: keyFacts.slice(0, 4).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 5. SMS ALERT (< 160 chars)
  buildSMS({ mainTopic, keyFacts, dates, numbers, lang, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const firstFact = keyFacts[0] || 'Please review official notice.';
    const dateStr = dates.length > 0 ? ` by ${dates[0].date}` : '';

    let content = '';
    if (isHindi) {
      content = `सूचना: ${mainTopic}। ${firstFact.slice(0, 75)}। विवरण हेतु आधिकारिक पोर्टल देखें।`;
    } else if (isMarathi) {
      content = `सूचना: ${mainTopic}. ${firstFact.slice(0, 75)}. अधिक माहितीसाठी अधिकृत संकेतस्थळ पहा.`;
    } else {
      content = `ALERT: ${mainTopic}. ${firstFact.slice(0, 80)}${dateStr}. Refer to official guidelines for action.`;
    }

    // Keep under 160 characters if possible
    if (content.length > 160) {
      content = content.slice(0, 157) + '...';
    }

    return {
      title: 'SMS Alert Notification',
      content,
      structuredData: {
        characterCount: content.length,
        isUnderLimit: content.length <= 160
      },
      traceability: [{
        fact: firstFact,
        sourceId,
        origin: 'analysis.keyFacts'
      }]
    };
  }

  // 6. PUBLIC ANNOUNCEMENT
  buildAnnouncement({ mainTopic, summary, keyFacts, dates, urgency, lang, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const deadlineSection = dates.length > 0 
      ? `\n\n${isHindi ? 'लागू तिथियां / समय सीमा:' : isMarathi ? 'लागू तारखा / मुदत:' : 'EFFECTIVE TIMELINE & DATES:'}\n${dates.map(d => `• ${d.date}: ${d.context}`).join('\n')}` 
      : '';

    let titleText = `PUBLIC ANNOUNCEMENT: ${mainTopic.toUpperCase()}`;
    let overviewText = `FOR IMMEDIATE RELEASE / PUBLIC NOTICE\n\n${summary}`;
    let instructionsHeading = 'IMPORTANT PUBLIC INSTRUCTIONS:';
    let instructions = keyFacts.slice(0, 4).map((f, i) => `${i + 1}. ${f}`).join('\n');
    let advisoryNote = 'Issued for general public awareness. Please consult designated authorities for further verification.';

    if (isHindi) {
      titleText = `सार्वजनिक घोषणा: ${mainTopic}`;
      overviewText = `जनहित में जारी आधिकारिक सूचना\n\n${summary}`;
      instructionsHeading = 'नागरिकों के लिए महत्वपूर्ण निर्देश:';
      instructions = keyFacts.slice(0, 4).map((f, i) => `${i + 1}. ${f}`).join('\n');
      advisoryNote = 'यह सूचना जन-जागरूकता हेतु जारी की गई है। किसी भी संशय की स्थिति में अधिकृत स्रोत से पुष्टि करें।';
    } else if (isMarathi) {
      titleText = `सार्वजनिक घोषणा: ${mainTopic}`;
      overviewText = `जनहितार्थ अधिकृत सूचना\n\n${summary}`;
      instructionsHeading = 'नागरिकांसाठी महत्त्वाच्या सूचना:';
      instructions = keyFacts.slice(0, 4).map((f, i) => `${i + 1}. ${f}`).join('\n');
      advisoryNote = 'ही सूचना लोकजागृतीसाठी प्रसिद्ध केली आहे. अधिक माहितीसाठी अधिकृत विभागाशी संपर्क साधावा.';
    }

    const content = `========================================\n${titleText}\n========================================\n\n${overviewText}\n\n${instructionsHeading}\n${instructions}${deadlineSection}\n\n----------------------------------------\n${advisoryNote}`;

    return {
      title: 'Public Announcement Notice',
      content,
      structuredData: {
        headline: titleText,
        overview: summary,
        instructions: keyFacts.slice(0, 4),
        effectiveDates: dates
      },
      traceability: keyFacts.slice(0, 4).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 7. CALL-TO-ACTION (CTA) VARIANTS
  buildCTA({ mainTopic, keyFacts, dates, lang, sourceId }) {
    const isHindi = lang === 'Hindi';
    const isMarathi = lang === 'Marathi';

    const deadlineStr = dates.length > 0 ? ` (Deadline: ${dates[0].date})` : '';

    let v1 = `Primary Action: Review the latest guidance on ${mainTopic} and verify your readiness${deadlineStr}.`;
    let v2 = `Immediate Step: Check official requirements and download the verified documentation now.`;
    let v3 = `Community Share: Forward these verified facts to team members and impacted stakeholders.`;
    let v4 = `Urgent Follow-up: Confirm all pending actions before the scheduled cutoff window.`;

    if (isHindi) {
      v1 = `मुख्य कदम: ${mainTopic} संबंधी नवीनतम निर्देशों की समीक्षा करें और पुष्टि करें${deadlineStr}।`;
      v2 = `तत्काल कदम: आधिकारिक आवश्यकताओं की जांच करें और सत्यापित जानकारी प्राप्त करें।`;
      v3 = `साझा करने हेतु: इस सत्यापित जानकारी को अपने सहयोगियों और प्रभावित लोगों तक पहुंचाएं।`;
      v4 = `समयबद्ध कदम: समय सीमा समाप्त होने से पूर्व आवश्यक कार्यवाही पूरी करें।`;
    } else if (isMarathi) {
      v1 = `मुख्य कृती: ${mainTopic} बाबत अधिकृत नियमावली तपासा आणि खात्री करा${deadlineStr}.`;
      v2 = `त्वरित कृती: अधिकृत अटींची पडताळणी करा आणि आवश्यक ती कागदपत्रे मिळवा.`;
      v3 = `माहिती शेअर करा: ही सत्यापित माहिती सर्व सहकारी आणि संबंधितांपर्यंत पोहोचवा.`;
      v4 = `मुदतपूर्व कृती: अंतिम मुदतीपूर्वी सर्व प्रलंबित कामे पूर्ण करा.`;
    }

    const variants = [v1, v2, v3, v4];
    const content = `ACTION-ORIENTED CALL-TO-ACTION VARIANTS (Grounded):\n\n${variants.map((v, i) => `Variant ${i + 1}:\n${v}`).join('\n\n')}`;

    return {
      title: 'Call-to-Action (CTA) Variants',
      content,
      structuredData: {
        variants: [
          { type: 'Primary', text: v1 },
          { type: 'Immediate', text: v2 },
          { type: 'Community', text: v3 },
          { type: 'Urgent', text: v4 }
        ]
      },
      traceability: keyFacts.slice(0, 2).map(f => ({
        fact: f,
        sourceId,
        origin: 'analysis.keyFacts'
      }))
    };
  }

  // 8. HASHTAG SUGGESTIONS
  buildHashtags({ mainTopic, analysis, entities, sourceId }) {
    const tagsSet = new Set();

    // From main topic
    const topicTag = '#' + mainTopic.replace(/[^a-zA-Z0-9]/g, '');
    if (topicTag.length > 2) tagsSet.add(topicTag);

    // From category / domain
    if (analysis.overview?.category) {
      tagsSet.add('#' + analysis.overview.category.replace(/[^a-zA-Z0-9]/g, ''));
    }

    // From keywords
    if (analysis.keywords?.primary && Array.isArray(analysis.keywords.primary)) {
      analysis.keywords.primary.slice(0, 4).forEach(k => {
        const clean = '#' + k.replace(/[^a-zA-Z0-9]/g, '');
        if (clean.length > 2) tagsSet.add(clean);
      });
    }

    // From organizations or locations
    if (entities.organizations && Array.isArray(entities.organizations)) {
      entities.organizations.slice(0, 2).forEach(o => {
        const clean = '#' + o.replace(/[^a-zA-Z0-9]/g, '');
        if (clean.length > 2) tagsSet.add(clean);
      });
    }

    // Core platform tags
    tagsSet.add('#VerifiedInfo');
    tagsSet.add('#PublicNotice');
    tagsSet.add('#InfoFlip');

    const tagsArray = Array.from(tagsSet).slice(0, 8);
    const content = `RECOMMENDED TOPIC HASHTAGS:\n\n${tagsArray.join(' ')}\n\n(Generated strictly from source topics, entities, and category)`;

    return {
      title: 'Relevant Hashtag Suggestions',
      content,
      structuredData: {
        tags: tagsArray,
        count: tagsArray.length
      },
      traceability: [{
        fact: `Keywords & Topics: ${mainTopic}`,
        sourceId,
        origin: 'analysis.keywords'
      }]
    };
  }
}
