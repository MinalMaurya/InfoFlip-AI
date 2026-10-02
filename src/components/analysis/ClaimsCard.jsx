import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, HelpCircle, AlertCircle } from 'lucide-react';
import { EVIDENCE_LEVELS } from '../../types/analysis.js';

export default function ClaimsCard({ claims }) {
  if (!claims || claims.length === 0) return null;

  const getClaimEvidence = (claim) => {
    if (claim.evidenceLevel === EVIDENCE_LEVELS.NOT_DETECTED) {
      return {
        level: 'Not detected',
        icon: HelpCircle,
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        cardClass: 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800',
        iconClass: 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        note: 'Insufficient grounding in source'
      };
    }
    if (claim.type === 'ai-inferred' || claim.evidenceLevel === EVIDENCE_LEVELS.INFERRED) {
      return {
        level: 'Inferred',
        icon: Sparkles,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        cardClass: 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40',
        iconClass: 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300',
        note: 'Semantically inferred by AI (not directly stated)'
      };
    }
    return {
      level: 'Detected',
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      cardClass: 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40',
      iconClass: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300',
      note: 'Directly supported by source text'
    };
  };

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
              Claims & Evidence Separation
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Rigorous separation between verbatim source facts and AI inferential reasoning
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Detected
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Inferred
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-2.5">
        {claims.map((claim, idx) => {
          const evidence = getClaimEvidence(claim);
          const Icon = evidence.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${evidence.cardClass}`}
            >
              <div className="mt-0.5 shrink-0">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${evidence.iconClass}`}>
                  <Icon className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                  {claim.statement}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className={`px-2 py-0.2 rounded font-bold uppercase border ${evidence.badgeClass}`}>
                    {evidence.level}
                  </span>
                  <span>•</span>
                  <span>{evidence.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
