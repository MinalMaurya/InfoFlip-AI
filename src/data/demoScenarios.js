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
    title: 'Heavy Rainfall Advisory & Flash Flood Warning',
    category: 'Disaster Management',
    sourceSnippet: 'Heavy rainfall is expected in several coastal and low-lying districts over the next 24 hours...',
    audience: 'General Public',
    tone: 'Urgent',
    language: 'English',
    formatsCount: 3,
    formats: ['Social Media Post', 'Short Brief', 'Email'],
    timestamp: '10 mins ago',
    verified: true
  },
  {
    id: 'hist-2',
    title: 'Public Health Vector-borne Prevention Notice',
    category: 'Public Health',
    sourceSnippet: 'With the seasonal change, the Public Health Department has issued a preventative advisory...',
    audience: 'General Public',
    tone: 'Informative',
    language: 'Hindi',
    formatsCount: 3,
    formats: ['Social Media Post', 'Awareness Message', 'Press Release'],
    timestamp: '1 hour ago',
    verified: true
  },
  {
    id: 'hist-3',
    title: 'New Citizen Electric Vehicle Subsidy Scheme',
    category: 'Governance & Policy',
    sourceSnippet: 'The State Department of Transportation has approved Phase 2 of the Green Mobility Subsidy for EV two-wheelers...',
    audience: 'Government Officials',
    tone: 'Formal',
    language: 'Marathi',
    formatsCount: 4,
    formats: ['Press Release', 'Short Brief', 'Social Media Post', 'Email'],
    timestamp: 'Yesterday',
    verified: true
  }
];
