import React from 'react';
import { 
  FileText, 
  Sliders, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { getCommunicationChannelById } from '../../services/communication/communicationChannelRegistry.js';

const STAGES = [
  { step: 1, stage: 'reading', label: 'Reading structured outputs & context', icon: FileText },
  { step: 2, stage: 'strategy', label: 'Calibrating channel strategies', icon: Sliders },
  { step: 3, stage: 'generating', label: 'Generating communication assets', icon: Send },
  { step: 4, stage: 'validating', label: 'Validating channel constraints & facts', icon: ShieldCheck },
  { step: 5, stage: 'complete', label: 'Communication generation complete', icon: CheckCircle2 },
];

export default function CommunicationProgressTracker({ progressState, requestedChannels = [] }) {
  const currentStep = progressState?.step || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Module 4 • Social & Communication Engine</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {progressState?.title || 'Synthesizing Platform Assets...'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {progressState?.detail || 'Specializing structured content for communication channels...'}
        </p>
      </div>

      {/* Stage Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isDone = s.step < currentStep || currentStep === 5;
          const isActive = s.step === currentStep && currentStep !== 5;

          return (
            <div
              key={s.step}
              className={`p-3.5 rounded-2xl border transition-all flex sm:flex-col items-center gap-3 sm:text-center ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-2xs ring-2 ring-indigo-400/20'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <span className={`text-xs font-bold block ${
                  isActive ? 'text-indigo-900 dark:text-indigo-200' : isDone ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-channel chips during generation */}
      {requestedChannels.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Targeting Channels:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {requestedChannels.map((ch) => {
              const def = getCommunicationChannelById(ch);
              return (
                <span
                  key={ch}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {def?.name || ch}
                </span>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
