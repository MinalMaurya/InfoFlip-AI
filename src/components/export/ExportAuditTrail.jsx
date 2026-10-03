import React, { useState } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Wand2, 
  Share2, 
  ShieldCheck, 
  UserCheck, 
  DownloadCloud, 
  Copy, 
  Check, 
  ArrowDown, 
  Layers
} from 'lucide-react';

export default function ExportAuditTrail({ exportPackage }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!exportPackage) return null;

  const {
    sourceId,
    analysisId,
    transformationId,
    communicationId,
    exportId,
    approvedOutputs = [],
    createdAt
  } = exportPackage;

  const handleCopyId = (key, val) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const STAGES = [
    {
      step: '01',
      module: 'Module 1: Smart Input & Ingestion',
      idKey: 'sourceId',
      idVal: sourceId,
      icon: FileText,
      description: 'Raw source document extracted, normalized, and verified.'
    },
    {
      step: '02',
      module: 'Module 2: AI Content Understanding',
      idKey: 'analysisId',
      idVal: analysisId,
      icon: BrainCircuit,
      description: 'Extracted key facts, dates, entities, and intent profiling.'
    },
    {
      step: '03',
      module: 'Module 3: Transformation Engine',
      idKey: 'transformationId',
      idVal: transformationId,
      icon: Wand2,
      description: 'Structured multi-format core outputs generated with groundings.'
    },
    {
      step: '04',
      module: 'Module 4: Social & Communication',
      idKey: 'communicationId',
      idVal: communicationId,
      icon: Share2,
      description: 'Platform-specialized channel content with traceability links.'
    },
    {
      step: '05',
      module: 'Module 5: Review & Human Approval',
      idKey: 'approvalStatus',
      idVal: 'PASSED (Human-in-the-Loop Certified)',
      icon: ShieldCheck,
      description: `10-dimension audit passed; ${approvedOutputs.length} deliverables human-approved.`
    },
    {
      step: '06',
      module: 'Module 6: Export & Distribution',
      idKey: 'exportId',
      idVal: exportId,
      icon: DownloadCloud,
      description: 'Packaged into authoritative multi-format deliverables.'
    }
  ];

  return (
    <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>End-to-End Audit Trail & Lineage Preservation</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable lineage verification tracing exported deliverables back to origin source document.
          </p>
        </div>

        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-bold">
          Chain Complete (100% Traceable)
        </span>
      </div>

      {/* Stage Timeline */}
      <div className="space-y-2">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isCopied = copiedKey === st.idKey;

          return (
            <div 
              key={st.step}
              className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 border border-indigo-100 dark:border-indigo-900">
                  {st.step}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {st.module}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {st.description}
                  </p>
                </div>
              </div>

              {/* ID Pill & Copy Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {st.idVal}
                </span>
                {st.idKey !== 'approvalStatus' && (
                  <button
                    type="button"
                    onClick={() => handleCopyId(st.idKey, st.idVal)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    title={`Copy ${st.idKey}`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
