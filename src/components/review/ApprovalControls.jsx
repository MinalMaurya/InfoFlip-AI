import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw, 
  MessageSquare, 
  ShieldCheck, 
  FileEdit,
  Clock
} from 'lucide-react';
import { APPROVAL_STATUSES } from '../../types/review.js';
import ContentStatusBadge from '../common/ContentStatusBadge.jsx';
import { CONTENT_STATUS_FLAGS } from '../../types/contentConfidence.js';

export default function ApprovalControls({
  approvalStatus = APPROVAL_STATUSES.PENDING_REVIEW,
  reviewerNotes = '',
  reviewedAt,
  isEdited = false,
  unresolvedWarnings = [],
  onApprove,
  onReject,
  onRegenerate,
  isRegenerating = false
}) {
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState(reviewerNotes || '');

  const handleApprove = () => {
    if (onApprove) {
      onApprove(notes);
    }
  };

  const handleReject = () => {
    if (!showNotesInput && !notes) {
      setShowNotesInput(true);
      return;
    }
    if (onReject) {
      onReject(notes || 'Content does not meet quality requirements.');
    }
  };

  const getStatusBadge = () => {
    switch (approvalStatus) {
      case APPROVAL_STATUSES.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Approved {isEdited ? '(with edits)' : ''}
          </span>
        );
      case APPROVAL_STATUSES.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Rejected
          </span>
        );
      case APPROVAL_STATUSES.NEEDS_EDIT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <FileEdit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Needs Edit
          </span>
        );
      case APPROVAL_STATUSES.PENDING_REVIEW:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            Pending Human Review
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary dark:text-accent" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Human Approval Decision
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {reviewedAt && (
            <span className="text-[10px] text-slate-400">
              {new Date(reviewedAt).toLocaleTimeString()}
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Reviewer Notes Display or Edit */}
      {reviewerNotes && !showNotesInput && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Reviewer Remarks
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            "{reviewerNotes}"
          </p>
        </div>
      )}

      {showNotesInput && (
        <div className="space-y-1.5 animate-fade-in">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-text-primary0" />
              <span>Reviewer Remarks / Feedback</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Required for rejection · Optional for approval
            </span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Specify reason for rejection, required revisions, or approval notes..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      )}

      {/* Unresolved Quality Warnings Notice before Approval */}
      {unresolvedWarnings && unresolvedWarnings.length > 0 && approvalStatus !== APPROVAL_STATUSES.APPROVED && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Unresolved Warnings Before Approval ({unresolvedWarnings.length})</span>
          </div>
          <ul className="list-disc list-inside text-[11px] pl-1 space-y-0.5 text-amber-900 dark:text-amber-100">
            {unresolvedWarnings.map((w, idx) => (
              <li key={idx}>{typeof w === 'string' ? w : (w.message || w.explanation || 'Verification warning')}</li>
            ))}
          </ul>
          <p className="text-[10px] text-amber-700/90 dark:text-amber-300/90 pt-1 border-t border-amber-200/60 dark:border-amber-900/60">
            ⚠️ <em>Human approval overrides quality gates for export. It does NOT independently verify unverified claims or alter factual ground truth.</em>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotesInput(!showNotesInput)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {showNotesInput ? 'Hide Remarks' : notes ? 'Edit Remarks' : '+ Add Remarks'}
          </button>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReject}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              approvalStatus === APPROVAL_STATUSES.REJECTED
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject Output</span>
          </button>

          <button
            type="button"
            onClick={handleApprove}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              approvalStatus === APPROVAL_STATUSES.APPROVED
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve for Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
