import React from 'react';
import { 
  Anchor, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { GROUNDING_LEVELS } from '../../types/review.js';
import { 
  CLAIM_VERIFICATION_STATUSES, 
  isHighRiskClaim, 
  UNVERIFIED_SOURCE_NOTICE 
} from '../../types/contentConfidence.js';

export default function TraceabilityViewer({ 
  sourceTraceability = [], 
  sourceId, 
  transformationId, 
  analysisId 
}) {
  if (!sourceTraceability || sourceTraceability.length === 0) {
    return (
      <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <Anchor className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          No explicit source traceability records attached.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          This content was derived as a channel adaptation from overall source context (e.g., call-to-action or hashtags).
        </p>
      </div>
    );
  }

  const getOriginBadge = (item) => {
    // 1. Independently verified (only if actual independent verification was recorded)
    if (
      item.independentlyVerified === true ||
      item.isIndependentlyVerified === true ||
      item.originType === 'independently-verified'
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {CLAIM_VERIFICATION_STATUSES.INDEPENDENTLY_VERIFIED}
        </span>
      );
    }

    // 2. Inferred
    if (item.originType === 'ai-inferred' || item.inferred === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {CLAIM_VERIFICATION_STATUSES.INFERRED}
        </span>
      );
    }

    // 3. Unknown / ungrounded
    if (item.groundingLevel === GROUNDING_LEVELS.UNGROUNDED || item.originType === 'unknown') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {CLAIM_VERIFICATION_STATUSES.UNKNOWN}
        </span>
      );
    }

    // 4. Extracted from source
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
        <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        {CLAIM_VERIFICATION_STATUSES.EXTRACTED_FROM_SOURCE}
      </span>
    );
  };

  const getQualitativeMatchText = (similarity) => {
    if (typeof similarity !== 'number') return null;
    if (similarity >= 0.75) return 'Strong Semantic Match with Source';
    if (similarity >= 0.45) return 'Moderate Semantic Alignment';
    return 'Weak / Paraphrased Semantic Match';
  };

  return (
    <div className="space-y-3">
      {/* Upstream Lineage Linkages */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-text-primary0" /> Lineage:
          </span>
          {sourceId && (
            <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Source: {sourceId}
            </span>
          )}
          {analysisId && (
            <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Analysis: {analysisId}
            </span>
          )}
          {transformationId && (
            <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Transform: {transformationId}
            </span>
          )}
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {sourceTraceability.length} Claim Mapping{sourceTraceability.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Traceability Items */}
      <div className="space-y-3">
        {sourceTraceability.map((item, idx) => {
          const sourceSnippet = item.sourceSnippet || item.originStatement || item.fact || 'Source context';
          const generatedStatement = item.generatedStatement || item.claim || item.outputSnippet || 'Generated statement';
          const isHighRisk = isHighRiskClaim(sourceSnippet) || isHighRiskClaim(generatedStatement);
          const isIndependentlyVerified = Boolean(item.independentlyVerified || item.isIndependentlyVerified);
          const matchLabel = getQualitativeMatchText(item.similarity);

          return (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Mapping #{idx + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  {getOriginBadge(item)}

                  {isHighRisk && !isIndependentlyVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                      <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      Verification required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                {/* Source Origin */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-text-primary0" /> Source Excerpt
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed">
                    "{sourceSnippet}"
                  </p>
                </div>

                {/* Generated Claim */}
                <div className="p-2.5 rounded-lg bg-surface-selected/60 border border-primary/30 space-y-1">
                  <span className="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-primary dark:text-accent" /> Generated Statement
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    "{generatedStatement}"
                  </p>
                </div>
              </div>

              {/* Qualitative verification and match notes */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span>
                  {isHighRisk && !isIndependentlyVerified
                    ? '⚠️ Time-sensitive/high-risk claim — ' + UNVERIFIED_SOURCE_NOTICE
                    : 'Origin grounded in supplied content'}
                </span>
                {matchLabel && (
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {matchLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
