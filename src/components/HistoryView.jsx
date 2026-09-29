import React from 'react';
import { 
  History, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Languages, 
  Users 
} from 'lucide-react';

export default function HistoryView({ 
  historyItems, 
  onSelectHistoryItem, 
  onBackToWorkspace 
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <History className="w-3.5 h-3.5 text-indigo-600" /> Session History & Sample Records
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Recent Transformations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit log of context-analyzed inputs and synthesized communication bundles.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Workspace</span>
        </button>
      </div>

      {/* Notice info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-600 flex items-start gap-2.5">
        <span className="text-base">💡</span>
        <div>
          <strong className="text-slate-800">Production Note:</strong> In production, transformation histories are indexed in a secured relational database (e.g. PostgreSQL / Firebase Data Connect) with organizational access control. This client-side view showcases active session logs and SIH benchmark datasets.
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-3.5">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.category || 'Advisory'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.timestamp}
                </span>
                {item.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Human Reviewed
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                "{item.sourceSnippet || item.source}"
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> {item.audience}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Tone: {item.tone}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-slate-400" /> {item.language}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded">
                  {item.formatsCount || (item.formats ? item.formats.length : 3)} formats generated
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => onSelectHistoryItem(item)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                <span>Load into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
