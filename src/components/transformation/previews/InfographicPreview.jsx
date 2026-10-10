import React from 'react';
import { BarChart3 } from 'lucide-react';

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
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Infographic Title:
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
            Subtitle:
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Callout Banner:
          </label>
          <input
            type="text"
            value={callout}
            onChange={(e) => onUpdateContent({ ...content, callout: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="text-center pb-4 border-b border-divider space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-selected text-text-primary border border-border">
          <BarChart3 className="w-3.5 h-3.5 text-primary dark:text-accent" />
          Infographic Content Structure (Ready for Module 5)
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
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
              className="p-3.5 rounded-2xl bg-sidebar-bg dark:bg-surface-elevated border border-border text-center space-y-1 shadow-2xs"
            >
              <div className="text-lg sm:text-xl font-black text-primary dark:text-accent tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-text-primary truncate">
                {stat.label}
              </div>
              <div className="text-[10px] text-text-secondary line-clamp-2">
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
            className="p-4 rounded-xl bg-sidebar-bg dark:bg-surface-elevated border border-border space-y-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent">
              {sec.heading}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-text-primary">
              {sec.keyPoint}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              {sec.supportingFact}
            </p>
          </div>
        ))}
      </div>

      {/* Callout Footer */}
      {callout && (
        <div className="p-4 rounded-xl bg-surface-selected border border-border text-center text-xs sm:text-sm font-bold text-text-primary">
          💡 {callout}
        </div>
      )}
    </div>
  );
}
