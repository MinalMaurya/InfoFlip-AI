import React, { useState } from 'react';
import ExportSummary from '../components/export/ExportSummary.jsx';
import ExportActions from '../components/export/ExportActions.jsx';
import ApprovedAssetList from '../components/export/ApprovedAssetList.jsx';
import ExportAuditTrail from '../components/export/ExportAuditTrail.jsx';
import ExportMetadata from '../components/export/ExportMetadata.jsx';
import ExportProgress from '../components/export/ExportProgress.jsx';
import ExportDataContractModal from '../components/export/ExportDataContractModal.jsx';
import GeneralDisclaimerNotice from '../components/common/GeneralDisclaimerNotice.jsx';

import { validateExportPackage } from '../services/export/exportService.js';
import { EXPORT_STATUSES } from '../types/export.js';

import { 
  DownloadCloud, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Code, 
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function Module6ExportView({
  exportPackage,
  onBackToInput,
  onBackToUnderstand,
  onBackToTransform,
  onBackToCommunicate,
  onBackToReview,
  onLoadDemo,
  onRecordHistory
}) {
  const [showContractModal, setShowContractModal] = useState(false);
  const [exportStatus, setExportStatus] = useState(EXPORT_STATUSES.READY);
  const [statusMessage, setStatusMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Validate incoming Module 5 export package
  const validation = validateExportPackage(exportPackage);
  const isBlocked = !validation.isValid;

  const handleExportSuccess = (meta) => {
    setExportStatus(EXPORT_STATUSES.SUCCESS);
    const msg = meta.format === 'clipboard'
      ? `Copied ${meta.itemCount} approved deliverables to clipboard.`
      : `Downloaded ${meta.fileName || meta.format} deliverable successfully.`;

    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);

    // Record into History if callback provided
    if (onRecordHistory && exportPackage) {
      onRecordHistory({
        exportId: exportPackage.exportId,
        sourceId: exportPackage.sourceId,
        exportedAt: new Date().toISOString(),
        approvedCount: exportPackage.approvedOutputs?.length || 0,
        formats: [meta.format],
        qualityGate: 'PASSED'
      });
    }
  };

  const approvedCount = exportPackage?.approvedOutputs?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Page Heading & Header (Pass 4 UI Refinement) */}
      <div className="mb-2 sm:mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent border border-primary/40">
                EXPORT
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Export your approved content
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Download, copy, and distribute the content that has passed human review.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onBackToReview && (
              <button
                type="button"
                onClick={onBackToReview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Review (Mod 5)</span>
              </button>
            )}

            {!isBlocked && (
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary dark:text-accent border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Inspect Module 6 Export Package Contract"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quality Gate Trust Banner */}
      {!isBlocked ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  QUALITY GATE PASSED · HUMAN CERTIFIED
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                  Human Approved
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                {approvedCount} deliverable{approvedCount !== 1 ? 's' : ''} reviewed and authorized by human reviewer. Only approved content is released for export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ready for Distribution</span>
            </span>
          </div>
        </div>
      ) : null}

      {/* General Transparency Notice */}
      <GeneralDisclaimerNotice compact />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-[10px] text-emerald-600 dark:text-emerald-400 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* BLOCKED STATE: When no approved outputs exist */}
      {isBlocked && (
        <div className="p-8 text-center rounded-3xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Export Locked — Human Approval Required
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {validation.error || 'Module 6 strictly requires at least one human-approved communication deliverable from Module 5. Unapproved or rejected AI content cannot be distributed.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onBackToReview && (
              <button
                type="button"
                onClick={onBackToReview}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs transition-colors"
              >
                Go to Module 5 (Review) to Approve
              </button>
            )}
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Load Demo Scenario
              </button>
            )}
          </div>
        </div>
      )}

      {/* EXPORTING STATE: Progress indicator */}
      <ExportProgress status={exportStatus} message={statusMessage} />

      {/* ACTIVE DASHBOARD: When export package is valid */}
      {!isBlocked && (
        <div className="space-y-6 sm:space-y-8">
          {/* Summary Stat Cards */}
          <ExportSummary exportPackage={exportPackage} />

          {/* Export Action Buttons */}
          <ExportActions
            exportPackage={exportPackage}
            onInspectContracts={() => setShowContractModal(true)}
            onExportSuccess={handleExportSuccess}
          />

          {/* Approved Deliverables Card List */}
          <ApprovedAssetList exportPackage={exportPackage} />

          {/* Lineage & Audit Trail */}
          <ExportAuditTrail exportPackage={exportPackage} />

          {/* Metadata & Technical Specs */}
          <ExportMetadata exportPackage={exportPackage} />
        </div>
      )}

      {/* Contract Inspection Modal */}
      <ExportDataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        exportPackage={exportPackage}
      />

    </div>
  );
}
