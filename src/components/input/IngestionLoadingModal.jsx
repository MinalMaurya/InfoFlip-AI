import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  Sparkles, 
  FileSearch, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

const INGESTION_STAGES = [
  { id: 1, key: 'validating', label: 'Validating Input Format & Bounds', desc: 'Verifying file integrity, mime type, and memory limits' },
  { id: 2, key: 'extracting', label: 'Extracting Raw Content Layers', desc: 'Parsing binary streams, tokenizing paragraphs & structures' },
  { id: 3, key: 'normalizing', label: 'Normalizing & Computing Metrics', desc: 'Sanitizing characters, counting words & reading metrics' },
  { id: 4, key: 'packaging', label: 'Packaging Structured Data Contract', desc: 'Readying standardized input contract for Module 2 AI analysis' }
];

export default function IngestionLoadingModal({
  isOpen,
  currentStep = 1,
  title = 'Preparing your content...',
  detail = 'Validating input structure...'
}) {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {/* Top Header with Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 id="loading-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {detail}
          </p>
        </div>

        {/* Multi-step Loading Tracker */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          {INGESTION_STAGES.map((stage) => {
            const isCompleted = currentStep > stage.id;
            const isCurrent = currentStep === stage.id;
            const isPending = currentStep < stage.id;

            return (
              <div 
                key={stage.id} 
                className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' 
                    : isCompleted
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold leading-tight">
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentStep / 4) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Module 1: Content Ingestion</span>
            <span>Step {currentStep} of 4</span>
          </div>
        </div>

        {/* Compliance footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Passing structured data contract to Module 2</span>
        </div>

      </div>
    </div>
  );
}
