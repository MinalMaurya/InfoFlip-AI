import React from 'react';
import { AlertTriangle, Clock, ShieldCheck, CheckSquare, MapPin } from 'lucide-react';

export default function AdvisoryPreview({
  content,
  isEditing,
  onUpdateContent,
  audience,
  tone
}) {
  if (!content) return null;

  const title = content.title || 'Official Advisory';
  const situation = content.situation || '';
  const keyInformation = Array.isArray(content.keyInformation) ? content.keyInformation : [];
  const potentialImpact = content.potentialImpact || '';
  const recommendedActions = Array.isArray(content.recommendedActions) ? content.recommendedActions : [];
  const importantDates = Array.isArray(content.importantDates) ? content.importantDates : [];

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Advisory Title:
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
            Situation Assessment:
          </label>
          <textarea
            rows={3}
            value={situation}
            onChange={(e) => onUpdateContent({ ...content, situation: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Alert Header */}
      <div className="border-b border-amber-100 dark:border-amber-950/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Official Public Notice
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Cohort: {audience} • Protocol: {tone}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>

      {/* Situation */}
      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
          Current Situation & Hazard Assessment
        </h3>
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
          {situation}
        </p>
      </div>

      {/* Key Information */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Essential Operational Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {keyInformation.map((info, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
            >
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <span className="leading-relaxed">{info}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Recommended Actions</span>
          </h4>
          <ul className="space-y-1.5">
            {recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Timelines, Deadlines & Helplines</span>
          </h4>
          <ul className="space-y-1.5">
            {importantDates.map((date, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">
                <span className="text-rose-600 dark:text-rose-400 font-bold">⏱</span>
                <span className="leading-relaxed">{date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
