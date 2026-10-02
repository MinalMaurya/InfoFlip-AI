export const DEMO_SCENARIOS = [
  {
    id: 'weather',
    title: 'Emergency: Heavy Rainfall Advisory',
    category: 'Public Safety',
    audience: 'General Public',
    tone: 'Urgent',
    language: 'English',
    selectedFormats: ['Social Media Post', 'Short Brief', 'Email'],
    source: `Heavy rainfall is expected in several coastal and low-lying districts over the next 24 hours. The Meteorological Department has issued an orange alert warning of localized flash floods, waterlogging, and travel disruptions. Authorities have advised citizens to avoid unnecessary travel, remain alert to local warnings, and strictly follow official emergency instructions. Emergency response teams (NDRF/SDRF) and municipal emergency units have been placed on 24x7 standby. Emergency helpline 112 is operational for assistance.`
  },
  {
    id: 'health',
    title: 'Public Health: Seasonal Disease Alert',
    category: 'Healthcare',
    audience: 'General Public',
    tone: 'Informative',
    language: 'Hindi',
    selectedFormats: ['Social Media Post', 'Awareness Message', 'Press Release'],
    source: `With the seasonal change, the Public Health Department has issued a preventative advisory regarding seasonal viral infections and vector-borne diseases. Healthcare facilities report an uptick in flu-like symptoms among children and senior citizens. Residents are advised to ensure no stagnant water accumulates around homes, maintain adequate hydration, use mosquito repellents, and consult registered medical practitioners promptly if fever persists beyond 48 hours. Free screening camps will operate across all civic primary health centres from this Monday.`
  },
  {
    id: 'security',
    title: 'Cybersecurity: Phishing Alert & MFA Enforcement',
    category: 'Internal Operations',
    audience: 'Internal Teams',
    tone: 'Formal',
    language: 'English',
    selectedFormats: ['Email', 'Short Brief', 'Social Media Post'],
    source: `The Information Security Operations Centre (ISOC) has detected an active credential phishing campaign targeting internal staff accounts. All employees must immediately verify sender addresses before clicking any external links or downloading unauthorized attachments. Multi-Factor Authentication (MFA) re-verification will be enforced across all enterprise cloud services starting at 18:00 hrs today. If any suspicious activity is noticed, report it immediately to the SecOps incident desk at extension #404.`
  }
];

export const INITIAL_HISTORY = [
  {
    id: 'hist-1',
    title: 'Severe Weather & Flash Flood Response',
    category: 'Disaster Management',
    sourceSnippet: 'Heavy rainfall is expected in several coastal and low-lying districts over the next 24 hours. The state disaster management agency urges citizens to avoid riverbeds...',
    source: DEMO_SCENARIOS[0].source,
    sourceId: 'src-1790954097105-ydu3f',
    exportId: 'pkg-exp-1790954357435-ytl3v',
    stage: '06 Export',
    approvedCount: 4,
    qualityGate: 'PASSED',
    exportStatus: 'Exported',
    audience: 'General Public',
    tone: 'Urgent',
    language: 'English',
    formatsCount: 4,
    formats: ['Social Media Post', 'Short Brief', 'Email', 'WhatsApp Broadcast'],
    timestamp: '10 mins ago',
    createdDate: 'Oct 02, 2026',
    verified: true
  },
  {
    id: 'hist-2',
    title: 'Public Health Vector-Borne Prevention Notice',
    category: 'Public Health',
    sourceSnippet: 'With the seasonal change, the Public Health Department has issued a preventative advisory on water containment...',
    source: DEMO_SCENARIOS[1].source,
    sourceId: 'src-1790954112344-abc21',
    exportId: 'pkg-exp-1790954388123-med99',
    stage: '06 Export',
    approvedCount: 3,
    qualityGate: 'PASSED',
    exportStatus: 'Exported',
    audience: 'General Public',
    tone: 'Informative',
    language: 'Hindi',
    formatsCount: 3,
    formats: ['Social Media Post', 'Awareness Message', 'Press Release'],
    timestamp: '1 hour ago',
    createdDate: 'Oct 02, 2026',
    verified: true
  },
  {
    id: 'hist-3',
    title: 'Green Mobility Electric Vehicle Subsidy Scheme',
    category: 'Governance & Policy',
    sourceSnippet: 'The State Department of Transportation has approved Phase 2 of the Green Mobility Subsidy for EV two-wheelers...',
    source: DEMO_SCENARIOS[0].source,
    sourceId: 'src-1790954203912-pol88',
    exportId: 'pkg-exp-1790954401923-ev771',
    stage: '06 Export',
    approvedCount: 4,
    qualityGate: 'PASSED',
    exportStatus: 'Exported',
    audience: 'Government Officials',
    tone: 'Formal',
    language: 'Marathi',
    formatsCount: 4,
    formats: ['Press Release', 'Short Brief', 'Social Media Post', 'Email'],
    timestamp: 'Yesterday',
    createdDate: 'Oct 01, 2026',
    verified: true
  }
];
