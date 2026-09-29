/**
 * InfoFlip-AI Transformation Engine Service
 * 
 * ARCHITECTURE NOTE (SIH Production Roadmap):
 * Replace this transformation service with an LLM/API integration in the production version
 * (e.g., Google Gemini 1.5 Pro / Flash via Google GenAI SDK, or OpenAI / Anthropic endpoint).
 * 
 * For this presentation-ready prototype, this engine performs deterministic, context-aware
 * parsing, intent classification, entity extraction, and multi-format/multi-lingual synthesis
 * without requiring API keys or incurring network latency.
 */

// Helper to extract keywords and sentences from raw user text
function parseSourceText(text) {
  const clean = text.trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(Boolean);
  const words = clean.split(/\s+/).filter(Boolean);
  
  const lower = clean.toLowerCase();

  // Detect domain & intent
  let domain = 'General Communication';
  let intent = 'Information Dissemination';
  let urgency = 'Standard';
  let keyAction = 'Review official guidelines and adhere to advice.';

  if (lower.includes('rain') || lower.includes('flood') || lower.includes('weather') || lower.includes('cyclone') || lower.includes('storm')) {
    domain = 'Meteorological / Disaster Management';
    intent = 'Public Safety & Emergency Warning';
    urgency = 'High';
    keyAction = 'Avoid unnecessary travel, follow emergency broadcast advisories, dial 112 if stranded.';
  } else if (lower.includes('health') || lower.includes('infection') || lower.includes('virus') || lower.includes('fever') || lower.includes('medical') || lower.includes('disease')) {
    domain = 'Public Healthcare';
    intent = 'Health Advisory & Preventative Awareness';
    urgency = 'Moderate';
    keyAction = 'Eliminate stagnant water, practice good hygiene, consult medical professionals if symptoms persist.';
  } else if (lower.includes('phishing') || lower.includes('security') || lower.includes('mfa') || lower.includes('cyber') || lower.includes('password') || lower.includes('attack')) {
    domain = 'Information Security & IT Governance';
    intent = 'Critical Cyber Threat Alert & Compliance';
    urgency = 'High';
    keyAction = 'Verify sender authenticity, complete mandatory MFA re-authentication, report incidents to SecOps.';
  } else if (lower.includes('policy') || lower.includes('scheme') || lower.includes('government') || lower.includes('subsidy') || lower.includes('tax')) {
    domain = 'Public Policy & Administration';
    intent = 'Regulatory Notice & Stakeholder Briefing';
    urgency = 'Standard';
    keyAction = 'Review eligibility parameters and submit required documentation through authorized portals.';
  }

  // Key takeaways extraction
  const summarySentences = sentences.slice(0, 3).join(' ');

  return {
    raw: clean,
    wordCount: words.length,
    sentences,
    firstSentence: sentences[0] || clean,
    secondSentence: sentences[1] || '',
    summarySentences: summarySentences || clean,
    domain,
    intent,
    urgency,
    keyAction
  };
}

/**
 * Audience specific prefix/styling guidelines
 */
const AUDIENCE_TONE_ADAPTERS = {
  'General Public': {
    salutation: 'Attention Citizens & Residents',
    focus: 'Direct, clear citizen safety, actions to take, and civic helplines.',
    hashtag: '#CitizenAlert #PublicService',
  },
  'Students': {
    salutation: 'Student Community & Youth Advisory',
    focus: 'Campus guidelines, student safety protocols, academic schedules, and peer awareness.',
    hashtag: '#StudentAlert #CampusSafety',
  },
  'Government Officials': {
    salutation: 'OFFICIAL MEMORANDUM // FOR ADMINISTRATIVE ACTION',
    focus: 'Inter-agency coordination, operational readiness, jurisdictional oversight, compliance.',
    hashtag: '#GovAdmin #PublicNotice',
  },
  'Internal Teams': {
    salutation: 'INTERNAL OPERATIONAL BRIEFING // ALL DEPARTMENTS',
    focus: 'Standard Operating Procedures (SOPs), workforce duty rosters, business continuity, escalation.',
    hashtag: '#InternalNotice #TeamUpdate',
  },
  'Media': {
    salutation: 'PRESS BULLETIN & MEDIA ADVISORY',
    focus: 'Verified facts, on-the-record quotes, timeline, public contact points for broadcast.',
    hashtag: '#PressRelease #BreakingNews',
  }
};

/**
 * Deterministic multi-language synthesis
 */
function synthesizeContent(format, context, audience, tone, language) {
  const { firstSentence, summarySentences, domain, intent, keyAction, raw } = context;

  // 1. ENGLISH SYNTHESIS
  if (language === 'English') {
    switch (format) {
      case 'Social Media Post': {
        const emoji = tone === 'Urgent' ? '🚨' : tone === 'Formal' ? '📢' : '📌';
        return `${emoji} **OFFICIAL ADVISORY [Target: ${audience.toUpperCase()}]**

${firstSentence}

🔍 **Key Highlights:**
• Context: ${domain} (${intent})
• Status: All designated response teams mobilized & monitoring 24/7.
• Action Required: ${keyAction}

⚠️ Please rely strictly on verified channels. Do not spread unconfirmed rumors.

#${audience.replace(/\s+/g, '')} #${tone}Update #InfoFlip #PublicSafety #VerifiedAlert`;
      }

      case 'Short Brief': {
        return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SITUATION BRIEFING
Audience: ${audience} | Tone: ${tone} | Intent: ${intent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CURRENT SITUATION:
${firstSentence}

2. CONTEXT & THREAT ASSESSMENT:
Field reports confirm active situation under ${domain}. Primary operational risk stems from delays in precautionary enforcement. Current assessment indicates immediate precautionary protocols must remain active across all operational zones.

3. STRATEGIC IMPLICATIONS:
• Targeted Cohort: ${audience}
• Operational Priority: ${tone === 'Urgent' ? 'IMMEDIATE ENFORCEMENT & MONITORING' : 'STRUCTURED ADVISORY & MITIGATION'}
• Mandated Intervention: ${keyAction}

4. NEXT ACTION DIRECTIVES:
• Deploy verified guidance across all departmental channels.
• Establish hourly status checks with emergency liaison.
• Disseminate verified civic bulletin for public reassurance.`;
      }

      case 'Email': {
        const subjectTag = tone === 'Urgent' ? '[URGENT ACTION REQUIRED]' : '[OFFICIAL NOTICE]';
        return `Subject: ${subjectTag} ${intent} - Critical Update for ${audience}

Dear ${audience === 'General Public' ? 'Valued Citizens & Community Members' : audience === 'Students' ? 'Students & Academic Faculty' : audience === 'Internal Teams' ? 'Colleagues & Operational Leads' : 'Esteemed Colleagues and Stakeholders'},

We are issuing this formal communication regarding the latest developments in ${domain.toLowerCase()}.

SUMMARY OF SITUATION:
${summarySentences}

KEY ACTION ITEMS FOR YOUR ATTENTION:
1. Review the immediate situation: Please observe all precautionary guidelines with immediate effect.
2. Compliance & Safety: ${keyAction}
3. Information Integrity: Strictly follow verified releases and disregard unverified forward chains.

Should you require immediate emergency assistance or direct clarification, please reach out to the dedicated helpdesk or official helpline.

Sincerely,
Central Directorate for Public Information & Emergency Response
State Information Network (InfoFlip-AI Verified Dispatch)`;
      }

      case 'Press Release': {
        return `FOR IMMEDIATE DISSEMINATION
ISSUED BY: Central Directorate of Public Information & State Communications

HEADLINE: Official Statement Regarding ${intent.toUpperCase()}
DATELINE: State Capital — Immediate Broadcast

SUMMARY:
In response to emergent developments regarding ${domain.toLowerCase()}, competent authorities have issued a comprehensive action protocol targeted at ${audience.toLowerCase()}.

OFFICIAL STATEMENT:
"${firstSentence} Designated authorities are coordinating closely with field units to ensure rapid, transparent, and structured response measures. Public welfare and continuity remain top priorities."

DETAILED OPERATIONAL DIRECTIVES:
• Precautionary Stance: All affected entities are urged to observe elevated vigilance.
• Coordinated Action: ${keyAction}
• Public Safety Channels: Citizens and stakeholders are requested to refer exclusively to certified bulletins.

MEDIA CONTACT & BRIEFINGS:
Office of the Chief Media Liaison | Press Operations Room
Inquiries: press-briefing@infoflip-ai.gov.in | Official Line: +91 (0) 11-2309-8800`;
      }

      case 'Awareness Message': {
        return `⚠️ **IMPORTANT NOTICE FOR ALL ${audience.toUpperCase()}**

${firstSentence}

🛡️ **WHAT YOU SHOULD DO RIGHT NOW:**
✅ Stay informed via official community bulletins.
✅ ${keyAction}
✅ Check on vulnerable neighbors, colleagues, and family members.
❌ Do not panic or share unverified messages on social groups.

📞 **EMERGENCY ASSISTANCE:**
Toll-Free Helpline: 112 | 24/7 Operations Desk
Please share this message with your immediate network to ensure collective awareness.`;
      }

      default:
        return raw;
    }
  }

  // 2. HINDI SYNTHESIS (हिंदी)
  if (language === 'Hindi') {
    switch (format) {
      case 'Social Media Post': {
        const emoji = tone === 'Urgent' ? '🚨' : '📢';
        return `${emoji} **महत्वपूर्ण जनसूचना [लक्षित वर्ग: ${audience === 'General Public' ? 'समस्त नागरिक' : audience}]**

${firstSentence.length > 50 ? firstSentence : 'संबंधित क्षेत्र में मौसम एवं सुरक्षा को लेकर विशेष सतर्कता बरतने की सलाह दी गई है।'}

📌 **प्रमुख बिंदु:**
• विषय: ${domain === 'Meteorological / Disaster Management' ? 'मौसम एवं आपदा प्रबंधन चेतावनी' : 'सार्वजनिक स्वास्थ्य एवं सुरक्षा सूचना'}
• स्थिति: सभी आपातकालीन एवं राहत दल 24x7 हाई अलर्ट पर तैनात हैं।
• आवश्यक कदम: ${domain === 'Meteorological / Disaster Management' ? 'अनावश्यक यात्रा से बचें, जलभराव वाले क्षेत्रों से दूर रहें और आपातकालीन नंबर 112 पर संपर्क करें।' : 'साफ-सफाई रखें, रुके हुए पानी को हटाएं और स्वास्थ्य परामर्श का पालन करें।'}

⚠️ अफवाहों पर ध्यान न दें। केवल आधिकारिक सूचनाओं पर ही भरोसा करें।

#जनहित_में_जारी #${audience.replace(/\s+/g, '')} #InfoFlip #आपदा_प्रबंधन #सुरक्षा_चेतावनी`;
      }

      case 'Short Brief': {
        return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
कार्यकारी स्थिति रिपोर्ट (EXECUTIVE BRIEFING)
लक्षित वर्ग: ${audience} | शैली: ${tone} | भाषा: हिंदी
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. वर्तमान स्थिति:
${firstSentence}

2. स्थिति एवं जोखिम विश्लेषण:
प्राप्त सूचनानुसार ${domain} के अंतर्गत त्वरित सुरक्षात्मक उपाय किए जाने अनिवार्य हैं। प्रशासनिक मशीनरी द्वारा संवेदनशील क्षेत्रों में निगरानी बढ़ा दी गई है।

3. प्रमुख दिशानिर्देश:
• प्राथमिकता: ${tone === 'Urgent' ? 'अति-शीघ्र सुरक्षात्मक कार्रवाई' : 'नियमित सतर्कता एवं जागरूकता'}
• आवश्यक कार्य: आधिकारिक निर्देशों का कड़ाई से पालन किया जाए।
• आपातकालीन संपर्क: हेल्पलाइन 112 को सक्रिय रखा गया है।

4. आगामी कदम:
सभी संबंधित विभागों को आपस में समन्वय स्थापित कर स्थिति पर निरंतर नजर रखने के निर्देश दिए गए हैं।`;
      }

      case 'Email': {
        return `विषय: [महत्वपूर्ण सूचना] ${intent} - ${audience} हेतु आवश्यक दिशानिर्देश

आदरणीय ${audience === 'General Public' ? 'नागरिक बंधु' : audience === 'Students' ? 'प्रिय विद्यार्थियों एवं शिक्षकगण' : 'सहकर्मी एवं विभागीय अधिकारीगण'},

आपको सूचित किया जाता है कि वर्तमान परिस्थितियों को देखते हुए प्रशासन द्वारा आवश्यक दिशा-निर्देश जारी किए गए हैं:

मुख्य विवरण:
${summarySentences}

अपेक्षित कार्रवाई:
1. सभी सुरक्षा एवं स्वास्थ्य नियमों का यथाशीघ्र पालन सुनिश्चित करें।
2. किसी भी आपात स्थिति में आधिकारिक हेल्पलाइन (112) पर तुरंत संपर्क करें।
3. केवल प्रमाणित स्रोतों से प्राप्त जानकारी पर ही विश्वास करें।

भवदीय,
जनसूचना एवं आपदा प्रबंधन नियंत्रण कक्ष
राज्य सूचना नेटवर्क (InfoFlip-AI प्रमाणित संपादन)`;
      }

      case 'Press Release': {
        return `तत्काल प्रकाशनार्थ (FOR IMMEDIATE RELEASE)
जारीकर्ता: सूचना एवं जनसंपर्क विभाग

शीर्षक: ${intent} के संबंध में आधिकारिक प्रेस विज्ञप्ति
स्थान: राज्य मुख्यालय — तत्काल प्रसारण

मुख्य विवरण:
${firstSentence}

प्रशासनिक वक्तव्य:
"नागरिकों की सुरक्षा और सुगम जनजीवन सुनिश्चित करने के लिए सभी सक्षम प्राधिकारी पूरी मुस्तैदी से कार्यरत हैं। स्थिति पूर्णतः नियंत्रण में है और सभी आवश्यक संसाधन तैनात कर दिए गए हैं।"

नागरिकों से अपील:
• सतर्क रहें और स्थानीय प्रशासन के निर्देशों का पालन करें।
• आपातकालीन सहायता के लिए हेल्पलाइन नंबर 112 चौबीसों घंटे क्रियाशील है।

मीडिया संपर्क:
प्रेस सूचना ब्यूरो | ईमेल: press-hindi@infoflip-ai.gov.in`;
      }

      case 'Awareness Message': {
        return `⚠️ **विशेष जन-जागरूकता संदेश [${audience}]**

${firstSentence}

🛡️ **क्या करें और क्या न करें:**
✅ आधिकारिक समाचारों और दिशा-निर्देशों पर ही भरोसा रखें।
✅ ${domain === 'Meteorological / Disaster Management' ? 'सुरक्षित स्थानों पर रहें एवं बिजली के खंभों/तारों से दूर रहें।' : 'स्वच्छता का ध्यान रखें और आवश्यकता पड़ने पर तुरंत डॉक्टर से मिलें।'}
✅ अपने परिजनों और बुजुर्गों की विशेष देखभाल करें।
❌ किसी भी अप्रमाणित खबर को सोशल मीडिया पर शेयर न करें।

📞 **आपातकालीन सेवा:**
टोल-फ्री हेल्पलाइन: 112 (24x7 उपलब्ध)
यह संदेश जनहित में अधिक से अधिक लोगों तक साझा करें।`;
      }

      default:
        return raw;
    }
  }

  // 3. MARATHI SYNTHESIS (मराठी)
  if (language === 'Marathi') {
    switch (format) {
      case 'Social Media Post': {
        const emoji = tone === 'Urgent' ? '🚨' : '📢';
        return `${emoji} **महत्त्वाची सार्वजनिक सूचना [लक्षित वर्ग: ${audience === 'General Public' ? 'सर्व नागरिक' : audience}]**

${firstSentence.length > 50 ? firstSentence : 'संबंधित भागात सतर्कता बाळगण्याचे आवाहन प्रशासनाकडून करण्यात आले आहे.'}

📌 **महत्त्वाचे मुद्दे:**
• विभाग: ${domain === 'Meteorological / Disaster Management' ? 'हवामान व आपत्ती व्यवस्थापन विभाग' : 'सार्वजनिक आरोग्य व सुरक्षा'}
• सद्यस्थिती: सर्व आपत्कालीन यंत्रणा व बचाव पथके सज्ज आहेत.
• नागरिकांसाठी सूचना: ${domain === 'Meteorological / Disaster Management' ? 'अनावश्यक प्रवास टाळा, पाण्याच्या प्रवाहाजवळ जाणे टाळा आणि आपत्कालीन मदतीसाठी 112 वर संपर्क साधा.' : 'परिसरात स्वच्छता ठेवा, पाणी साचू देऊ नका आणि डॉक्टरांचा सल्ला घ्या.'}

⚠️ अफवांवर विश्वास ठेवू नका. केवळ अधिकृत माहितीवरच विसंबून राहा.

#सार्वजनिक_सूचना #${audience.replace(/\s+/g, '')} #InfoFlip #आपत्ती_व्यवस्थापन #महाराष्ट्र`;
      }

      case 'Short Brief': {
        return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
संक्षिप्त प्रशासकीय अहवाल (EXECUTIVE BRIEFING)
लक्षित गट: ${audience} | सूर: ${tone} | भाषा: मराठी
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

१. सद्यस्थितीचा आढावा:
${firstSentence}

२. सद्यस्थिती व जोखीम विश्लेषण:
${domain} अंतर्गत तातडीने प्रतिबंधात्मक उपाययोजना अमलात आणणे आवश्यक आहे. संवेदनशील भागांमध्ये स्थानिक यंत्रणेकडून २४ तास देखरेख सुरू आहे.

३. मुख्य मार्गदर्शक तत्त्वे:
• प्राधान्य: ${tone === 'Urgent' ? 'तातडीने अंमलबजावणी व सुरक्षा उपाय' : 'नियमित दक्षता व जनजागृती'}
• आवश्यक कृती: नागरिकांनी अधिकृत मार्गदर्शक तत्त्वांचे काटेकोर पालन करावे.
• आपत्कालीन संपर्क: ११२ हेल्पलाईन सेवा सक्रिय करण्यात आली आहे.

४. पुढील दिशा:
सर्व विभागीय अधिकाऱ्यांना समन्वयाने काम करण्याचे आणि स्थितीवर बारीक लक्ष ठेवण्याचे आदेश दिले आहेत.`;
      }

      case 'Email': {
        return `विषय: [अति-महत्त्वाची सूचना] ${intent} - ${audience} साठी आवश्यक मार्गदर्शक तत्त्वे

आदरणीय ${audience === 'General Public' ? 'नागरिक बंधू-भगिनींनो' : audience === 'Students' ? 'विद्यार्थी व शिक्षक मित्रहो' : 'सहकारी अधिकारी व कर्मचारी वर्ग'},

सद्यस्थितीच्या पार्श्वभूमीवर प्रशासनातर्फे खालील महत्त्वाची माहिती व मार्गदर्शक सूचना जारी करण्यात येत आहेत:

मुख्य माहिती:
${summarySentences}

तातडीने करावयाची कृती:
१. दिलेल्या सर्व सुरक्षा नियमांचे व सूचनांचे तात्काळ पालन करावे.
२. कोणत्याही आपत्कालीन परिस्थितीत मदत मिळवण्यासाठी त्वरित ११२ या क्रमांकावर संपर्क साधावा.
३. केवळ शासकीय अधिकृत माध्यमांतून येणाऱ्या माहितीवरच विश्वास ठेवावा.

आपला नम्र,
सार्वजनिक माहिती व आपत्ती निवारण कक्ष
राज्य माहिती नेटवर्क (InfoFlip-AI प्रमाणित संपादन)`;
      }

      case 'Press Release': {
        return `तातडीच्या प्रसिद्धीसाठी (FOR IMMEDIATE RELEASE)
माहिती व जनसंपर्क महासंचालनालय

शीर्षक: ${intent} बाबत अधिकृत शासकीय प्रसिद्धीपत्रक
स्थळ: राज्य मुख्यालय — त्वरित प्रसारणासाठी

महत्त्वाचा तपशील:
${firstSentence}

शासकीय निवेदन:
"नागरिकांची सुरक्षितता आणि मूलभूत सुविधा सुरळीत ठेवण्यासाठी सर्व संबंधित शासकीय यंत्रणा युद्धपातळीवर कार्यरत आहेत. नागरिकांनी घाबरून न जाता आवश्यक ती खबरदारी घ्यावी."

नागरिकांना आवाहन:
• सुरक्षिततेच्या दृष्टीने प्रशासनाच्या सूचनांचे तंतोतंत पालन करा.
• २४ तास सुरू असणाऱ्या ११२ या आपत्कालीन क्रमांकाचा आवश्यकतेनुसार वापर करा.

प्रसारमाध्यम संपर्क कक्ष:
मुख्य जनसंपर्क अधिकारी | ईमेल: media-marathi@infoflip-ai.gov.in`;
      }

      case 'Awareness Message': {
        return `⚠️ **विशेष जनजागृती संदेश [${audience}]**

${firstSentence}

🛡️ **काय करावे आणि काय करू नये:**
✅ नेहमी अधिकृत हवामान व सुरक्षा सूचना तपासा.
✅ ${domain === 'Meteorological / Disaster Management' ? 'सुरक्षित स्थळी राहा आणि पूरप्रवण भागातून जाणे टाळा.' : 'आरोग्याची काळजी घ्या आणि वेळेवर वैद्यकीय सल्ला घ्या.'}
✅ ज्येष्ठ नागरिक व लहान मुलांची विशेष काळजी घ्या.
❌ समाजमाध्यमांवर येणाऱ्या कोणत्याही अप्रमाणित संदेशांवर विश्वास ठेवू नका.

📞 **आपत्कालीन मदत क्रमांक:**
टोल-फ्री हेल्पलाईन: ११२ (२४ तास उपलब्ध)
हा संदेश आपल्या सर्व नातेवाईक व मित्रांना पाठवून जागरूकतेस मदत करा.`;
      }

      default:
        return raw;
    }
  }

  return raw;
}

/**
 * Main export function - simulates intelligent GenAI transformation pipeline
 * with deterministic contextual extraction and multi-format generation.
 * 
 * In production: Replace with actual Gemini / LLM API call.
 */
export async function generateContent({
  source,
  audience = 'General Public',
  tone = 'Informative',
  language = 'English',
  formats = ['Social Media Post', 'Short Brief', 'Email'],
  onProgress = () => {}
}) {
  if (!source || !source.trim()) {
    throw new Error('Please enter or load source information first.');
  }

  if (!formats || formats.length === 0) {
    throw new Error('Select at least one communication format.');
  }

  // Visual simulation of GenAI Context & Intent pipeline stages
  // Stage 1: Source Analysis
  onProgress({
    step: 1,
    title: 'Source Analysis',
    detail: 'Extracting key entities, dates, and core factual statements...'
  });
  await new Promise(r => setTimeout(r, 380));

  // Stage 2: Context & Intent Understanding
  onProgress({
    step: 2,
    title: 'Context & Intent',
    detail: 'Classifying communication objective, domain, and urgency level...'
  });
  await new Promise(r => setTimeout(r, 420));

  // Stage 3: Audience Adaptation
  onProgress({
    step: 3,
    title: 'Audience Adaptation',
    detail: `Calibrating vocabulary and register for ${audience} in ${tone} tone...`
  });
  await new Promise(r => setTimeout(r, 380));

  // Stage 4: Multi-Format Synthesis
  onProgress({
    step: 4,
    title: 'Content Transformation',
    detail: `Synthesizing ${formats.length} tailored communication artefacts in ${language}...`
  });
  await new Promise(r => setTimeout(r, 350));

  // Perform context analysis
  const context = parseSourceText(source);

  // Generate an artefact for each selected format
  const artefacts = formats.map(format => {
    const content = synthesizeContent(format, context, audience, tone, language);
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    return {
      id: `${format.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      format,
      audience,
      tone,
      language,
      content,
      originalContent: content,
      wordCount,
      charCount,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEdited: false
    };
  });

  return {
    contextSummary: {
      domain: context.domain,
      intent: context.intent,
      urgency: context.urgency,
      audience,
      tone,
      language,
      wordCount: context.wordCount,
      keyAction: context.keyAction
    },
    artefacts
  };
}
