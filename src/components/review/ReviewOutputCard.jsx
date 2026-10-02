import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Share2, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Send, 
  Megaphone, 
  MousePointerClick, 
  Hash, 
  Copy, 
  Check, 
  Edit3, 
  RotateCcw, 
  Layers, 
  FileCheck2, 
  ShieldCheck, 
  Anchor,
  Sparkles,
  Bot
} from 'lucide-react';
import { CHECK_STATUSES, APPROVAL_STATUSES } from '../../types/review.js';
import ReviewCheckList from './ReviewCheckList.jsx';
import TraceabilityViewer from './TraceabilityViewer.jsx';
import ContentEditor from './ContentEditor.jsx';
import ApprovalControls from './ApprovalControls.jsx';

const CHANNEL_ICONS = {
  linkedin: Share2,
  twitter: MessageSquare,
  whatsapp: Smartphone,
  email: Mail,
  sms: Send,
  announcement: Megaphone,
  cta: MousePointerClick,
  hashtags: Hash
};

export default function ReviewOutputCard({
  item,
  sourceId,
  analysisId,
  transformationId,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
  isRegenerating = false
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'checks' | 'traceability' | 'edit'
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const {
    outputId,
    channelId,
    title,
    content,
    originalContent,
    isEdited,
    metadata = {},
    sourceTraceability = [],
    overallStatus,
    approvalStatus,
    reviewerNotes,
    reviewedAt,
    checks = {}
  } = item;

  const ChannelIcon = CHANNEL_ICONS[channelId] || Share2;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOverallStatusBadge = () => {
    switch (overallStatus) {
      case CHECK_STATUSES.PASS:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Checks Passed
          </span>
        );
      case CHECK_STATUSES.WARNING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Quality Warnings
          </span>
        );
      case CHECK_STATUSES.FAIL:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Action Required
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col transition-all">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-indigo-100 dark:border-indigo-900/60">
            <ChannelIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title || channelId.toUpperCase()}
              </h3>
              {isEdited && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  Edited
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="capitalize font-medium">{channelId} Channel</span>
              <span>&bull;</span>
              <span>{metadata.wordCount || content.split(/\s+/).filter(Boolean).length} words</span>
              <span>&bull;</span>
              <span>{metadata.characterCount || content.length} chars</span>
              {metadata.provider && (
                <>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    <Bot className="w-2.5 h-2.5" /> {metadata.provider}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {getOverallStatusBadge()}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Content & Live Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'checks'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Quality Checks</span>
            <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] inline-flex items-center justify-center font-bold">
              10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('traceability')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'traceability'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Grounding & Lineage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'edit'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Human Edit</span>
          </button>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="p-4 sm:p-5 flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Content Display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {content}
              </div>
            </div>

            {/* Quick telemetry indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Factual Audit</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {checks.factualConsistency?.status === 'PASS' ? '100% Grounded' : checks.factualConsistency?.message || 'Checked'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tone Check</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {checks.toneConsistency?.status || 'PASS'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audience Fit</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {checks.audienceFit?.status || 'PASS'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Platform Compliance</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {checks.platformCompliance?.status || 'PASS'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checks' && (
          <ReviewCheckList checks={checks} />
        )}

        {activeTab === 'traceability' && (
          <TraceabilityViewer
            sourceTraceability={sourceTraceability}
            sourceId={sourceId}
            analysisId={analysisId}
            transformationId={transformationId}
          />
        )}

        {activeTab === 'edit' && (
          <ContentEditor
            content={content}
            originalContent={originalContent}
            isEdited={isEdited}
            channelId={channelId}
            onSave={(newContent) => onEdit(outputId, newContent)}
          />
        )}
      </div>

      {/* Human Approval Controls (Bottom Footer) */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
        <ApprovalControls
          approvalStatus={approvalStatus}
          reviewerNotes={reviewerNotes}
          reviewedAt={reviewedAt}
          isEdited={isEdited}
          onApprove={(notes) => onApprove(outputId, notes)}
          onReject={(notes) => onReject(outputId, notes)}
          onRegenerate={onRegenerate ? () => onRegenerate(outputId) : null}
          isRegenerating={isRegenerating}
        />
      </div>

    </div>
  );
}
