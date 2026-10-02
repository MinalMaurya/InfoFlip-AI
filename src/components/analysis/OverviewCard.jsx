import React from 'react';
import { BookOpen, Tag, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function OverviewCard({ overview, confidence }) {
  if (!overview) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Executive Summary
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {overview.category && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/50">
              {overview.category}
            </span>
          )}
          {overview.contentType && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {overview.contentType}
            </span>
          )}
        </div>
      </div>

      {/* Source Title & Topic context */}
      {overview.title && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Source: <span className="text-slate-800 dark:text-slate-200 font-bold">{overview.title}</span>
          </h2>
        </div>
      )}

      {/* Primary Dominant Summary Paragraph */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-100 font-normal">
          {overview.summary}
        </p>
      </div>

    </div>
  );
}
