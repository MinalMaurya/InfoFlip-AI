import { 
  validateExportPackage, 
  prepareExportItems, 
  generateTXT, 
  generateJSON, 
  generatePDF, 
  generatePackage, 
  copyAll, 
  copyItem, 
  createExportManifest, 
  getExportSummary, 
  generateFileName, 
  sanitizeFileName 
} from '../services/export/exportService.js';

import { 
  createExportPackage, 
  createExportItem, 
  createExportResult, 
  EXPORT_STATUSES, 
  EXPORT_FORMATS 
} from '../types/export.js';

import { 
  getExportFormatById, 
  getAllExportFormats, 
  isExportFormatSupported 
} from '../services/export/exportFormatRegistry.js';

import { prepareModule6ExportPackage } from '../services/review/reviewService.js';
import { createReviewResult, APPROVAL_STATUSES, CHECK_STATUSES } from '../types/review.js';

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
console.log('🧪 RUNNING MODULE 6 VERIFICATION SUITE');
console.log('========================================\n');

// Sample Base Data matching prompt verified state
const samplePackage = {
  exportId: 'pkg-exp-1790954357435-ytl3v',
  sourceId: 'src-1790954097105-ydu3f',
  analysisId: 'ana-1790954097105',
  transformationId: 'trans-1790954097105',
  communicationId: 'comm-1790954097105',
  approvedOutputs: [
    {
      outputId: 'out-linkedin-1',
      channelId: 'linkedin',
      title: 'LinkedIn Advisory Update',
      content: 'IMD Severe Cyclonic Storm Advisory: Coastal operations suspended. Sustained winds of 85 to 105 km/h. Helpline: 112.',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      reviewer: 'Disaster Officer Sharma',
      reviewedAt: '2026-10-02T20:30:00.000Z',
      reviewerNotes: 'Verified against IMD bulletin. Approved.',
      metadata: { wordCount: 18, characterCount: 122, provider: 'gemini', isFallback: false },
      sourceTraceability: [{ fact: 'Helpline: 112', similarity: 1.0 }]
    },
    {
      outputId: 'out-twitter-1',
      channelId: 'twitter',
      title: 'X / Twitter Alert',
      content: '⚠️ Severe Cyclonic Storm Advisory: Winds 85-105 km/h expected. Coastal operations suspended. Call 112 for help. #CycloneAlert',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      reviewer: 'Disaster Officer Sharma',
      reviewedAt: '2026-10-02T20:31:00.000Z',
      reviewerNotes: 'Appropriate character count. Approved.',
      metadata: { wordCount: 18, characterCount: 126, provider: 'gemini', isFallback: false },
      sourceTraceability: []
    },
    {
      outputId: 'out-whatsapp-1',
      channelId: 'whatsapp',
      title: 'WhatsApp Emergency Notice',
      content: '🚨 *URGENT CYCLONE WARNING*\n\n• Winds: 85-105 km/h\n• Rain: >210 mm\n• Helpline: *112*',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      reviewer: 'Disaster Officer Sharma',
      reviewedAt: '2026-10-02T20:32:00.000Z',
      reviewerNotes: 'Clear scannability. Approved.',
      metadata: { wordCount: 12, characterCount: 88, provider: 'gemini', isFallback: false },
      sourceTraceability: []
    },
    {
      outputId: 'out-email-1',
      channelId: 'email',
      title: 'Official Email Bulletin',
      content: 'Subject: Severe Cyclone Warning\n\nDear Resident,\n\nPlease remain indoors. Winds of 85-105 km/h expected.\n\nCall 112 in emergency.',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      reviewer: 'Disaster Officer Sharma',
      reviewedAt: '2026-10-02T20:33:00.000Z',
      reviewerNotes: 'Complete message. Approved.',
      metadata: { wordCount: 19, characterCount: 133, provider: 'gemini', isFallback: false },
      sourceTraceability: []
    }
  ],
  reviewSummary: {
    qualityGate: 'PASSED',
    approvedCount: 4,
    rejectedCount: 0,
    warningCount: 0,
    failedCount: 0
  },
  config: {
    targetAudience: 'General Public',
    tone: 'Urgent',
    language: 'English'
  },
  createdAt: '2026-10-02T20:35:00.000Z'
};

async function runTests() {
  console.log('--- 1. Validation & Input Gating Tests ---');

  // 1. Valid Module 5 package accepted
  const validCheck = validateExportPackage(samplePackage);
  assert(validCheck.isValid === true, '1. Valid Module 5 export package is accepted');

  // 2. Empty approvedOutputs rejected
  const emptyApprovedCheck = validateExportPackage({
    ...samplePackage,
    approvedOutputs: []
  });
  assert(emptyApprovedCheck.isValid === false, '2. Package with empty approvedOutputs is rejected');

  // 3. Missing approvedOutputs rejected
  const missingApprovedCheck = validateExportPackage({
    ...samplePackage,
    approvedOutputs: null
  });
  assert(missingApprovedCheck.isValid === false, '3. Package with null approvedOutputs is rejected');

  // 4. Failed quality gate blocks export
  const failedQgCheck = validateExportPackage({
    ...samplePackage,
    reviewSummary: { qualityGate: 'FAILED' }
  });
  assert(failedQgCheck.isValid === false, '4. Failed quality gate strictly blocks export');

  // 5. Unapproved output cannot be exported
  const unapprovedCheck = validateExportPackage({
    ...samplePackage,
    approvedOutputs: [
      {
        outputId: 'out-unapproved',
        channelId: 'sms',
        status: 'PENDING_REVIEW',
        approvalStatus: 'PENDING_REVIEW'
      }
    ]
  });
  assert(unapprovedCheck.isValid === false, '5. Unapproved output status blocks export');

  // 6. Approved output is exportable
  const items = prepareExportItems(samplePackage);
  assert(items.length === 4, '6. prepareExportItems standardizes all 4 approved outputs');
  assert(items[0].status === 'APPROVED', '6.1 ExportItem marks status: APPROVED');

  console.log('\n--- 2. Multi-Format Deliverable Generation Tests ---');

  // 7. TXT generation
  const txtResult = generateTXT(samplePackage);
  assert(typeof txtResult === 'string' && txtResult.includes('INFOFLIP-AI'), '7.1 TXT generator produces text with brand header');
  assert(txtResult.includes('pkg-exp-1790954357435-ytl3v'), '7.2 TXT preserves exportId');
  assert(txtResult.includes('src-1790954097105-ydu3f'), '7.3 TXT preserves sourceId');
  assert(txtResult.includes('[1] LINKEDIN'), '7.4 TXT contains approved LinkedIn channel block');
  assert(txtResult.includes('AUDIT TRAIL & LINEAGE VERIFICATION'), '7.5 TXT contains audit trail section');

  // 8. JSON generation
  const jsonStr = generateJSON(samplePackage);
  const parsedJson = JSON.parse(jsonStr);
  assert(parsedJson.product === 'InfoFlip-AI', '8.1 JSON contains product key');
  assert(parsedJson.exportId === samplePackage.exportId, '8.2 JSON preserves exportId');
  assert(parsedJson.lineage.sourceId === samplePackage.sourceId, '8.3 JSON preserves lineage.sourceId');
  assert(parsedJson.approvedCount === 4, '8.4 JSON contains approvedCount = 4');
  assert(parsedJson.approvedOutputs.length === 4, '8.5 JSON contains all approvedOutputs');
  assert(parsedJson.exportMetadata.format === 'json', '8.6 JSON includes exportMetadata');

  // 9. PDF generation
  const pdfData = generatePDF(samplePackage);
  assert(typeof pdfData === 'string' && pdfData.startsWith('%PDF-1.4'), '9.1 PDF generator outputs standard %PDF-1.4 header');
  assert(pdfData.includes('INFOFLIP-AI'), '9.2 PDF includes brand title in text stream');
  assert(pdfData.includes('xref') && pdfData.includes('%%EOF'), '9.3 PDF includes cross-reference table and EOF marker');

  // 10. Package (ZIP) generation
  const zipBytes = generatePackage(samplePackage);
  assert(zipBytes instanceof Uint8Array, '10.1 Package generator outputs Uint8Array binary');
  assert(zipBytes.length > 100, '10.2 ZIP buffer size is substantive');
  // Check standard PK\x03\x04 signature
  const isZipHeader = zipBytes[0] === 0x50 && zipBytes[1] === 0x4B && zipBytes[2] === 0x03 && zipBytes[3] === 0x04;
  assert(isZipHeader, '10.3 ZIP buffer contains valid PKZip (PK\\x03\\x04) local file header');

  console.log('\n--- 3. Clipboard & Copy Functionality Tests ---');

  // 11. Copy All
  const copyAllResult = await copyAll(samplePackage);
  assert(copyAllResult.success === true, '11.1 copyAll executes successfully');
  assert(copyAllResult.text.includes('[LINKEDIN]'), '11.2 copyAll concatenates LinkedIn channel header');
  assert(copyAllResult.text.includes('[X / TWITTER]'), '11.3 copyAll concatenates Twitter channel header');
  assert(copyAllResult.text.includes('[WHATSAPP]'), '11.4 copyAll concatenates WhatsApp channel header');

  // 12. Copy individual
  const singleItem = samplePackage.approvedOutputs[0];
  const copyItemResult = await copyItem(singleItem);
  assert(copyItemResult.success === true, '12.1 copyItem executes successfully');
  assert(copyItemResult.text === singleItem.content, '12.2 copyItem copies exact single item content');

  console.log('\n--- 4. Lineage & Metadata Integrity Tests ---');

  // 13. Lineage preserved
  items.forEach((item, idx) => {
    assert(item.sourceId === samplePackage.sourceId, `13.${idx + 1} Item ${item.channelId} preserves sourceId`);
    assert(item.communicationId === samplePackage.communicationId, `13.${idx + 5} Item ${item.channelId} preserves communicationId`);
  });

  // 14. Export metadata preserved
  assert(items[0].wordCount === 18, '14.1 Preserves accurate wordCount');
  assert(items[0].characterCount === 122, '14.2 Preserves accurate characterCount');
  assert(items[0].provider === 'gemini', '14.3 Preserves provider telemetry');
  assert(items[0].reviewer === 'Disaster Officer Sharma', '14.4 Preserves reviewer identity');

  // 15. Correct filenames
  const txtName = generateFileName(samplePackage, 'txt');
  const jsonName = generateFileName(samplePackage, 'json');
  const pdfName = generateFileName(samplePackage, 'pdf');
  const zipName = generateFileName(samplePackage, 'package');
  const channelTxtName = generateFileName(samplePackage, 'txt', 'linkedin');

  assert(txtName === 'InfoFlip-AI-Export-pkg-exp-1790954357435-ytl3v.txt', '15.1 Generates expected TXT filename');
  assert(jsonName === 'InfoFlip-AI-Export-pkg-exp-1790954357435-ytl3v.json', '15.2 Generates expected JSON filename');
  assert(pdfName === 'InfoFlip-AI-Export-pkg-exp-1790954357435-ytl3v.pdf', '15.3 Generates expected PDF filename');
  assert(zipName === 'InfoFlip-AI-Export-pkg-exp-1790954357435-ytl3v.zip', '15.4 Generates expected ZIP package filename');
  assert(channelTxtName === 'InfoFlip-AI-linkedin-Approved.txt', '15.5 Generates expected single channel filename');

  console.log('\n--- 5. Edge Cases & Boundary Conditions ---');

  // 16. Empty content handling in individual copy
  const emptyCopy = await copyItem({ content: '' });
  assert(emptyCopy.success === false, '16. Empty content copy handled safely');

  // 17. Missing optional metadata handling
  const minimalPackage = {
    exportId: 'exp-min-1',
    sourceId: 'src-min-1',
    communicationId: 'comm-min-1',
    approvedOutputs: [
      {
        channelId: 'sms',
        content: 'Brief alert.',
        status: 'APPROVED'
      }
    ]
  };
  const minTxt = generateTXT(minimalPackage);
  assert(minTxt.includes('SMS') && minTxt.includes('Brief alert.'), '17. Minimal metadata generates valid TXT cleanly');

  // 18. Single approved channel package
  const singleChannelPkg = {
    ...samplePackage,
    approvedOutputs: [samplePackage.approvedOutputs[0]]
  };
  const singleCheck = validateExportPackage(singleChannelPkg);
  assert(singleCheck.isValid === true, '18. Package with single approved channel is valid');

  // 19. Export summary
  const summary = getExportSummary(samplePackage);
  assert(summary.exportId === samplePackage.exportId, '19.1 Summary returns accurate exportId');
  assert(summary.approvedCount === 4, '19.2 Summary returns approvedCount = 4');
  assert(summary.qualityGate === 'PASSED', '19.3 Summary returns qualityGate: PASSED');

  // 20. Manifest generation
  const manifest = createExportManifest(samplePackage);
  assert(manifest.product === 'InfoFlip-AI', '20.1 Manifest has product InfoFlip-AI');
  assert(manifest.items.length === 4, '20.2 Manifest contains all 4 items');

  // 21. Format registry tests
  const formats = getAllExportFormats();
  assert(formats.length === 4, '21.1 Format registry provides 4 formats (TXT, JSON, PDF, PACKAGE)');
  assert(isExportFormatSupported('txt') === true, '21.2 Format TXT is supported');
  assert(isExportFormatSupported('json') === true, '21.3 Format JSON is supported');
  assert(isExportFormatSupported('pdf') === true, '21.4 Format PDF is supported');
  assert(isExportFormatSupported('package') === true, '21.5 Format PACKAGE is supported');
  assert(isExportFormatSupported('unknown_xyz') === false, '21.6 Unknown format returns false');

  // 22. Export package immutability
  const originalApprovedLength = samplePackage.approvedOutputs.length;
  generateTXT(samplePackage);
  generateJSON(samplePackage);
  generatePDF(samplePackage);
  generatePackage(samplePackage);
  assert(samplePackage.approvedOutputs.length === originalApprovedLength, '22. Export generation does not mutate original package');

  // 23. Module 5 to Module 6 integration handoff
  const mockReview = createReviewResult({
    sourceId: 'src-m5-test',
    transformationId: 'trans-m5-test',
    analysisId: 'ana-m5-test',
    communicationId: 'comm-m5-test',
    reviewedOutputs: [
      {
        outputId: 'out-m5-1',
        channelId: 'announcement',
        title: 'Public Announcement',
        content: 'Official notice: Evacuation zones active.',
        overallStatus: CHECK_STATUSES.PASS,
        approvalStatus: APPROVAL_STATUSES.APPROVED,
        metadata: { wordCount: 5, characterCount: 40 }
      }
    ]
  });

  const m5HandoffPkg = prepareModule6ExportPackage(mockReview);
  assert(m5HandoffPkg !== null, '23.1 prepareModule6ExportPackage outputs valid package');
  assert(m5HandoffPkg.approvedOutputs.length === 1, '23.2 Handoff package contains 1 approved output');
  
  const m6Valid = validateExportPackage(m5HandoffPkg);
  assert(m6Valid.isValid === true, '23.3 Module 6 successfully validates Module 5 handoff package');

  const m6Txt = generateTXT(m5HandoffPkg);
  assert(m6Txt.includes('ANNOUNCEMENT'), '23.4 Module 6 delivers channel from real Module 5 handoff');

  console.log('\n========================================');
  console.log(`📊 MODULE 6 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in Module 6 test runner:', err);
  process.exit(1);
});
