import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  Sparkles,
  Sliders
} from 'lucide-react';

export default function ReviewProgressTracker({ progressState }) {
  if (!progressState) return null;

  const { step = 1, title = 'Evaluating Quality', detail = 'Running review checks...' } = progressState;

  const STEPS = [
    { number: 1, label: 'Contract Validation', icon: FileCheck2 },
    { number: 2, label: 'Fact & Grounding', icon: ShieldCheck },
    { number: 3, label: 'Tone & Style', icon: Sliders },
    { number: 4, label: 'Platform Constraints', icon: AlertCircle },
    { number: 5, label: 'Final Quality Verdict', icon: Sparkles }
  ];

  return (
    <div className="p-5 rounded-2xl border border-border bg-sidebar-bg shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary text-white shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-primary dark:text-accent bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-primary/40">
          Step {step} of 5
        </span>
      </div>

      {/* Progress Steps Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
        {STEPS.map((s) => {
          const isDone = step > s.number;
          const isCurrent = step === s.number;
          const Icon = s.icon;

          return (
            <div 
              key={s.number}
              className={`p-2 rounded-xl border transition-all text-xs flex flex-col items-center text-center gap-1 ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : isCurrent
                  ? 'bg-white dark:bg-slate-800 border-primary dark:border-primary/40 text-primary dark:text-accent shadow-xs ring-1 ring-primary'
                  : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full mb-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary dark:text-accent animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 opacity-50" />
                )}
              </div>
              <span className="font-semibold text-[11px] leading-tight">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
