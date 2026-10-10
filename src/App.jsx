import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  Sliders,
  MessageSquare,
  Layers,
  ArrowLeft
} from 'lucide-react';

// Chat-Centered Workspace Components
import LeftSidebar from './components/workspace/LeftSidebar';
import RightSidebar from './components/workspace/RightSidebar';
import ChatWorkspace from './components/workspace/ChatWorkspace';
import LibraryView from './components/workspace/LibraryView';
import ScheduledPostsView from './components/workspace/ScheduledPostsView';
import ExploreView from './components/workspace/ExploreView';
import ThemeToggle from './components/ThemeToggle';

// Classic 6-Module Pipeline Inspector Views & Modals
import PipelineStepIndicator from './components/input/PipelineStepIndicator';
import Module1CreateView from './components/input/Module1CreateView';
import Module2AnalysisView from './components/analysis/Module2AnalysisView';
import Module3TransformView from './components/transformation/Module3TransformView';
import Module4CommunicationView from './views/Module4CommunicationView';
import Module5ReviewView from './views/Module5ReviewView';
import Module6ExportView from './views/Module6ExportView';
import AboutView from './components/AboutView';
import DataContractModal from './components/input/DataContractModal';
import AnalysisDataContractModal from './components/analysis/AnalysisDataContractModal';

// Services & State
import {
  defaultWorkspaceStorage,
  createEmptyConversation,
  generateConversationTitle,
  DEFAULT_GENERATION_CONFIG
} from './services/storage/workspaceStorageService';
import {
  executeChatTurn,
  editCanonicalContentItem,
  approveCanonicalContentItem,
  rejectCanonicalContentItem,
  regenerateCanonicalContentItem
} from './services/workspace/chatPipelineOrchestrator';
import { DEMO_SCENARIOS } from './data/demoScenarios';
import { SAMPLE_ANALYSIS } from './services/analysisService';

export default function App() {
  // 1. Initialize Workspace State & UI Preferences from Browser Storage
  const [initialLoad] = useState(() => {
    const loadedWorkspace = defaultWorkspaceStorage.loadWorkspaceState();
    const loadedPrefs = defaultWorkspaceStorage.loadUIPreferences();
    return {
      workspaceState: loadedWorkspace.state,
      storageWarning: loadedWorkspace.warning,
      uiPreferences: loadedPrefs
    };
  });

  const [workspaceState, setWorkspaceState] = useState(initialLoad.workspaceState);
  const [uiPreferences, setUiPreferences] = useState(initialLoad.uiPreferences);
  const [storageWarning, setStorageWarning] = useState(initialLoad.storageWarning);

  // In-memory draft conversation when starting a new unsaved chat (prevents polluting Recent Chats with empty sessions)
  const [pendingConversation, setPendingConversation] = useState(() =>
    createEmptyConversation({ title: 'New Chat' })
  );

  // Mobile Drawer State (independent left & right slide-out drawers)
  const [mobileLeftDrawerOpen, setMobileLeftDrawerOpen] = useState(false);
  const [mobileRightDrawerOpen, setMobileRightDrawerOpen] = useState(false);

  // Generation & Regeneration State
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingItemId, setRegeneratingItemId] = useState(null);
  const [progressState, setProgressState] = useState({
    module: 1,
    stage: 'idle',
    title: '',
    detail: ''
  });
  const [composerFocusTrigger, setComposerFocusTrigger] = useState(0);

  // Classic 6-Module Pipeline Inspector State (preserved for deep module inspection)
  const [pipelineTab, setPipelineTab] = useState('create'); // 'create' | 'understand' | 'transform' | 'communicate' | 'review' | 'export'
  const [source, setSource] = useState(DEMO_SCENARIOS[0].source);
  const [ingestedContract, setIngestedContract] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [transformationResult, setTransformationResult] = useState(null);
  const [communicationResult, setCommunicationResult] = useState(null);
  const [exportPackage, setExportPackage] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAnalysisContractModal, setShowAnalysisContractModal] = useState(false);

  // Persist Workspace State Helper
  const persistWorkspace = useCallback((nextState) => {
    setWorkspaceState(nextState);
    const saveResult = defaultWorkspaceStorage.saveWorkspaceState(nextState);
    if (!saveResult.success && saveResult.error) {
      setStorageWarning(saveResult.error);
    }
  }, []);

  // Persist UI Preferences Helper
  const updateUIPreferences = useCallback((patch) => {
    setUiPreferences((prev) => {
      const next = { ...prev, ...patch };
      const saveResult = defaultWorkspaceStorage.saveUIPreferences(next);
      if (!saveResult.success && saveResult.error) {
        setStorageWarning(saveResult.error);
      }
      return next;
    });
  }, []);

  // Escape key handler to close mobile drawers cleanly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileLeftDrawerOpen) setMobileLeftDrawerOpen(false);
        if (mobileRightDrawerOpen) setMobileRightDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileLeftDrawerOpen, mobileRightDrawerOpen]);

  // Resolve Active Conversation (either hydrated from stored conversations or the pending new chat)
  const activeConversation = React.useMemo(() => {
    if (workspaceState.activeConversationId) {
      const hydrated = defaultWorkspaceStorage.hydrateConversation(
        workspaceState,
        workspaceState.activeConversationId
      );
      if (hydrated) return hydrated;
    }
    return pendingConversation;
  }, [workspaceState, pendingConversation]);

  // ============================================================================
  // NAVIGATION & NEW CHAT HANDLERS
  // ============================================================================

  // Start a New Chat (Section 3A: preserve unsaved work if present, reset config/input to defaults, focus composer)
  const handleNewChat = useCallback(() => {
    let nextConversations = [...workspaceState.conversations];

    // If the user is in a pending (unsaved) conversation and has typed unsaved draft content, save it first
    if (!workspaceState.activeConversationId) {
      const hasUnsavedDraft =
        Boolean(pendingConversation.draft?.prompt?.trim()) ||
        Boolean(pendingConversation.draft?.sourceText?.trim());

      if (hasUnsavedDraft) {
        const savedDraftConv = {
          ...pendingConversation,
          title: generateConversationTitle({
            prompt: pendingConversation.draft?.prompt,
            sourceText: pendingConversation.draft?.sourceText
          }),
          updatedAt: new Date().toISOString()
        };
        nextConversations = [savedDraftConv, ...nextConversations];
      }
    }

    const freshConv = createEmptyConversation({
      title: 'New Chat',
      config: { ...DEFAULT_GENERATION_CONFIG },
      draft: { prompt: '', sourceText: '' }
    });

    setPendingConversation(freshConv);
    persistWorkspace({
      ...workspaceState,
      activeConversationId: null,
      conversations: nextConversations
    });

    updateUIPreferences({
      activeSection: 'chat',
      activeCollectionFormat: null
    });
    setComposerFocusTrigger((c) => c + 1);
  }, [workspaceState, pendingConversation, persistWorkspace, updateUIPreferences]);

  // Select a section in Left Sidebar ('chat' | 'library' | 'scheduled' | 'explore' | 'pipeline' | 'about')
  const handleSelectSection = useCallback(
    (sectionId) => {
      updateUIPreferences({
        activeSection: sectionId,
        activeCollectionFormat: null
      });
    },
    [updateUIPreferences]
  );

  // Select a Content Collection format filter in Left Sidebar
  const handleSelectCollection = useCallback(
    (formatId) => {
      if (!formatId) {
        updateUIPreferences({
          activeSection: 'library',
          activeCollectionFormat: null
        });
        return;
      }
      updateUIPreferences({
        activeSection: 'collection',
        activeCollectionFormat: formatId
      });
    },
    [updateUIPreferences]
  );

  // Open an existing Conversation from Recent Chats or Library
  const handleSelectConversation = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      // Save any unsaved pending draft before switching
      let nextConversations = [...workspaceState.conversations];
      if (
        !workspaceState.activeConversationId &&
        (pendingConversation.draft?.prompt?.trim() || pendingConversation.draft?.sourceText?.trim())
      ) {
        const savedDraftConv = {
          ...pendingConversation,
          title: generateConversationTitle({
            prompt: pendingConversation.draft?.prompt,
            sourceText: pendingConversation.draft?.sourceText
          }),
          updatedAt: new Date().toISOString()
        };
        nextConversations = [savedDraftConv, ...nextConversations];
      }

      persistWorkspace({
        ...workspaceState,
        activeConversationId: conversationId,
        conversations: nextConversations
      });

      updateUIPreferences({
        activeSection: 'chat',
        activeCollectionFormat: null
      });
    },
    [workspaceState, pendingConversation, persistWorkspace, updateUIPreferences]
  );

  // ============================================================================
  // ACTIVE CONVERSATION DRAFT & CONFIG UPDATES
  // ============================================================================

  const handleUpdateDraft = useCallback(
    (nextDraft) => {
      if (workspaceState.activeConversationId) {
        const nextConversations = workspaceState.conversations.map((conv) =>
          conv.conversationId === workspaceState.activeConversationId
            ? {
                ...conv,
                draft: { ...conv.draft, ...nextDraft },
                updatedAt: new Date().toISOString()
              }
            : conv
        );
        persistWorkspace({
          ...workspaceState,
          conversations: nextConversations
        });
      } else {
        setPendingConversation((prev) => ({
          ...prev,
          draft: { ...prev.draft, ...nextDraft },
          updatedAt: new Date().toISOString()
        }));
      }
    },
    [workspaceState, persistWorkspace]
  );

  const handleUpdateConfig = useCallback(
    (configPatch) => {
      if (workspaceState.activeConversationId) {
        const nextConversations = workspaceState.conversations.map((conv) =>
          conv.conversationId === workspaceState.activeConversationId
            ? {
                ...conv,
                config: { ...conv.config, ...configPatch },
                updatedAt: new Date().toISOString()
              }
            : conv
        );
        persistWorkspace({
          ...workspaceState,
          conversations: nextConversations
        });
      } else {
        setPendingConversation((prev) => ({
          ...prev,
          config: { ...prev.config, ...configPatch },
          updatedAt: new Date().toISOString()
        }));
      }
    },
    [workspaceState, persistWorkspace]
  );

  // ============================================================================
  // CHAT TURN EXECUTION (MODULES 1 -> 2 -> 3 -> 4 -> 5)
  // ============================================================================

  const handleSubmitTurn = useCallback(
    async ({ prompt, sourceText, file }) => {
      setIsGenerating(true);
      setProgressState({
        module: 1,
        stage: 'ingest',
        title: 'Module 1: Validating & ingesting source',
        detail: 'Preparing input for the 6-module transformation pipeline...'
      });

      try {
        const targetConv = activeConversation;
        const turnResult = await executeChatTurn({
          conversation: targetConv,
          prompt,
          sourceText,
          file,
          requestedFormats: targetConv.config?.selectedFormats,
          configOverrides: targetConv.config,
          onProgress: (prog) => setProgressState(prog)
        });

        const nowIso = new Date().toISOString();
        const isFirstTurn = !targetConv.messages || targetConv.messages.length === 0;
        const resolvedTitle =
          isFirstTurn || targetConv.title === 'New Chat'
            ? generateConversationTitle({
                prompt,
                sourceText: sourceText || turnResult.sourceData?.extractedText,
                fileName: file?.name || turnResult.sourceData?.fileName,
                mainTopic: turnResult.analysisData?.overview?.mainTopic
              })
            : targetConv.title;

        // Strip hydrated `outputs` before persisting conversation message records
        const cleanExistingMessages = (targetConv.messages || []).map((m) => {
          const copy = { ...m };
          delete copy.outputs;
          return copy;
        });

        const updatedConversation = {
          ...targetConv,
          title: resolvedTitle,
          updatedAt: nowIso,
          messages: [...cleanExistingMessages, turnResult.userMessage, turnResult.assistantMessage],
          activeSource: turnResult.sourceData,
          activeAnalysis: turnResult.analysisData,
          lastTransformationResult: turnResult.transformationResult,
          lastCommunicationResult: turnResult.communicationResult,
          lastReviewResult: turnResult.reviewResult,
          config: turnResult.resolvedConfig,
          draft: { prompt: '', sourceText: '' }
        };

        // Merge canonical items into contentItemsById
        const nextItemsById = { ...workspaceState.contentItemsById };
        for (const item of turnResult.canonicalItems) {
          nextItemsById[item.itemId] = item;
        }

        const existingIndex = workspaceState.conversations.findIndex(
          (c) => c.conversationId === updatedConversation.conversationId
        );
        let nextConversations;
        if (existingIndex >= 0) {
          nextConversations = [...workspaceState.conversations];
          nextConversations[existingIndex] = updatedConversation;
        } else {
          nextConversations = [updatedConversation, ...workspaceState.conversations];
        }

        persistWorkspace({
          ...workspaceState,
          activeConversationId: updatedConversation.conversationId,
          conversations: nextConversations,
          contentItemsById: nextItemsById,
          updatedAt: nowIso
        });

        // Also sync with classic 6-module inspector state
        setIngestedContract(turnResult.sourceData);
        setSource(turnResult.sourceData?.extractedText || turnResult.sourceData?.rawText || '');
        setAnalysisData(turnResult.analysisData);
        setTransformationResult(turnResult.transformationResult);
        setCommunicationResult(turnResult.communicationResult);
      } finally {
        setIsGenerating(false);
      }
    },
    [activeConversation, workspaceState, persistWorkspace]
  );

  // ============================================================================
  // CANONICAL CONTENT ITEM ACTIONS (SHARED ACROSS CHAT, LIBRARY & COLLECTIONS)
  // ============================================================================

  const handleEditItem = useCallback(
    (itemId, newContentOrStructured) => {
      const existingItem = workspaceState.contentItemsById?.[itemId];
      if (!existingItem) return;

      const conv = workspaceState.conversations.find(
        (c) => c.conversationId === existingItem.conversationId
      );
      const updatedItem = editCanonicalContentItem(existingItem, newContentOrStructured, conv || {});
      if (!updatedItem) return;

      persistWorkspace({
        ...workspaceState,
        contentItemsById: {
          ...workspaceState.contentItemsById,
          [itemId]: updatedItem
        }
      });
    },
    [workspaceState, persistWorkspace]
  );

  const handleApproveItem = useCallback(
    (itemId, notes = '') => {
      const existingItem = workspaceState.contentItemsById?.[itemId];
      if (!existingItem) return;

      const approvedItem = approveCanonicalContentItem(existingItem, notes);
      if (!approvedItem) return;

      persistWorkspace({
        ...workspaceState,
        contentItemsById: {
          ...workspaceState.contentItemsById,
          [itemId]: approvedItem
        }
      });
    },
    [workspaceState, persistWorkspace]
  );

  const handleRejectItem = useCallback(
    (itemId, reason = 'Needs revision') => {
      const existingItem = workspaceState.contentItemsById?.[itemId];
      if (!existingItem) return;

      const rejectedItem = rejectCanonicalContentItem(existingItem, reason);
      if (!rejectedItem) return;

      persistWorkspace({
        ...workspaceState,
        contentItemsById: {
          ...workspaceState.contentItemsById,
          [itemId]: rejectedItem
        }
      });
    },
    [workspaceState, persistWorkspace]
  );

  const handleApproveAllInTurn = useCallback(
    (itemIds = []) => {
      if (!Array.isArray(itemIds) || itemIds.length === 0) return;
      const nextItemsById = { ...workspaceState.contentItemsById };
      for (const id of itemIds) {
        if (nextItemsById[id]) {
          nextItemsById[id] = approveCanonicalContentItem(nextItemsById[id], 'Batch approved in workspace');
        }
      }
      persistWorkspace({
        ...workspaceState,
        contentItemsById: nextItemsById
      });
    },
    [workspaceState, persistWorkspace]
  );

  const handleRegenerateItem = useCallback(
    async (itemId) => {
      const existingItem = workspaceState.contentItemsById?.[itemId];
      if (!existingItem) return;

      const conv =
        workspaceState.conversations.find((c) => c.conversationId === existingItem.conversationId) ||
        activeConversation;
      if (!conv) return;

      setRegeneratingItemId(itemId);
      try {
        const regeneratedItem = await regenerateCanonicalContentItem(existingItem, conv);
        if (regeneratedItem) {
          persistWorkspace({
            ...workspaceState,
            contentItemsById: {
              ...workspaceState.contentItemsById,
              [itemId]: regeneratedItem
            }
          });
        }
      } finally {
        setRegeneratingItemId(null);
      }
    },
    [workspaceState, activeConversation, persistWorkspace]
  );

  // ============================================================================
  // CLASSIC 6-MODULE PIPELINE INSPECTOR HANDLERS
  // ============================================================================

  const canNavigateToPipelineStep = (stepId) => {
    const stepNumMap = {
      create: 1,
      understand: 2,
      transform: 3,
      communicate: 4,
      review: 5,
      export: 6
    };
    const currentNum = stepNumMap[pipelineTab] || 1;
    if (stepId <= currentNum) return true;
    switch (stepId) {
      case 1:
        return true;
      case 2:
        return !!(ingestedContract || source);
      case 3:
        return !!analysisData;
      case 4:
        return !!transformationResult;
      case 5:
        return !!communicationResult;
      case 6:
        return !!exportPackage;
      default:
        return false;
    }
  };

  const handlePipelineStepClick = (stepId) => {
    const stepTabMap = {
      1: 'create',
      2: 'understand',
      3: 'transform',
      4: 'communicate',
      5: 'review',
      6: 'export'
    };
    if (stepTabMap[stepId]) {
      setPipelineTab(stepTabMap[stepId]);
    }
  };

  const handleUseDemoScenarioFromExplore = (scenario) => {
    if (!scenario) return;
    handleUpdateDraft({
      prompt: `Create multi-format communications for ${scenario.name} (${scenario.audience}, ${scenario.tone} tone).`,
      sourceText: scenario.source
    });
    handleUpdateConfig({
      targetAudience: scenario.audience,
      tone: scenario.tone,
      language: scenario.language
    });
    updateUIPreferences({
      activeSection: 'chat',
      activeCollectionFormat: null
    });
    setComposerFocusTrigger((c) => c + 1);
  };

  const activeSection = uiPreferences.activeSection || 'chat';
  const leftCollapsed = Boolean(uiPreferences.leftSidebarCollapsed);
  const rightCollapsed = Boolean(uiPreferences.rightSidebarCollapsed);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex font-sans text-foreground transition-colors">
      {/* =====================================================================
          A. LEFT SIDEBAR (Desktop Collapsible Icon Rail + Mobile Slide-Out Drawer)
         ===================================================================== */}
      <div className="hidden lg:block h-full shrink-0">
        <LeftSidebar
          activeSection={activeSection}
          activeCollectionFormat={uiPreferences.activeCollectionFormat}
          activeConversationId={workspaceState.activeConversationId}
          conversations={workspaceState.conversations}
          contentItemsById={workspaceState.contentItemsById}
          onNewChat={handleNewChat}
          onSelectSection={handleSelectSection}
          onSelectCollection={handleSelectCollection}
          onSelectConversation={handleSelectConversation}
          isCollapsed={leftCollapsed}
          onCollapseDesktop={() => updateUIPreferences({ leftSidebarCollapsed: true })}
          onExpandDesktop={() => updateUIPreferences({ leftSidebarCollapsed: false })}
        />
      </div>

      {/* Mobile Left Slide-Out Drawer */}
      {mobileLeftDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
        >
          <div
            className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity"
            onClick={() => setMobileLeftDrawerOpen(false)}
            aria-label="Close navigation drawer backdrop"
          />
          <div className="relative z-10 h-full max-w-[85vw]">
            <LeftSidebar
              activeSection={activeSection}
              activeCollectionFormat={uiPreferences.activeCollectionFormat}
              activeConversationId={workspaceState.activeConversationId}
              conversations={workspaceState.conversations}
              contentItemsById={workspaceState.contentItemsById}
              onNewChat={handleNewChat}
              onSelectSection={handleSelectSection}
              onSelectCollection={handleSelectCollection}
              onSelectConversation={handleSelectConversation}
              onCloseMobileDrawer={() => setMobileLeftDrawerOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          B. CENTER WORKSPACE (Auto-expands when either sidebar is collapsed)
         ===================================================================== */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-app-bg">
        {activeSection === 'chat' ? (
          <ChatWorkspace
            conversation={activeConversation}
            leftSidebarCollapsed={leftCollapsed}
            rightSidebarCollapsed={rightCollapsed}
            onExpandLeftSidebar={() => updateUIPreferences({ leftSidebarCollapsed: false })}
            onExpandRightSidebar={() => updateUIPreferences({ rightSidebarCollapsed: false })}
            onOpenMobileLeftDrawer={() => {
              setMobileRightDrawerOpen(false);
              setMobileLeftDrawerOpen(true);
            }}
            onOpenMobileRightDrawer={() => {
              setMobileLeftDrawerOpen(false);
              setMobileRightDrawerOpen(true);
            }}
            onSubmitTurn={handleSubmitTurn}
            onUpdateDraft={handleUpdateDraft}
            onUpdateConfig={handleUpdateConfig}
            onEditItem={handleEditItem}
            onApproveItem={handleApproveItem}
            onRejectItem={handleRejectItem}
            onApproveAllInTurn={handleApproveAllInTurn}
            onRegenerateItem={handleRegenerateItem}
            regeneratingItemId={regeneratingItemId}
            isGenerating={isGenerating}
            progressState={progressState}
            storageWarning={storageWarning}
            onDismissStorageWarning={() => setStorageWarning(null)}
            onOpenPipelineInspector={() => {
              if (activeConversation.activeSource) setIngestedContract(activeConversation.activeSource);
              if (activeConversation.activeAnalysis) setAnalysisData(activeConversation.activeAnalysis);
              if (activeConversation.lastTransformationResult) setTransformationResult(activeConversation.lastTransformationResult);
              if (activeConversation.lastCommunicationResult) setCommunicationResult(activeConversation.lastCommunicationResult);
              setPipelineTab(activeConversation.lastCommunicationResult ? 'review' : 'create');
              handleSelectSection('pipeline');
            }}
            onOpenExportInspector={(pkg) => {
              setExportPackage(pkg);
              setPipelineTab('export');
              handleSelectSection('pipeline');
            }}
            composerFocusTrigger={composerFocusTrigger}
          />
        ) : (
          /* Non-Chat Workspace Sections (Library, Collections, Scheduled Posts, Explore, Pipeline Inspector, About) */
          <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-app-bg">
            {/* Shared Compact Top Header for Secondary Workspace Views */}
            <header className="relative z-30 h-14 px-3 sm:px-5 bg-surface border-b border-border flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setMobileRightDrawerOpen(false);
                    setMobileLeftDrawerOpen(true);
                  }}
                  aria-label="Open navigation menu"
                  className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSection('chat')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chat</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ThemeToggle />

                <button
                  type="button"
                  onClick={() => {
                    setMobileLeftDrawerOpen(false);
                    setMobileRightDrawerOpen(true);
                  }}
                  aria-label="Open output format settings"
                  className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-selected text-text-primary border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <Sliders className="w-3.5 h-3.5 text-primary dark:text-accent" />
                  <span>{activeConversation?.config?.selectedFormats?.length || 0}</span>
                </button>
              </div>
            </header>

            {/* Active Secondary Section Body */}
            {activeSection === 'library' || activeSection === 'collection' ? (
              <LibraryView
                contentItemsById={workspaceState.contentItemsById}
                conversations={workspaceState.conversations}
                collectionFormatId={
                  activeSection === 'collection' ? uiPreferences.activeCollectionFormat : null
                }
                onSelectCollectionFormat={(fmtId) => handleSelectCollection(fmtId)}
                onOpenConversation={handleSelectConversation}
                onEditItem={handleEditItem}
                onApproveItem={handleApproveItem}
                onRejectItem={handleRejectItem}
                onRegenerateItem={handleRegenerateItem}
                onStartNewChat={handleNewChat}
              />
            ) : activeSection === 'scheduled' ? (
              <ScheduledPostsView onBackToChat={() => handleSelectSection('chat')} />
            ) : activeSection === 'explore' ? (
              <ExploreView
                onBackToChat={() => handleSelectSection('chat')}
                onUseDemoScenario={handleUseDemoScenarioFromExplore}
              />
            ) : activeSection === 'about' ? (
              <div className="flex-1 overflow-y-auto">
                <AboutView onStartTransforming={() => handleSelectSection('chat')} />
              </div>
            ) : (
              /* Classic 6-Module Pipeline Inspector View */
              <div className="flex-1 overflow-y-auto">
                <section
                  aria-label="Content Transformation Workflow Pipeline"
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
                >
                  <PipelineStepIndicator
                    activeTab={pipelineTab}
                    onStepClick={handlePipelineStepClick}
                    canNavigateToStep={canNavigateToPipelineStep}
                  />
                </section>

                {pipelineTab === 'create' ? (
                  <Module1CreateView
                    initialSource={source}
                    onProceedToModule2={(contract) => {
                      if (!contract) return;
                      setIngestedContract(contract);
                      setSource(contract.extractedText || contract.rawText);
                      setPipelineTab('understand');
                    }}
                  />
                ) : pipelineTab === 'understand' ? (
                  <Module2AnalysisView
                    sourceData={
                      ingestedContract ||
                      (source
                        ? {
                            sourceId: `src-direct-${Date.now()}`,
                            sourceType: 'text',
                            fileName: 'Pasted Text Source',
                            rawText: source,
                            extractedText: source,
                            metadata: {
                              wordCount: source.split(/\s+/).filter(Boolean).length,
                              characterCount: source.length
                            },
                            createdAt: new Date().toISOString()
                          }
                        : null)
                    }
                    onContinueToTransform={({ source: src, analysis }) => {
                      if (analysis) setAnalysisData(analysis);
                      if (src) {
                        setIngestedContract(src);
                        setSource(src.extractedText || src.rawText);
                      }
                      setPipelineTab('transform');
                    }}
                    onBackToInput={() => setPipelineTab('create')}
                  />
                ) : pipelineTab === 'communicate' ? (
                  <Module4CommunicationView
                    sourceData={ingestedContract}
                    analysisData={analysisData}
                    transformationResult={transformationResult}
                    onBackToInput={() => setPipelineTab('create')}
                    onBackToUnderstand={() => setPipelineTab('understand')}
                    onBackToTransform={() => setPipelineTab('transform')}
                    onProceedToModule5={({ source: src, analysis, transformation, communication }) => {
                      if (communication) setCommunicationResult(communication);
                      if (transformation) setTransformationResult(transformation);
                      if (analysis) setAnalysisData(analysis);
                      if (src) setIngestedContract(src);
                      setPipelineTab('review');
                    }}
                    onLoadDemo={() => {
                      setSource(DEMO_SCENARIOS[0].source);
                      setAnalysisData(SAMPLE_ANALYSIS);
                    }}
                  />
                ) : pipelineTab === 'review' ? (
                  <Module5ReviewView
                    sourceData={ingestedContract}
                    analysisData={analysisData}
                    transformationResult={transformationResult}
                    communicationResult={communicationResult}
                    onBackToInput={() => setPipelineTab('create')}
                    onBackToUnderstand={() => setPipelineTab('understand')}
                    onBackToTransform={() => setPipelineTab('transform')}
                    onBackToCommunicate={() => setPipelineTab('communicate')}
                    onProceedToModule6={(pkg) => {
                      if (pkg) setExportPackage(pkg);
                      setPipelineTab('export');
                    }}
                    onLoadDemo={() => {
                      setSource(DEMO_SCENARIOS[0].source);
                      setAnalysisData(SAMPLE_ANALYSIS);
                    }}
                  />
                ) : pipelineTab === 'export' ? (
                  <Module6ExportView
                    exportPackage={exportPackage}
                    onBackToInput={() => setPipelineTab('create')}
                    onBackToUnderstand={() => setPipelineTab('understand')}
                    onBackToTransform={() => setPipelineTab('transform')}
                    onBackToCommunicate={() => setPipelineTab('communicate')}
                    onBackToReview={() => setPipelineTab('review')}
                    onLoadDemo={() => {
                      setSource(DEMO_SCENARIOS[0].source);
                      setAnalysisData(SAMPLE_ANALYSIS);
                    }}
                  />
                ) : (
                  <Module3TransformView
                    sourceData={ingestedContract}
                    analysisData={analysisData}
                    onBackToInput={() => setPipelineTab('create')}
                    onBackToUnderstand={() => setPipelineTab('understand')}
                    onProceedToModule4={({ source: src, analysis, transformation }) => {
                      if (transformation) setTransformationResult(transformation);
                      if (analysis) setAnalysisData(analysis);
                      if (src) setIngestedContract(src);
                      setPipelineTab('communicate');
                    }}
                    onLoadDemo={() => {
                      setSource(DEMO_SCENARIOS[0].source);
                      setAnalysisData(SAMPLE_ANALYSIS);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          C. RIGHT SIDEBAR (Desktop Collapsible Icon Rail + Mobile Slide-Out Drawer)
         ===================================================================== */}
      <div className="hidden lg:block h-full shrink-0">
        <RightSidebar
          config={activeConversation?.config || DEFAULT_GENERATION_CONFIG}
          onUpdateConfig={handleUpdateConfig}
          isCollapsed={rightCollapsed}
          onCollapseDesktop={() => updateUIPreferences({ rightSidebarCollapsed: true })}
          onExpandDesktop={() => updateUIPreferences({ rightSidebarCollapsed: false })}
        />
      </div>

      {/* Mobile Right Slide-Out Drawer */}
      {mobileRightDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Output Formats & Settings Drawer"
        >
          <div
            className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity"
            onClick={() => setMobileRightDrawerOpen(false)}
            aria-label="Close output formats drawer backdrop"
          />
          <div className="relative z-10 h-full max-w-[85vw]">
            <RightSidebar
              config={activeConversation?.config || DEFAULT_GENERATION_CONFIG}
              onUpdateConfig={handleUpdateConfig}
              onCloseMobileDrawer={() => setMobileRightDrawerOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Data Contract Inspection Modals */}
      <DataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        contractData={ingestedContract}
      />
      <AnalysisDataContractModal
        isOpen={showAnalysisContractModal}
        onClose={() => setShowAnalysisContractModal(false)}
        analysisData={analysisData}
      />
    </div>
  );
}
