import React from 'react';
import { Loader2, Download, ShieldCheck } from 'lucide-react';

export default function ExportProgress({ status, message }) {
  if (status !== 'EXPORTING') return null;

  return (
    <div className="p-4 rounded-2xl bg-surface-selected/60 border border-primary/40 flex items-center justify-between gap-3 text-xs animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary text-white shadow-2xs">
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
      <span className="font-mono text-[10px] text-primary dark:text-accent font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-primary/40">
        PROCESSING
      </span>
    </div>
  );
}
