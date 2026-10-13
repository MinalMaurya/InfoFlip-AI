import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Home,
  Sliders,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Copy,
  Check,
  Layers,
  BrainCircuit,
  FolderArchive,
  FileCode,
  ExternalLink,
  Link2,
  Eye,
  RefreshCw
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle.jsx';
import GeneralDisclaimerNotice from '../common/GeneralDisclaimerNotice.jsx';
import GeneratedOutputRenderer from './GeneratedOutputRenderer.jsx';
import { validateFile, formatFileSize } from '../../utils/fileValidation.js';
import { SAMPLE_PRESETS } from '../../services/ingestionService.js';
import { DEMO_SCENARIOS } from '../../data/demoScenarios.js';
import {
  getWorkspaceFormatById,
  buildTurnExportPackage,
  isEligibleForApprovePassed
} from '../../services/workspace/chatPipelineOrchestrator.js';
import {
  generateTXT,
  generateJSON,
  generatePDF,
  generatePackage,
  copyAll,
  downloadFile,
  generateFileName
} from '../../services/export/exportService.js';
import { APPROVAL_STATUSES, CHECK_STATUSES } from '../../types/review.js';

export default function ChatWorkspace({
  conversation,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
  onExpandLeftSidebar,
  onExpandRightSidebar,
  onOpenMobileLeftDrawer,
  onOpenMobileRightDrawer,
  onSubmitTurn,
  onUpdateDraft,
  onUpdateConfig,
  onEditItem,
  onApproveItem,
  onRejectItem,
  onApproveAllInTurn,
  onRegenerateItem,
  onRestoreApprovedItem,
  regeneratingItemId,
  isGenerating,
  progressState,
  storageWarning,
  onDismissStorageWarning,
  onOpenPipelineInspector,
  onOpenExportInspector,
  onOpenLandingPage,
  composerFocusTrigger
}) {
  const [showSourceDrawer, setShowSourceDrawer] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [inputError, setInputError] = useState('');
  const [activeTabByMessage, setActiveTabByMessage] = useState({});
  const [expandedAllByMessage, setExpandedAllByMessage] = useState({});
  const [expandedAnalysisByMessage, setExpandedAnalysisByMessage] = useState({});
  const [expandedSourceByMessage, setExpandedSourceByMessage] = useState({});
  const [exportToast, setExportToast] = useState('');

  const promptTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const promptValue = conversation?.draft?.prompt || '';
  const sourceTextValue = conversation?.draft?.sourceText || '';
  const selectedFormats = conversation?.config?.selectedFormats || [];
  const messages = conversation?.messages || [];
  const hasExistingSource = Boolean(
    conversation?.activeSource &&
    (conversation.activeSource.extractedText || conversation.activeSource.rawText)
  );

  // Aggregate all generated outputs across this conversation for the workflow hierarchy summary
  const allConversationOutputs = React.useMemo(() => {
    const list = [];
    for (const m of messages) {
      if (m.role === 'assistant' && Array.isArray(m.outputs)) {
        list.push(...m.outputs);
      }
    }
    return list;
  }, [messages]);

  const totalGeneratedCount = allConversationOutputs.length;
  const totalApprovedCount = allConversationOutputs.filter(
    (o) => o.approvalStatus === APPROVAL_STATUSES.APPROVED
  ).length;
  const totalPendingCount = allConversationOutputs.filter(
    (o) => o.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW
  ).length;
  const totalRejectedCount = allConversationOutputs.filter(
    (o) => o.approvalStatus === APPROVAL_STATUSES.REJECTED
  ).length;

  const activeWorkflowStage = totalApprovedCount > 0 && totalPendingCount === 0
    ? 5
    : totalGeneratedCount > 0
    ? 4
    : hasExistingSource || attachedFile || sourceTextValue.trim()
    ? 2
    : 1;

  // Focus composer when New Chat is triggered
  useEffect(() => {
    if (promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  }, [composerFocusTrigger, conversation?.conversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, isGenerating]);

  const handlePromptChange = (val) => {
    if (inputError) setInputError('');
    onUpdateDraft({ prompt: val, sourceText: sourceTextValue });
  };

  const handleSourceTextChange = (val) => {
    if (inputError) setInputError('');
    onUpdateDraft({ prompt: promptValue, sourceText: val });
  };

  // Validate uploaded file using Module 1 fileValidation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.isValid) {
      setInputError(validation.error);
      setAttachedFile(null);
      return;
    }
    setInputError('');
    setAttachedFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load a sample file preset (PDF, DOCX, Image) from Module 1 SAMPLE_PRESETS
  const handleLoadSamplePreset = (presetKey) => {
    const preset = SAMPLE_PRESETS[presetKey];
    if (!preset) return;
    const mockFile = {
      name: preset.fileName,
      size: preset.fileSize,
      type: preset.mimeType,
      _presetText: preset.text,
      _presetMetadata: preset.metadata,
      _presetDataUrl: preset.dataUrl || null
    };
    const validation = validateFile(mockFile);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }
    setInputError('');
    setAttachedFile(mockFile);
    if (!promptValue.trim()) {
      onUpdateDraft({
        prompt: `Transform ${preset.fileName} into clear audience-ready communications.`,
        sourceText: sourceTextValue
      });
    }
  };

  // Load a demo scenario into the composer
  const handleLoadScenario = (scenario) => {
    setInputError('');
    setShowSourceDrawer(true);
    onUpdateDraft({
      prompt: `Create multi-format communications for ${scenario.title} (${scenario.audience}, ${scenario.tone} tone).`,
      sourceText: scenario.source
    });
    onUpdateConfig({
      targetAudience: scenario.audience,
      tone: scenario.tone,
      language: scenario.language
    });
    if (promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  };

  // Submit composer turn
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    const trimmedPrompt = promptValue.trim();
    const trimmedSource = sourceTextValue.trim();

    if (!attachedFile && !trimmedSource && !trimmedPrompt) {
      setInputError('Please enter a prompt, paste source text, or attach a document/image.');
      return;
    }

    if (!hasExistingSource && !attachedFile && (trimmedSource || trimmedPrompt).length < 15) {
      setInputError('Source text is too short. Please provide at least 15 characters for meaningful analysis.');
      return;
    }

    if (selectedFormats.length === 0) {
      setInputError('Please select at least one output format in the right sidebar.');
      return;
    }

    setInputError('');
    const fileToSubmit = attachedFile;
    setAttachedFile(null);
    setShowSourceDrawer(false);

    try {
      await onSubmitTurn({
        prompt: trimmedPrompt,
        sourceText: trimmedSource,
        file: fileToSubmit
      });
    } catch (err) {
      setInputError(err.message || 'Could not complete content transformation.');
    }
  };

  // Handle Module 6 export actions for a conversation turn
  const handleTurnExport = async (turnOutputs, lineage, format) => {
    try {
      const pkg = buildTurnExportPackage(turnOutputs, lineage, conversation?.config || {});

      if (format === 'inspector') {
        if (onOpenExportInspector) onOpenExportInspector(pkg);
        return;
      }

      if (format === 'copy') {
        await copyAll(pkg);
        setExportToast(`Copied ${pkg.approvedOutputs.length} approved deliverable(s) to clipboard.`);
      } else if (format === 'txt') {
        const txt = generateTXT(pkg);
        downloadFile(txt, generateFileName(pkg, 'txt'), 'text/plain;charset=utf-8');
        setExportToast(`Downloaded ${generateFileName(pkg, 'txt')}`);
      } else if (format === 'json') {
        const json = generateJSON(pkg);
        downloadFile(json, generateFileName(pkg, 'json'), 'application/json;charset=utf-8');
        setExportToast(`Downloaded ${generateFileName(pkg, 'json')}`);
      } else if (format === 'pdf') {
        const pdf = generatePDF(pkg);
        downloadFile(pdf, generateFileName(pkg, 'pdf'), 'application/pdf');
        setExportToast(`Downloaded ${generateFileName(pkg, 'pdf')}`);
      } else if (format === 'package') {
        const zip = generatePackage(pkg);
        downloadFile(zip, generateFileName(pkg, 'package'), 'application/zip');
        setExportToast(`Downloaded ${generateFileName(pkg, 'package')}`);
      }

      setTimeout(() => setExportToast(''), 3500);
    } catch (err) {
      setInputError(err.message || 'Export failed.');
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-app-bg text-text-primary transition-colors">
      {/* Top Workspace Header */}
      <header className="relative z-30 h-14 px-3 sm:px-5 bg-surface border-b border-border flex items-center justify-between gap-2 shrink-0">
        {/* Left: Mobile Drawer Toggle + Active Chat Title */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Left Drawer Button */}
          <button
            type="button"
            onClick={onOpenMobileLeftDrawer}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-text-primary truncate">
              {conversation?.title || 'New Chat'}
            </h1>
            {hasExistingSource && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-subtle text-success border border-success/30">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span>Source Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Landing Page Button, Previous Prototype Button, Theme Toggle, Mobile Right Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenLandingPage && (
            <button
              type="button"
              onClick={onOpenLandingPage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border bg-surface transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          )}

          {onOpenPipelineInspector && (
            <button
              type="button"
              onClick={onOpenPipelineInspector}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border bg-surface transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              title="Open Previous Prototype"
            >
              <Layers className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
              <span>Previous Prototype</span>
            </button>
          )}

          <ThemeToggle />

          {/* Mobile Right Drawer Button */}
          <button
            type="button"
            onClick={onOpenMobileRightDrawer}
            aria-label="Open output format settings"
            className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-selected text-text-primary border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Sliders className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span>{selectedFormats.length}</span>
          </button>
        </div>
      </header>

      {/* Workflow Visual Hierarchy Strip: Source Document → Selected Formats → Generated Outputs → Quality Review → Approved Export */}
      <nav
        aria-label="Transformation Workflow Hierarchy"
        className="px-3 sm:px-5 py-2 bg-sidebar-bg border-b border-border shrink-0 overflow-x-auto scrollbar-none"
      >
        <ol className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 text-[11px] min-w-max">
          {/* 1. Source Document */}
          <li
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeWorkflowStage === 1
                ? 'bg-surface-selected border-primary/50 text-text-primary font-semibold shadow-2xs ring-1 ring-primary/30'
                : activeWorkflowStage > 1
                ? 'bg-surface border-border text-text-primary'
                : 'bg-sidebar-bg/50 border-border/60 text-text-muted'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${
                activeWorkflowStage === 1
                  ? 'bg-primary text-primary-foreground'
                  : activeWorkflowStage > 1
                  ? 'bg-success/15 text-success'
                  : 'bg-sidebar-bg text-text-muted border border-border'
              }`}
            >
              1
            </span>
            <span>Source Document</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sidebar-bg text-text-secondary border border-border truncate max-w-[120px]">
              {conversation?.activeSource?.fileName ||
                attachedFile?.name ||
                (sourceTextValue.trim() ? 'Draft Text' : 'Awaiting Input')}
            </span>
          </li>

          <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" aria-hidden="true" />

          {/* 2. Selected Formats */}
          <li
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeWorkflowStage === 2
                ? 'bg-surface-selected border-primary/50 text-text-primary font-semibold shadow-2xs ring-1 ring-primary/30'
                : activeWorkflowStage > 2
                ? 'bg-surface border-border text-text-primary'
                : 'bg-sidebar-bg/50 border-border/60 text-text-muted'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${
                activeWorkflowStage === 2
                  ? 'bg-primary text-primary-foreground'
                  : activeWorkflowStage > 2
                  ? 'bg-success/15 text-success'
                  : 'bg-sidebar-bg text-text-muted border border-border'
              }`}
            >
              2
            </span>
            <span>Selected Formats</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-selected text-primary dark:text-accent font-bold border border-border">
              {selectedFormats.length} active
            </span>
          </li>

          <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" aria-hidden="true" />

          {/* 3. Generated Outputs */}
          <li
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeWorkflowStage === 3
                ? 'bg-surface-selected border-primary/50 text-text-primary font-semibold shadow-2xs ring-1 ring-primary/30'
                : activeWorkflowStage > 3
                ? 'bg-surface border-border text-text-primary'
                : 'bg-sidebar-bg/50 border-border/60 text-text-muted'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${
                activeWorkflowStage === 3
                  ? 'bg-primary text-primary-foreground'
                  : activeWorkflowStage > 3
                  ? 'bg-success/15 text-success'
                  : 'bg-sidebar-bg text-text-muted border border-border'
              }`}
            >
              3
            </span>
            <span>Generated Outputs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sidebar-bg text-text-secondary border border-border font-semibold">
              {totalGeneratedCount}
            </span>
          </li>

          <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" aria-hidden="true" />

          {/* 4. Quality Review */}
          <li
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeWorkflowStage === 4
                ? 'bg-surface-selected border-primary/50 text-text-primary font-semibold shadow-2xs ring-1 ring-primary/30'
                : activeWorkflowStage > 4
                ? 'bg-surface border-border text-text-primary'
                : 'bg-sidebar-bg/50 border-border/60 text-text-muted'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${
                activeWorkflowStage === 4
                  ? 'bg-primary text-primary-foreground'
                  : activeWorkflowStage > 4
                  ? 'bg-success/15 text-success'
                  : 'bg-sidebar-bg text-text-muted border border-border'
              }`}
            >
              4
            </span>
            <span>Quality Review</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sidebar-bg text-text-secondary border border-border">
              {totalGeneratedCount === 0
                ? 'Pending'
                : totalPendingCount > 0
                ? `${totalPendingCount} to review`
                : 'Reviewed'}
            </span>
          </li>

          <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" aria-hidden="true" />

          {/* 5. Approved Export */}
          <li
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeWorkflowStage === 5
                ? 'bg-surface-selected border-primary/50 text-text-primary font-semibold shadow-2xs ring-1 ring-primary/30'
                : totalApprovedCount > 0
                ? 'bg-success-subtle border-success/30 text-success font-semibold'
                : 'bg-sidebar-bg/50 border-border/60 text-text-muted'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${
                activeWorkflowStage === 5
                  ? 'bg-primary text-primary-foreground'
                  : totalApprovedCount > 0
                  ? 'bg-success text-white'
                  : 'bg-sidebar-bg text-text-muted border border-border'
              }`}
            >
              5
            </span>
            <span>Approved Export</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface text-text-primary border border-border font-semibold">
              {totalApprovedCount}/{totalGeneratedCount || 0} ready
            </span>
          </li>
        </ol>
      </nav>

      {/* Storage or Export Toast Notifications */}
      {storageWarning && (
        <div
          role="alert"
          className="mx-4 mt-3 p-3 rounded-xl bg-warning-subtle border border-warning/30 text-xs text-warning flex items-center justify-between gap-2 animate-slide-down"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span>{storageWarning}</span>
          </div>
          {onDismissStorageWarning && (
            <button
              type="button"
              onClick={onDismissStorageWarning}
              className="text-[11px] font-bold underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {exportToast && (
        <div
          role="status"
          className="mx-4 mt-3 p-3 rounded-xl bg-success-subtle border border-success/30 text-xs text-success flex items-center justify-between gap-2 animate-slide-down"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span className="font-semibold">{exportToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportToast('')}
            className="text-[11px] font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Scrollable Conversation & Output Review Area (Primary Workspace Focus) */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            /* A. NEW CONVERSATION WELCOME STATE */
            <div className="py-6 sm:py-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-selected border border-border text-text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-primary dark:text-accent" />
                <span>InfoFlip-AI Content Transformation Workspace</span>
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  What would you like to create?
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Follow the 5-step workflow above: provide your <strong>Source Document</strong> below, confirm your <strong>Selected Formats</strong> in the right Output Config panel, then review, approve, and export your <strong>Generated Outputs</strong>.
                </p>
              </div>

              {/* Compact Starter Examples */}
              <div className="max-w-2xl mx-auto pt-2 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Try an official scenario or sample document
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {DEMO_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => handleLoadScenario(scen)}
                      className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text-primary active:scale-[0.98] transition-all duration-150 shadow-2xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary dark:text-accent" />
                      <span>{scen.title}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleLoadSamplePreset('pdf')}
                    className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text-primary active:scale-[0.98] transition-all duration-150 shadow-2xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary dark:text-accent" />
                    <span>Sample Weather PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSamplePreset('docx')}
                    className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text-primary active:scale-[0.98] transition-all duration-150 shadow-2xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <FileText className="w-3.5 h-3.5 text-success" />
                    <span>Sample Health DOCX</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* C. CHRONOLOGICAL CONVERSATION & OUTPUT REVIEW WORKSPACE */
            messages.map((msg, msgIndex) => {
              if (msg.role === 'user') {
                const isSourceExpanded = Boolean(expandedSourceByMessage[msg.messageId]);
                const fullSourceText =
                  msg.sourceAttachment?.sourceText ||
                  conversation?.activeSource?.extractedText ||
                  conversation?.activeSource?.rawText ||
                  msg.sourceAttachment?.previewSnippet ||
                  '';

                return (
                  <div
                    key={msg.messageId}
                    className="flex justify-end animate-fade-in"
                  >
                    <div
                      className="max-w-2xl w-full sm:w-auto rounded-2xl bg-surface-selected text-text-primary border border-border p-4 shadow-2xs space-y-2.5 transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface-selected)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <span>Stage 1 & 2 • Source Document & Selected Formats</span>
                        {msg.sourceAttachment?.sourceId && (
                          <span className="font-mono">{msg.sourceAttachment.sourceId}</span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-text-primary whitespace-pre-wrap leading-relaxed">
                        {msg.prompt}
                      </div>

                      {/* Source Document Preview & Provenance Card */}
                      {msg.sourceAttachment && (
                        <div
                          className="p-2.5 rounded-xl bg-surface border border-border text-[11px] text-text-primary space-y-1.5"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                              <span className="truncate">{msg.sourceAttachment.fileName || 'Source Content'}</span>
                              {msg.sourceAttachment.wordCount > 0 && (
                                <span className="text-[10px] font-normal text-text-secondary">
                                  ({msg.sourceAttachment.wordCount} words)
                                </span>
                              )}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              {fullSourceText && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSourceByMessage((prev) => ({
                                      ...prev,
                                      [msg.messageId]: !prev[msg.messageId]
                                    }))
                                  }
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary dark:text-accent hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>{isSourceExpanded ? 'Hide Source Preview' : 'Source Document Preview'}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {isSourceExpanded ? (
                            <div className="p-2.5 rounded-lg bg-sidebar-bg border border-border text-[11px] text-text-primary whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                              {fullSourceText}
                            </div>
                          ) : (
                            msg.sourceAttachment.previewSnippet && (
                              <p className="text-[10px] text-text-secondary line-clamp-2">
                                "{msg.sourceAttachment.previewSnippet}..."
                              </p>
                            )
                          )}

                          {msg.sourceAttachment.isFollowUpContext && msg.sourceAttachment.adjustments?.length > 0 && (
                            <div className="text-[10px] text-primary dark:text-accent font-medium">
                              Applied follow-up adjustments: {msg.sourceAttachment.adjustments.join(' • ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requested Format Pills */}
                      {Array.isArray(msg.requestedFormats) && msg.requestedFormats.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-semibold text-text-secondary mr-1">
                            Selected Formats:
                          </span>
                          {msg.requestedFormats.map((fmtId) => {
                            const fmt = getWorkspaceFormatById(fmtId);
                            return (
                              <span
                                key={fmtId}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface text-primary dark:text-accent border border-border"
                              >
                                {fmt?.shortName || fmtId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Assistant Message Turn (Primary Focus: Generated Outputs -> Quality Review -> Approved Export)
              const turnOutputs = msg.outputs || [];
              const activeFormatId = activeTabByMessage[msg.messageId] || turnOutputs[0]?.formatId || '';
              const activeItem = turnOutputs.find(o => o.formatId === activeFormatId) || turnOutputs[0];
              const isAllExpanded = Boolean(expandedAllByMessage[msg.messageId]);
              const isAnalysisExpanded = Boolean(expandedAnalysisByMessage[msg.messageId]);
              const isTurnSourceExpanded = Boolean(expandedSourceByMessage[msg.messageId]);

              const approvedInTurn = turnOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.APPROVED);
              const rejectedInTurn = turnOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.REJECTED);
              const pendingInTurn = turnOutputs.filter(o => o.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW);

              // Strict eligibility for Approve Passed: only pending outputs that passed all required checks with 0 warnings/failures
              const passedInTurn = turnOutputs.filter(o => isEligibleForApprovePassed(o));

              // Resolve source summary for this turn (from msg.sourceSummary, preceding user message, or conversation.activeSource)
              const prevUserMsg = msgIndex > 0 && messages[msgIndex - 1]?.role === 'user' ? messages[msgIndex - 1] : null;
              const turnSourceDoc = msg.sourceSummary || {
                sourceId: msg.lineage?.sourceId || conversation?.activeSource?.sourceId || 'src-1',
                sourceType: prevUserMsg?.sourceAttachment?.sourceType || conversation?.activeSource?.sourceType || 'text',
                fileName: prevUserMsg?.sourceAttachment?.fileName || conversation?.activeSource?.fileName || 'Pasted Source Text',
                wordCount: prevUserMsg?.sourceAttachment?.wordCount || conversation?.activeSource?.metadata?.wordCount || 0,
                characterCount: prevUserMsg?.sourceAttachment?.characterCount || conversation?.activeSource?.metadata?.characterCount || 0,
                excerpt:
                  prevUserMsg?.sourceAttachment?.sourceText ||
                  conversation?.activeSource?.extractedText ||
                  conversation?.activeSource?.rawText ||
                  prevUserMsg?.sourceAttachment?.previewSnippet ||
                  '',
                mainTopic: msg.analysisSummary?.mainTopic || 'Source Document'
              };

              return (
                <section
                  key={msg.messageId}
                  aria-label="Generated Content Response"
                  className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden space-y-4 p-4 sm:p-5 animate-fade-in transition-colors"
                >
                  {/* Turn Source Document -> Grounded Analysis Provenance Header */}
                  {msg.analysisSummary && (
                    <div className="rounded-xl bg-sidebar-bg border border-border p-3.5 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-bold text-text-primary">
                            <BrainCircuit className="w-3.5 h-3.5 text-primary dark:text-accent" />
                            <span>{msg.analysisSummary.mainTopic}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface text-text-primary border border-border">
                            <FileText className="w-3 h-3 text-primary dark:text-accent" />
                            <span>{turnSourceDoc.fileName}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-selected text-text-primary border border-border">
                            {msg.analysisSummary.keyFactsCount} Grounded Facts
                          </span>
                          {msg.analysisSummary.highRiskClaimsCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-warning-subtle text-warning border border-warning/30">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              <span>{msg.analysisSummary.highRiskClaimsCount} High-Risk Claim(s) — Verification Required</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {turnSourceDoc.excerpt && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSourceByMessage(prev => ({
                                  ...prev,
                                  [msg.messageId]: !prev[msg.messageId]
                                }))
                              }
                              className="text-[11px] font-semibold text-primary dark:text-accent hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{isTurnSourceExpanded ? 'Hide Source Document' : 'Source Document Preview'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAnalysisByMessage(prev => ({
                                ...prev,
                                [msg.messageId]: !prev[msg.messageId]
                              }))
                            }
                            className="text-[11px] font-semibold text-primary dark:text-accent hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
                          >
                            <span>{isAnalysisExpanded ? 'Hide Analysis' : 'Source Facts & Lineage'}</span>
                            {isAnalysisExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Source Document Preview right inside the Generated Outputs card */}
                      {isTurnSourceExpanded && turnSourceDoc.excerpt && (
                        <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5 text-xs animate-slide-down">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            <span>Source Document Preview • {turnSourceDoc.fileName}</span>
                            <span className="font-mono">
                              Source ID: {turnSourceDoc.sourceId}
                              {turnSourceDoc.wordCount ? ` • ${turnSourceDoc.wordCount} words` : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-text-primary whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                            {turnSourceDoc.excerpt}
                          </div>
                        </div>
                      )}

                      {isAnalysisExpanded && (
                        <div className="pt-2 border-t border-divider space-y-2 text-xs animate-slide-down">
                          {msg.analysisSummary.summary && (
                            <p className="text-text-secondary leading-relaxed">
                              {msg.analysisSummary.summary}
                            </p>
                          )}
                          {Array.isArray(msg.analysisSummary.keyFacts) && msg.analysisSummary.keyFacts.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                Extracted Source Facts (Not Independently Verified)
                              </div>
                              <ul className="space-y-1 text-[11px] text-text-primary">
                                {msg.analysisSummary.keyFacts.map((f, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-primary dark:text-accent font-bold">•</span>
                                    <span>{typeof f === 'string' ? f : f.fact}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {msg.lineage && (
                            <div className="text-[10px] font-mono text-text-secondary pt-1">
                              Lineage: src={msg.lineage.sourceId} → ana={msg.lineage.analysisId} → trans={msg.lineage.transformationId} → comm={msg.lineage.communicationId} → rev={msg.lineage.reviewId}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unsupported Format Notice (if any unsupported format was passed) */}
                  {Array.isArray(msg.unsupportedFormats) && msg.unsupportedFormats.length > 0 && (
                    <div className="p-3 rounded-xl bg-error-subtle border border-error/30 text-xs text-error flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-error shrink-0" />
                      <span>
                        Unsupported format(s) skipped and not generated: <strong>{msg.unsupportedFormats.join(', ')}</strong>
                      </span>
                    </div>
                  )}

                  {/* D. Generated Outputs & Quality Review Primary Focus Area */}
                  {turnOutputs.length > 0 && (
                    <div className="space-y-4">
                      {/* Quality Review Status Overview Bar */}
                      <div className="p-3 rounded-xl bg-sidebar-bg border border-border flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-text-primary">
                            Generated Outputs ({turnOutputs.length})
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-subtle text-success border border-success/30">
                            {approvedInTurn.length} Approved
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-subtle text-warning border border-warning/30">
                            {pendingInTurn.length} Pending Review
                          </span>
                          {rejectedInTurn.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-subtle text-error border border-error/30">
                              {rejectedInTurn.length} Rejected
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-text-secondary">
                          Human approval authorizes export readiness • Source claims not independently verified
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-divider">
                        {/* Format Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" role="tablist" aria-label="Generated format tabs">
                          {turnOutputs.map((out) => {
                            const fmt = getWorkspaceFormatById(out.formatId);
                            const isSelected = !isAllExpanded && activeItem?.itemId === out.itemId;
                            const isOutApproved = out.approvalStatus === APPROVAL_STATUSES.APPROVED;
                            const isOutRejected = out.approvalStatus === APPROVAL_STATUSES.REJECTED;
                            const hasWarn = out.overallStatus === CHECK_STATUSES.WARNING || out.overallStatus === CHECK_STATUSES.FAIL;

                            return (
                              <button
                                key={out.itemId}
                                role="tab"
                                aria-selected={isSelected}
                                type="button"
                                onClick={() => {
                                  setExpandedAllByMessage(prev => ({ ...prev, [msg.messageId]: false }));
                                  setActiveTabByMessage(prev => ({ ...prev, [msg.messageId]: out.formatId }));
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground shadow-2xs'
                                    : 'bg-sidebar-bg text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border'
                                }`}
                              >
                                <span>{fmt?.shortName || out.formatId}</span>
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isOutApproved
                                      ? 'bg-success'
                                      : isOutRejected
                                      ? 'bg-error'
                                      : hasWarn
                                      ? 'bg-warning'
                                      : 'bg-primary'
                                  }`}
                                  title={`Status: ${out.approvalStatus} • QA: ${out.overallStatus}`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* View All / Batch Approve Passed Controls */}
                        <div className="flex items-center gap-2">
                          {turnOutputs.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAllByMessage(prev => ({
                                  ...prev,
                                  [msg.messageId]: !prev[msg.messageId]
                                }))
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sidebar-bg text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                            >
                              {isAllExpanded ? 'Tabbed View' : `Compare All (${turnOutputs.length})`}
                            </button>
                          )}

                          {passedInTurn.length > 0 && onApproveAllInTurn && (
                            <button
                              type="button"
                              onClick={() => onApproveAllInTurn(passedInTurn.map(o => o.itemId))}
                              title="Approves only pending outputs that passed all 10 required QA checks with 0 warnings/failures. Does not independently verify source facts."
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-success-subtle text-success border border-success/30 hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                            >
                              Approve Passed ({passedInTurn.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Render Either Active Tab or All Stacked Sections */}
                      {isAllExpanded ? (
                        <div className="space-y-6 divide-y divide-divider">
                          {turnOutputs.map((out) => (
                            <div key={out.itemId} className="pt-4 first:pt-0">
                              <GeneratedOutputRenderer
                                item={out}
                                config={msg.configSnapshot || conversation?.config}
                                sourceDocument={turnSourceDoc}
                                onEdit={onEditItem}
                                onApprove={onApproveItem}
                                onReject={onRejectItem}
                                onRegenerate={onRegenerateItem}
                                onRestoreApproved={onRestoreApprovedItem}
                                onInspectSource={() =>
                                  setExpandedSourceByMessage(prev => ({
                                    ...prev,
                                    [msg.messageId]: true
                                  }))
                                }
                                isRegenerating={regeneratingItemId === out.itemId}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        activeItem && (
                          <GeneratedOutputRenderer
                            item={activeItem}
                            config={msg.configSnapshot || conversation?.config}
                            sourceDocument={turnSourceDoc}
                            onEdit={onEditItem}
                            onApprove={onApproveItem}
                            onReject={onRejectItem}
                            onRegenerate={onRegenerateItem}
                            onRestoreApproved={onRestoreApprovedItem}
                            onInspectSource={() =>
                              setExpandedSourceByMessage(prev => ({
                                ...prev,
                                [msg.messageId]: true
                              }))
                            }
                            isRegenerating={regeneratingItemId === activeItem.itemId}
                          />
                        )
                      )}

                      {/* Grouped Verification Notice & Module 6 Export Gate */}
                      <div className="rounded-xl border border-border bg-sidebar-bg/60 p-3 space-y-2.5">
                        <GeneralDisclaimerNotice compact />

                        <div
                          className={`p-2.5 sm:p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2.5 text-xs ${
                            approvedInTurn.length > 0
                              ? 'bg-success-subtle border-success/30'
                              : 'bg-surface border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck
                              className={`w-4 h-4 shrink-0 ${
                                approvedInTurn.length > 0 ? 'text-success' : 'text-text-secondary'
                              }`}
                            />
                            <div>
                              <span className="font-bold text-text-primary">
                                Module 6 Export Gate:{' '}
                              </span>
                              <span className="text-text-secondary">
                                {approvedInTurn.length > 0
                                  ? `${approvedInTurn.length} of ${turnOutputs.length} output(s) human-approved and unlocked for distribution.`
                                  : 'Locked until at least 1 output is human-approved above.'}
                              </span>
                            </div>
                          </div>

                          {approvedInTurn.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'copy')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Approved</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'txt')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              >
                                <Download className="w-3 h-3" />
                                <span>TXT</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'json')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              >
                                <FileCode className="w-3 h-3" />
                                <span>JSON</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'pdf')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              >
                                <FileText className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'package')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-success hover:opacity-90 text-white active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              >
                                <FolderArchive className="w-3 h-3" />
                                <span>ZIP Bundle</span>
                              </button>
                              {onOpenExportInspector && (
                                <button
                                  type="button"
                                  onClick={() => handleTurnExport(turnOutputs, msg.lineage, 'inspector')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary dark:text-accent hover:underline active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                                >
                                  <span>Audit View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })
          )}

          {/* Live Pipeline Progress Indicator when Generating */}
          {isGenerating && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3.5 animate-fade-in"
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-text-primary">
                  {progressState?.title || 'Running 6-Module Content Pipeline...'}
                </div>
                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                  {progressState?.detail || 'Validating source, analyzing facts, and generating selected formats...'}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-surface-selected text-text-primary border border-border">
                Step {progressState?.module || 1}/5
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* B. FOLLOW-UP & SOURCE COMPOSER (Compact when outputs exist so Generated Outputs remain primary focus) */}
      <div className="p-2.5 sm:px-6 sm:pb-3.5 bg-app-bg border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
          {/* Input Validation Error Alert */}
          {inputError && (
            <div
              role="alert"
              className="p-2.5 rounded-xl bg-error-subtle border border-error/30 text-xs text-error flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-error shrink-0" />
                <span>{inputError}</span>
              </div>
              <button
                type="button"
                onClick={() => setInputError('')}
                className="text-[11px] font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Attached File Pill */}
          {attachedFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-selected border border-border text-xs text-text-primary">
              {attachedFile.type?.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5 text-primary dark:text-accent" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-primary dark:text-accent" />
              )}
              <span className="font-semibold truncate max-w-[240px]">{attachedFile.name}</span>
              <span className="text-[10px] text-text-secondary">
                ({formatFileSize(attachedFile.size)})
              </span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                aria-label="Remove attached file"
                className="p-0.5 rounded hover:bg-surface-hover"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Optional Expandable Source Text Drawer (for pasting long articles separately from instructions) */}
          {showSourceDrawer && (
            <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="composer-source-textarea" className="font-bold text-text-primary">
                  Source Text / Document Body (Module 1 Input)
                </label>
                <button
                  type="button"
                  onClick={() => setShowSourceDrawer(false)}
                  className="text-text-secondary hover:text-text-primary"
                  aria-label="Close source text drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                id="composer-source-textarea"
                rows={4}
                value={sourceTextValue}
                onChange={(e) => handleSourceTextChange(e.target.value)}
                placeholder="Paste raw article, official bulletin, circular, or press release here (minimum 15 characters)..."
                className="w-full p-2.5 rounded-lg bg-input-bg border border-input-border text-xs text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
          )}

          {/* Main Composer Box */}
          <div className="rounded-2xl bg-input-bg border border-input-border focus-within:border-primary dark:focus-within:border-accent focus-within:ring-2 focus-within:ring-focus-ring/25 shadow-xs transition-all p-2.5 space-y-2">
            <textarea
              ref={promptTextareaRef}
              rows={totalGeneratedCount > 0 ? 1 : 2}
              value={promptValue}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isGenerating}
              aria-label="Message composer prompt or source text"
              placeholder={
                hasExistingSource
                  ? 'Follow-up instruction for active source (e.g. "Make tone Urgent", "Simplify for students") or attach a new source...'
                  : 'Paste your source content or enter instructions to transform (Press Enter to generate)...'
              }
              className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-placeholder resize-none focus:outline-none leading-relaxed px-1"
            />

            {/* Composer Bottom Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-divider">
              {/* Left Controls: File Upload, Paste Source Drawer, Active Formats Summary */}
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload source file or image"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  title="Attach PDF, DOCX, TXT, PNG, or JPG (Max 10 MB)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <Paperclip className="w-3.5 h-3.5 text-primary dark:text-accent" />
                  <span>Attach File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSourceDrawer(!showSourceDrawer)}
                  disabled={isGenerating}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    showSourceDrawer || sourceTextValue.trim()
                      ? 'bg-surface-selected text-text-primary border border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-primary dark:text-accent" />
                  <span>{sourceTextValue.trim() ? 'Source Text Attached' : 'Paste Source'}</span>
                </button>

                {/* Active Formats Summary Indicator (Read-only badge referencing Right Output Config) */}
                <div className="hidden sm:flex items-center gap-1 pl-1" title="Configured in Right Output Config panel">
                  {selectedFormats.slice(0, 3).map((fmtId) => {
                    const fmt = getWorkspaceFormatById(fmtId);
                    return (
                      <span
                        key={fmtId}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sidebar-bg border border-border text-text-secondary"
                      >
                        {fmt?.shortName || fmtId}
                      </span>
                    );
                  })}
                  {selectedFormats.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
                      +{selectedFormats.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Right Controls: Target Profile Hint + Submit Button */}
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[11px] text-text-secondary">
                  {conversation?.config?.tone} • {conversation?.config?.language}
                </span>

                <button
                  type="submit"
                  disabled={isGenerating}
                  aria-label="Submit request to generate content"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-50 disabled:pointer-events-none shadow-2xs active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span>
                    {isGenerating
                      ? 'Generating...'
                      : hasExistingSource
                      ? 'Generate Follow-Up'
                      : 'Generate'}
                  </span>
                  {isGenerating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
