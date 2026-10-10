import React, { useState, useEffect } from 'react';
import ReviewSummary from '../components/review/ReviewSummary.jsx';
import ReviewOutputCard from '../components/review/ReviewOutputCard.jsx';
import ReviewProgressTracker from '../components/review/ReviewProgressTracker.jsx';
import ReviewDataContractModal from '../components/review/ReviewDataContractModal.jsx';
import GeneralDisclaimerNotice from '../components/common/GeneralDisclaimerNotice.jsx';

import { 
  reviewCommunicationOutputs, 
  editOutput, 
  approveOutput, 
  rejectOutput, 
  regenerateOutputReview, 
  prepareModule6ExportPackage 
} from '../services/review/reviewService.js';

import { 
  CHECK_STATUSES, 
  APPROVAL_STATUSES 
} from '../types/review.js';

import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  ChevronRight, 
  RotateCcw, 
  Code, 
  Download, 
  Sparkles, 
  Check, 
  FileCheck2, 
  Layers, 
  RefreshCw,
  Send,
  Info
} from 'lucide-react';

export default function Module5ReviewView({
  sourceData,
  analysisData,
  transformationResult,
  communicationResult,
  onBackToInput,
  onBackToUnderstand,
  onBackToTransform,
  onBackToCommunicate,
  onProceedToModule6,
  onLoadDemo
}) {
  // Review state
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [progressState, setProgressState] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeChannelFilter, setActiveChannelFilter] = useState('ALL');
  const [selectedOutputId, setSelectedOutputId] = useState(null);

  // Modals & export
  const [showContractModal, setShowContractModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPackage, setExportPackage] = useState(null);
  const [exportError, setExportError] = useState('');

  // Run initial review when communicationResult changes or loads
  useEffect(() => {
    if (communicationResult && communicationResult.outputs?.length > 0) {
      handleRunReview();
    }
  }, [communicationResult]);

  const handleRunReview = async () => {
    if (!communicationResult) return;

    setIsReviewing(true);
    setProgressState({ step: 1, title: 'Validating Input Contract', detail: 'Verifying Module 4 schema...' });

    try {
      setTimeout(() => {
        setProgressState({ step: 2, title: 'Fact & Grounding Audit', detail: 'Checking dates, numbers, facts against source...' });
      }, 250);

      setTimeout(() => {
        setProgressState({ step: 3, title: 'Tone & Style Review', detail: 'Verifying audience fit, tone, and readability...' });
      }, 500);

      setTimeout(() => {
        setProgressState({ step: 4, title: 'Platform Compliance', detail: 'Validating limits for SMS, X, LinkedIn, Email...' });
      }, 750);

      setTimeout(() => {
        setProgressState({ step: 5, title: 'Finalizing Quality Verdict', detail: 'Assembling review contract...' });
      }, 950);

      const result = await reviewCommunicationOutputs({
        communicationResult,
        sourceData,
        analysisData,
        transformationResult,
        config: communicationResult.config || {}
      });

      setTimeout(() => {
        setReviewResult(result);
        setIsReviewing(false);
        setProgressState(null);
      }, 1100);

    } catch (err) {
      console.error('Module 5 review error:', err);
      setIsReviewing(false);
      setProgressState(null);
    }
  };

  // Human Edit Action
  const handleEditOutput = (outputId, newContent) => {
    if (!reviewResult) return;
    try {
      const updated = editOutput(reviewResult, outputId, newContent, {
        sourceData,
        analysisData,
        transformationResult,
        config: reviewResult.config
      });
      setReviewResult(updated);
    } catch (err) {
      console.error('Failed to edit output:', err);
    }
  };

  // Human Approve Action
  const handleApproveOutput = (outputId, notes = '') => {
    if (!reviewResult) return;
    const updated = approveOutput(reviewResult, outputId, notes);
    setReviewResult(updated);
  };

  // Human Reject Action
  const handleRejectOutput = (outputId, notes = '') => {
    if (!reviewResult) return;
    const updated = rejectOutput(reviewResult, outputId, notes);
    setReviewResult(updated);
  };

  // Re-generate / Re-evaluate single output
  const handleRegenerateOutput = (outputId) => {
    if (!reviewResult) return;
    const updated = regenerateOutputReview(reviewResult, outputId, {
      sourceData,
      analysisData,
      transformationResult,
      config: reviewResult.config
    });
    setReviewResult(updated);
  };

  // Bulk Approve All Passed
  const handleApproveAllPassed = () => {
    if (!reviewResult) return;
    let current = reviewResult;
    current.items.forEach(item => {
      if (item.overallStatus === CHECK_STATUSES.PASS && item.approvalStatus !== APPROVAL_STATUSES.REJECTED) {
        current = approveOutput(current, item.outputId, 'Batch approved based on all checks passing');
      }
    });
    setReviewResult(current);
  };

  // Prepare & trigger Module 6 Export Package
  const handlePrepareExport = () => {
    if (!reviewResult) return;
    setExportError('');

    try {
      const pkg = prepareModule6ExportPackage(reviewResult);
      setExportPackage(pkg);

      if (onProceedToModule6) {
        onProceedToModule6(pkg);
      } else {
        setShowExportModal(true);
      }
    } catch (err) {
      setExportError(err.message || 'Unable to prepare export package.');
    }
  };

  // Filtered items logic
  const items = reviewResult?.items || [];

  const filteredItems = items.filter(item => {
    // Channel filter
    if (activeChannelFilter !== 'ALL' && item.channelId !== activeChannelFilter) {
      return false;
    }

    // Status filter
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PASS') return item.overallStatus === CHECK_STATUSES.PASS;
    if (filterStatus === 'WARNING') return item.overallStatus === CHECK_STATUSES.WARNING;
    if (filterStatus === 'FAIL') return item.overallStatus === CHECK_STATUSES.FAIL;
    if (filterStatus === 'APPROVED') return item.approvalStatus === APPROVAL_STATUSES.APPROVED;
    if (filterStatus === 'PENDING') return item.approvalStatus === APPROVAL_STATUSES.PENDING_REVIEW || item.approvalStatus === APPROVAL_STATUSES.NEEDS_EDIT;

    return true;
  });

  const approvedCount = items.filter(i => i.approvalStatus === APPROVAL_STATUSES.APPROVED).length;
  const passedCount = items.filter(i => i.overallStatus === CHECK_STATUSES.PASS).length;
  const isExportReady = approvedCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Page Heading & Header (Pass 4 UI Refinement) */}
      <div className="mb-2 sm:mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent border border-primary/40">
                REVIEW
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Review & approve your content
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Validate AI-generated content, inspect its grounding, make human edits, and approve it for export.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onBackToCommunicate && (
              <button
                type="button"
                onClick={onBackToCommunicate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Communicate</span>
              </button>
            )}

            {reviewResult && (
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary dark:text-accent border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Inspect Module 5 Review Contract"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Review JSON</span>
              </button>
            )}

            {passedCount > 0 && (
              <button
                type="button"
                onClick={handleApproveAllPassed}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve All Passed ({passedCount})</span>
              </button>
            )}

            {reviewResult && (
              <button
                type="button"
                onClick={handleRunReview}
                disabled={isReviewing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Re-run all quality checks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReviewing ? 'animate-spin' : ''}`} />
                <span>Re-run Checks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Human Review Required Trust Banner (Phase 1 Requirement) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface-selected via-blue-50/50 to-slate-50 dark:from-surface-selected dark:via-blue-950/20 dark:to-slate-900 border border-primary/30 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent">
                HUMAN REVIEW REQUIRED
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-surface-selected text-primary dark:text-accent">
                Quality Gate
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Automated checks verify grounding, consistency, safety, readability, and platform compliance. Final approval remains with a human reviewer.
            </p>
          </div>
        </div>

        {/* Live Gate Status Pill */}
        <div className="flex items-center gap-2">
          {approvedCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{approvedCount} of {items.length} Approved</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Awaiting Human Sign-Off</span>
            </span>
          )}
        </div>
      </div>

      {/* General Transparency Notice */}
      <GeneralDisclaimerNotice compact />

      {/* Upstream Transformation & Communication Context Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Topic:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-surface-selected font-semibold text-primary dark:text-accent border border-primary/30">
              {analysisData?.overview?.mainTopic || 'General Document'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Evaluated Outputs:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{items.length} channel assets</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Target Audience:</span>{' '}
            <span>{communicationResult?.config?.targetAudience || 'General Public'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Tone:</span>{' '}
            <span>{communicationResult?.config?.tone || 'Informative'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(!communicationResult || communicationResult.outputs?.length === 0) && onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-selected text-primary dark:text-accent border border-primary/40 hover:bg-surface-hover transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Scenario</span>
            </button>
          )}
        </div>
      </div>

      {/* Evaluation Progress Tracker */}
      {isReviewing && progressState && (
        <ReviewProgressTracker progressState={progressState} />
      )}

      {/* No Data Fallback State */}
      {!communicationResult && !isReviewing && (
        <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-surface-selected text-primary dark:text-accent flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Communication Assets Available for Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Module 5 reviews and validates outputs generated by Module 4. Please proceed through the pipeline or load a verified demo scenario to explore the review engine.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs transition-colors"
              >
                Load Demo & Proceed
              </button>
            )}
            {onBackToCommunicate && (
              <button
                type="button"
                onClick={onBackToCommunicate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Go to Module 4 (Communicate)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Review Dashboard */}
      {reviewResult && (
        <div className="space-y-6">
          
          {/* Summary Stat Cards */}
          <ReviewSummary
            summary={reviewResult.summary}
            currentFilter={filterStatus}
            activeFilter={filterStatus}
            onFilterChange={setFilterStatus}
          />

          {/* Export Error Alert */}
          {exportError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Channel Filter Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-2 shrink-0">
              Filter by Channel:
            </span>
            <button
              type="button"
              onClick={() => setActiveChannelFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeChannelFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            {Array.from(new Set(items.map(i => i.channelId))).map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannelFilter(ch)}
                className={`capitalize px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  activeChannelFilter === ch
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Review Output Cards Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ReviewOutputCard
                  key={item.outputId}
                  item={item}
                  sourceId={reviewResult.sourceId}
                  analysisId={reviewResult.analysisId}
                  transformationId={reviewResult.transformationId}
                  onApprove={handleApproveOutput}
                  onReject={handleRejectOutput}
                  onEdit={handleEditOutput}
                  onRegenerate={handleRegenerateOutput}
                />
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
                No communication outputs match the selected filter.
              </div>
            )}
          </div>

          {/* Module 6 Export Readiness Banner */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isExportReady
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isExportReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {isExportReady
                      ? `Quality Gate Approved (${approvedCount} of ${items.length} Ready)`
                      : 'Quality Gate: Pending Human Sign-Off'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                  {isExportReady
                    ? 'Outputs have received human review and approval with intact source traceability. Ready for packaging into Module 6 (Export).'
                    : 'Module 6 (Export) requires at least one output to be human-approved. Review and approve the outputs above to unlock export packaging.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrepareExport}
                disabled={!isExportReady}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-950 active:scale-[0.99]"
              >
                <span>Proceed to Module 6 (Export)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Contract Inspection Modal */}
      <ReviewDataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        reviewResult={reviewResult}
        exportPackage={exportPackage}
      />

      {/* Export Confirmation Modal */}
      {showExportModal && exportPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Ready for Module 6 Export
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Module 5 has verified and packaged {exportPackage.approvedOutputs?.length} human-approved communication assets with full audit trail.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
              <div>Export ID: {exportPackage.exportId}</div>
              <div>Approved Count: {exportPackage.approvedOutputs?.length}</div>
              <div>Source ID: {exportPackage.sourceId}</div>
              <div>Quality Gate: PASSED</div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  setShowContractModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Inspect JSON
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
