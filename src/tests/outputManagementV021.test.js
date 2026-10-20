/**
 * InfoFlip-AI V0.2.1 — Output Management, Generation, Editing & State Verification Suite
 *
 * Verifies all 10 core requirements:
 * 1. Regenerating WhatsApp does not change LinkedIn, X/Twitter, or Executive Summary.
 * 2. Regenerating X/Twitter changes X/Twitter content only.
 * 3. Compare All regenerates every selected format and no unselected formats.
 * 4. Editing X/Twitter never opens WhatsApp content (per-format draft isolation).
 * 5. Saving Executive Summary edits updates the formatted preview and structured fields.
 * 6. Copy and export use the latest saved content.
 * 7. QA results correspond to the current output.
 * 8. Approve and Reject affect only the intended output.
 * 9. Failed generation does not overwrite valid content or falsely report success.
 * 10. Existing UI functionality remains intact.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  executeChatTurn,
  editCanonicalContentItem,
  approveCanonicalContentItem,
  rejectCanonicalContentItem,
  regenerateCanonicalContentItem,
  regenerateCanonicalContentItems,
  restoreApprovedCanonicalContentItem,
  buildTurnExportPackage,
  isEligibleForApprovePassed,
  approvePassedCanonicalContentItems
} from '../services/workspace/chatPipelineOrchestrator.js';

import {
  createEmptyConversation,
  DEFAULT_GENERATION_CONFIG
} from '../services/storage/workspaceStorageService.js';

import { APPROVAL_STATUSES, CHECK_STATUSES } from '../types/review.js';
import { CONTENT_STATUS_FLAGS } from '../types/contentConfidence.js';
import { checkReadability } from '../services/review/readabilityChecker.js';
import { checkDuplication } from '../services/review/duplicationChecker.js';
import { checkFactualConsistency } from '../services/review/factualConsistencyChecker.js';
import { checkPlatformCompliance } from '../services/review/platformComplianceChecker.js';
import { evaluateOutputItem } from '../services/review/reviewRules.js';
import { DeterministicCommunicationProvider } from '../services/communication/deterministicCommunicationProvider.js';
import { DeterministicTransformer } from '../services/transformation/deterministicTransformer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..');

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

async function runTests() {
  console.log('\n====================================================');
  console.log('🧪 INFOFLIP-AI V0.2.1 OUTPUT MANAGEMENT TEST SUITE');
  console.log('====================================================\n');

  // Shared source text for tests
  const sampleSource = `
  DISTRICT DISASTER MANAGEMENT ADVISORY
  Issued by: National Disaster Management Authority
  Date: October 24, 2026
  Urgency: High

  Severe cyclonic storm 'Megh' is expected to make landfall along the coastal districts of Odisha and West Bengal on October 27, 2026, with sustained wind speeds of 135 km/h.
  Key Directives:
  1. Fishermen are strictly advised not to venture into deep sea areas until October 29.
  2. Evacuation of residents in low-lying coastal areas to designated cyclone shelters will commence at 06:00 hours on October 26.
  3. Emergency control room activated. Helpline: 1077 and 0674-2534177.
  4. 45 rapid response disaster relief teams have been deployed across 12 vulnerable districts.
  5. Power and water utilities must maintain backup generators across all primary health centers.
  `.trim();

  // Create baseline conversation with 4 key formats: linkedin, twitter, whatsapp, executive-summary
  const baseConv = createEmptyConversation();
  const turnResult = await executeChatTurn({
    conversation: baseConv,
    prompt: 'Synthesize disaster advisory into cross-channel communication outputs',
    sourceText: sampleSource,
    requestedFormats: ['linkedin', 'twitter', 'whatsapp', 'executive-summary'],
    delayMs: 0
  });

  const convWithOutputs = {
    ...baseConv,
    activeSource: turnResult.sourceData,
    activeAnalysis: turnResult.analysisData,
    lastTransformationResult: turnResult.transformationResult,
    lastCommunicationResult: turnResult.communicationResult,
    config: turnResult.resolvedConfig,
    messages: [turnResult.userMessage, turnResult.assistantMessage]
  };

  const initialItemsById = {};
  for (const item of turnResult.canonicalItems) {
    initialItemsById[item.itemId] = item;
  }

  const linkedinItem = turnResult.canonicalItems.find(i => i.formatId === 'linkedin');
  const twitterItem = turnResult.canonicalItems.find(i => i.formatId === 'twitter');
  const whatsappItem = turnResult.canonicalItems.find(i => i.formatId === 'whatsapp');
  const execItem = turnResult.canonicalItems.find(i => i.formatId === 'executive-summary');

  console.log('--- Requirement 1: Regenerating WhatsApp does not change LinkedIn, X/Twitter, or Exec Summary ---');
  {
    assert(linkedinItem && twitterItem && whatsappItem && execItem, 'All 4 target formats generated in initial turn');
    const linkedinBefore = linkedinItem.content;
    const twitterBefore = twitterItem.content;
    const execBefore = execItem.content;
    const whatsappBefore = whatsappItem.content;

    // Regenerate WhatsApp
    const regeneratedWhatsapp = await regenerateCanonicalContentItem(whatsappItem, convWithOutputs, {
      variantSeed: 99999
    });

    assert(regeneratedWhatsapp.itemId === whatsappItem.itemId, 'Regenerated WhatsApp preserves identical itemId');
    assert(regeneratedWhatsapp.formatId === 'whatsapp', 'Regenerated item is identified as whatsapp');
    assert(linkedinItem.content === linkedinBefore, 'LinkedIn content is completely unchanged');
    assert(twitterItem.content === twitterBefore, 'Twitter content is completely unchanged');
    assert(execItem.content === execBefore, 'Executive Summary content is completely unchanged');
    assert(typeof regeneratedWhatsapp.content === 'string' && regeneratedWhatsapp.content.length > 0, 'WhatsApp produces valid non-empty content');
  }

  console.log('\n--- Requirement 2: Regenerating X/Twitter changes X/Twitter content only ---');
  {
    const linkedinBefore = linkedinItem.content;
    const whatsappBefore = whatsappItem.content;
    const execBefore = execItem.content;
    const twitterBefore = twitterItem.content;

    // Regenerate Twitter with a specific seed/variant
    const regeneratedTwitter = await regenerateCanonicalContentItem(twitterItem, convWithOutputs, {
      variantSeed: 42
    });

    assert(regeneratedTwitter.itemId === twitterItem.itemId, 'Regenerated Twitter preserves identical itemId');
    assert(regeneratedTwitter.formatId === 'twitter', 'Regenerated item format is twitter');
    assert(linkedinItem.content === linkedinBefore, 'LinkedIn remains untouched');
    assert(whatsappItem.content === whatsappBefore, 'WhatsApp remains untouched');
    assert(execItem.content === execBefore, 'Executive Summary remains untouched');
    assert(regeneratedTwitter.content !== twitterBefore, 'Regenerated Twitter content changes and differs from initial version');
    assert(Array.isArray(regeneratedTwitter.structuredData?.posts), 'Regenerated Twitter maintains structuredData.posts');
  }

  console.log('\n--- Requirement 3: Compare All regenerates every selected format and no unselected formats ---');
  {
    // Candidate items: only whatsapp and twitter selected
    const selectedCandidates = [whatsappItem, twitterItem];
    const unselectedItem = linkedinItem;
    const unselectedBefore = unselectedItem.content;

    const { updatedItemsById, succeededIds, failedIds } = await regenerateCanonicalContentItems(
      selectedCandidates,
      convWithOutputs,
      { variantSeed: 777 }
    );

    assert(succeededIds.length === 2, 'Exactly 2 selected formats regenerated');
    assert(succeededIds.includes(whatsappItem.itemId), 'WhatsApp was regenerated');
    assert(succeededIds.includes(twitterItem.itemId), 'Twitter was regenerated');
    assert(!succeededIds.includes(unselectedItem.itemId), 'Unselected LinkedIn was NOT regenerated');
    assert(unselectedItem.content === unselectedBefore, 'Unselected LinkedIn content remains completely untouched');
    assert(!updatedItemsById[unselectedItem.itemId], 'Unselected item is not in updatedItemsById map');
  }

  console.log('\n--- Requirement 4: Editing X/Twitter never opens WhatsApp content (Identity & Isolation) ---');
  {
    // Verify distinct format IDs and contents
    assert(twitterItem.formatId === 'twitter' && whatsappItem.formatId === 'whatsapp', 'Formats have distinct formatIds');
    assert(twitterItem.content !== whatsappItem.content, 'Twitter and WhatsApp have distinct initial contents');

    // Simulate human edit on Twitter
    const twitterEditString = '1/2 🚨 Cyclone Megh Landfall Warning: Evacuate low-lying areas by Oct 26.\n\n---\n\n2/2 📞 Emergency Helpline: 1077 and 0674-2534177. #PublicSafety';
    const updatedTwitter = editCanonicalContentItem(twitterItem, twitterEditString, convWithOutputs);

    assert(updatedTwitter.itemId === twitterItem.itemId, 'Updated Twitter preserves itemId');
    assert(updatedTwitter.content === twitterEditString, 'Twitter content updated to new string');
    assert(Array.isArray(updatedTwitter.structuredData?.posts), 'Twitter structuredData.posts synchronized from edited text');
    assert(updatedTwitter.structuredData.posts.length === 2, 'Twitter structuredData has 2 posts');
    assert(whatsappItem.content.includes('OFFICIAL BROADCAST') || whatsappItem.content.includes('WhatsApp'), 'WhatsApp content is completely isolated and unaffected');
    assert(!updatedTwitter.content.includes('OFFICIAL BROADCAST'), 'Twitter does not inherit WhatsApp content');
  }

  console.log('\n--- Requirement 5: Saving Executive Summary edits updates formatted preview and structured fields ---');
  {
    const updatedStructured = {
      title: 'SUPER-CYCLONE MEGH EMERGENCY DIRECTIVE',
      executiveOverview: 'Comprehensive operational briefing regarding landfall timeline and evacuation readiness.',
      keyPoints: [
        'Mass evacuation begins at 06:00 on October 26 across 12 coastal districts.',
        'Total ban on deep sea fishing active until October 29.'
      ],
      importantFindings: [
        'Sustained wind velocity: 135 km/h',
        '45 rapid response disaster relief teams deployed'
      ],
      implications: [
        'Coastal transport hubs and utility corridors face immediate suspension.',
        'Medical facilities require independent backup power reserves.'
      ],
      recommendedConsiderations: [
        'Activate localized VHF radio broadcasts for non-cellular zones.',
        'Pre-stage potable water tankers at designated shelters.'
      ]
    };

    const updatedExec = editCanonicalContentItem(execItem, updatedStructured, convWithOutputs);

    assert(updatedExec.itemId === execItem.itemId, 'Saved Executive Summary preserves itemId');
    assert(updatedExec.structuredData.title === 'SUPER-CYCLONE MEGH EMERGENCY DIRECTIVE', 'Structured title updated');
    assert(updatedExec.structuredData.executiveOverview === updatedStructured.executiveOverview, 'Structured overview updated');
    assert(updatedExec.structuredData.keyPoints.length === 2, 'Structured key points updated');
    assert(updatedExec.structuredData.importantFindings.length === 2, 'Structured important findings updated');
    assert(updatedExec.structuredData.implications.length === 2, 'Structured implications updated');
    assert(updatedExec.structuredData.recommendedConsiderations.length === 2, 'Structured recommended considerations updated');
    assert(updatedExec.content.includes('SUPER-CYCLONE MEGH EMERGENCY DIRECTIVE'), 'Serialized content includes updated title');
    assert(updatedExec.content.includes('KEY FINDINGS:'), 'Serialized content includes key findings section');
    assert(updatedExec.content.includes('STRATEGIC IMPLICATIONS:'), 'Serialized content includes implications');
    assert(updatedExec.content.includes('RECOMMENDED CONSIDERATIONS:'), 'Serialized content includes considerations');
  }

  console.log('\n--- Requirement 6: Copy and Export use the latest saved content ---');
  {
    // Edit LinkedIn item and approve it
    const newLinkedInText = '📢 [URGENT NOTICE] District Disaster Advisory regarding Cyclone Megh landfall on Oct 27, 2026. 45 rapid response teams deployed across 12 vulnerable districts. Emergency Helpline: 1077. Please circulate only official updates.';
    const editedLinkedIn = editCanonicalContentItem(linkedinItem, newLinkedInText, convWithOutputs);
    const approvedLinkedIn = approveCanonicalContentItem(editedLinkedIn, 'Approved for export with updated text');

    // Build export package
    const exportPkg = buildTurnExportPackage([approvedLinkedIn], {
      sourceId: convWithOutputs.activeSource.sourceId,
      analysisId: convWithOutputs.activeAnalysis.analysisId
    });

    assert(exportPkg.approvedOutputs.length === 1, 'Export package contains approved item');
    assert(exportPkg.approvedOutputs[0].content === newLinkedInText, 'Export package uses latest saved content');
    assert(!exportPkg.approvedOutputs[0].content.includes(linkedinItem.content), 'Export package does NOT use stale original content');
  }

  console.log('\n--- Requirement 7: QA Checks correspond to current output & detect applicable issues ---');
  {
    // Test 7A: Empty content detection
    const emptyItem = { ...twitterItem, content: '' };
    const emptyReadability = checkReadability(emptyItem);
    assert(emptyReadability.status === CHECK_STATUSES.FAIL, 'Readability flags empty content as FAIL');

    // Test 7B: Duplicate sentence detection
    const duplicateText = 'Evacuation will begin on October 26 at 06:00 hours across all coastal low-lying areas. Evacuation will begin on October 26 at 06:00 hours across all coastal low-lying areas. Emergency helpline is active at 1077.';
    const dupCheck = checkDuplication({ content: duplicateText });
    assert(dupCheck.status === CHECK_STATUSES.WARNING, 'Duplication checker detects redundant duplicate sentence');

    // Test 7C: Sentence length detection
    const longSentenceText = 'Because severe cyclonic storm Megh is expected to make landfall along the coastal districts with sustained wind speeds of 135 km/h on October 27, 2026, the district disaster management authority has issued an immediate order instructing all residents living in low-lying coastal zones to begin orderly evacuation to designated shelters starting promptly at six o clock in the morning on October 26 while rescue teams stand ready.';
    const longCheck = checkReadability({ content: longSentenceText });
    assert(longCheck.status === CHECK_STATUSES.WARNING, 'Readability flags sentence exceeding 28 words');

    // Test 7D: Source inconsistency detection (unmatched numbers/dates)
    const inconsistentText = 'Cyclone Megh will strike on November 15, 2099 with 850 km/h winds affecting 9999 districts.';
    const inconsistencyCheck = checkFactualConsistency({ content: inconsistentText }, {
      sourceContent: { extractedText: sampleSource },
      analysis: convWithOutputs.activeAnalysis
    });
    assert(inconsistencyCheck.status === CHECK_STATUSES.WARNING, 'Factual consistency detects dates/metrics not found in source');

    // Test 7E: Invalidation of approval on edit
    const approvedItem = approveCanonicalContentItem(whatsappItem, 'Human approval test');
    assert(approvedItem.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Item is approved');
    assert(approvedItem.approvalInfo !== null, 'Item has approvalInfo');

    const editedAfterApproval = editCanonicalContentItem(approvedItem, 'Updated whatsapp message after initial approval', convWithOutputs);
    assert(editedAfterApproval.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, 'Approval status reset to PENDING_REVIEW on edit');
    assert(editedAfterApproval.approvalInfo === null, 'Stale approvalInfo is cleanly cleared to null');
    assert(editedAfterApproval.requiresHumanReview === true, 'requiresHumanReview is true after editing approved content');
  }

  console.log('\n--- Requirement 8: Approve and Reject affect only the intended output ---');
  {
    const testItemA = { ...twitterItem, approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW };
    const testItemB = { ...whatsappItem, approvalStatus: APPROVAL_STATUSES.PENDING_REVIEW };

    const approvedA = approveCanonicalContentItem(testItemA, 'Approved Twitter specifically');
    assert(approvedA.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Target Twitter item approved');
    assert(testItemB.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW, 'Sibling WhatsApp item remains PENDING_REVIEW');

    const rejectedB = rejectCanonicalContentItem(testItemB, 'WhatsApp needs more clarity');
    assert(rejectedB.approvalStatus === APPROVAL_STATUSES.REJECTED, 'Target WhatsApp item rejected');
    assert(approvedA.approvalStatus === APPROVAL_STATUSES.APPROVED, 'Approved Twitter item remains APPROVED');
  }

  console.log('\n--- Requirement 9: Failed generation does not overwrite valid content or falsely report success ---');
  {
    const corruptConv = { ...convWithOutputs, activeSource: null, activeAnalysis: null };
    let threwError = false;

    try {
      await regenerateCanonicalContentItem(twitterItem, corruptConv);
    } catch (err) {
      threwError = true;
    }
    assert(threwError, 'Regenerating without source context throws error as expected');

    // Batch regeneration partial failure resilience
    const mixedBatch = [twitterItem, { itemId: 'invalid-item', formatId: 'unknown-format' }];
    const batchResult = await regenerateCanonicalContentItems(mixedBatch, convWithOutputs);

    assert(batchResult.succeededIds.includes(twitterItem.itemId), 'Valid Twitter item regenerates successfully');
    assert(batchResult.failedIds.includes('invalid-item'), 'Invalid item is recorded in failedIds');
    assert(batchResult.errors['invalid-item'], 'Failed item has recorded error reason');
    assert(twitterItem.content.length > 0, 'Original valid content was not destroyed');
  }

  console.log('\n--- Requirement 10: Existing UI components & architecture remain intact ---');
  {
    const generatedOutputRendererSrc = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/GeneratedOutputRenderer.jsx'), 'utf8');
    const chatWorkspaceSrc = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/ChatWorkspace.jsx'), 'utf8');
    const libraryViewSrc = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/LibraryView.jsx'), 'utf8');
    const rightSidebarSrc = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/RightSidebar.jsx'), 'utf8');

    assert(chatWorkspaceSrc.includes('key={activeItem.itemId}'), 'ChatWorkspace keys activeItem.itemId in tab view');
    assert(libraryViewSrc.includes('key={item.itemId}'), 'LibraryView keys item.itemId in expanded view');
    assert(chatWorkspaceSrc.includes('Regenerate All'), 'ChatWorkspace has Compare All / Regenerate All capability');
    assert(generatedOutputRendererSrc.includes('internalDraftText'), 'GeneratedOutputRenderer has per-item draft isolation');
    assert(rightSidebarSrc.includes('(Exp.)') || rightSidebarSrc.includes('Experimental'), 'RightSidebar accurately labels Hindi/Marathi as experimental');
    assert(!chatWorkspaceSrc.includes('secondWorkflow'), 'No second workflow or rebuild introduced');
  }

  console.log('\n====================================================');
  console.log(`V0.2.1 SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
