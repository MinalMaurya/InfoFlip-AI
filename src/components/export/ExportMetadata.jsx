import React from 'react';
import { FileText, Type, Layers, ShieldCheck } from 'lucide-react';

export default function ExportMetadata({ exportPackage }) {
  if (!exportPackage) return null;

  const {
    exportId,
    approvedOutputs = [],
    config = {},
    createdAt
  } = exportPackage;

  const totalWords = approvedOutputs.reduce((acc, item) => acc + (item.wordCount || 0), 0);
  const totalChars = approvedOutputs.reduce((acc, item) => acc + (item.characterCount || 0), 0);

  return (
    <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Deliverable Telemetry & Specifications
        </h4>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Verified metrics across approved channels
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Words</span>
            <FileText className="w-3.5 h-3.5 text-text-primary0" />
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalWords}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Characters</span>
            <Type className="w-3.5 h-3.5 text-text-primary0" />
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalChars}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Deliverable Count</span>
            <Layers className="w-3.5 h-3.5 text-text-primary0" />
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{approvedOutputs.length} channels</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Integrity Hash</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">VERIFIED</div>
        </div>
      </div>
    </div>
  );
}
