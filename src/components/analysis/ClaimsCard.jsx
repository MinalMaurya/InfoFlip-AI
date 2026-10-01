import React from 'react';
import { ShieldCheck, Sparkles, Check, HelpCircle } from 'lucide-react';

export default function ClaimsCard({ claims }) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Claims & Statements Separation
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Rigorous separation between verbatim source facts and AI inferential reasoning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Source-Stated
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> AI-Inferred
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-2.5">
        {claims.map((claim, idx) => {
          const isSourceStated = claim.type === 'source-stated';

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                isSourceStated
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                  : 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/40 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSourceStated ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    ✦
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm leading-relaxed">
                  {claim.statement}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  <span>Classification: <strong className={isSourceStated ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}>
                    {isSourceStated ? 'Source-Stated Fact' : 'AI-Inferred Interpretation'}
                  </strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
