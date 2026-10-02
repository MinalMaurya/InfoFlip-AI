import React from 'react';
import { FileText, CheckCircle2, TrendingUp, AlertCircle, Compass, Target } from 'lucide-react';

export default function ExecutiveSummaryPreview({
  content,
  isEditing,
  onUpdateContent,
  audience,
  tone
}) {
  if (!content) return null;

  const title = content.title || 'Executive Summary';
  const overview = content.executiveOverview || '';
  const keyPoints = Array.isArray(content.keyPoints) ? content.keyPoints : [];
  const importantFindings = Array.isArray(content.importantFindings) ? content.importantFindings : [];
  const implications = Array.isArray(content.implications) ? content.implications : [];
  const considerations = Array.isArray(content.recommendedConsiderations) ? content.recommendedConsiderations : [];

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Summary Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Executive Overview:
          </label>
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => onUpdateContent({ ...content, executiveOverview: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Key Points (one per line):
          </label>
          <textarea
            rows={4}
            value={keyPoints.join('\n')}
            onChange={(e) => onUpdateContent({ ...content, keyPoints: e.target.value.split('\n').filter(Boolean) })}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Title & Framing Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Executive Briefing
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Cohort: {audience} • Protocol: {tone}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>

      {/* Executive Overview */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Strategic Executive Overview</span>
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
          {overview}
        </p>
      </div>

      {/* Grid: Key Points & Important Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Key Operational Points</span>
          </h4>
          <ul className="space-y-2">
            {keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Findings */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Quantitative Findings & Metrics</span>
          </h4>
          <ul className="space-y-2">
            {importantFindings.map((finding, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40"
              >
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 mt-0.5">📊</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Implications & Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Strategic Implications</span>
          </h4>
          <ul className="space-y-1.5">
            {implications.map((imp, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                → {imp}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Recommended Considerations</span>
          </h4>
          <ul className="space-y-1.5">
            {considerations.map((con, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ✓ {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
