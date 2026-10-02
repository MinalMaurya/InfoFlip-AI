import React from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Sliders, 
  Wand2, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { getOutputFormatById } from '../../services/transformation/outputFormatRegistry.js';

const STAGES = [
  { step: 1, title: 'Reading source & analysis', icon: FileText },
  { step: 2, title: 'Applying content understanding', icon: BrainCircuit },
  { step: 3, title: 'Applying cohort preferences', icon: Sliders },
  { step: 4, title: 'Synthesizing output formats', icon: Wand2 },
  { step: 5, title: 'Validating results & grounding', icon: ShieldCheck },
  { step: 6, title: 'Transformation complete', icon: CheckCircle2 },
];

export default function TransformationProgressTracker({
  currentStep = 1,
  title = '',
  detail = '',
  requestedFormats = []
}) {
  const percent = Math.min(Math.round(((currentStep - 1) / 5) * 100), 100);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title || 'Generating Content Transformations...'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {detail || 'Synthesizing verified facts into requested communication formats...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Sequential Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STAGES.map((st) => {
          const isPassed = currentStep > st.step;
          const isCurrent = currentStep === st.step;
          const Icon = st.icon;

          return (
            <div
              key={st.step}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                isPassed
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                  : isCurrent
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] ${
                  isPassed
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isPassed ? '✓' : st.step}
              </div>
              <span className="truncate">{st.title}</span>
            </div>
          );
        })}
      </div>

      {/* Per-Format Checklist */}
      {requestedFormats.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Target Output Formats:
          </div>
          <div className="flex flex-wrap gap-2">
            {requestedFormats.map((fId) => {
              const def = getOutputFormatById(fId);
              const isDone = currentStep >= 5;
              const isWorking = currentStep === 4;

              return (
                <div
                  key={fId}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : isWorking
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <span>{isDone ? '✓' : isWorking ? '●' : '○'}</span>
                  <span>{def?.name || fId}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
