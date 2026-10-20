import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  Edit3,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Download,
  FileText,
  ExternalLink,
  Link2,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Existing Module 4 Communication Previews
import LinkedInCommunicationPreview from '../communication/LinkedInCommunicationPreview.jsx';
import TwitterCommunicationPreview from '../communication/TwitterCommunicationPreview.jsx';
import WhatsAppPreview from '../communication/WhatsAppPreview.jsx';
import EmailPreview from '../communication/EmailPreview.jsx';
import SMSPreview from '../communication/SMSPreview.jsx';
import AnnouncementPreview from '../communication/AnnouncementPreview.jsx';
import CTASection from '../communication/CTASection.jsx';
import HashtagSection from '../communication/HashtagSection.jsx';

// Existing Module 3 Structured Previews
import ExecutiveSummaryPreview from '../transformation/previews/ExecutiveSummaryPreview.jsx';
import AdvisoryPreview from '../transformation/previews/AdvisoryPreview.jsx';
import InfographicPreview from '../transformation/previews/InfographicPreview.jsx';
import PresentationPreview from '../transformation/previews/PresentationPreview.jsx';
import VideoScriptPreview from '../transformation/previews/VideoScriptPreview.jsx';

import ContentStatusBadge from '../common/ContentStatusBadge.jsx';
import { CONTENT_STATUS_FLAGS } from '../../types/contentConfidence.js';
import { APPROVAL_STATUSES, CHECK_STATUSES } from '../../types/review.js';
import { getWorkspaceFormatById } from '../../services/workspace/chatPipelineOrchestrator.js';
import { downloadFile, generateFileName } from '../../services/export/exportService.js';

const CHECK_LABELS = {
  factualConsistency: 'Factual Consistency',
  sourceGrounding: 'Source Grounding',
  hallucinationRisk: 'Hallucination Guard',
  toneConsistency: 'Tone Alignment',
  audienceFit: 'Audience Fit',
  readability: 'Readability',
  languageConsistency: 'Language Match',
  platformCompliance: 'Platform Compliance',
  duplication: 'Anti-Duplication',
  safety: 'Public Safety & Directives'
};

export default function GeneratedOutputRenderer({
  item,
  config = {},
  sourceDocument = null,
  onEdit,
  onApprove,
  onReject,
  onRegenerate,
  onRestoreApproved = null,
  onInspectSource = null,
  isRegenerating = false,
  onOpenOriginConversation = null,
  // Optional external draft control by itemId to prevent cross-format bleed & retain unsaved tab edits
  externalDraftText = null,
  externalDraftStructured = null,
  onUpdateDraftText = null,
  onUpdateDraftStructured = null,
  isEditingExternal = null,
  onToggleEditExternal = null
}) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [internalDraftText, setInternalDraftText] = useState(item?.content || '');
  const [internalDraftStructured, setInternalDraftStructured] = useState(item?.structuredData || null);
  const [copied, setCopied] = useState(false);
  const [showReviewChecks, setShowReviewChecks] = useState(false);
  const [showSourceProvenance, setShowSourceProvenance] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const isEditing = isEditingExternal !== null ? isEditingExternal : internalIsEditing;
  const draftText = externalDraftText !== null ? externalDraftText : internalDraftText;
  const draftStructured = externalDraftStructured !== null ? externalDraftStructured : internalDraftStructured;

  // Crucial: reset local editor state whenever item.itemId changes to guarantee zero cross-format bleed
  useEffect(() => {
    setInternalIsEditing(false);
    setInternalDraftText(item?.content || '');
    setInternalDraftStructured(item?.structuredData || null);
  }, [item?.itemId]);

  // Synchronize internal draft when item content changes outside edit mode
  useEffect(() => {
    if (!isEditing) {
      setInternalDraftText(item?.content || '');
      setInternalDraftStructured(item?.structuredData || null);
    }
  }, [item?.content, item?.structuredData, isEditing]);

  if (!item) return null;

  const formatId = String(item.formatId || item.channelId || '').toLowerCase();
  const formatMeta = getWorkspaceFormatById(formatId);
  const isApproved = item.approvalStatus === APPROVAL_STATUSES.APPROVED;
  const isRejected = item.approvalStatus === APPROVAL_STATUSES.REJECTED;

  // Determine content status flag accurately from current approval & edit state
  const statusFlag = isApproved
    ? CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT
    : item.isEdited
    ? CONTENT_STATUS_FLAGS.HUMAN_REVIEWED
    : item.metadata?.contentStatusFlag &&
      item.metadata.contentStatusFlag !== CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT
    ? item.metadata.contentStatusFlag
    : item.metadata?.isFallback
    ? CONTENT_STATUS_FLAGS.RULE_BASED_FALLBACK
    : CONTENT_STATUS_FLAGS.AI_GENERATED;

  const verificationLabel = item.metadata?.verificationStatus || 'Source not independently verified';

  // Resolve source provenance reference from item.sourceReference, passed sourceDocument, or lineage
  const sourceRef = item.sourceReference || (sourceDocument
    ? {
        sourceId: sourceDocument.sourceId || item.lineage?.sourceId || 'src-1',
        sourceType: sourceDocument.sourceType || 'text',
        fileName: sourceDocument.fileName || 'Pasted Source Text',
        wordCount: sourceDocument.metadata?.wordCount || sourceDocument.wordCount || 0,
        characterCount: sourceDocument.metadata?.characterCount || sourceDocument.characterCount || 0,
        excerpt: (sourceDocument.extractedText || sourceDocument.rawText || sourceDocument.excerpt || '').slice(0, 260),
        mainTopic: sourceDocument.mainTopic || 'Source Document'
      }
    : {
        sourceId: item.lineage?.sourceId || 'src-1',
        sourceType: 'text',
        fileName: 'Source Document',
        wordCount: 0,
        characterCount: 0,
        excerpt: '',
        mainTopic: 'Source Document'
      });

  const traceabilityList = Array.isArray(item.sourceTraceability) ? item.sourceTraceability : [];

  // Collect warnings from Module 5 checks
  const checkEntries = Object.entries(item.checks || {});
  const warningChecks = checkEntries.filter(
    ([, c]) => c?.status === CHECK_STATUSES.WARNING || c?.status === CHECK_STATUSES.FAIL
  );

  const handleUpdateText = (val) => {
    if (onUpdateDraftText) {
      onUpdateDraftText(item.itemId, val);
    } else {
      setInternalDraftText(val);
    }
  };

  const handleUpdateStructured = (val) => {
    if (onUpdateDraftStructured) {
      onUpdateDraftStructured(item.itemId, val);
    } else {
      setInternalDraftStructured(val);
    }
  };

  const handleStartEdit = () => {
    if (onToggleEditExternal) {
      onToggleEditExternal(item.itemId, true);
    } else {
      setInternalDraftText(item.content || '');
      setInternalDraftStructured(item.structuredData || null);
      setInternalIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (onToggleEditExternal) {
      onToggleEditExternal(item.itemId, false);
    } else {
      setInternalIsEditing(false);
    }
    if (!onEdit) return;
    if (
      ['executive-summary', 'advisory', 'infographic', 'presentation', 'video-script'].includes(formatId) &&
      draftStructured
    ) {
      onEdit(item.itemId, draftStructured);
    } else {
      onEdit(item.itemId, draftText);
    }
  };

  const handleRegenerateClick = () => {
    if (!onRegenerate || isRegenerating) return;
    // Protect approved content from accidental silent overwrite
    if (isApproved && !showRegenerateConfirm) {
      setShowRegenerateConfirm(true);
      return;
    }
    setShowRegenerateConfirm(false);
    onRegenerate(item.itemId);
  };

  const handleConfirmRegenerateApproved = () => {
    setShowRegenerateConfirm(false);
    if (onRegenerate) {
      onRegenerate(item.itemId);
    }
  };

  const handleCopy = async () => {
    const text = item.content || '';
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadApprovedSingle = () => {
    if (!isApproved) return;
    const fileName = generateFileName({ exportId: item.itemId }, 'txt', formatId);
    downloadFile(item.content || '', fileName, 'text/plain;charset=utf-8');
  };

  const renderFormatPreview = () => {
    const audience = config.targetAudience || 'General Public';
    const tone = config.tone || 'Informative';

    switch (formatId) {
      case 'linkedin':
        return (
          <LinkedInCommunicationPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
            audience={audience}
            tone={tone}
          />
        );
      case 'twitter':
      case 'x-twitter':
        return (
          <TwitterCommunicationPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'email':
        return (
          <EmailPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'sms':
        return (
          <SMSPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'announcement':
        return (
          <AnnouncementPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'cta':
        return (
          <CTASection
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'hashtags':
        return (
          <HashtagSection
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={handleUpdateText}
          />
        );
      case 'executive-summary':
        if (item.structuredData || draftStructured) {
          return (
            <ExecutiveSummaryPreview
              content={isEditing ? (draftStructured || item.structuredData) : (item.structuredData || draftStructured)}
              isEditing={isEditing}
              onUpdateContent={handleUpdateStructured}
              audience={audience}
              tone={tone}
            />
          );
        }
        break;
      case 'advisory':
        if (item.structuredData || draftStructured) {
          return (
            <AdvisoryPreview
              content={isEditing ? (draftStructured || item.structuredData) : (item.structuredData || draftStructured)}
              isEditing={isEditing}
              onUpdateContent={handleUpdateStructured}
              audience={audience}
              tone={tone}
            />
          );
        }
        break;
      case 'infographic':
        if (item.structuredData || draftStructured) {
          return (
            <InfographicPreview
              content={isEditing ? (draftStructured || item.structuredData) : (item.structuredData || draftStructured)}
              isEditing={isEditing}
              onUpdateContent={handleUpdateStructured}
              audience={audience}
            />
          );
        }
        break;
      case 'presentation':
        if (item.structuredData || draftStructured) {
          return (
            <PresentationPreview
              content={isEditing ? (draftStructured || item.structuredData) : (item.structuredData || draftStructured)}
              isEditing={isEditing}
              onUpdateContent={handleUpdateStructured}
            />
          );
        }
        break;
      case 'video-script':
        if (item.structuredData || draftStructured) {
          return (
            <VideoScriptPreview
              content={isEditing ? (draftStructured || item.structuredData) : (item.structuredData || draftStructured)}
              isEditing={isEditing}
              onUpdateContent={handleUpdateStructured}
            />
          );
        }
        break;
      default:
        break;
    }

    // Fallback clean text view / editor
    if (isEditing) {
      return (
        <textarea
          rows={8}
          value={draftText}
          onChange={(e) => handleUpdateText(e.target.value)}
          aria-label={`Edit ${formatMeta?.name || formatId} content`}
          className="w-full p-3.5 rounded-xl border border-input-border bg-input-bg text-xs sm:text-sm text-text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
      );
    }

    return (
      <div className="p-4 rounded-xl bg-surface border border-border whitespace-pre-wrap text-xs sm:text-sm text-text-primary leading-relaxed">
        {item.content}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Action & Review Status Bar */}
      <div className="p-3 rounded-xl bg-sidebar-bg border border-border flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Format Title, Status Flag, Review Approval Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-text-primary">
            {formatMeta?.name || item.title || formatId}
          </span>

          <ContentStatusBadge
            status={statusFlag}
            sublabel={item.metadata?.provider}
            size="xs"
          />

          {/* Approval Status Pill */}
          {isApproved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-subtle text-success border border-success/30">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span>Approved for Export</span>
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-subtle text-error border border-error/30">
              <XCircle className="w-3 h-3 text-error" />
              <span>Rejected — Needs Revision</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-subtle text-warning border border-warning/30">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span>Pending Human Approval</span>
            </span>
          )}

          {/* Truthful Verification Status (Never claims independent factual verification) */}
          <span
            className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border"
            title="Human approval authorizes export readiness; it does not independently verify source facts against external databases."
          >
            {verificationLabel}
          </span>

          <span className="text-[10px] text-text-muted">
            {item.metadata?.wordCount || 0}w • {item.metadata?.characterCount || (item.content?.length || 0)}c
          </span>
        </div>

        {/* Right: Edit, Copy, Regenerate, Review Details, Approve/Reject */}
        <div className="flex flex-wrap items-center gap-1.5">
          {onOpenOriginConversation && (
            <button
              type="button"
              onClick={onOpenOriginConversation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface border border-border text-primary dark:text-accent hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowReviewChecks(!showReviewChecks)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              showReviewChecks
                ? 'bg-surface-selected border-primary/40 text-primary dark:text-accent'
                : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-primary dark:text-accent" />
            <span>QA Checks ({item.summary?.passed || 0}/10)</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={isEditing ? handleSaveEdit : handleStartEdit}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                isEditing
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {isEditing ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              <span>{isEditing ? 'Save Edit' : 'Edit'}</span>
            </button>
          )}

          {onRegenerate && (
            <button
              type="button"
              onClick={handleRegenerateClick}
              disabled={isRegenerating}
              title={
                isApproved
                  ? 'Regenerate only this format output (requires confirmation because this output is currently approved)'
                  : 'Regenerate only this format output without affecting other outputs'
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-50 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-primary' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          )}

          {/* Restore Previously Approved Snapshot if this item was regenerated after approval */}
          {!isApproved && item.previousApprovedVersion && onRestoreApproved && (
            <button
              type="button"
              onClick={() => onRestoreApproved(item.itemId)}
              title="Restore the previously approved version of this output"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-success-subtle border border-success/30 text-success hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Approved</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Module 5 Human Approval Actions */}
          {onApprove && !isApproved && (
            <button
              type="button"
              onClick={() => onApprove(item.itemId, 'Human reviewed and approved in chat workspace')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-success hover:opacity-90 text-white shadow-2xs active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Approve</span>
            </button>
          )}

          {onReject && !isRejected && (
            <button
              type="button"
              onClick={() => onReject(item.itemId, 'Flagged for revision during human review')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-error-subtle hover:opacity-90 text-error border border-error/30 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <XCircle className="w-3 h-3" />
              <span>Reject</span>
            </button>
          )}

          {/* Direct Single-Item Download (Module 6 Approved Gate) */}
          {isApproved && (
            <button
              type="button"
              onClick={handleDownloadApprovedSingle}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-95 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              title="Download this approved deliverable (.txt)"
            >
              <Download className="w-3 h-3" />
              <span>Export TXT</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Guard Before Regenerating an Approved Output */}
      {showRegenerateConfirm && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-warning-subtle border border-warning/30 text-xs text-warning flex flex-wrap items-center justify-between gap-2.5 animate-slide-down"
        >
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">
                Protect Approved Content — Confirm Single-Format Regeneration
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                This <strong>{formatMeta?.name || formatId}</strong> output is currently approved for export. Regenerating will create a new draft for this format only and reset its status to Pending Human Approval. Your approved version will be preserved so you can restore it, and no other format outputs will be modified.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleConfirmRegenerateApproved}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-warning hover:opacity-90 text-white active:scale-[0.98] transition-all duration-150"
            >
              Regenerate {formatMeta?.name || formatId}
            </button>
            <button
              type="button"
              onClick={() => setShowRegenerateConfirm(false)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary active:scale-[0.98] transition-all duration-150"
            >
              Keep Approved
            </button>
          </div>
        </div>
      )}

      {/* Source Provenance & Grounding Connection Bar (Always Visible) */}
      <div className="px-3 py-2 rounded-xl bg-surface border border-border flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5 text-text-secondary min-w-0">
            <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
              <Link2 className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
              <span>Grounded in Source:</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sidebar-bg border border-border text-text-primary font-medium truncate max-w-[240px]">
              <FileText className="w-3 h-3 text-primary dark:text-accent shrink-0" />
              <span className="truncate">{sourceRef.fileName || 'Source Document'}</span>
            </span>
            {sourceRef.mainTopic && sourceRef.mainTopic !== 'Source Document' && (
              <span className="px-2 py-0.5 rounded-md bg-sidebar-bg border border-border text-text-secondary truncate max-w-[200px]">
                Topic: {sourceRef.mainTopic}
              </span>
            )}
            <span className="text-[10px] font-mono text-text-muted">
              ID: {item.lineage?.sourceId || sourceRef.sourceId}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onInspectSource && (
              <button
                type="button"
                onClick={onInspectSource}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-accent hover:underline focus-visible:outline-none"
              >
                <FileText className="w-3 h-3" />
                <span>View Source Document</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSourceProvenance(!showSourceProvenance)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sidebar-bg hover:bg-surface-hover border border-border text-[10px] font-semibold text-text-secondary hover:text-text-primary active:scale-[0.98] transition-all duration-150"
            >
              <span>
                Source References ({traceabilityList.length})
              </span>
              {showSourceProvenance ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Source References & Provenance Details */}
        {showSourceProvenance && (
          <div className="pt-2 border-t border-border space-y-2 text-[11px] animate-slide-down">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-muted font-mono">
              <span>
                Provenance Lineage: {item.lineage?.sourceId || 'src'} → {item.lineage?.analysisId || 'ana'} → {item.lineage?.transformationId || 'trans'} → {item.lineage?.communicationId || 'comm'} → {item.lineage?.reviewId || 'rev'}
              </span>
              {sourceRef.wordCount > 0 && (
                <span>Source Length: {sourceRef.wordCount} words</span>
              )}
            </div>

            {sourceRef.excerpt && (
              <div className="p-2.5 rounded-lg bg-sidebar-bg border border-border text-text-secondary">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Source Document Excerpt
                </div>
                <p className="text-[11px] text-text-primary leading-relaxed line-clamp-3">
                  {sourceRef.excerpt}
                </p>
              </div>
            )}

            {traceabilityList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {traceabilityList.map((trace, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-sidebar-bg border border-border text-[11px] text-text-primary"
                  >
                    <div className="font-medium leading-snug">{trace.fact}</div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">
                      Origin: {trace.origin || 'Extracted from source'} • {trace.sourceId || item.lineage?.sourceId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-text-muted italic">
                Derived directly from active source document ({item.lineage?.sourceId || 'src-1'}).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visible Warning Banner when Module 5 detects warnings/issues */}
      {warningChecks.length > 0 && (
        <div className="p-3 rounded-xl bg-warning-subtle border border-warning/30 text-xs text-warning space-y-1 animate-slide-down">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
            <span>Module 5 Quality & Verification Warnings ({warningChecks.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-text-secondary">
            {warningChecks.map(([key, check]) => (
              <li key={key}>
                <strong>{CHECK_LABELS[key] || key}:</strong> {check.message || check.explanation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable 10-Dimension Module 5 QA & Source Traceability Drawer */}
      {showReviewChecks && (
        <div className="p-3.5 rounded-xl bg-sidebar-bg border border-border space-y-3 text-xs animate-slide-down">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary dark:text-accent" />
              <span>Module 5 Quality Review & Grounding Audit</span>
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              src: {item.lineage?.sourceId || 'src'} • ana: {item.lineage?.analysisId || 'ana'} • rev: {item.lineage?.reviewId || 'rev'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checkEntries.map(([key, check]) => {
              const isPass = check?.status === CHECK_STATUSES.PASS;
              const isWarn = check?.status === CHECK_STATUSES.WARNING;
              return (
                <div
                  key={key}
                  className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                    isPass
                      ? 'bg-surface border-border text-text-primary'
                      : isWarn
                      ? 'bg-warning-subtle border-warning/30 text-warning'
                      : 'bg-error-subtle border-error/30 text-error'
                  }`}
                >
                  {isPass ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold">{CHECK_LABELS[key] || key}</div>
                    <div className="text-[10px] opacity-85 leading-snug">{check?.message || check?.explanation}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grounded Source Traceability Excerpts */}
          {traceabilityList.length > 0 && (
            <div className="pt-2 border-t border-border space-y-1.5">
              <div className="text-[11px] font-bold text-text-secondary">
                Source Traceability References ({traceabilityList.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {traceabilityList.map((trace, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-surface border border-border text-[11px] text-text-primary"
                  >
                    <div className="font-medium leading-snug">{trace.fact}</div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">
                      Origin: {trace.origin || 'Extracted from source'} • {trace.sourceId || item.lineage?.sourceId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Preview / Editor */}
      {renderFormatPreview()}
    </div>
  );
}
