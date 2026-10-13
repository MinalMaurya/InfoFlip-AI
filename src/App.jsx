import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Menu,
  Home,
  Sliders,
  MessageSquare,
  Layers,
  ArrowLeft
} from 'lucide-react';
import {
  parseCurrentRoute,
  syncRouteToUrl
} from './services/routing/routeService';

// Landing Page & Chat-Centered Workspace Components
import LandingPage from './components/LandingPage';
import LeftSidebar from './components/workspace/LeftSidebar';
import RightSidebar from './components/workspace/RightSidebar';
import ChatWorkspace from './components/workspace/ChatWorkspace';
import LibraryView from './components/workspace/LibraryView';
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
  approvePassedCanonicalContentItems,
  rejectCanonicalContentItem,
  regenerateCanonicalContentItem,
  restoreApprovedCanonicalContentItem
} from './services/workspace/chatPipelineOrchestrator';
import { DEMO_SCENARIOS } from './data/demoScenarios';
import { SAMPLE_ANALYSIS } from './services/analysisService';

export default function App() {
  // 1. Resolve initial URL route synchronously (preserves screen across browser refreshes & direct links)
  const [initialRoute] = useState(() =>
    parseCurrentRoute(typeof window !== 'undefined' ? window.location : null)
  );

  // 2. Initialize Workspace State & UI Preferences from Browser Storage + URL route
  const [initialLoad] = useState(() => {
    const loadedWorkspace = defaultWorkspaceStorage.loadWorkspaceState();
    const loadedPrefs = defaultWorkspaceStorage.loadUIPreferences();

    const resolvedPrefs = {
      ...loadedPrefs,
      ...(initialRoute.showLandingPage
        ? {}
        : {
            activeSection: initialRoute.activeSection || loadedPrefs.activeSection || 'chat',
            activeCollectionFormat: initialRoute.activeCollectionFormat || null
          })
    };

    const resolvedWorkspaceState = {
      ...loadedWorkspace.state,
      ...(initialRoute.conversationId
        ? { activeConversationId: initialRoute.conversationId }
        : {})
    };

    return {
      workspaceState: resolvedWorkspaceState,
      storageWarning: loadedWorkspace.warning,
      uiPreferences: resolvedPrefs
    };
  });

  const [workspaceState, setWorkspaceState] = useState(initialLoad.workspaceState);
  const [uiPreferences, setUiPreferences] = useState(initialLoad.uiPreferences);
  const [storageWarning, setStorageWarning] = useState(initialLoad.storageWarning);

  // Landing Page is the first page visitors see when opening the website
  // const [showLandingPage, setShowLandingPage] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(() => initialRoute.showLandingPage);

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
  const [pipelineTab, setPipelineTab] = useState(() => initialRoute.pipelineTab || 'create');
  const [source, setSource] = useState(DEMO_SCENARIOS[0].source);
  const [ingestedContract, setIngestedContract] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [transformationResult, setTransformationResult] = useState(null);
  const [communicationResult, setCommunicationResult] = useState(null);
  const [exportPackage, setExportPackage] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAnalysisContractModal, setShowAnalysisContractModal] = useState(false);

  // Ref to differentiate between browser navigation (popstate/hashchange) and user interactions
  const isPopStateRef = useRef(false);

  // Listen for browser Back/Forward (popstate and hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      isPopStateRef.current = true;
      const nextRoute = parseCurrentRoute(window.location);

      setShowLandingPage(nextRoute.showLandingPage);

      if (!nextRoute.showLandingPage) {
        setUiPreferences((prev) => {
          const next = {
            ...prev,
            activeSection: nextRoute.activeSection || 'chat',
            activeCollectionFormat: nextRoute.activeCollectionFormat || null
          };
          defaultWorkspaceStorage.saveUIPreferences(next);
          return next;
        });

        if (nextRoute.pipelineTab) {
          setPipelineTab(nextRoute.pipelineTab);
        }

        if (nextRoute.conversationId) {
          setWorkspaceState((prev) => {
            const exists = (prev.conversations || []).some(
              (c) => c.conversationId === nextRoute.conversationId
            );
            if (exists && prev.activeConversationId !== nextRoute.conversationId) {
              const updated = { ...prev, activeConversationId: nextRoute.conversationId };
              defaultWorkspaceStorage.saveWorkspaceState(updated);
              return updated;
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Synchronize state changes to browser URL (preserves route on refresh and updates browser history)
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    syncRouteToUrl({
      showLandingPage,
      activeSection: uiPreferences.activeSection,
      activeCollectionFormat: uiPreferences.activeCollectionFormat,
      pipelineTab,
      activeConversationId: workspaceState.activeConversationId
    });
  }, [
    showLandingPage,
    uiPreferences.activeSection,
    uiPreferences.activeCollectionFormat,
    pipelineTab,
    workspaceState.activeConversationId
  ]);

  // Persist Workspace State Helper (supports both direct state and functional updater to prevent async stale-closure overwrites)
  const persistWorkspace = useCallback((nextStateOrUpdater) => {
    setWorkspaceState((prev) => {
      const nextState =
        typeof nextStateOrUpdater === 'function' ? nextStateOrUpdater(prev) : nextStateOrUpdater;
      const saveResult = defaultWorkspaceStorage.saveWorkspaceState(nextState);
      if (!saveResult.success && saveResult.error) {
        setStorageWarning(saveResult.error);
      }
      return nextState;
    });
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
    setShowLandingPage(false);
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
      setShowLandingPage(false);
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
      setShowLandingPage(false);
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
      setShowLandingPage(false);

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

        persistWorkspace((prev) => {
          const nextItemsById = { ...prev.contentItemsById };
          for (const item of turnResult.canonicalItems) {
            nextItemsById[item.itemId] = item;
          }

          const existingIndex = prev.conversations.findIndex(
            (c) => c.conversationId === updatedConversation.conversationId
          );
          let nextConversations;
          if (existingIndex >= 0) {
            nextConversations = [...prev.conversations];
            nextConversations[existingIndex] = updatedConversation;
          } else {
            nextConversations = [updatedConversation, ...prev.conversations];
          }

          return {
            ...prev,
            activeConversationId: updatedConversation.conversationId,
            conversations: nextConversations,
            contentItemsById: nextItemsById,
            updatedAt: nowIso
          };
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
    [activeConversation, persistWorkspace]
  );

  // ============================================================================
  // CANONICAL CONTENT ITEM ACTIONS (SHARED ACROSS CHAT, LIBRARY & COLLECTIONS)
  // ============================================================================

  const handleEditItem = useCallback(
    (itemId, newContentOrStructured) => {
      persistWorkspace((prev) => {
        const existingItem = prev.contentItemsById?.[itemId];
        if (!existingItem) return prev;

        const conv = prev.conversations.find(
          (c) => c.conversationId === existingItem.conversationId
        );
        const updatedItem = editCanonicalContentItem(existingItem, newContentOrStructured, conv || {});
        if (!updatedItem) return prev;

        return {
          ...prev,
          contentItemsById: {
            ...prev.contentItemsById,
            [itemId]: updatedItem
          }
        };
      });
    },
    [persistWorkspace]
  );

  const handleApproveItem = useCallback(
    (itemId, notes = '') => {
      persistWorkspace((prev) => {
        const existingItem = prev.contentItemsById?.[itemId];
        if (!existingItem) return prev;

        const approvedItem = approveCanonicalContentItem(existingItem, notes);
        if (!approvedItem) return prev;

        return {
          ...prev,
          contentItemsById: {
            ...prev.contentItemsById,
            [itemId]: approvedItem
          }
        };
      });
    },
    [persistWorkspace]
  );

  const handleRejectItem = useCallback(
    (itemId, reason = 'Needs revision') => {
      persistWorkspace((prev) => {
        const existingItem = prev.contentItemsById?.[itemId];
        if (!existingItem) return prev;

        const rejectedItem = rejectCanonicalContentItem(existingItem, reason);
        if (!rejectedItem) return prev;

        return {
          ...prev,
          contentItemsById: {
            ...prev.contentItemsById,
            [itemId]: rejectedItem
          }
        };
      });
    },
    [persistWorkspace]
  );

  const handleApproveAllInTurn = useCallback(
    (itemIds = []) => {
      if (!Array.isArray(itemIds) || itemIds.length === 0) return;
      persistWorkspace((prev) => {
        const { updatedItemsById, approvedCount } = approvePassedCanonicalContentItems(
          prev.contentItemsById,
          itemIds,
          'Batch approved in workspace (passed all required checks)'
        );
        if (approvedCount === 0) return prev;
        return {
          ...prev,
          contentItemsById: updatedItemsById
        };
      });
    },
    [persistWorkspace]
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
          persistWorkspace((prev) => ({
            ...prev,
            contentItemsById: {
              ...prev.contentItemsById,
              [itemId]: regeneratedItem
            }
          }));
        }
      } finally {
        setRegeneratingItemId(null);
      }
    },
    [workspaceState, activeConversation, persistWorkspace]
  );

  const handleRestoreApprovedItem = useCallback(
    (itemId) => {
      persistWorkspace((prev) => {
        const existingItem = prev.contentItemsById?.[itemId];
        if (!existingItem) return prev;
        const restoredItem = restoreApprovedCanonicalContentItem(existingItem);
        if (!restoredItem) return prev;
        return {
          ...prev,
          contentItemsById: {
            ...prev.contentItemsById,
            [itemId]: restoredItem
          }
        };
      });
    },
    [persistWorkspace]
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

  const activeSection =
    uiPreferences.activeSection === 'explore' || uiPreferences.activeSection === 'scheduled'
      ? 'chat'
      : uiPreferences.activeSection || 'chat';
  const leftCollapsed = Boolean(uiPreferences.leftSidebarCollapsed);
  const rightCollapsed = Boolean(uiPreferences.rightSidebarCollapsed);

  const handleEnterWorkspace = useCallback(() => {
    setShowLandingPage(false);
  }, []);

  const handleOpenLandingPage = useCallback(() => {
    setMobileLeftDrawerOpen(false);
    setMobileRightDrawerOpen(false);
    setShowLandingPage(true);
  }, []);

  if (showLandingPage) {
    return (
      <div className="w-full min-h-screen animate-fade-in">
        <LandingPage
          onGetStarted={handleEnterWorkspace}
          savedConversationsCount={workspaceState.conversations?.length || 0}
          savedItemsCount={Object.keys(workspaceState.contentItemsById || {}).length}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex font-sans text-foreground transition-colors animate-fade-in">
      {/* =====================================================================
          A. LEFT SIDEBAR (Desktop Collapsible Icon Rail + Mobile Slide-Out Drawer)
         ===================================================================== */}
      <div className="hidden lg:block h-full shrink-0 transition-[width] duration-200 ease-in-out">
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
          onOpenLandingPage={handleOpenLandingPage}
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
            className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
            onClick={() => setMobileLeftDrawerOpen(false)}
            aria-label="Close navigation drawer backdrop"
          />
          <div className="relative z-10 h-full max-w-[85vw] animate-slide-in-left shadow-2xl">
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
              onOpenLandingPage={handleOpenLandingPage}
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
            onRestoreApprovedItem={handleRestoreApprovedItem}
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
            onOpenLandingPage={handleOpenLandingPage}
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
                <button
                  type="button"
                  onClick={handleOpenLandingPage}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border bg-surface transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  title="Return to Landing Page"
                >
                  <Home className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                  <span className="hidden sm:inline">Landing Page</span>
                </button>

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
                onRestoreApprovedItem={handleRestoreApprovedItem}
                regeneratingItemId={regeneratingItemId}
                onStartNewChat={handleNewChat}
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
      <div className="hidden lg:block h-full shrink-0 transition-[width] duration-200 ease-in-out">
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
            className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
            onClick={() => setMobileRightDrawerOpen(false)}
            aria-label="Close output formats drawer backdrop"
          />
          <div className="relative z-10 h-full max-w-[85vw] animate-slide-in-right shadow-2xl">
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
