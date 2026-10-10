import React from 'react';
import { 
  History, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Languages, 
  Users,
  ShieldCheck,
  DownloadCloud,
  FileCheck2,
  Tag
} from 'lucide-react';

export default function HistoryView({ 
  historyItems, 
  onSelectHistoryItem, 
  onBackToWorkspace 
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-selected text-primary dark:text-accent border border-primary/40 mb-2">
            <History className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span>Workflow History & Saved Deliverables</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Previous Workflows
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access, inspect, and reload completed transformation pipelines and human-approved deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Resume Active Workflow</span>
        </button>
      </div>

      {/* Notice info */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <span className="text-base">💡</span>
        <div>
          <strong className="text-slate-800 dark:text-slate-200">Production Note:</strong> In production, transformation runs are indexed in a secured relational audit ledger with cryptographic traceability signatures. Select any record to reload its full lineage, review state, and approved deliverables.
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {historyItems.map((item) => {
          const approvedCount = item.approvedCount || item.deliverableCount || 4;
          const qualityGate = item.qualityGate || 'PASSED';
          const exportStatus = item.exportStatus || 'Exported';
          const stage = item.stage || '06 Export';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                {/* Badges: Category, Date, Stage, Quality Gate */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent bg-surface-selected px-2 py-0.5 rounded border border-primary/30">
                    {item.category || 'Advisory'}
                  </span>
                  
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {item.createdDate || item.timestamp}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-accent bg-surface-selected px-2 py-0.5 rounded border border-primary/20">
                    <FileCheck2 className="w-3 h-3 text-primary dark:text-accent" />
                    <span>Stage: {stage}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Quality Gate: {qualityGate}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-accent bg-surface-selected/60 px-2 py-0.5 rounded border border-primary/30 dark:border-primary/40">
                    <DownloadCloud className="w-3 h-3 text-primary dark:text-accent" />
                    <span>{exportStatus}</span>
                  </span>
                </div>

                {/* Project Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {item.title}
                </h3>

                {/* Source Snippet */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  "{item.sourceSnippet || item.source}"
                </p>

                {/* Technical Lineage & Asset Metadata */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> {item.audience}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-600 dark:text-slate-400">Tone: {item.tone}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-slate-400" /> {item.language}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    {approvedCount} approved {approvedCount === 1 ? 'asset' : 'assets'}
                  </span>

                  {item.sourceId && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        src: {item.sourceId}
                      </span>
                    </>
                  )}

                  {item.exportId && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-mono text-[10px] text-primary dark:text-accent">
                        pkg: {item.exportId}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button: Open Workflow */}
              <div className="shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onSelectHistoryItem(item)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-primary dark:text-accent bg-surface-selected hover:bg-surface-hover dark:hover:bg-surface-hover border border-primary/40 transition-colors shadow-2xs active:scale-[0.98]"
                >
                  <span>Open Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
