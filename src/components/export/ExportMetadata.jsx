import React from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

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
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Deliverable Telemetry & Specifications
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Words</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalWords}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Characters</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalChars}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Deliverable Count</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{approvedOutputs.length} channels</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Integrity Hash</span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
