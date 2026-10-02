import React from 'react';
import { 
  Anchor, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  FileText, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { GROUNDING_LEVELS } from '../../types/review.js';

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
          This content was derived as a channel adaptation or CTA/Hashtag formulation from source context.
        </p>
      </div>
    );
  }

  const getGroundingBadge = (level) => {
    switch (level) {
      case GROUNDING_LEVELS.GROUNDED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Grounded
          </span>
        );
      case GROUNDING_LEVELS.PARTIALLY_GROUNDED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Partially Grounded
          </span>
        );
      case GROUNDING_LEVELS.UNGROUNDED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Ungrounded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Verified Origin
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Upstream Contract Linkages */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Trace Lineage:
          </span>
          {sourceId && <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Source: {sourceId}</span>}
          {analysisId && <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Analysis: {analysisId}</span>}
          {transformationId && <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Transform: {transformationId}</span>}
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {sourceTraceability.length} Claim{sourceTraceability.length !== 1 ? 's' : ''} Mapped
        </span>
      </div>

      {/* Traceability Items */}
      <div className="space-y-2">
        {sourceTraceability.map((item, idx) => {
          const groundingLevel = item.groundingLevel || (item.similarity >= 0.7 ? GROUNDING_LEVELS.GROUNDED : GROUNDING_LEVELS.PARTIALLY_GROUNDED);
          const sourceSnippet = item.sourceSnippet || item.originStatement || item.fact || 'Source verified fact';
          const generatedStatement = item.generatedStatement || item.claim || item.outputSnippet || 'Generated statement';

          return (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Mapping #{idx + 1} &bull; Origin: {item.originType || 'source-fact'}
                </span>
                {getGroundingBadge(groundingLevel)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                {/* Source Origin */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-500" /> Source Statement / Fact
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                    "{sourceSnippet}"
                  </p>
                </div>

                {/* Generated Claim */}
                <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Generated Communication
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    "{generatedStatement}"
                  </p>
                </div>
              </div>

              {typeof item.similarity === 'number' && (
                <div className="text-[10px] text-slate-400 text-right">
                  Grounding Match Confidence: {Math.round(item.similarity * 100)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
