import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Flame, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ContextIntentCard({ contextSummary }) {
  const [expanded, setExpanded] = useState(false);

  if (!contextSummary) return null;

  const { domain, intent, urgency, audience, tone, language, keyAction } = contextSummary;

  const getUrgencyBadge = (lvl) => {
    switch (lvl) {
      case 'High':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900';
      case 'Moderate':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900';
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-4 sm:p-5 shadow-2xs mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-2xs">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Cognitive Pipeline Extracted
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs">
                Context & Intent Grounded
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {domain}
            </h3>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Intent:</span>
            <span>{intent}</span>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-2xs ${getUrgencyBadge(urgency)}`}>
            <Flame className="w-3 h-3" />
            <span>{urgency} Priority</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expanded Semantic Diagnostics */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-indigo-100/80 dark:border-indigo-900/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fade-in">
          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
              Audience Filter
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{audience}</span>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
              Calibrated Tone
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{tone}</span>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
              Output Language
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{language}</span>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
              Core Call to Action
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {keyAction}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
