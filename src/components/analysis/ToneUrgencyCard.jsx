import React from 'react';
import { Sliders, AlertOctagon, Flame, ShieldAlert } from 'lucide-react';
import { URGENCY_LEVELS } from '../../types/analysis.js';

export default function ToneUrgencyCard({ tone, urgency }) {
  const getUrgencyColor = (lvl) => {
    switch (lvl) {
      case URGENCY_LEVELS.HIGH:
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case URGENCY_LEVELS.MEDIUM:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case URGENCY_LEVELS.LOW:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Tone Analysis Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-7 h-7 rounded-lg bg-surface-selected text-primary dark:text-accent flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Source Tone Analysis
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-slate-100">
            <span>{tone?.primary || 'Informative'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Primary Voice
            </span>
          </div>

          {tone?.secondary && tone.secondary.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tone.secondary.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            Analysis of the original source's register and communicative demeanor.
          </p>
        </div>
      </div>

      {/* Urgency & Priority Signals Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Urgency & Priority Signals
            </h3>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getUrgencyColor(urgency?.level)}`}>
            {urgency?.level ? `${urgency.level} Priority` : 'Not detected'}
          </span>
        </div>

        <div className="space-y-1.5">
          {urgency?.reasons && urgency.reasons.length > 0 ? (
            urgency.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-rose-500 mt-0.5">•</span>
                <span className="flex-1">{reason}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No critical urgency triggers or emergency deadlines detected.</p>
          )}
        </div>
      </div>

    </div>
  );
}
