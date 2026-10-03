import React, { useState } from 'react';
import { 
  FileCheck2, 
  Anchor, 
  AlertCircle, 
  Sliders, 
  Users, 
  BookOpen, 
  Languages, 
  CheckSquare, 
  Copy, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { CHECK_STATUSES } from '../../types/review.js';
import ReviewCheckDetail from './ReviewCheckDetail.jsx';

const DIMENSION_CONFIG = {
  factualConsistency: {
    label: '1. Factual Consistency',
    icon: FileCheck2,
    description: 'Dates, numbers, names, locations, and facts verified against source data.'
  },
  sourceGrounding: {
    label: '2. Source Grounding',
    icon: Anchor,
    description: 'Direct traceability records mapping claims to source/analysis origin.'
  },
  hallucinationCheck: {
    label: '3. Unsupported Claims',
    icon: AlertCircle,
    description: 'Identification of unsupported URLs, absolutes, or invented statistics.'
  },
  toneConsistency: {
    label: '4. Tone Consistency',
    icon: Sliders,
    description: 'Comparison of generated emotional style with requested tone.'
  },
  audienceFit: {
    label: '5. Audience Fit',
    icon: Users,
    description: 'Vocabulary complexity, jargon, and framing tailored to target group.'
  },
  readability: {
    label: '6. Readability & Metrics',
    icon: BookOpen,
    description: 'Sentence length, complexity analysis, and public reading level metrics.'
  },
  languageConsistency: {
    label: '7. Language Consistency',
    icon: Languages,
    description: 'Script and vocabulary verification according to target language config.'
  },
  platformCompliance: {
    label: '8. Platform Compliance',
    icon: CheckSquare,
    description: 'Channel constraints: character limits, layout, CTA, hashtags, and threads.'
  },
  duplicationCheck: {
    label: '9. Duplication & Redundancy',
    icon: Copy,
    description: 'Repetition detection within output and cross-module verbatim redundancy.'
  },
  safetyCheck: {
    label: '10. Safety & Emergency',
    icon: ShieldAlert,
    description: 'Detection of unauthorized emergency claims or ungrounded helpline numbers.'
  }
};

export default function ReviewCheckList({ checks }) {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!checks || typeof checks !== 'object') {
    return (
      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        No review checks recorded for this output.
      </div>
    );
  }

  const toggleExpand = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case CHECK_STATUSES.PASS:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case CHECK_STATUSES.WARNING:
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case CHECK_STATUSES.FAIL:
        return <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      default:
        return null;
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case CHECK_STATUSES.PASS:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            PASS
          </span>
        );
      case CHECK_STATUSES.WARNING:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            WARN
          </span>
        );
      case CHECK_STATUSES.FAIL:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            FAIL
          </span>
        );
      default:
        return null;
    }
  };

  const passCount = Object.keys(DIMENSION_CONFIG).filter(k => checks[k]?.status === CHECK_STATUSES.PASS).length;
  const warnCount = Object.keys(DIMENSION_CONFIG).filter(k => checks[k]?.status === CHECK_STATUSES.WARNING).length;
  const failCount = Object.keys(DIMENSION_CONFIG).filter(k => checks[k]?.status === CHECK_STATUSES.FAIL).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            10-Dimension Quality Audit
          </h4>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{passCount} Passed</span>
            {warnCount > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold">• {warnCount} Warn</span>}
            {failCount > 0 && <span className="text-rose-600 dark:text-rose-400 font-bold">• {failCount} Fail</span>}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Click any check for telemetry
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {Object.entries(DIMENSION_CONFIG).map(([dimensionKey, config]) => {
          const check = checks[dimensionKey] || { status: CHECK_STATUSES.PASS, message: 'Check not evaluated' };
          const isExpanded = expandedKey === dimensionKey;
          const Icon = config.icon;

          return (
            <div key={dimensionKey} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleExpand(dimensionKey)}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                  isExpanded 
                    ? 'bg-slate-50/80 dark:bg-slate-800/50' 
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {config.label}
                      </span>
                      {getStatusPill(check.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {check.message || config.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusIcon(check.status)}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80">
                  <ReviewCheckDetail check={check} dimensionKey={dimensionKey} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
