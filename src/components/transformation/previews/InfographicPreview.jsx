import React from 'react';
import { BarChart3, Sparkles, Layers, Quote } from 'lucide-react';

export default function InfographicPreview({
  content,
  isEditing,
  onUpdateContent,
  audience
}) {
  if (!content) return null;

  const title = content.title || 'Infographic Layout';
  const subtitle = content.subtitle || '';
  const sections = Array.isArray(content.sections) ? content.sections : [];
  const statistics = Array.isArray(content.statistics) ? content.statistics : [];
  const callout = content.callout || '';

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Infographic Title:
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
            Subtitle:
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Callout Banner:
          </label>
          <input
            type="text"
            value={callout}
            onChange={(e) => onUpdateContent({ ...content, callout: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Header Banner */}
      <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <BarChart3 className="w-3.5 h-3.5" />
          Infographic Content Structure (Ready for Module 5)
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Statistics Tiles */}
      {statistics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statistics.map((stat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-1 shadow-2xs"
            >
              <div className="text-lg sm:text-xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {stat.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {stat.context}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {sec.heading}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {sec.keyPoint}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {sec.supportingFact}
            </p>
          </div>
        ))}
      </div>

      {/* Callout Footer */}
      {callout && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-900 text-center text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-200">
          💡 {callout}
        </div>
      )}
    </div>
  );
}
