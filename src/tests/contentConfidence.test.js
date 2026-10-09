/**
 * InfoFlip-AI Content Confidence & Verification Regression Suite
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Verification Tests:
 * 1. AI-generated vs rule-based fallback labels
 * 2. Source-grounded but independently unverified claims labeled "Verification required" / "Source not independently verified"
 * 3. Unsupported and conflicting claims flagged as "Potential issue detected"
 * 4. Missing or ungrounded source references labeled "Unknown"
 * 5. Emergency high-risk vs ordinary claims classification
 * 6. Human review and override behavior (human approval does not falsely mark claim as INDEPENDENTLY_VERIFIED)
 * 7. Edit and regeneration preserving appropriate warnings
 * 8. Approved-only export behavior and audit metadata packaging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  CONTENT_STATUS_FLAGS, 
  CLAIM_VERIFICATION_STATUSES, 
  CLAIM_ORIGINS,
  CLAIM_VERIFICATION_STATES,
  CLAIM_RISK_LEVELS,
  HIGH_RISK_CLAIM_WARNING,
  EMERGENCY_ADVISORY_NOTICE,
  GENERAL_DISCLAIMER_TEXT, 
  UNVERIFIED_SOURCE_NOTICE,
  isHighRiskClaim, 
  classifyClaimOrigin, 
  getQualitativeConfidenceLabel,
  createStructuredClaim
} from '../types/contentConfidence.js';

import { 
  reviewCommunicationOutputs, 
  editOutput, 
  approveOutput, 
  rejectOutput, 
  regenerateOutputReview, 
  prepareModule6ExportPackage 
} from '../services/review/reviewService.js';

import { 
  CHECK_STATUSES, 
  APPROVAL_STATUSES 
} from '../types/review.js';

import { 
  validateExportPackage, 
  generateTXT, 
  generateJSON, 
  createExportManifest 
} from '../services/export/exportService.js';

import { DeterministicTransformer } from '../services/transformation/deterministicTransformer.js';
import { DeterministicNLPProvider } from '../services/ai/deterministicNLPProvider.js';
import { buildLinkedInPost } from '../services/communication/linkedInPostBuilder.js';
import { checkSafetyAndSensitivity } from '../services/review/safetyChecker.js';
import { checkHallucinations } from '../services/review/hallucinationChecker.js';
import { GeminiAIProvider } from '../services/ai/geminiProvider.js';

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

export async function runContentConfidenceTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING CONTENT CONFIDENCE & VERIFICATION SUITE');
  console.log('========================================\n');

  // ----------------------------------------------------
  // Suite 1: Content Status Flags Enum & Non-Interchangeability
  // ----------------------------------------------------
  console.log('--- Suite 1: Content Status Flags Definition & Distinctness ---');

  assert(CONTENT_STATUS_FLAGS.AI_GENERATED === 'AI-generated', '1.1 AI-generated status flag is defined');
  assert(CONTENT_STATUS_FLAGS.RULE_BASED_FALLBACK === 'Rule-based fallback', '1.2 Rule-based fallback status flag is defined');
  assert(CONTENT_STATUS_FLAGS.VERIFICATION_REQUIRED === 'Verification required', '1.3 Verification required status flag is defined');
  assert(CONTENT_STATUS_FLAGS.POTENTIAL_ISSUE_DETECTED === 'Potential issue detected', '1.4 Potential issue detected status flag is defined');
  assert(CONTENT_STATUS_FLAGS.HUMAN_REVIEWED === 'Human reviewed', '1.5 Human reviewed status flag is defined');
  assert(CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT === 'Approved for export', '1.6 Approved for export status flag is defined');

  // Verify non-interchangeability
  const allFlags = Object.values(CONTENT_STATUS_FLAGS);
  const uniqueFlags = new Set(allFlags);
  assert(uniqueFlags.size === 6, '1.7 All 6 content status flags are distinct and non-interchangeable');
  assert(CONTENT_STATUS_FLAGS.HUMAN_REVIEWED !== CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT, '1.8 Human reviewed is distinct from Approved for export');

  // ----------------------------------------------------
  // Suite 2: General Transparency Disclaimer
  // ----------------------------------------------------
  console.log('\n--- Suite 2: General Disclaimer Notice ---');
  const expectedNotice = 'AI-generated content may contain errors or outdated information. Verify important facts and sources before relying on or publishing this content.';
  assert(GENERAL_DISCLAIMER_TEXT === expectedNotice, '2.1 Disclaimer matches standard transparent wording');
  assert(UNVERIFIED_SOURCE_NOTICE === 'Source not independently verified.', '2.2 Unverified source notice is defined');

  // ----------------------------------------------------
  // Suite 3: High-Risk and Time-Sensitive Claims Classification
  // ----------------------------------------------------
  console.log('\n--- Suite 3: High-Risk & Time-Sensitive Claims Detection ---');

  // Weather alerts & warning levels
  assert(isHighRiskClaim('IMD issues Red Alert for coastal districts with heavy rainfall') === true, '3.1 Identifies weather red alert as high risk');
  assert(isHighRiskClaim('Severe cyclonic storm with wind speed of 105 km/h expected') === true, '3.2 Identifies cyclone and wind speed as high risk');
  assert(isHighRiskClaim('Precipitation exceeding 210 mm in the next 24 hours') === true, '3.3 Identifies heavy precipitation as high risk');

  // Emergency evacuations & deployments
  assert(isHighRiskClaim('NDRF teams deployed to evacuate low-lying coastal belts') === true, '3.4 Identifies evacuation directive as high risk');
  assert(isHighRiskClaim('Helpline number 112 is active for emergency rescue') === true, '3.5 Identifies emergency helpline 112 as high risk');
  assert(isHighRiskClaim('Quarantine and curfew orders enforced') === true, '3.6 Identifies curfew and quarantine orders as high risk');

  // Medical, financial, and legal
  assert(isHighRiskClaim('15 casualties and 40 hospital admissions reported') === true, '3.7 Identifies casualty and hospital claims as high risk');
  assert(isHighRiskClaim('Estimated damage loss exceeds 500 crore rupees') === true, '3.8 Identifies large monetary loss claims as high risk');
  assert(isHighRiskClaim('Section 144 imposed by district magistrate') === true, '3.9 Identifies legal restrictions as high risk');

  // Non-high-risk general claims
  assert(isHighRiskClaim('The company announced a productivity feature in its quarterly newsletter') === false, '3.10 General software announcement is not high risk');
  assert(isHighRiskClaim('Students gathered in the auditorium for the annual science seminar') === false, '3.11 General educational event is not high risk');
  assert(isHighRiskClaim('The new library collection offers diverse fiction titles') === false, '3.12 Routine general information is not high risk');

  // ----------------------------------------------------
  // Suite 4: Claim-Level Traceability & Origin Classification
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Claim-Level Origin & Traceability Categories ---');

  const sourceDoc = 'IMD Severe Cyclonic Storm Advisory: Sustained winds of 85 to 105 km/h expected. Coastal operations suspended. Emergency helpline: 112.';

  // 4.1 Extracted from source
  const claimInSource = { statement: 'Sustained winds of 85 to 105 km/h expected' };
  const originInSource = classifyClaimOrigin(claimInSource, sourceDoc);
  assert(originInSource === CLAIM_VERIFICATION_STATUSES.EXTRACTED_FROM_SOURCE, '4.1 Grounded source claim classified as Extracted from source');

  // 4.2 Inferred by AI
  const claimInferred = { statement: 'Local businesses may face temporary disruptions', type: 'ai-inferred' };
  const originInferred = classifyClaimOrigin(claimInferred, sourceDoc);
  assert(originInferred === CLAIM_VERIFICATION_STATUSES.INFERRED, '4.2 Model-derived statement classified as Inferred');

  // 4.3 Unknown / ungrounded claim
  const claimUnknown = { statement: 'Airport reopened and flights resumed normal operations' };
  const originUnknown = classifyClaimOrigin(claimUnknown, sourceDoc);
  assert(originUnknown === CLAIM_VERIFICATION_STATUSES.UNKNOWN, '4.3 Statement absent from source classified as Unknown');

  // 4.4 Missing source text produces Unknown
  const claimNoSource = { statement: 'Important official directive' };
  const originNoSource = classifyClaimOrigin(claimNoSource, '');
  assert(originNoSource === CLAIM_VERIFICATION_STATUSES.UNKNOWN, '4.4 Missing source text yields Unknown origin');

  // 4.5 Independently verified ONLY with proof
  const claimWithoutProof = { statement: 'Winds of 85 to 105 km/h', independentlyVerified: false };
  assert(classifyClaimOrigin(claimWithoutProof, sourceDoc) !== CLAIM_VERIFICATION_STATUSES.INDEPENDENTLY_VERIFIED, '4.5 Source-grounded claim is NOT marked Independently verified without proof');

  const claimWithRealProof = { 
    statement: 'Winds of 85 to 105 km/h', 
    independentlyVerified: true,
    verificationResult: { verified: true, verifier: 'Official Meteorological API' }
  };
  assert(classifyClaimOrigin(claimWithRealProof, sourceDoc) === CLAIM_VERIFICATION_STATUSES.INDEPENDENTLY_VERIFIED, '4.6 Claim with authentic verification record classified as Independently verified');

  // ----------------------------------------------------
  // Suite 5: Truthful Qualitative Confidence Metrics
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Truthful Qualitative Confidence Metrics ---');

  const highConf = getQualitativeConfidenceLabel(0.92);
  assert(highConf.label === 'High Model Inference Confidence', '5.1 Score 0.92 maps to High Model Inference Confidence');
  assert(!highConf.label.includes('100%'), '5.2 High confidence label never claims 100%');
  assert(!highConf.label.includes('Verified'), '5.3 High model score never claims factual verification');
  assert(highConf.note.includes('generation probability'), '5.4 Explains score is model inference probability, not factual truth');

  const medConf = getQualitativeConfidenceLabel(0.68);
  assert(medConf.label === 'Moderate Model Inference Confidence', '5.5 Score 0.68 maps to Moderate Model Inference Confidence');

  const lowConf = getQualitativeConfidenceLabel(0.35);
  assert(lowConf.label === 'Low Model Inference Confidence', '5.6 Score 0.35 maps to Low Model Inference Confidence');

  const nullConf = getQualitativeConfidenceLabel(null);
  assert(nullConf.label === 'Confidence Metric Not Available', '5.7 Null score handled safely without inventing percentages');

  // ----------------------------------------------------
  // Suite 6: Module 5 Review Workflow & Human Override Integrity
  // ----------------------------------------------------
  console.log('\n--- Suite 6: Module 5 Review Integration & Human Override ---');

  const testPayload = {
    communicationId: 'comm-conf-test-001',
    sourceId: 'src-conf-test-001',
    transformationId: 'trans-conf-test-001',
    analysisId: 'ana-conf-test-001',
    sourceContent: { rawText: sourceDoc },
    analysis: {
      importantNumbers: ['85', '105', '112'],
      importantDates: []
    },
    outputs: [
      {
        outputId: 'out-ai-item',
        channelId: 'linkedin',
        title: 'LinkedIn Advisory',
        content: 'IMD Advisory: Winds of 85 to 105 km/h expected. Coastal operations suspended. Emergency helpline: 112.',
        metadata: { provider: 'GeminiAIProvider', isFallback: false, isIndependentlyVerified: false },
        sourceTraceability: [
          { sourceSnippet: 'Winds of 85 to 105 km/h', generatedStatement: 'Winds of 85 to 105 km/h', similarity: 0.9 }
        ]
      },
      {
        outputId: 'out-fallback-item',
        channelId: 'twitter',
        title: 'X / Twitter Post',
        content: '⚠️ Alert: Cyclone expected with winds up to 105 km/h. Helpline 112.',
        metadata: { provider: 'DeterministicFallback', isFallback: true, isIndependentlyVerified: false },
        sourceTraceability: []
      },
      {
        outputId: 'out-unverified-warning-item',
        channelId: 'sms',
        title: 'SMS Notice',
        content: '100% verified cyclone alert with winds of 450 km/h hitting city on 2030-12-25. Visit https://unverified-relief.org',
        metadata: { provider: 'GeminiAIProvider', isFallback: false, isIndependentlyVerified: false },
        sourceTraceability: []
      }
    ],
    config: { targetAudience: 'General Public', tone: 'Urgent', language: 'English' }
  };

  const reviewResult = await reviewCommunicationOutputs(testPayload, { delayMs: 0 });
  assert(reviewResult.items.length === 3, '6.1 Reviews all 3 channel assets');

  const aiItem = reviewResult.items.find(i => i.outputId === 'out-ai-item');
  const fallbackItem = reviewResult.items.find(i => i.outputId === 'out-fallback-item');
  const warningItem = reviewResult.items.find(i => i.outputId === 'out-unverified-warning-item');

  assert(aiItem.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.AI_GENERATED, '6.2 AI item has AI-generated flag');
  assert(fallbackItem.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.RULE_BASED_FALLBACK, '6.3 Fallback item has Rule-based fallback flag');
  assert(aiItem.metadata.verificationStatus === 'Source not independently verified', '6.4 AI item labeled Source not independently verified');

  // Verify warnings on problematic item
  assert(warningItem.overallStatus === CHECK_STATUSES.WARNING, '6.5 Item with false verification & ungrounded numbers flagged with WARNING');

  // Human approval override test
  const approvedItem = approveOutput(warningItem, 'Human reviewer verified with local authority out-of-band');
  assert(approvedItem.approvalStatus === APPROVAL_STATUSES.APPROVED, '6.6 Human approval sets status to APPROVED');
  assert(approvedItem.approvalInfo.hasHumanOverride === true, '6.7 Audit trail flags hasHumanOverride = true for item with warnings');
  assert(approvedItem.approvalInfo.unresolvedWarnings.length > 0, '6.8 Unresolved warnings preserved in approval audit log');
  
  // CRITICAL: Human override does NOT falsify claim verification status
  assert(approvedItem.metadata.isIndependentlyVerified === false, '6.9 Human override does NOT falsely mark claim as independently verified in metadata');
  assert(approvedItem.approvalInfo.isIndependentlyVerified === false, '6.10 Human override does NOT falsely mark claim as independently verified in approvalInfo');
  assert(approvedItem.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT, '6.11 Approved item transitions to Approved for export flag');

  // Human edit revalidation test
  const editedItem = editOutput(
    warningItem,
    'Official Alert: Cyclone expected with winds of 85 to 105 km/h. Helpline: 112.',
    { sourceContent: testPayload.sourceContent, analysis: testPayload.analysis }
  );
  assert(editedItem.isEdited === true, '6.12 Item marked as edited');
  assert(editedItem.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.HUMAN_REVIEWED, '6.13 Edited item has Human reviewed flag');
  assert(editedItem.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, '6.14 Edited item resets to PENDING_REVIEW (does not bypass approval)');

  // Human rejection test
  const rejectedItem = rejectOutput(warningItem, 'Contains unverified claims and speculative dates');
  assert(rejectedItem.approvalStatus === APPROVAL_STATUSES.REJECTED, '6.15 Rejection sets status to REJECTED');
  assert(rejectedItem.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.POTENTIAL_ISSUE_DETECTED, '6.16 Rejected item flagged with Potential issue detected');

  // ----------------------------------------------------
  // Suite 7: Module 6 Approved-Only Export Gate & Audit Telemetry
  // ----------------------------------------------------
  console.log('\n--- Suite 7: Module 6 Approved-Only Export Gate & Audit Metadata ---');

  // 7.1 Export blocked when zero items approved
  let exportBlockedCaught = false;
  try {
    prepareModule6ExportPackage({
      ...reviewResult,
      items: reviewResult.items.map(i => ({ ...i, approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW }))
    });
  } catch (err) {
    exportBlockedCaught = true;
  }
  assert(exportBlockedCaught === true, '7.1 Module 6 export blocks packages with zero approved items');

  // 7.2 Export passes with approved items and packages audit trail
  const fullyApprovedItems = reviewResult.items.map((it, idx) => {
    if (idx === 0) return approveOutput(it, 'Passed human inspection');
    return it; // items 1 and 2 remain pending
  });

  const exportPackage = prepareModule6ExportPackage({
    ...reviewResult,
    reviewedOutputs: fullyApprovedItems,
    items: fullyApprovedItems
  });

  assert(exportPackage.approvedOutputs.length === 1, '7.2 Export package strictly contains only approved items (1 of 3)');
  assert(exportPackage.qualityGate.passed === true, '7.3 Quality gate passed for approved subset');

  // 7.3 Verification and audit metadata in exported items
  const exportValidation = validateExportPackage(exportPackage);
  assert(exportValidation.isValid === true, '7.4 Module 6 validator passes compliant export package');

  const exportedTxt = generateTXT(exportPackage);
  assert(exportedTxt.includes('Verification:'), '7.5 Exported TXT deliverable includes Verification telemetry');
  assert(exportedTxt.includes('Content Flag:'), '7.6 Exported TXT deliverable includes Content Flag telemetry');
  assert(exportedTxt.includes('CONTENT:'), '7.7 Clean content section remains unaltered');

  const exportedJson = JSON.parse(generateJSON(exportPackage));
  assert(Array.isArray(exportedJson.approvedOutputs) && exportedJson.approvedOutputs.length === 1, '7.8 Exported JSON contains approvedOutputs array');
  assert(exportedJson.approvedOutputs[0].verificationStatus === 'Source not independently verified', '7.9 Exported JSON preserves truthful verificationStatus');
  assert(exportedJson.approvedOutputs[0].contentStatusFlag === CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT, '7.10 Exported JSON preserves Approved for export flag');

  const manifest = createExportManifest(exportPackage);
  assert(manifest.approvedCount === 1, '7.11 Manifest reflects accurate approvedCount');
  assert(manifest.items[0].verificationStatus === 'Source not independently verified', '7.12 Manifest preserves truthful verificationStatus');

  // ----------------------------------------------------
  // Suite 8: Module 2 Grounding, Verification and Risk-Flag Scenarios
  // ----------------------------------------------------
  console.log('\n--- Suite 8: Module 2 Grounding, Verification and Risk-Flag Scenarios ---');

  // Scenario 1: Source-extracted claims are not automatically marked as independently verified
  const sourceDoc1 = 'India Meteorological Department reported sustained wind speeds reaching 105 km/h in coastal districts.';
  const claim1 = createStructuredClaim('Sustained wind speeds reaching 105 km/h in coastal districts.', sourceDoc1);
  assert(claim1.origin === CLAIM_ORIGINS.SOURCE_EXTRACTED, '8.1.1 Origin is source-extracted');
  assert(claim1.isIndependentlyVerified === false, '8.1.2 Source-extracted claim is NOT marked as independently verified');
  assert(claim1.verificationStatus === CLAIM_VERIFICATION_STATES.VERIFICATION_REQUIRED, '8.1.3 High-risk claim has status verification required');
  assert(claim1.verificationStatus !== CLAIM_VERIFICATION_STATES.VERIFIED, '8.1.4 Source extraction alone never produces Verified status');

  // Scenario 2: Model inference confidence is never displayed as factual accuracy
  const confScoreHigh = getQualitativeConfidenceLabel(0.96);
  assert(confScoreHigh.isCalibrated === false, '8.2.1 Confidence score is explicitly marked isCalibrated: false');
  assert(!confScoreHigh.label.includes('100%'), '8.2.2 Confidence label never contains 100%');
  assert(!confScoreHigh.label.includes('Accurate') && !confScoreHigh.label.includes('Verified'), '8.2.3 Confidence label never claims factual accuracy or verification');
  assert(confScoreHigh.note.includes('probability'), '8.2.4 Notes that score is generation probability, not factual truth');

  // Scenario 3: "Zero-hallucination verified extractions" string does not appear in codebase or UI
  let foundForbiddenString = false;
  const scanCodebase = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist') {
        scanCodebase(full);
      } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.jsx') || item.name.endsWith('.html') || item.name.endsWith('.json'))) {
        if (full === fileURLToPath(import.meta.url)) continue;
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes('Zero-hallucination verified extractions')) {
          foundForbiddenString = true;
        }
      }
    }
  };
  const rootSrcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  scanCodebase(rootSrcDir);
  assert(!foundForbiddenString, '8.3 "Zero-hallucination verified extractions" string does not appear in codebase or UI');

  // Scenario 4: Advisory containing "avoid unnecessary travel" does not generate "stay indoors" or mandatory evacuation instructions
  const transformer = new DeterministicTransformer();
  const stormSource = {
    sourceId: 'src-storm-travel-test',
    rawText: 'Severe storm alert: Residents are advised to avoid unnecessary travel on coastal highways.',
    extractedText: 'Severe storm alert: Residents are advised to avoid unnecessary travel on coastal highways.'
  };
  const stormAnalysis = {
    analysisId: 'ana-storm-travel-test',
    overview: { mainTopic: 'Severe Storm Alert', summary: 'Severe storm alert: Residents advised to avoid unnecessary travel.' },
    keyFacts: ['Residents advised to avoid unnecessary travel on coastal highways.'],
    urgency: { level: 'high', reasons: ['Severe storm alert'] },
    tone: { primary: 'Urgent' },
    intent: { primary: 'Advise' }
  };
  const advisoryRes = transformer.generateAdvisory(stormSource, stormAnalysis, { lang: 'English', audienceStr: 'Residents', tone: 'Urgent' });
  const serializedAdvisory = JSON.stringify(advisoryRes).toLowerCase();
  assert(!serializedAdvisory.includes('stay indoors'), '8.4.1 Advisory does not strengthen "avoid unnecessary travel" into "stay indoors"');
  assert(!serializedAdvisory.includes('mandatory evacuation'), '8.4.2 Advisory does not strengthen into "mandatory evacuation"');
  // Check that safetyChecker correctly catches any unauthorized strengthening if present
  const unauthorizedOutput = {
    content: '🚨 Severe Storm: You must stay indoors immediately and adhere to mandatory evacuation orders.',
    sourceContent: stormSource
  };
  const safetyRes = checkSafetyAndSensitivity(unauthorizedOutput, { sourceContent: stormSource });
  assert(safetyRes.status === CHECK_STATUSES.WARNING, '8.4.3 Safety checker flags unauthorized strengthening directives');
  assert(safetyRes.details.safetyAlerts.some(a => a.includes('stay indoors')), '8.4.4 Safety checker specifically detects "stay indoors" strengthening');

  // Scenario 5: Emergency telephone number (e.g. 112) extracted from source is not marked as independently verified without evidence
  const helplineClaim = createStructuredClaim(
    'Emergency helpline 112 is operational for rescue coordination.',
    'Notice: Emergency helpline 112 is operational for rescue coordination in coastal zones.'
  );
  assert(helplineClaim.origin === CLAIM_ORIGINS.SOURCE_EXTRACTED, '8.5.1 Emergency helpline claim origin is source-extracted');
  assert(helplineClaim.isIndependentlyVerified === false, '8.5.2 Emergency helpline is NOT marked independently verified without evidence');
  assert(helplineClaim.isHighRisk === true, '8.5.3 Helpline 112 is flagged as high-risk');
  assert(helplineClaim.warningNotice === HIGH_RISK_CLAIM_WARNING, '8.5.4 Helpline claim carries visible high-risk warning notice');

  // Scenario 6: Missing verification evidence cannot produce a "Verified" status
  const fabricatedAttempt = createStructuredClaim(
    { statement: 'Harbor gates closed by maritime port authority.', isIndependentlyVerified: true, verificationStatus: CLAIM_VERIFICATION_STATES.VERIFIED },
    'Harbor gates closed by maritime authority.',
    { isIndependentlyVerified: true } // Missing verificationEvidence
  );
  assert(fabricatedAttempt.isIndependentlyVerified === false, '8.6.1 Missing verification evidence forces isIndependentlyVerified to false');
  assert(fabricatedAttempt.verificationStatus !== CLAIM_VERIFICATION_STATES.VERIFIED, '8.6.2 Missing evidence cannot produce Verified status');
  assert(fabricatedAttempt.verificationEvidence === null, '8.6.3 Verification evidence is null when not authentically verified');

  // Scenario 7: Provenance and verification metadata survive through Modules 2 -> 3 -> 4 -> 5 -> 6
  // Module 2
  const pipelineClaim = createStructuredClaim('Storm surge reached 2.2 meters at high tide.', 'Storm surge reached 2.2 meters at high tide.');
  assert(pipelineClaim.origin === CLAIM_ORIGINS.SOURCE_EXTRACTED, '8.7.1 Module 2 produces source-extracted claim');
  assert(pipelineClaim.isIndependentlyVerified === false, '8.7.2 Module 2 records claim as unverified');

  // Module 3
  const transformedAdvisory = transformer.generateAdvisory(
    { rawText: 'Storm surge reached 2.2 meters at high tide.' },
    { overview: { mainTopic: 'Storm Surge' }, keyFacts: [pipelineClaim.claimText], claims: [pipelineClaim] },
    { lang: 'English', audienceStr: 'Public', tone: 'Urgent' }
  );
  assert(transformedAdvisory.verificationNotice.includes('Extracted from provided source'), '8.7.3 Module 3 preserves source-extracted notice');

  // Module 4
  const commPost = buildLinkedInPost({
    mainTopic: 'Storm Surge',
    summary: 'Storm surge reached 2.2 meters at high tide.',
    keyFacts: [pipelineClaim.claimText],
    analysis: { claims: [pipelineClaim], overview: { mainTopic: 'Storm Surge' } },
    rawText: 'Storm surge reached 2.2 meters at high tide.'
  });
  assert(commPost.content.includes('Key figures from the source') || !commPost.content.includes('Verified Key Metrics'), '8.7.4 Module 4 preserves truthful metric labeling');

  // Module 5
  const pipelineReview = await reviewCommunicationOutputs({
    outputs: [{
      outputId: 'out-pipe-e2e',
      channelId: 'linkedin',
      title: 'Storm Surge Notice',
      content: commPost.content,
      metadata: { provider: 'DeterministicFallback', isFallback: true, isIndependentlyVerified: false },
      sourceTraceability: [{ fact: pipelineClaim.claimText, sourceId: 'src-e2e' }]
    }],
    sourceContent: { rawText: 'Storm surge reached 2.2 meters at high tide.' }
  }, { delayMs: 0 });
  assert(pipelineReview.items[0].metadata.verificationStatus === 'Source not independently verified', '8.7.5 Module 5 flags unverified source status');

  // Module 6
  const approvedItem7 = approveOutput(pipelineReview.items[0], 'Human confirmed against source text');
  const e2ePackage = prepareModule6ExportPackage({
    ...pipelineReview,
    items: [approvedItem7],
    reviewedOutputs: [approvedItem7]
  });
  assert(e2ePackage.approvedOutputs[0].metadata?.verificationStatus === 'Source not independently verified', '8.7.6 Module 6 export preserves truthful unverified status');

  // Scenario 8: Human review does not automatically imply factual verification
  assert(approvedItem7.approvalStatus === APPROVAL_STATUSES.APPROVED, '8.8.1 Human review sets approval status to APPROVED');
  assert(approvedItem7.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT, '8.8.2 Item flag is Approved for export');
  assert(approvedItem7.metadata.verificationStatus === 'Source not independently verified', '8.8.3 Verification status remains "Source not independently verified"');
  assert(approvedItem7.approvalInfo.isIndependentlyVerified !== true, '8.8.4 Human review does NOT set isIndependentlyVerified to true');

  // Scenario 9: Existing approval gates, history, editing, and exports continue working
  const editedItem9 = editOutput(approvedItem7, 'Updated localized warning instructions for residents.');
  assert(editedItem9.isEdited === true, '8.9.1 Edited item records isEdited: true');
  assert(editedItem9.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, '8.9.2 Editing resets approval status to PENDING_REVIEW');
  assert(editedItem9.metadata.contentStatusFlag === CONTENT_STATUS_FLAGS.HUMAN_REVIEWED, '8.9.3 Content flag transitions to Human reviewed');

  let gateCaught9 = false;
  try {
    prepareModule6ExportPackage({ items: [editedItem9], reviewedOutputs: [editedItem9] });
  } catch (err) {
    gateCaught9 = true;
  }
  assert(gateCaught9 === true, '8.9.4 Export gate strictly blocks unapproved edited items');

  // Scenario 10: Both Gemini and deterministic fallback paths follow the same grounding and verification rules
  const nlpEngine = new DeterministicNLPProvider();
  const nlpAnalysis = await nlpEngine.analyze({
    sourceId: 'src-nlp-e2e',
    rawText: 'Red alert issued for rainfall exceeding 180 mm. Call helpline 112.'
  });
  assert(Array.isArray(nlpAnalysis.claims), '8.10.1 Deterministic NLP engine outputs structured claims');
  assert(nlpAnalysis.claims.every(c => c.isIndependentlyVerified === false), '8.10.2 Deterministic NLP claims are NOT marked independently verified');
  assert(nlpAnalysis.claims.some(c => c.isHighRisk && c.warningNotice === HIGH_RISK_CLAIM_WARNING), '8.10.3 Deterministic claims carry high-risk warning notice');

  // Hallucination checker flags misleading accuracy buzzwords in any provider output
  const buzzwordCheck = checkHallucinations({
    content: 'All claims backed by official source telemetry and zero-hallucination verified data.',
    sourceContent: { rawText: 'Rainfall notice.' }
  });
  assert(buzzwordCheck.status === CHECK_STATUSES.WARNING, '8.10.4 Hallucination check flags misleading accuracy and verification claims');
  assert(buzzwordCheck.details.unsupportedSignals.some(w => w.includes('official source telemetry') || w.includes('zero-hallucination')), '8.10.5 Buzzword warning correctly identified');

  console.log('\n========================================');
  console.log(`📊 CONTENT CONFIDENCE SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('contentConfidence.test.js')) {
  runContentConfidenceTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}
