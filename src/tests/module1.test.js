import { validateFile, formatFileSize, getFileExtension } from '../utils/fileValidation.js';
import { normalizeText, calculateTextMetrics } from '../utils/textNormalization.js';
import { extractContent } from '../utils/contentExtractor.js';
import { processIngestion, validateInput, SAMPLE_PRESETS } from '../services/ingestionService.js';
import { createSourcePayload, MAX_FILE_SIZE_BYTES } from '../types/source.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n========================================');
console.log('🧪 RUNNING MODULE 1 VERIFICATION SUITE');
console.log('========================================\n');

// TEST SUITE 1: FILE VALIDATION
console.log('--- Suite 1: File Validation ---');
{
  // 1.1 Empty file
  const emptyFile = { name: 'empty.txt', size: 0, type: 'text/plain' };
  const resEmpty = validateFile(emptyFile);
  assert(!resEmpty.isValid, 'Rejects empty (0-byte) files');
  assert(resEmpty.error.includes('empty'), 'Returns friendly empty file error message');

  // 1.2 Oversized file (> 10MB)
  const bigFile = { name: 'huge.pdf', size: 11 * 1024 * 1024, type: 'application/pdf' };
  const resBig = validateFile(bigFile);
  assert(!resBig.isValid, 'Rejects files larger than 10MB');
  assert(resBig.error.includes('larger than 10 MB'), 'Returns friendly oversized error message');

  // 1.3 Unsupported extension
  const badFile = { name: 'malicious.exe', size: 1024, type: 'application/octet-stream' };
  const resBad = validateFile(badFile);
  assert(!resBad.isValid, 'Rejects unsupported file extensions (.exe)');
  assert(resBad.error.includes('Unsupported file type'), 'Returns friendly unsupported type error message');

  // 1.4 Valid PDF
  const pdfFile = { name: 'report.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' };
  const resPdf = validateFile(pdfFile);
  assert(resPdf.isValid, 'Accepts valid PDF under 10MB');
  assert(resPdf.fileType === 'pdf', 'Correctly resolves fileType as pdf');

  // 1.5 Valid DOCX
  const docxFile = { name: 'advisory.docx', size: 1024 * 500, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  const resDocx = validateFile(docxFile);
  assert(resDocx.isValid, 'Accepts valid DOCX under 10MB');
  assert(resDocx.fileType === 'docx', 'Correctly resolves fileType as docx');

  // 1.6 Valid Image
  const imgFile = { name: 'radar.png', size: 1024 * 800, type: 'image/png' };
  const resImg = validateFile(imgFile);
  assert(resImg.isValid, 'Accepts valid PNG image under 10MB');
  assert(resImg.fileType === 'image', 'Correctly resolves fileType as image');
}

// TEST SUITE 2: TEXT NORMALIZATION & METRICS
console.log('\n--- Suite 2: Text Normalization & Metrics ---');
{
  // 2.1 Whitespace and CRLF cleaning
  const messy = "  Headline with CRLF\r\n\r\n\r\n\r\nParagraph 2 with extra    spaces.\x00\x07  ";
  const cleaned = normalizeText(messy);
  assert(!cleaned.includes('\r'), 'Strips carriage returns (\\r)');
  assert(!cleaned.includes('\x00'), 'Strips unprintable control characters');
  assert(!cleaned.includes('\n\n\n'), 'Collapses excessive newlines');
  assert(cleaned.startsWith('Headline') && cleaned.endsWith('spaces.'), 'Trims boundary whitespace');

  // 2.2 Word and character counting
  const sample = "The quick brown fox jumps over the lazy dog. Severe storm alert issued.";
  const metrics = calculateTextMetrics(sample);
  assert(metrics.wordCount === 13, `Accurate word count (expected 13, got ${metrics.wordCount})`);
  assert(metrics.characterCount === sample.length, 'Accurate character count');
  assert(metrics.sentenceCount === 2, 'Accurate sentence count (2 sentences)');
  assert(metrics.readingTimeMinutes === 1, 'Estimated reading time calculated');

  // 2.3 Devanagari / Hindi / Marathi detection
  const hindiText = "मौसम विभाग ने भारी बारिश की चेतावनी जारी की है। नागरिकों को सतर्क रहने की सलाह दी जाती है।";
  const hindiMetrics = calculateTextMetrics(hindiText);
  assert(hindiMetrics.detectedLanguage === 'Hindi', 'Correctly identifies Hindi text');

  const marathiText = "हवामान विभागाने जोरदार पावसाचा इशारा दिला आहे. सर्व नागरिकांनी सुरक्षित ठिकाणी राहावे.";
  const marathiMetrics = calculateTextMetrics(marathiText);
  assert(marathiMetrics.detectedLanguage === 'Marathi', 'Correctly identifies Marathi text');
}

// TEST SUITE 3: DATA CONTRACT GENERATION
console.log('\n--- Suite 3: Data Contract Generation (Requirement 16) ---');
{
  const contract = createSourcePayload({
    sourceId: 'src-test-001',
    sourceType: 'pdf',
    fileName: 'weather_report.pdf',
    fileSize: 2457600,
    mimeType: 'application/pdf',
    rawText: 'IMD Severe Weather Warning Bulletin',
    extractedText: 'IMD Severe Weather Warning Bulletin. Heavy downpours expected along coastal line.',
    metadata: {
      pageCount: 3,
      detectedLanguage: 'English'
    }
  });

  assert(contract.sourceId === 'src-test-001', 'Includes sourceId');
  assert(contract.sourceType === 'pdf', 'Includes correct sourceType');
  assert(contract.fileName === 'weather_report.pdf', 'Includes fileName');
  assert(contract.fileSize === 2457600, 'Includes fileSize');
  assert(contract.mimeType === 'application/pdf', 'Includes mimeType');
  assert(typeof contract.extractedText === 'string', 'Includes extractedText string');
  assert(contract.metadata.wordCount > 0, 'Includes metadata.wordCount');
  assert(contract.metadata.characterCount > 0, 'Includes metadata.characterCount');
  assert(contract.metadata.pageCount === 3, 'Includes metadata.pageCount');
  assert(Boolean(contract.createdAt), 'Includes ISO 8601 createdAt timestamp');
}

// TEST SUITE 4: INGESTION PIPELINE ORCHESTRATION
console.log('\n--- Suite 4: Ingestion Pipeline Orchestrator ---');
{
  // 4.1 Empty text rejected
  const emptyValidation = validateInput({ type: 'text', rawText: '    ' });
  assert(!emptyValidation.isValid, 'Rejects empty text input');

  // 4.2 Too short text rejected
  const shortValidation = validateInput({ type: 'text', rawText: 'hi there' });
  assert(!shortValidation.isValid, 'Rejects text under 15 characters');

  // 4.3 Successful text ingestion
  const progressSteps = [];
  const validText = "Severe cyclonic storm alert: The national meteorological agency has issued an immediate red alert for all coastal districts. Fishermen are strictly advised not to venture into deep sea waters.";
  
  const contractResult = await processIngestion({
    type: 'text',
    rawText: validText,
    onProgress: (prog) => {
      progressSteps.push(prog.step);
    }
  });

  assert(contractResult.sourceType === 'text', 'Produces text source contract');
  assert(contractResult.extractedText.includes('cyclonic storm'), 'Extracted text preserved and normalized');
  assert(progressSteps.length === 4, `Progresses through all 4 ingestion stages (got ${progressSteps.length} stages)`);
}

// TEST SUITE 5: PRESETS INTEGRITY
console.log('\n--- Suite 5: Preloaded Presets Integrity ---');
{
  assert(Boolean(SAMPLE_PRESETS.pdf), 'PDF preset exists');
  assert(SAMPLE_PRESETS.pdf.fileName.endsWith('.pdf'), 'PDF preset filename is valid');
  assert(SAMPLE_PRESETS.pdf.text.length > 100, 'PDF preset text is rich');

  assert(Boolean(SAMPLE_PRESETS.docx), 'DOCX preset exists');
  assert(SAMPLE_PRESETS.docx.fileName.endsWith('.docx'), 'DOCX preset filename is valid');

  assert(Boolean(SAMPLE_PRESETS.image), 'Image preset exists');
  assert(SAMPLE_PRESETS.image.dimensions.width === 1920, 'Image preset has 1920px width');
  assert(SAMPLE_PRESETS.image.dataUrl.startsWith('data:image/'), 'Image preset has valid dataUrl');
}

console.log('\n========================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
