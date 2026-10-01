import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

const ANALYSIS_STEPS = [
  { id: 1, key: 'reading', label: 'Reading source document', desc: 'Loading raw text buffer and metadata' },
  { id: 2, key: 'language', label: 'Detecting language & encoding', desc: 'Verifying syntax and vernacular indicators' },
  { id: 3, key: 'topic', label: 'Identifying main topic & domain', desc: 'Classifying domain context and category' },
  { id: 4, key: 'intent', label: 'Understanding intent & tone', desc: 'Analyzing purpose and communicative stance' },
  { id: 5, key: 'facts', label: 'Extracting key facts & entities', desc: 'Grounding facts, dates, organizations & numbers' },
  { id: 6, key: 'audience', label: 'Identifying audience signals', desc: 'Enforcing hallucination safeguards' },
];

export default function AnalysisLoadingTracker({
  currentStep = 1,
  title = 'Understanding your content...',
  detail = 'Analyzing source structure...'
}) {
  return (
    <div 
      role="status"
      aria-live="polite"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto shadow-xl space-y-6 animate-fade-in"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
          <BrainCircuit className="w-7 h-7 animate-pulse text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {detail}
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        {ANALYSIS_STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                  : isDone
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-slate-400 dark:text-slate-500 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold leading-tight block">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentStep / 6) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <span>Module 2: AI Content Understanding</span>
          <span>Step {currentStep} of 6</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Grounded extraction • Hallucination prevention active</span>
      </div>
    </div>
  );
}
