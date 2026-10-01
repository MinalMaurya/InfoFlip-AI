import React from 'react';
import { BookOpen, Tag, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function OverviewCard({ overview, confidence }) {
  if (!overview) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Content Overview
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/50">
            {overview.category || 'General'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {overview.contentType || 'Document'}
          </span>
          {typeof confidence?.overall === 'number' && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {Math.round(confidence.overall * 100)}% Confidence
            </span>
          )}
        </div>
      </div>

      {/* Title & Topic */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {overview.title}
        </h2>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <Compass className="w-3.5 h-3.5" />
          <span>Main Topic: <strong className="text-slate-800 dark:text-slate-200">{overview.mainTopic}</strong></span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
          Executive Summary
        </span>
        <p>{overview.summary}</p>
      </div>

    </div>
  );
}
