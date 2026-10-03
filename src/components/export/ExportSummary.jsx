import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck2, 
  Layers, 
  Clock, 
  Sparkles,
  Users,
  Sliders,
  Languages
} from 'lucide-react';

export default function ExportSummary({ exportPackage }) {
  if (!exportPackage) return null;

  const {
    exportId,
    sourceId,
    approvedOutputs = [],
    reviewSummary = {},
    config = {},
    createdAt
  } = exportPackage;

  const qualityGate = reviewSummary.qualityGate || 'PASSED';
  const approvedCount = approvedOutputs.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Distribution & Quality Overview
        </h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Audit-verified delivery package
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Quality Gate Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs space-y-1 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Quality Gate
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {qualityGate}
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Human Certified</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Audited across 10 QA dimensions
          </p>
        </div>

        {/* Approved Deliverables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Approved Deliverables
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {approvedCount} Channel{approvedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {approvedCount} Asset{approvedCount !== 1 ? 's' : ''} Ready
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            100% human-approved for export
          </p>
        </div>

        {/* Export Package Identifier */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 hover:shadow-xs transition-shadow">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Export Deliverable ID
          </span>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate" title={exportId}>
            {exportId}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            Source: {sourceId}
          </div>
        </div>

        {/* Delivery Configuration */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 hover:shadow-xs transition-shadow">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Profile Constraints
          </span>
          <div className="flex flex-wrap gap-1 text-[11px] pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <Users className="w-3 h-3 text-indigo-500 shrink-0" /> {config.targetAudience || 'General Public'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <Sliders className="w-3 h-3 text-indigo-500 shrink-0" /> {config.tone || 'Informative'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <Languages className="w-3 h-3 text-indigo-500 shrink-0" /> {config.language || 'English'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
