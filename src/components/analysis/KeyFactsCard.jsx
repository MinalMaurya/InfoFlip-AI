import React from 'react';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function KeyFactsCard({ keyFacts }) {
  if (!keyFacts || keyFacts.length === 0) return null;

  const getImportanceBadge = (imp) => {
    switch (imp) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Grounded Key Facts ({keyFacts.length})
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Extracted from provided source
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <FileText className="w-3.5 h-3.5" />
          <span>Extracted from source</span>
        </div>
      </div>

      {/* Facts List */}
      <div className="space-y-2.5">
        {keyFacts.map((factItem, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
          >
            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
              {idx + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {factItem.fact}
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-1.5 justify-end">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Detected</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getImportanceBadge(factItem.importance)}`}>
                {factItem.importance}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
