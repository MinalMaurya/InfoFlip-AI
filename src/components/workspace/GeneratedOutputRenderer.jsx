import React, { useState } from 'react';
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
  ExternalLink
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
  onEdit,
  onApprove,
  onReject,
  onRegenerate,
  isRegenerating = false,
  onOpenOriginConversation = null
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(item?.content || '');
  const [draftStructured, setDraftStructured] = useState(item?.structuredData || null);
  const [copied, setCopied] = useState(false);
  const [showReviewChecks, setShowReviewChecks] = useState(false);

  if (!item) return null;

  const formatId = String(item.formatId || item.channelId || '').toLowerCase();
  const formatMeta = getWorkspaceFormatById(formatId);
  const isApproved = item.approvalStatus === APPROVAL_STATUSES.APPROVED;
  const isRejected = item.approvalStatus === APPROVAL_STATUSES.REJECTED;

  // Determine content status flag
  const statusFlag = item.metadata?.contentStatusFlag ||
    (isApproved
      ? CONTENT_STATUS_FLAGS.APPROVED_FOR_EXPORT
      : item.isEdited
      ? CONTENT_STATUS_FLAGS.HUMAN_REVIEWED
      : item.metadata?.isFallback
      ? CONTENT_STATUS_FLAGS.RULE_BASED_FALLBACK
      : CONTENT_STATUS_FLAGS.AI_GENERATED);

  const verificationLabel = item.metadata?.verificationStatus || 'Source not independently verified';

  // Collect warnings from Module 5 checks
  const checkEntries = Object.entries(item.checks || {});
  const warningChecks = checkEntries.filter(
    ([, c]) => c?.status === CHECK_STATUSES.WARNING || c?.status === CHECK_STATUSES.FAIL
  );

  const handleStartEdit = () => {
    setDraftText(item.content || '');
    setDraftStructured(item.structuredData || null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
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
            onUpdateContent={(val) => setDraftText(val)}
            audience={audience}
            tone={tone}
          />
        );
      case 'twitter':
        return (
          <TwitterCommunicationPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'email':
        return (
          <EmailPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'sms':
        return (
          <SMSPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'announcement':
        return (
          <AnnouncementPreview
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'cta':
        return (
          <CTASection
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'hashtags':
        return (
          <HashtagSection
            content={isEditing ? draftText : item.content}
            structuredData={item.structuredData}
            isEditing={isEditing}
            onUpdateContent={(val) => setDraftText(val)}
          />
        );
      case 'executive-summary':
        if (item.structuredData) {
          return (
            <ExecutiveSummaryPreview
              content={isEditing ? (draftStructured || item.structuredData) : item.structuredData}
              isEditing={isEditing}
              onUpdateContent={(val) => setDraftStructured(val)}
              audience={audience}
              tone={tone}
            />
          );
        }
        break;
      case 'advisory':
        if (item.structuredData) {
          return (
            <AdvisoryPreview
              content={isEditing ? (draftStructured || item.structuredData) : item.structuredData}
              isEditing={isEditing}
              onUpdateContent={(val) => setDraftStructured(val)}
              audience={audience}
              tone={tone}
            />
          );
        }
        break;
      case 'infographic':
        if (item.structuredData) {
          return (
            <InfographicPreview
              content={isEditing ? (draftStructured || item.structuredData) : item.structuredData}
              isEditing={isEditing}
              onUpdateContent={(val) => setDraftStructured(val)}
              audience={audience}
            />
          );
        }
        break;
      case 'presentation':
        if (item.structuredData) {
          return (
            <PresentationPreview
              content={isEditing ? (draftStructured || item.structuredData) : item.structuredData}
              isEditing={isEditing}
              onUpdateContent={(val) => setDraftStructured(val)}
            />
          );
        }
        break;
      case 'video-script':
        if (item.structuredData) {
          return (
            <VideoScriptPreview
              content={isEditing ? (draftStructured || item.structuredData) : item.structuredData}
              isEditing={isEditing}
              onUpdateContent={(val) => setDraftStructured(val)}
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
          onChange={(e) => setDraftText(e.target.value)}
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
      {/* Top Action & Status Bar */}
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Approved for Export</span>
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>Rejected — Needs Revision</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Pending Human Approval</span>
            </span>
          )}

          {/* Truthful Verification Status */}
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/70">
            {verificationLabel}
          </span>

          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {item.metadata?.wordCount || 0}w • {item.metadata?.characterCount || (item.content?.length || 0)}c
          </span>
        </div>

        {/* Right: Edit, Copy, Regenerate, Review Details, Approve/Reject */}
        <div className="flex flex-wrap items-center gap-1.5">
          {onOpenOriginConversation && (
            <button
              type="button"
              onClick={onOpenOriginConversation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary dark:text-accent hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowReviewChecks(!showReviewChecks)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              showReviewChecks
                ? 'bg-surface-selected border-primary/40 text-primary dark:text-accent'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-primary dark:text-accent" />
            <span>QA Checks ({item.summary?.passed || 0}/10)</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={isEditing ? handleSaveEdit : handleStartEdit}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isEditing
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isEditing ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              <span>{isEditing ? 'Save Edit' : 'Edit'}</span>
            </button>
          )}

          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(item.itemId)}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-primary' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Module 5 Human Approval Actions */}
          {onApprove && !isApproved && (
            <button
              type="button"
              onClick={() => onApprove(item.itemId, 'Human reviewed and approved in chat workspace')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Approve</span>
            </button>
          )}

          {onReject && !isRejected && (
            <button
              type="button"
              onClick={() => onReject(item.itemId, 'Flagged for revision during human review')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Download this approved deliverable (.txt)"
            >
              <Download className="w-3 h-3" />
              <span>Export TXT</span>
            </button>
          )}
        </div>
      </div>

      {/* Visible Warning Banner when Module 5 detects warnings/issues */}
      {warningChecks.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Module 5 Quality & Verification Warnings ({warningChecks.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300">
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
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary dark:text-accent" />
              <span>Module 5 Quality Review & Grounding Audit</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
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
                      ? 'bg-white dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      : isWarn
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {isPass ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
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
          {Array.isArray(item.sourceTraceability) && item.sourceTraceability.length > 0 && (
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Source Traceability References ({item.sourceTraceability.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {item.sourceTraceability.map((trace, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    <div className="font-medium leading-snug">{trace.fact}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
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
