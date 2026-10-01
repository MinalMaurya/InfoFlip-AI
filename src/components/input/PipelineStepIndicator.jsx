import React from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Wand2, 
  CheckCircle, 
  DownloadCloud,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, number: '01', title: 'Input', subtitle: 'Ingest & Normalize', icon: FileText, current: true, module: 'Module 1' },
  { id: 2, number: '02', title: 'Understand', subtitle: 'Context & Intent', icon: BrainCircuit, current: false, module: 'Module 2' },
  { id: 3, number: '03', title: 'Transform', subtitle: 'Multi-Format GenAI', icon: Wand2, current: false, module: 'Module 3' },
  { id: 4, number: '04', title: 'Review', subtitle: 'Human in the Loop', icon: CheckCircle, current: false, module: 'Module 4' },
  { id: 5, number: '05', title: 'Export', subtitle: 'Multi-Channel Dispatch', icon: DownloadCloud, current: false, module: 'Module 5' },
];

export default function PipelineStepIndicator({ activeModule = 1 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-2xs mb-6">
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            SIH 26154 Transformation Pipeline
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
          <Sparkles className="w-3 h-3" />
          <span>Active: {PIPELINE_STEPS.find(s => s.id === activeModule)?.module || `Module ${activeModule}`} ({PIPELINE_STEPS.find(s => s.id === activeModule)?.subtitle || PIPELINE_STEPS.find(s => s.id === activeModule)?.title})</span>
        </div>
      </div>

      {/* Steps bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.id === activeModule;
          const isPast = step.id < activeModule;

          return (
            <div
              key={step.id}
              className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600/80 shadow-2xs ring-1 ring-indigo-400/20'
                  : isPast
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800/80 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isCurrent
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
                    : isPast
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.number}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold truncate ${
                    isCurrent 
                      ? 'text-indigo-900 dark:text-indigo-200' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
