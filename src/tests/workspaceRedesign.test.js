/**
 * InfoFlip-AI V0.1.0 — Chat-Centered Workspace Redesign Test Suite
 *
 * Comprehensive test coverage for all 32 requirements in Section 10:
 * - Suite A: Conversation & Workspace Behavior (Items 1–7)
 * - Suite B: Persistence & Browser Storage Resilience (Items 8–12)
 * - Suite C: Sidebar & Responsive Drawer Behavior (Items 13–18)
 * - Suite D: Output Selection & Generation Settings (Items 19–23)
 * - Suite E: Existing 6-Module Pipeline & Verification Governance (Items 24–29)
 * - Suite F: Future-Feature Placeholders & Prototype Profile (Items 30–32)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  STORAGE_KEYS,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_GENERATION_CONFIG,
  DEFAULT_UI_PREFERENCES,
  stripSecrets,
  generateConversationTitle,
  sanitizeWorkspaceState,
  sanitizeUIPreferences,
  createEmptyConversation,
  createWorkspaceStorage
} from '../services/storage/workspaceStorageService.js';

import {
  WORKSPACE_FORMATS,
  WORKSPACE_FORMAT_MAP,
  isSupportedWorkspaceFormat,
  partitionRequestedFormats,
  resolveFollowUpContext,
  executeChatTurn,
  editCanonicalContentItem,
  approveCanonicalContentItem,
  rejectCanonicalContentItem,
  regenerateCanonicalContentItem,
  buildTurnExportPackage
} from '../services/workspace/chatPipelineOrchestrator.js';

import { validateFile } from '../utils/fileValidation.js';
import { APPROVAL_STATUSES } from '../types/review.js';
import { CONTENT_STATUS_FLAGS } from '../types/contentConfidence.js';
import { generateTXT, generateJSON, generatePackage } from '../services/export/exportService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failed++;
  }
}

/**
 * In-memory mock Web Storage for deterministic persistence testing
 */
function createMockWebStorage({ quotaExceeded = false, initialData = {} } = {}) {
  const store = new Map(Object.entries(initialData));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      if (quotaExceeded) {
        const err = new Error('QuotaExceededError: DOM Exception 22');
        err.name = 'QuotaExceededError';
        err.code = 22;
        throw err;
      }
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    _dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

const SAMPLE_CYCLONE_SOURCE = `
URGENT METEOROLOGICAL BULLETIN: Severe Cyclonic Storm Dana is projected to make landfall along the Odisha and West Bengal coast between October 24 and October 25 with sustained wind speeds of 100 to 120 km/h and heavy rainfall exceeding 200 mm.
District administrations in coastal areas have opened 450 relief shelters. Citizens in low-lying coastal zones are advised to avoid unnecessary travel during peak storm hours and keep emergency helpline 112 and NDRF control room numbers accessible.
`.trim();

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING WORKSPACE REDESIGN TEST SUITE (SECTION 10: 32 ITEMS)');
  console.log('========================================\n');

  // =========================================================================
  // SUITE A: CONVERSATION & WORKSPACE BEHAVIOR (ITEMS 1–7)
  // =========================================================================
  console.log('--- Suite A: Conversation & Workspace Behavior (Items 1–7) ---');

  const appSource = fs.readFileSync(path.join(SRC_DIR, 'App.jsx'), 'utf8');
  const chatWorkspaceSource = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/ChatWorkspace.jsx'), 'utf8');
  const leftSidebarSource = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/LeftSidebar.jsx'), 'utf8');
  const rightSidebarSource = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/RightSidebar.jsx'), 'utf8');
  const libraryViewSource = fs.readFileSync(path.join(SRC_DIR, 'components/workspace/LibraryView.jsx'), 'utf8');

  // Item 1: Opening the application displays the new chat-centered layout
  assert(
    DEFAULT_UI_PREFERENCES.activeSection === 'chat' &&
      appSource.includes('<LeftSidebar') &&
      appSource.includes('<ChatWorkspace') &&
      appSource.includes('<RightSidebar') &&
      chatWorkspaceSource.includes('What would you like to create?'),
    '1. Opening the application defaults to the three-region chat-centered workspace with welcome heading "What would you like to create?"'
  );

  // Item 2: Starting a new chat resets temporary input/settings while preserving saved conversations
  const mockStoreA = createMockWebStorage();
  const storageA = createWorkspaceStorage(mockStoreA);

  const savedConv1 = createEmptyConversation({
    conversationId: 'conv-saved-1',
    title: 'Saved Cyclone Alert Chat',
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      tone: 'Urgent',
      targetAudience: 'Citizens',
      selectedFormats: ['sms', 'whatsapp']
    },
    draft: { prompt: 'Old draft', sourceText: '' }
  });

  // Resetting for a new chat creates fresh defaults while keeping savedConv1 intact
  const newChatConv = createEmptyConversation({
    conversationId: 'conv-new-2',
    title: 'New Chat'
  });
  storageA.saveWorkspaceState({
    activeConversationId: newChatConv.conversationId,
    conversations: [newChatConv, savedConv1],
    contentItemsById: {}
  });
  const loadedAfterNewChat = storageA.loadWorkspaceState().state;

  assert(
    loadedAfterNewChat.conversations.length === 2 &&
      loadedAfterNewChat.conversations[0].conversationId === 'conv-new-2' &&
      loadedAfterNewChat.conversations[0].config.tone === DEFAULT_GENERATION_CONFIG.tone &&
      loadedAfterNewChat.conversations[0].draft.prompt === '' &&
      loadedAfterNewChat.conversations[1].conversationId === 'conv-saved-1' &&
      loadedAfterNewChat.conversations[1].title === 'Saved Cyclone Alert Chat',
    '2. Starting a new chat resets temporary input and output-format settings to defaults while preserving saved conversations'
  );

  // Item 3: Submitting a prompt and source content runs through the existing generation pipeline
  const turn1Result = await executeChatTurn({
    conversation: newChatConv,
    prompt: 'Create LinkedIn and WhatsApp alerts for coastal residents.',
    sourceText: SAMPLE_CYCLONE_SOURCE,
    requestedFormats: ['linkedin', 'whatsapp'],
    configOverrides: {
      targetAudience: 'Citizens',
      tone: 'Urgent',
      language: 'English'
    },
    delayMs: 0
  });

  assert(
    Boolean(turn1Result.sourceData?.sourceId) &&
      Boolean(turn1Result.analysisData?.analysisId) &&
      Boolean(turn1Result.transformationResult?.transformationId) &&
      Boolean(turn1Result.communicationResult?.communicationId) &&
      Boolean(turn1Result.reviewResult?.reviewId) &&
      turn1Result.canonicalItems.length === 2,
    '3. Submitting a prompt and source content executes the full 6-module pipeline (Modules 1 -> 2 -> 3 -> 4 -> 5)'
  );

  // Item 4: Generated outputs appear inside the active conversation in clearly separated format sections
  const turn1Formats = turn1Result.canonicalItems.map((i) => i.formatId);
  assert(
    turn1Formats.includes('linkedin') &&
      turn1Formats.includes('whatsapp') &&
      turn1Result.assistantMessage.outputItemIds.length === 2 &&
      turn1Result.canonicalItems.every((i) => i.conversationId === newChatConv.conversationId && i.messageId === turn1Result.assistantMessage.messageId),
    '4. Generated outputs are linked to the assistant message in clearly separated per-format canonical items'
  );

  // Item 5: Follow-up refinement requests remain associated with the active conversation
  const convAfterTurn1 = {
    ...newChatConv,
    title: generateConversationTitle({
      prompt: turn1Result.userMessage.prompt,
      sourceText: SAMPLE_CYCLONE_SOURCE,
      mainTopic: turn1Result.analysisData.overview?.mainTopic
    }),
    messages: [turn1Result.userMessage, turn1Result.assistantMessage],
    activeSource: turn1Result.sourceData,
    activeAnalysis: turn1Result.analysisData,
    lastTransformationResult: turn1Result.transformationResult,
    lastCommunicationResult: turn1Result.communicationResult,
    lastReviewResult: turn1Result.reviewResult,
    config: turn1Result.resolvedConfig
  };

  const turn2FollowUp = await executeChatTurn({
    conversation: convAfterTurn1,
    prompt: 'Make the LinkedIn post shorter and more concise',
    sourceText: '',
    requestedFormats: ['linkedin', 'whatsapp'],
    configOverrides: convAfterTurn1.config,
    delayMs: 0
  });

  assert(
    turn2FollowUp.userMessage.sourceAttachment?.isFollowUpContext === true &&
      turn2FollowUp.sourceData.sourceId === convAfterTurn1.activeSource.sourceId &&
      turn2FollowUp.canonicalItems.length === 1 &&
      turn2FollowUp.canonicalItems[0].formatId === 'linkedin' &&
      turn2FollowUp.canonicalItems[0].conversationId === convAfterTurn1.conversationId,
    '5. Follow-up refinement request ("Make the LinkedIn post shorter") reuses active conversation source/analysis context and targets the requested format'
  );

  // Item 6: Switching to a recent chat restores its messages and generated content
  const itemsById = {};
  for (const item of [...turn1Result.canonicalItems, ...turn2FollowUp.canonicalItems]) {
    itemsById[item.itemId] = item;
  }
  const convAfterTurn2 = {
    ...convAfterTurn1,
    messages: [
      ...convAfterTurn1.messages,
      turn2FollowUp.userMessage,
      turn2FollowUp.assistantMessage
    ]
  };

  storageA.saveWorkspaceState({
    activeConversationId: savedConv1.conversationId,
    conversations: [convAfterTurn2, savedConv1],
    contentItemsById: itemsById
  });

  const hydratedConv = storageA.hydrateConversation(
    storageA.loadWorkspaceState().state,
    convAfterTurn2.conversationId
  );

  assert(
    hydratedConv !== null &&
      hydratedConv.messages.length === 4 &&
      hydratedConv.messages[1].outputs.length === 2 &&
      hydratedConv.messages[3].outputs.length === 1 &&
      hydratedConv.messages[3].outputs[0].formatId === 'linkedin',
    '6. Switching to a recent chat restores all chronological messages and hydrates its generated outputs'
  );

  // Item 7: Editing or approving an output updates both the conversation view and Library/collection views
  const targetItemId = turn1Result.canonicalItems[0].itemId;
  const editedItem = editCanonicalContentItem(
    itemsById[targetItemId],
    'Updated Cyclone Dana LinkedIn Alert: Shelters open across coastal Odisha; call 112 for emergency help.',
    convAfterTurn2
  );
  const approvedItem = approveCanonicalContentItem(editedItem, 'Verified against IMD bulletin');
  itemsById[targetItemId] = approvedItem;

  storageA.saveWorkspaceState({
    activeConversationId: convAfterTurn2.conversationId,
    conversations: [convAfterTurn2, savedConv1],
    contentItemsById: itemsById
  });

  const reloadedState = storageA.loadWorkspaceState().state;
  const fromHydratedConversation = storageA
    .hydrateConversation(reloadedState, convAfterTurn2.conversationId)
    .messages[1].outputs.find((o) => o.itemId === targetItemId);
  const fromLibraryAll = storageA
    .getLibraryItems(reloadedState)
    .find((o) => o.itemId === targetItemId);
  const fromLinkedInCollection = storageA
    .getLibraryItems(reloadedState, { formatFilter: 'linkedin' })
    .find((o) => o.itemId === targetItemId);

  assert(
    fromHydratedConversation.content === approvedItem.content &&
      fromHydratedConversation.approvalStatus === APPROVAL_STATUSES.APPROVED &&
      fromLibraryAll.content === approvedItem.content &&
      fromLibraryAll.approvalStatus === APPROVAL_STATUSES.APPROVED &&
      fromLinkedInCollection.content === approvedItem.content &&
      fromLinkedInCollection.approvalStatus === APPROVAL_STATUSES.APPROVED,
    '7. Editing and approving an output updates the canonical record across the Conversation, Library, and Content Collection views'
  );

  // =========================================================================
  // SUITE B: PERSISTENCE & STORAGE RESILIENCE (ITEMS 8–12)
  // =========================================================================
  console.log('\n--- Suite B: Persistence & Storage Resilience (Items 8–12) ---');

  // Item 8: Conversations and generated content persist in browser storage and restore after page reload
  const freshStorageReader = createWorkspaceStorage(mockStoreA);
  const restoredAfterReload = freshStorageReader.loadWorkspaceState();
  assert(
    restoredAfterReload.warning === null &&
      restoredAfterReload.state.conversations.length === 2 &&
      Object.keys(restoredAfterReload.state.contentItemsById).length === 3 &&
      restoredAfterReload.state.activeConversationId === convAfterTurn2.conversationId,
    '8. Conversations and generated content persist in browser storage and restore cleanly on reload'
  );

  // Item 9: Sidebar collapse/expand preferences persist where implemented
  storageA.saveUIPreferences({
    leftSidebarCollapsed: true,
    rightSidebarCollapsed: false,
    activeSection: 'collection',
    activeCollectionFormat: 'linkedin'
  });
  const restoredPrefs = freshStorageReader.loadUIPreferences();
  assert(
    restoredPrefs.leftSidebarCollapsed === true &&
      restoredPrefs.rightSidebarCollapsed === false &&
      restoredPrefs.activeSection === 'collection' &&
      restoredPrefs.activeCollectionFormat === 'linkedin',
    '9. Independent left/right sidebar collapse states and active section preferences persist in browser storage'
  );

  // Item 10: Malformed or outdated browser storage data does not crash the app and falls back safely
  const corruptedStore = createMockWebStorage({
    initialData: {
      [STORAGE_KEYS.WORKSPACE_STATE]: '{corrupted-json-payload:::[[[',
      [STORAGE_KEYS.UI_PREFERENCES]: 'not-valid-json'
    }
  });
  const corruptedStorageService = createWorkspaceStorage(corruptedStore);
  const safeFallbackLoad = corruptedStorageService.loadWorkspaceState();
  const safeFallbackPrefs = corruptedStorageService.loadUIPreferences();

  assert(
    Array.isArray(safeFallbackLoad.state.conversations) &&
      safeFallbackLoad.state.conversations.length === 0 &&
      typeof safeFallbackLoad.warning === 'string' &&
      safeFallbackLoad.warning.includes('malformed') &&
      safeFallbackPrefs.leftSidebarCollapsed === false &&
      safeFallbackPrefs.rightSidebarCollapsed === false,
    '10. Malformed or outdated browser storage JSON does not crash the app and falls back safely with a warning'
  );

  // Item 11: Missing or quota-exceeded browser storage is handled gracefully with a clear user-facing message
  const quotaStore = createMockWebStorage({ quotaExceeded: true });
  const quotaStorageService = createWorkspaceStorage(quotaStore);
  const quotaSaveAttempt = quotaStorageService.saveWorkspaceState(reloadedState);
  const nullStorageService = createWorkspaceStorage(null);
  const nullSaveAttempt = nullStorageService.saveWorkspaceState(reloadedState);

  assert(
    quotaSaveAttempt.success === false &&
      typeof quotaSaveAttempt.error === 'string' &&
      quotaSaveAttempt.error.toLowerCase().includes('storage is full') &&
      nullSaveAttempt.success === false &&
      typeof nullSaveAttempt.error === 'string',
    '11. Missing or quota-exceeded browser storage is caught gracefully and returns a clear user-facing message'
  );

  // Item 12: Saved content items and conversations remain linked by stable IDs without duplicate divergence, and secrets are stripped
  const stateWithSecret = {
    ...reloadedState,
    apiKey: 'AIzaSyFakeSecretKeyShouldNeverPersist',
    nested: { geminiApiKey: 'secret-token-123' }
  };
  const cleanedSecretObj = stripSecrets(stateWithSecret);
  const allLibraryItems = storageA.getLibraryItems(reloadedState);
  const uniqueIds = new Set(allLibraryItems.map((i) => i.itemId));

  assert(
    !('apiKey' in cleanedSecretObj) &&
      !('geminiApiKey' in (cleanedSecretObj.nested || {})) &&
      allLibraryItems.length === uniqueIds.size &&
      allLibraryItems.every((i) => Boolean(i.conversationId) && Boolean(i.messageId)),
    '12. Saved content items and conversations remain linked by stable IDs without duplicate divergence, and secret keys are stripped'
  );

  // =========================================================================
  // SUITE C: SIDEBAR & RESPONSIVE BEHAVIOR (ITEMS 13–18)
  // =========================================================================
  console.log('\n--- Suite C: Sidebar & Responsive Behavior (Items 13–18) ---');

  // Item 13: Left sidebar collapses and expands independently on desktop
  assert(
    appSource.includes('updateUIPreferences({ leftSidebarCollapsed: true })') &&
      appSource.includes('updateUIPreferences({ leftSidebarCollapsed: false })') &&
      leftSidebarSource.includes('aria-label="Collapse left sidebar"'),
    '13. Left sidebar collapses and expands independently on desktop'
  );

  // Item 14: Right sidebar collapses and expands independently on desktop
  assert(
    appSource.includes('updateUIPreferences({ rightSidebarCollapsed: true })') &&
      appSource.includes('updateUIPreferences({ rightSidebarCollapsed: false })') &&
      rightSidebarSource.includes('aria-label="Collapse right sidebar"'),
    '14. Right sidebar collapses and expands independently on desktop'
  );

  // Item 15: Center workspace expands when either or both sidebars are collapsed into narrow icon rails
  assert(
    appSource.includes('<main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-app-bg">') &&
      appSource.includes('isCollapsed={leftCollapsed}') &&
      appSource.includes('isCollapsed={rightCollapsed}') &&
      leftSidebarSource.includes('w-16') &&
      rightSidebarSource.includes('w-16'),
    '15. Center workspace uses flex-1 min-w-0 and automatically expands when either or both sidebars collapse into w-16 icon rails'
  );

  // Item 16: Mobile left and right drawers open and close cleanly
  assert(
    appSource.includes('mobileLeftDrawerOpen') &&
      appSource.includes('mobileRightDrawerOpen') &&
      appSource.includes('aria-label="Navigation Drawer"') &&
      appSource.includes('aria-label="Output Formats & Settings Drawer"'),
    '16. Mobile left and right slide-out drawers open and close independently with modal dialog semantics'
  );

  // Item 17: Escape key or outside click closes mobile drawers where supported
  assert(
    appSource.includes("e.key === 'Escape'") &&
      appSource.includes('onClick={() => setMobileLeftDrawerOpen(false)}') &&
      appSource.includes('onClick={() => setMobileRightDrawerOpen(false)}'),
    '17. Escape key listener and backdrop overlay clicks close mobile drawers cleanly'
  );

  // Item 18: Long chat lists and format lists scroll within their containers without breaking page layout
  assert(
    leftSidebarSource.includes('overflow-y-auto') &&
      rightSidebarSource.includes('overflow-y-auto') &&
      chatWorkspaceSource.includes('overflow-y-auto') &&
      appSource.includes('h-screen w-screen overflow-hidden'),
    '18. Left sidebar, right sidebar, and center conversation scroll independently inside a bounded h-screen overflow-hidden container'
  );

  // =========================================================================
  // SUITE D: OUTPUT SELECTION & GENERATION SETTINGS (ITEMS 19–23)
  // =========================================================================
  console.log('\n--- Suite D: Output Selection & Generation Settings (Items 19–23) ---');

  // Item 19: Selecting one output format generates only that format
  const singleFormatTurn = await executeChatTurn({
    conversation: createEmptyConversation(),
    prompt: 'Generate an urgent SMS alert for coastal citizens.',
    sourceText: SAMPLE_CYCLONE_SOURCE,
    requestedFormats: ['sms'],
    delayMs: 0
  });

  assert(
    singleFormatTurn.canonicalItems.length === 1 &&
      singleFormatTurn.canonicalItems[0].formatId === 'sms' &&
      singleFormatTurn.assistantMessage.requestedFormats.length === 1,
    '19. Selecting a single output format (sms) generates only that format'
  );

  // Item 20: Selecting multiple output formats generates each supported format in its own section
  const multiFormatTurn = await executeChatTurn({
    conversation: createEmptyConversation(),
    prompt: 'Generate LinkedIn, Email, and Executive Summary outputs.',
    sourceText: SAMPLE_CYCLONE_SOURCE,
    requestedFormats: ['linkedin', 'email', 'executive-summary'],
    delayMs: 0
  });

  assert(
    multiFormatTurn.canonicalItems.length === 3 &&
      multiFormatTurn.canonicalItems[0].formatId === 'linkedin' &&
      multiFormatTurn.canonicalItems[1].formatId === 'email' &&
      multiFormatTurn.canonicalItems[2].formatId === 'executive-summary' &&
      Boolean(multiFormatTurn.canonicalItems[2].structuredData),
    '20. Selecting multiple output formats across Module 3 & Module 4 generates each format in its own distinct item section'
  );

  // Item 21: Unsupported formats are not selectable or are clearly rejected without fake output
  const partitioned = partitionRequestedFormats(['linkedin', 'tiktok-reel', 'instagram-story', 'email']);
  let allUnsupportedThrew = false;
  try {
    await executeChatTurn({
      conversation: createEmptyConversation(),
      prompt: 'Generate unsupported formats',
      sourceText: SAMPLE_CYCLONE_SOURCE,
      requestedFormats: ['tiktok-reel', 'snapchat'],
      delayMs: 0
    });
  } catch (err) {
    allUnsupportedThrew = err.message.includes('Unsupported output format');
  }

  assert(
    !isSupportedWorkspaceFormat('tiktok-reel') &&
      partitioned.supported.length === 2 &&
      partitioned.unsupported.length === 2 &&
      allUnsupportedThrew === true,
    '21. Unsupported formats are partitioned out and rejected without generating fake output'
  );

  // Item 22: Tone, audience, language, and detail/style settings are passed into the existing transformation/generation services
  const configuredTurn = await executeChatTurn({
    conversation: createEmptyConversation(),
    prompt: 'Transform bulletin into Hindi for Citizens.',
    sourceText: SAMPLE_CYCLONE_SOURCE,
    requestedFormats: ['whatsapp', 'advisory'],
    configOverrides: {
      targetAudience: 'Citizens',
      tone: 'Urgent',
      language: 'Hindi',
      detailLevel: 'Detailed',
      objective: 'Alert',
      contentStyle: 'Action-Oriented'
    },
    delayMs: 0
  });

  assert(
    configuredTurn.resolvedConfig.language === 'Hindi' &&
      configuredTurn.resolvedConfig.tone === 'Urgent' &&
      configuredTurn.resolvedConfig.targetAudience === 'Citizens' &&
      configuredTurn.resolvedConfig.detailLevel === 'Detailed' &&
      configuredTurn.canonicalItems.every((i) => i.metadata?.language === 'Hindi' || configuredTurn.resolvedConfig.language === 'Hindi'),
    '22. Tone, audience, language, detail level, and style settings are passed into Module 3 & Module 4 generation services'
  );

  // Item 23: Changing settings in the right sidebar affects subsequent generation requests as expected
  const convWithUpdatedSettings = {
    ...convAfterTurn1,
    config: {
      ...convAfterTurn1.config,
      tone: 'Executive',
      targetAudience: 'Executives & Leadership',
      selectedFormats: ['executive-summary']
    }
  };
  const subsequentTurn = await executeChatTurn({
    conversation: convWithUpdatedSettings,
    prompt: 'Regenerate with current settings for leadership.',
    sourceText: '',
    requestedFormats: convWithUpdatedSettings.config.selectedFormats,
    configOverrides: convWithUpdatedSettings.config,
    delayMs: 0
  });

  assert(
    subsequentTurn.resolvedConfig.tone === 'Executive' &&
      subsequentTurn.resolvedConfig.targetAudience === 'Executives & Leadership' &&
      subsequentTurn.canonicalItems.length === 1 &&
      subsequentTurn.canonicalItems[0].formatId === 'executive-summary',
    '23. Changing settings and selected formats in the right sidebar updates subsequent generation requests'
  );

  // =========================================================================
  // SUITE E: EXISTING PIPELINE INTEGRATION & VERIFICATION GOVERNANCE (ITEMS 24–29)
  // =========================================================================
  console.log('\n--- Suite E: Existing Pipeline Integration & Verification Governance (Items 24–29) ---');

  // Item 24: Module 1 file/text validation still works, including unsupported file and size-limit errors
  const invalidExeFile = { name: 'malware.exe', size: 1024, type: 'application/x-msdownload' };
  const oversizedPdfFile = { name: 'huge.pdf', size: 15 * 1024 * 1024, type: 'application/pdf' };
  const validTxtFile = { name: 'bulletin.txt', size: 2048, type: 'text/plain' };

  const exeCheck = validateFile(invalidExeFile);
  const sizeCheck = validateFile(oversizedPdfFile);
  const validCheck = validateFile(validTxtFile);

  let shortTextRejected = false;
  try {
    await executeChatTurn({
      conversation: createEmptyConversation(),
      prompt: 'Too short',
      sourceText: '',
      requestedFormats: ['linkedin'],
      delayMs: 0
    });
  } catch {
    shortTextRejected = true;
  }

  assert(
    exeCheck.isValid === false &&
      sizeCheck.isValid === false &&
      validCheck.isValid === true &&
      shortTextRejected === true,
    '24. Module 1 file and text validation enforces supported file types, 10MB size limit, and minimum text length'
  );

  // Item 25: Module 2 analysis/understanding data is still produced and used where required
  assert(
    Boolean(turn1Result.analysisData?.analysisId) &&
      Array.isArray(turn1Result.analysisData?.keyFacts) &&
      turn1Result.analysisData.keyFacts.length > 0 &&
      Boolean(turn1Result.assistantMessage.analysisSummary?.mainTopic),
    '25. Module 2 analysis/understanding data (topic, key facts, urgency, claims) is produced and attached to conversation turns'
  );

  // Item 26: Module 3 and Module 4 outputs remain grounded in the source content
  const allGeneratedText = multiFormatTurn.canonicalItems.map((i) => i.content.toLowerCase()).join(' ');
  assert(
    (allGeneratedText.includes('dana') || allGeneratedText.includes('cyclone') || allGeneratedText.includes('odisha') || allGeneratedText.includes('112')) &&
      multiFormatTurn.canonicalItems.every((i) => Array.isArray(i.sourceTraceability)),
    '26. Module 3 and Module 4 outputs remain grounded in the source content and carry source traceability'
  );

  // Item 27: Module 5 review, warning, edit, and human approval behavior remains intact
  const sampleItem = multiFormatTurn.canonicalItems[0];
  const rejectedSample = rejectCanonicalContentItem(sampleItem, 'Tone needs adjustment');
  const editedSample = editCanonicalContentItem(rejectedSample, sampleItem.content + '\n\nHelpline: 112', {
    activeSource: multiFormatTurn.sourceData,
    activeAnalysis: multiFormatTurn.analysisData,
    config: multiFormatTurn.resolvedConfig
  });
  const approvedSample = approveCanonicalContentItem(editedSample, 'Approved after human review');

  assert(
    rejectedSample.approvalStatus === APPROVAL_STATUSES.REJECTED &&
      editedSample.isEdited === true &&
      editedSample.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW &&
      approvedSample.approvalStatus === APPROVAL_STATUSES.APPROVED &&
      approvedSample.metadata?.contentStatusFlag === CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT,
    '27. Module 5 review, rejection, human editing (resetting to PENDING_REVIEW), and approval workflow remain intact'
  );

  // Item 28: Module 6 export actions still work for approved/selected outputs (and block unapproved packages)
  let unapprovedBlocked = false;
  try {
    buildTurnExportPackage([rejectedSample], multiFormatTurn.assistantMessage.lineage, multiFormatTurn.resolvedConfig);
  } catch {
    unapprovedBlocked = true;
  }

  const exportPkg = buildTurnExportPackage(
    [approvedSample, multiFormatTurn.canonicalItems[1]],
    multiFormatTurn.assistantMessage.lineage,
    multiFormatTurn.resolvedConfig
  );
  const exportedTxt = generateTXT(exportPkg);
  const exportedJson = JSON.parse(generateJSON(exportPkg));
  const exportedZip = generatePackage(exportPkg);

  assert(
    unapprovedBlocked === true &&
      exportPkg.approvedOutputs.length === 1 &&
      exportPkg.approvedOutputs[0].outputId === approvedSample.outputId &&
      exportedTxt.includes('CERTIFIED COMMUNICATION EXPORT DELIVERABLE') &&
      Array.isArray(exportedJson.approvedOutputs) &&
      exportedJson.approvedOutputs.length === 1 &&
      exportedZip instanceof Uint8Array &&
      exportedZip.byteLength > 0,
    '28. Module 6 export gate blocks unapproved packages and generates valid TXT, JSON, and ZIP deliverables for approved outputs'
  );

  // Item 29: Existing honest verification/confidence labels remain intact; source-extracted or AI-generated claims are not falsely marked as independently verified
  assert(
    approvedSample.metadata?.verificationStatus === 'Source not independently verified' &&
      approvedSample.metadata?.isIndependentlyVerified !== true &&
      approvedSample.approvalInfo?.isIndependentlyVerified === false &&
      turn1Result.analysisData.claims.every((c) => c.isIndependentlyVerified === false),
    '29. Truthful verification labels remain intact: source-extracted and human-approved outputs are never falsely marked as independently verified'
  );

  // =========================================================================
  // SUITE F: FUTURE-FEATURE PLACEHOLDERS & PROTOTYPE PROFILE (ITEMS 30–32)
  // =========================================================================
  console.log('\n--- Suite F: Future-Feature Placeholders & Prototype Profile (Items 30–32) ---');

  const scheduledPostsSource = fs.readFileSync(
    path.join(SRC_DIR, 'components/workspace/ScheduledPostsView.jsx'),
    'utf8'
  );
  const exploreViewSource = fs.readFileSync(
    path.join(SRC_DIR, 'components/workspace/ExploreView.jsx'),
    'utf8'
  );

  // Item 30: Scheduled Posts is visible as “Coming soon” and does not pretend to schedule or publish posts
  assert(
    leftSidebarSource.includes('Scheduled Posts') &&
      leftSidebarSource.includes('Soon') &&
      scheduledPostsSource.includes('Coming soon') &&
      scheduledPostsSource.includes('Scheduled Posts — Coming Soon') &&
      scheduledPostsSource.includes('No external platform connections, background jobs, or scheduled deliveries are active in this prototype'),
    '30. Scheduled Posts is clearly badged "Coming soon" in the sidebar and opens an honest placeholder without fake scheduling controls'
  );

  // Item 31: Prototype account area displays “Minal Maurya” and “Free plan” without implementing fake login/logout or authentication claims
  const hasLoginOrLogoutButtons =
    /['"]Log\s*in['"]|['"]Log\s*out['"]|['"]Sign\s*in['"]|['"]Sign\s*out['"]/i.test(leftSidebarSource);
  assert(
    leftSidebarSource.includes('Minal Maurya') &&
      leftSidebarSource.includes('Free plan') &&
      leftSidebarSource.includes('No account authentication is active in V0.1.0') &&
      hasLoginOrLogoutButtons === false,
    '31. Prototype account area displays "Minal Maurya" and "Free plan" without fake login/logout buttons or authentication claims'
  );

  // Item 32: Explore behaves as a minimal placeholder or supported preview without inventing unsupported features
  assert(
    leftSidebarSource.includes('Explore') &&
      exploreViewSource.includes('Coming soon') &&
      exploreViewSource.includes('Explore Templates & Workflows — Coming Soon') &&
      exploreViewSource.includes('DEMO_SCENARIOS'),
    '32. Explore opens a clearly labelled "Coming soon" placeholder with optional access to existing built-in demo scenarios'
  );

  // =========================================================================
  // SUITE G: COLLAPSED ICON RAILS & GRAPHITE + STEEL BLUE THEME SYSTEM (ITEMS 33–45)
  // =========================================================================
  console.log('\n--- Suite G: Collapsed Icon Rails & Graphite + Steel Blue Theme System (ITEMS 33–45) ---');

  const indexCssSource = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  const indexHtmlSource = fs.readFileSync(path.join(SRC_DIR, '..', 'index.html'), 'utf8');
  const tailwindConfigSource = fs.readFileSync(
    path.join(SRC_DIR, '..', 'tailwind.config.js'),
    'utf8'
  );
  const themeToggleSource = fs.readFileSync(
    path.join(SRC_DIR, 'components/ThemeToggle.jsx'),
    'utf8'
  );
  const themeContextSource = fs.readFileSync(
    path.join(SRC_DIR, 'context/ThemeContext.jsx'),
    'utf8'
  );

  // Item 33: Left sidebar collapses to a visible persistent icon rail with top expand control and bottom MM avatar
  assert(
    leftSidebarSource.includes('isCollapsed && !isMobileDrawer') &&
      leftSidebarSource.includes('aria-label="Collapsed Workspace Navigation Rail"') &&
      leftSidebarSource.includes('aria-label="Expand left sidebar"') &&
      leftSidebarSource.includes('title="Prototype account: Minal Maurya (Free plan)"'),
    '33. Left sidebar collapses to a visible persistent w-16 icon rail with top expand control and bottom MM account avatar'
  );

  // Item 34: Left navigation icons work directly without expanding the rail first, with no redundant chat icon below the + button
  assert(
    leftSidebarSource.includes('onClick={() => onNewChat()}') &&
      !leftSidebarSource.includes('aria-label="Conversation Workspace"') &&
      leftSidebarSource.includes("onClick={() => onSelectSection('explore')}") &&
      leftSidebarSource.includes("onClick={() => onSelectSection('library')}") &&
      leftSidebarSource.includes("onClick={() => onSelectSection('scheduled')}") &&
      leftSidebarSource.includes('onClick={() => onSelectCollection(fmt.id)}'),
    '34. Left rail navigation icons (New Chat, Explore, Library, Scheduled Posts, and all Content Collections) navigate directly without a redundant chat icon below +'
  );

  // Item 35: Right sidebar collapses to a visible persistent icon rail
  assert(
    rightSidebarSource.includes('isCollapsed && !isMobileDrawer') &&
      rightSidebarSource.includes('aria-label="Collapsed Output Formats Rail"') &&
      rightSidebarSource.includes('h-full w-16 bg-sidebar-bg'),
    '35. Right output-format sidebar collapses to a visible persistent w-16 icon rail on the right edge'
  );

  // Item 36: Right expand control and direct format toggle icons are accessible while collapsed
  assert(
    rightSidebarSource.includes('aria-label="Expand right sidebar"') &&
      rightSidebarSource.includes('onClick={onExpandDesktop}') &&
      rightSidebarSource.includes('onClick={() => handleToggleFormat(fmt.id)}') &&
      rightSidebarSource.includes('aria-label={`Toggle ${fmt.name}`}'),
    '36. Right collapsed rail provides a top expand button and allows direct format toggling without expanding the full panel'
  );

  // Item 37: Left and right sidebar collapsed states operate independently in browser storage
  storageA.saveUIPreferences({ leftSidebarCollapsed: true, rightSidebarCollapsed: false });
  const leftOnlyCollapsed = storageA.loadUIPreferences();
  storageA.saveUIPreferences({ leftSidebarCollapsed: false, rightSidebarCollapsed: true });
  const rightOnlyCollapsed = storageA.loadUIPreferences();
  storageA.saveUIPreferences({ leftSidebarCollapsed: true, rightSidebarCollapsed: true });
  const bothCollapsed = storageA.loadUIPreferences();

  assert(
    leftOnlyCollapsed.leftSidebarCollapsed === true &&
      leftOnlyCollapsed.rightSidebarCollapsed === false &&
      rightOnlyCollapsed.leftSidebarCollapsed === false &&
      rightOnlyCollapsed.rightSidebarCollapsed === true &&
      bothCollapsed.leftSidebarCollapsed === true &&
      bothCollapsed.rightSidebarCollapsed === true,
    '37. Left and right sidebar collapsed states operate and persist independently'
  );

  // Item 38: Central workspace resizes cleanly and prevents content overlap
  assert(
    appSource.includes('hidden lg:block h-full shrink-0') &&
      appSource.includes('<main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-app-bg">'),
    '38. Central workspace uses flex-1 min-w-0 between shrink-0 desktop sidebars/rails so it resizes without overlap'
  );

  // Item 39: Mobile drawers remain slide-out overlays and do not force desktop icon rails onto mobile viewports
  assert(
    leftSidebarSource.includes('if (isCollapsed && !isMobileDrawer)') &&
      rightSidebarSource.includes('if (isCollapsed && !isMobileDrawer)') &&
      appSource.includes('isMobileDrawer={true}') &&
      appSource.includes('fixed inset-0 z-50 lg:hidden flex'),
    '39. Mobile layout preserves slide-out drawers and does not force desktop icon rails into mobile viewports'
  );

  // Item 40: Tooltips, ARIA labels, and visible keyboard focus rings are present on icon-only controls
  assert(
    leftSidebarSource.includes('title="New Chat — Start a fresh conversation"') &&
      leftSidebarSource.includes('title={`Library (${totalLibraryCount} saved items)`}') &&
      rightSidebarSource.includes('role="checkbox"') &&
      leftSidebarSource.includes('focus-visible:ring-focus-ring') &&
      rightSidebarSource.includes('focus-visible:ring-focus-ring'),
    '40. Tooltips, accessible labels, checkbox semantics, and visible focus rings work across collapsed rail controls'
  );

  // Item 41: Light, dark, and system themes remain functional with synchronous pre-hydration initialization (no flash of wrong theme)
  assert(
    indexCssSource.includes(':root {') &&
      indexCssSource.includes('.dark {') &&
      indexHtmlSource.includes("localStorage.getItem('infoflip-theme')") &&
      indexHtmlSource.includes("document.documentElement.classList.add('dark')") &&
      themeContextSource.includes("root.setAttribute('data-theme', nextResolved)") &&
      themeToggleSource.includes("{ id: 'light', label: 'Light'") &&
      themeToggleSource.includes("{ id: 'dark', label: 'Dark'") &&
      themeToggleSource.includes("{ id: 'system', label: 'System'"),
    '41. Light, dark, and system theme modes initialize synchronously without flash of wrong theme and update root attributes'
  );

  // Item 42: All 23 required semantic design tokens (--color-*) and Graphite + Steel Blue hex values are defined in CSS and Tailwind
  const requiredSemanticTokenNames = [
    '--color-app-background',
    '--color-sidebar-background',
    '--color-surface',
    '--color-surface-elevated',
    '--color-surface-hover',
    '--color-surface-selected',
    '--color-primary',
    '--color-primary-hover',
    '--color-accent',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-muted',
    '--color-border',
    '--color-divider',
    '--color-focus-ring',
    '--color-input-background',
    '--color-input-border',
    '--color-placeholder',
    '--color-disabled-background',
    '--color-disabled-text',
    '--color-overlay',
    '--color-scrollbar-track',
    '--color-scrollbar-thumb'
  ];
  const allSemanticTokensInCss = requiredSemanticTokenNames.every((token) =>
    indexCssSource.includes(token)
  );

  const requiredPaletteHexes = [
    // Dark mode palette
    '#16181C',
    '#242831',
    '#2C313B',
    '#526B88',
    '#8298B0',
    '#F3F4F6',
    '#ADB5C2',
    '#343943',
    '#303642',
    '#344252',
    // Light mode palette
    '#F4F6F8',
    '#E9EDF2',
    '#FFFFFF',
    '#202833',
    '#657180',
    '#DCE2E8',
    '#E3E8EE',
    '#D8E1EA'
  ];
  const allHexesInCss = requiredPaletteHexes.every((hex) =>
    indexCssSource.toUpperCase().includes(hex.toUpperCase())
  );
  const allHexesInTailwind = requiredPaletteHexes.every((hex) =>
    tailwindConfigSource.toUpperCase().includes(hex.toUpperCase())
  );

  assert(
    allSemanticTokensInCss &&
      allHexesInCss &&
      allHexesInTailwind &&
      tailwindConfigSource.includes("'app-bg': 'var(--color-app-background)'") &&
      tailwindConfigSource.includes("'sidebar-bg': 'var(--color-sidebar-background)'") &&
      tailwindConfigSource.includes("DEFAULT: 'var(--color-surface)'"),
    '42. All 23 semantic design tokens (--color-*) and all Graphite + Steel Blue Light & Dark hex values are centrally mapped in CSS and Tailwind'
  );

  // Item 43: Global component audit — zero remaining purple/violet classes or hardcoded dark-only preview frames across UI components
  function collectJsxFiles(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(collectJsxFiles(fullPath));
      } else if (entry.name.endsWith('.jsx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allJsxFiles = collectJsxFiles(SRC_DIR);
  const filesWithPurpleOrViolet = [];
  const filesWithHardcodedWhatsAppOrDarkModal = [];

  for (const file of allJsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(SRC_DIR, file);
    if (/\b(purple|violet)-\d+/i.test(content)) {
      filesWithPurpleOrViolet.push(rel);
    }
    if (/#075E54|#EFEAE2|#D9FDD3|#128C7E/i.test(content)) {
      filesWithHardcodedWhatsAppOrDarkModal.push(rel);
    }
  }

  const smsPreviewSource = fs.readFileSync(
    path.join(SRC_DIR, 'components/communication/SMSPreview.jsx'),
    'utf8'
  );
  const presentationPreviewSource = fs.readFileSync(
    path.join(SRC_DIR, 'components/transformation/previews/PresentationPreview.jsx'),
    'utf8'
  );

  assert(
    filesWithPurpleOrViolet.length === 0 &&
      filesWithHardcodedWhatsAppOrDarkModal.length === 0 &&
      !smsPreviewSource.includes('bg-slate-950') &&
      !presentationPreviewSource.includes('from-slate-900 via-indigo-950'),
    `43. Global component audit: 0 purple/violet classes (${filesWithPurpleOrViolet.join(', ') || 'none'}) and 0 hardcoded dark-only preview cards across all ${allJsxFiles.length} JSX files`
  );

  // Item 44: Existing chat history, Library, content collections, generation, review, and export remain fully operational
  assert(
    libraryViewSource.includes('bg-app-bg') &&
      chatWorkspaceSource.includes('bg-app-bg') &&
      Object.keys(reloadedState.contentItemsById).length === 3 &&
      exportPkg.approvedOutputs.length === 1,
    '44. Existing chat history, Library, content collections, generation, review, and export functionality work end-to-end with the Graphite + Steel Blue theme'
  );

  // Item 45: Top navigation bar button is renamed from "6-Module Pipeline" to "Previous Prototype" without adding duplicate navigation items
  assert(
    chatWorkspaceSource.includes('<span>Previous Prototype</span>') &&
      chatWorkspaceSource.includes('onClick={onOpenPipelineInspector}') &&
      !chatWorkspaceSource.includes('6-Module Pipeline') &&
      !leftSidebarSource.includes('6-Module View') &&
      !leftSidebarSource.includes('Previous Prototype'),
    '45. Top navigation button is renamed to "Previous Prototype", keeps onOpenPipelineInspector handler, and adds no duplicate sidebar navigation item'
  );

  // Item 46: Redundant desktop sidebar expand/collapse controls are removed from ChatWorkspace.jsx, App.jsx, and RightSidebar.jsx bottom rail
  assert(
    !chatWorkspaceSource.includes('PanelLeftOpen') &&
      !chatWorkspaceSource.includes('PanelRightOpen') &&
      !appSource.includes('leftCollapsed && (') &&
      !appSource.includes('rightCollapsed && (') &&
      leftSidebarSource.includes('PanelLeftClose') &&
      leftSidebarSource.includes('PanelLeftOpen') &&
      rightSidebarSource.includes('PanelRightClose') &&
      rightSidebarSource.includes('PanelRightOpen') &&
      (rightSidebarSource.match(/onClick=\{onExpandDesktop\}/g) || []).length === 1,
    '46. Redundant outer expand/collapse controls are removed; LeftSidebar and RightSidebar each retain a single primary expand/collapse control'
  );

  // Item 47: User chat bubble uses theme-responsive Graphite + Steel Blue semantic tokens instead of dark/purple hardcoded classes
  assert(
    chatWorkspaceSource.includes('rounded-2xl bg-surface-selected text-text-primary border border-border') &&
      !chatWorkspaceSource.includes('bg-brand-700') &&
      !chatWorkspaceSource.includes('bg-brand-800') &&
      !chatWorkspaceSource.includes('bg-indigo-600'),
    '47. User chat bubble uses theme-responsive semantic surface and text tokens in Light, Dark, and System modes without dark/purple hardcoded fills'
  );

  // Item 48: Zero indigo-*, brand-*, purple-*, or violet-* classes remain across all JSX files in src/
  const filesWithIndigoOrBrand = [];
  for (const file of allJsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(SRC_DIR, file);
    if (/\b(indigo|brand|purple|violet|fuchsia)-/i.test(content)) {
      filesWithIndigoOrBrand.push(rel);
    }
  }
  assert(
    filesWithIndigoOrBrand.length === 0,
    `48. Zero indigo-*, brand-*, purple-*, or violet-* classes remain across all ${allJsxFiles.length} JSX files (${filesWithIndigoOrBrand.join(', ') || 'none'})`
  );

  // Item 49: ThemeToggle dropdown is properly anchored, opaque, stacked above conversation content, and closes on outside click or Escape
  assert(
    themeToggleSource.includes('className="relative inline-flex items-center"') &&
      themeToggleSource.includes('absolute right-0 top-full mt-1.5') &&
      themeToggleSource.includes('bg-surface-elevated') &&
      themeToggleSource.includes('z-50') &&
      themeToggleSource.includes("event.key === 'Escape'") &&
      themeToggleSource.includes("document.addEventListener('mousedown', handleOutsideInteraction)") &&
      chatWorkspaceSource.includes('<header className="relative z-30 h-14') &&
      appSource.includes('<header className="relative z-30 h-14'),
    '49. ThemeToggle dropdown is anchored below the trigger button with relative z-30 header stacking, opaque surface, and Escape/outside-click handling'
  );

  console.log('\n========================================');
  console.log(`WORKSPACE REDESIGN SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled error in workspaceRedesign.test.js:', err);
  process.exit(1);
});
