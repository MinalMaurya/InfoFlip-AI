import React from 'react';
import { Loader2, Download, ShieldCheck } from 'lucide-react';

export default function ExportProgress({ status, message }) {
  if (status !== 'EXPORTING') return null;

  return (
    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {message || 'Generating Export Deliverables...'}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Preserving lineage and building certified deliverables.
          </p>
        </div>
      </div>
      <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
        PROCESSING
      </span>
    </div>
  );
}
