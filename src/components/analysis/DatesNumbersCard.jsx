import React from 'react';
import { Calendar, Hash, Clock, AlertTriangle } from 'lucide-react';

export default function DatesNumbersCard({ importantDates = [], importantNumbers = [] }) {
  const hasDates = Array.isArray(importantDates) && importantDates.length > 0;
  const hasNumbers = Array.isArray(importantNumbers) && importantNumbers.length > 0;

  if (!hasDates && !hasNumbers) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Important Dates & Deadlines */}
      {hasDates && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface-selected text-primary dark:text-accent flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Timelines & Deadlines
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Detected</span>
            </span>
          </div>

          <div className="space-y-2">
            {importantDates.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {item.date}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {item.context}
                  </span>
                </div>
                {item.isDeadline && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shrink-0">
                    Deadline
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Numbers & Metrics */}
      {hasNumbers && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface-selected text-primary dark:text-accent flex items-center justify-center">
                <Hash className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Key Figures & Metrics
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Detected</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {importantNumbers.slice(0, 6).map((num, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-0.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent block truncate">
                  {num.label}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                  {num.value}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 block">
                  {num.context}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
