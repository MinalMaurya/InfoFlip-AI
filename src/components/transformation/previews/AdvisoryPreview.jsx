import React from 'react';
import { AlertTriangle, Clock, CheckSquare } from 'lucide-react';

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
  const recommendedActions = Array.isArray(content.recommendedActions) ? content.recommendedActions : [];
  const importantDates = Array.isArray(content.importantDates) ? content.importantDates : [];

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Advisory Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Situation Assessment:
          </label>
          <textarea
            rows={3}
            value={situation}
            onChange={(e) => onUpdateContent({ ...content, situation: e.target.value })}
            className="w-full p-3 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs space-y-6 transition-colors">
      {/* Alert Header */}
      <div className="border-b border-divider pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-warning-subtle text-warning border border-warning/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Official Public Notice
          </span>
          <span className="text-xs text-text-secondary font-semibold">
            Cohort: {audience} • Protocol: {tone}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">
          {title}
        </h2>
      </div>

      {/* Situation */}
      <div className="p-4 rounded-xl bg-warning-subtle/80 border border-warning/30">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warning mb-1.5">
          Current Situation & Hazard Assessment
        </h3>
        <p className="text-sm text-text-primary leading-relaxed font-sans">
          {situation}
        </p>
      </div>

      {/* Key Information */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
          Essential Operational Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {keyInformation.map((info, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-sidebar-bg dark:bg-surface-elevated border border-border text-xs sm:text-sm text-text-primary flex items-start gap-2"
            >
              <span className="text-warning font-bold shrink-0">⚠</span>
              <span className="leading-relaxed">{info}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-divider">
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Recommended Actions</span>
          </h4>
          <ul className="space-y-1.5">
            {recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-text-primary flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Timelines, Deadlines & Helplines</span>
          </h4>
          <ul className="space-y-1.5">
            {importantDates.map((date, idx) => (
              <li key={idx} className="text-xs text-text-primary flex items-start gap-2 bg-surface-selected/50 p-2 rounded-lg border border-border">
                <span className="text-primary dark:text-accent font-bold">⏱</span>
                <span className="leading-relaxed">{date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
