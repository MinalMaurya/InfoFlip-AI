import React from 'react';
import { Target, Users, ShieldCheck, HelpCircle } from 'lucide-react';
import { EVIDENCE_LEVELS } from '../../types/analysis.js';

export default function IntentAudienceCard({ intent, audience }) {
  if (!intent && !audience) return null;

  const getEvidenceBadge = (level) => {
    switch (level) {
      case EVIDENCE_LEVELS.DETECTED:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case EVIDENCE_LEVELS.INFERRED:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Intent Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-selected text-primary dark:text-accent flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Communication Intent
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-primary dark:text-accent">
            Primary: {intent?.primary || 'Inform'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{intent?.primary || 'Inform'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent">
              Lead Directive
            </span>
          </div>

          {intent?.secondary && intent.secondary.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-1">
                Secondary Intents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {intent.secondary.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audience Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-selected text-primary dark:text-accent flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Audience Signals
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEvidenceBadge(audience?.evidenceLevel)}`}>
            {audience?.evidenceLevel || 'Inferred'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {audience?.detected && audience.detected.length > 0 ? (
              audience.detected.map((aud, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-selected text-primary dark:text-accent border border-primary/30 dark:border-primary/40"
                >
                  {aud}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Not detected with sufficient confidence</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Inferential Signal: <strong>{(audience?.confidence || 0.85) >= 0.75 ? 'Strong Match' : 'Moderate Match'}</strong></span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">
              {audience?.evidenceLevel === EVIDENCE_LEVELS.DETECTED ? 'Explicitly stated in source' : 'Semantically inferred (not verified)'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
