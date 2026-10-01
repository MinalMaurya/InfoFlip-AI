import { validateFile } from '../utils/fileValidation.js';
import { extractContent } from '../utils/contentExtractor.js';
import { normalizeText, calculateTextMetrics } from '../utils/textNormalization.js';
import { createSourcePayload, SOURCE_TYPES } from '../types/source.js';

/**
 * Validates the raw input state before starting the extraction pipeline
 */
export function validateInput({ type, rawText, file }) {
  if (type === 'text') {
    if (!rawText || !rawText.trim()) {
      return {
        isValid: false,
        error: 'Please paste or type your source text before proceeding.'
      };
    }
    const clean = normalizeText(rawText);
    if (clean.length < 15) {
      return {
        isValid: false,
        error: 'Source text is too short. Please provide at least 15 characters for meaningful analysis.'
      };
    }
    return { isValid: true, error: null };
  }

  if (type === 'file' || type === 'image') {
    if (!file) {
      return {
        isValid: false,
        error: `Please select or upload an ${type === 'image' ? 'image' : 'file'} first.`
      };
    }
    return validateFile(file);
  }

  return { isValid: false, error: 'Unknown input type specified.' };
}

/**
 * Ingestion Pipeline Orchestrator (Module 1)
 * 
 * Flow:
 * User Input -> Validate -> Extract -> Normalize -> Prepare Structured Data Contract -> Handoff to Module 2
 */
export async function processIngestion({
  type = 'text',
  rawText = '',
  file = null,
  onProgress = () => {}
}) {
  // Step 1: Validate Input
  onProgress({
    step: 1,
    stage: 'validating',
    title: 'Validating Input',
    detail: 'Verifying input format, payload boundaries, and security parameters...'
  });
  await new Promise((r) => setTimeout(r, 220));

  const validation = validateInput({ type, rawText, file });
  if (!validation.isValid) {
    throw new Error(validation.error || 'Input validation failed.');
  }

  // Step 2: Extract Content
  onProgress({
    step: 2,
    stage: 'extracting',
    title: 'Extracting Content',
    detail: type === 'text' 
      ? 'Parsing text buffer, tokenizing paragraphs and sentences...'
      : `Reading binary stream for ${file?.name || 'document'} and parsing content layers...`
  });
  await new Promise((r) => setTimeout(r, 340));

  let extracted;
  try {
    extracted = await extractContent({
      file,
      type: type === 'text' ? 'text' : (validation.fileType || type),
      rawText
    });
  } catch (err) {
    throw new Error(`Content extraction failed: ${err.message || 'Could not parse content.'}`);
  }

  // Step 3: Normalize Content
  onProgress({
    step: 3,
    stage: 'normalizing',
    title: 'Normalizing Content',
    detail: 'Standardizing whitespace, encoding, and calculating structural metrics...'
  });
  await new Promise((r) => setTimeout(r, 280));

  const cleanText = normalizeText(extracted.text);
  const metrics = calculateTextMetrics(cleanText);

  // Step 4: Package Structured Data Contract
  onProgress({
    step: 4,
    stage: 'packaging',
    title: 'Preparing AI Analysis Payload',
    detail: 'Packaging standardized source contract ready for Module 2...'
  });
  await new Promise((r) => setTimeout(r, 240));

  const contract = createSourcePayload({
    sourceType: type === 'text' ? SOURCE_TYPES.TEXT : (validation.fileType || type),
    fileName: file ? file.name : null,
    fileSize: file ? file.size : new Blob([rawText]).size,
    mimeType: file ? file.type : 'text/plain',
    rawText: rawText || extracted.rawText || cleanText,
    extractedText: cleanText,
    imageData: extracted.imageData || null,
    metadata: {
      ...metrics,
      ...(extracted.metadata || {}),
      originType: type,
      sourceOrigin: file ? 'upload' : 'pasted_text'
    }
  });

  return contract;
}

/**
 * Pre-packaged demo presets for instant UI testing and demonstration
 */
export const SAMPLE_PRESETS = {
  pdf: {
    fileName: 'IMD-Special-Severe-Weather-Advisory-2026.pdf',
    fileSize: 2457600, // 2.4 MB
    mimeType: 'application/pdf',
    sourceType: 'pdf',
    text: `INDIA METEOROLOGICAL DEPARTMENT (IMD)
SPECIAL SEVERE WEATHER WARNING & FLASH FLOOD ADVISORY
BULLETIN NO: IMD/NDRF/SOP-449/2026

1. SYNOPTIC SITUATION & SATELLITE SUMMARY:
A deep depression over the central maritime basin has intensified into a severe cyclonic storm moving northwestward at 18 km/h. Doppler Weather Radar observations indicate heavy precipitable cloud clusters extending 250 km from the center.

2. METEOROLOGICAL PREDICTIONS:
• Sustained wind speeds: 85 to 105 km/h with gusts touching 120 km/h across coastal districts over the next 24 to 36 hours.
• Inundation Risk: Storm surge of 1.5 to 2.2 meters above astronomical tide likely to inundate low-lying coastal belts.
• Rainfall Quantities: Extremely heavy rainfall (exceeding 210 mm) forecasted across 8 key administrative zones.

3. DIRECTIVES FOR PUBLIC SAFETY & EMERGENCY AUTHORITIES:
• Total suspension of fishing, small craft maritime operations, and recreational water activities with immediate effect.
• Coastal district administrations are instructed to activate emergency shelters, pre-position NDRF and SDRF battalions, and stock potable water, chlorine tablets, and dry rations.
• General public is strongly advised to stay indoors, secure loose rooftop fixtures, keep battery-operated radios accessible, and avoid waterlogged roads or live electricity poles.
• For immediate evacuation support and medical transport, dial National Emergency Helpline 112.`,
    metadata: {
      wordCount: 224,
      characterCount: 1420,
      pageCount: 3,
      detectedLanguage: 'English'
    }
  },

  docx: {
    fileName: 'Directorate-Public-Health-Dengue-Protocol-2026.docx',
    fileSize: 1536000, // 1.5 MB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sourceType: 'docx',
    text: `DIRECTORATE GENERAL OF HEALTH SERVICES (DGHS)
PUBLIC HEALTH OPERATIONAL DIRECTIVE ON VECTOR-BORNE EPIDEMIC PREVENTION
DOCUMENT REF: DGHS/COMM-MED/2026/V4

BACKGROUND & CLINICAL SITUATION:
Surveillance data from primary health centers indicates a 42% week-on-week surge in acute febrile illness and suspected Dengue/Chikungunya transmissions across suburban municipal wards.

PRIMARY TRANSMISSION VECTORS:
Breeding of Aedes aegypti has been confirmed in discarded plastic containers, overhead construction tanks, and rooftop air coolers displaying water stagnation exceeding 72 hours.

MANDATED ADMINISTRATIVE & COMMUNITY INTERVENTIONS:
1. Intensive source reduction: Municipal sanitary workers shall conduct mandatory door-to-door larval surveys and larvicidal spraying every Tuesday and Friday.
2. Clinical management: District hospitals must maintain dedicated fever triage desks, reserve minimum 25% pediatric beds, and stock adequate platelets and IV fluids.
3. Citizen awareness: Citizens are advised to wear full-sleeve protective clothing, use DEET-based mosquito repellents, drain all water collection vessels every Sunday ("Dry Day"), and avoid self-medicating with aspirin or ibuprofen. Consult certified medical practitioners upon onset of high fever or joint pain.`,
    metadata: {
      wordCount: 185,
      characterCount: 1280,
      pageCount: 2,
      detectedLanguage: 'English'
    }
  },

  image: {
    fileName: 'Satellite-Storm-Track-Radar-Overlay.png',
    fileSize: 3145728, // 3.1 MB
    mimeType: 'image/png',
    sourceType: 'image',
    dimensions: { width: 1920, height: 1080, aspectRatio: '1.78' },
    // A clean SVG data-url representation for visual preview
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%230f172a"/><circle cx="400" cy="225" r="140" fill="none" stroke="%236366f1" stroke-width="4" stroke-dasharray="8 8"/><circle cx="400" cy="225" r="80" fill="%23ec4899" fill-opacity="0.25" stroke="%23ec4899" stroke-width="3"/><circle cx="400" cy="225" r="24" fill="%23ef4444"/><text x="400" y="390" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">IMD DOPPLER RADAR TRACK: CYCLONE ADVISORY 2026</text><text x="400" y="415" font-family="system-ui, sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Coordinates: 17.8°N 83.3°E | Eye Velocity: 95 km/h | Alert Level: Severe</text></svg>`,
    text: `[Visual Satellite & Doppler Radar Image Ingested]
File: Satellite-Storm-Track-Radar-Overlay.png
Resolution: 1920 × 1080 px (16:9 widescreen)
Visual Attributes: High-intensity precipitation band detected across coastal quadrant. Central low-pressure eye localized at 17.8°N 83.3°E. Multimodal Vision Pipeline primed for feature vectorization.`,
    metadata: {
      wordCount: 42,
      characterCount: 310,
      dimensions: { width: 1920, height: 1080, aspectRatio: '1.78' },
      detectedLanguage: 'English'
    }
  }
};
