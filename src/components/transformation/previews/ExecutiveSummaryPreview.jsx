import React from 'react';
import { CheckCircle2, TrendingUp, AlertCircle, Compass, Target } from 'lucide-react';

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
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Summary Title:
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
            Executive Overview:
          </label>
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => onUpdateContent({ ...content, executiveOverview: e.target.value })}
            className="w-full p-3 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Key Points (one per line):
          </label>
          <textarea
            rows={4}
            value={keyPoints.join('\n')}
            onChange={(e) => onUpdateContent({ ...content, keyPoints: e.target.value.split('\n').filter(Boolean) })}
            className="w-full p-3 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs space-y-6 transition-colors">
      {/* Title & Framing Header */}
      <div className="border-b border-divider pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary bg-surface-selected px-2.5 py-0.5 rounded-full border border-border">
            Executive Briefing
          </span>
          <span className="text-xs text-text-secondary font-medium">
            Cohort: {audience} • Protocol: {tone}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">
          {title}
        </h2>
      </div>

      {/* Executive Overview */}
      <div className="p-4 sm:p-5 rounded-xl bg-sidebar-bg dark:bg-surface-elevated border border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span>Strategic Executive Overview</span>
        </h3>
        <p className="text-sm text-text-primary leading-relaxed font-sans">
          {overview}
        </p>
      </div>

      {/* Grid: Key Points & Important Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Key Operational Points</span>
          </h4>
          <ul className="space-y-2">
            {keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-text-primary flex items-start gap-2 bg-sidebar-bg dark:bg-surface-elevated p-2.5 rounded-lg border border-border"
              >
                <span className="text-success font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Findings */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span>Quantitative Findings & Metrics</span>
          </h4>
          <ul className="space-y-2">
            {importantFindings.map((finding, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-text-primary flex items-start gap-2 bg-surface-selected/50 p-2.5 rounded-lg border border-border"
              >
                <span className="text-primary dark:text-accent font-bold shrink-0 mt-0.5">📊</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Implications & Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-divider">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Strategic Implications</span>
          </h4>
          <ul className="space-y-1.5">
            {implications.map((imp, idx) => (
              <li key={idx} className="text-xs text-text-secondary leading-relaxed">
                → {imp}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Recommended Considerations</span>
          </h4>
          <ul className="space-y-1.5">
            {considerations.map((con, idx) => (
              <li key={idx} className="text-xs text-text-secondary leading-relaxed">
                ✓ {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
