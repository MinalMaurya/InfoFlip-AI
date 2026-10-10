import React from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Wand2, 
  CheckCircle2, 
  DownloadCloud,
  Share2,
  Sparkles,
  Lock,
  Check,
  ChevronRight
} from 'lucide-react';

export const PIPELINE_STEPS = [
  { id: 1, tab: 'create', number: '01', title: 'Input', subtitle: 'Ingest & Normalize', icon: FileText, module: 'Module 1' },
  { id: 2, tab: 'understand', number: '02', title: 'Understand', subtitle: 'Context & Intent', icon: BrainCircuit, module: 'Module 2' },
  { id: 3, tab: 'transform', number: '03', title: 'Transform', subtitle: 'Multi-Format GenAI', icon: Wand2, module: 'Module 3' },
  { id: 4, tab: 'communicate', number: '04', title: 'Communicate', subtitle: 'Social & Channels', icon: Share2, module: 'Module 4' },
  { id: 5, tab: 'review', number: '05', title: 'Review', subtitle: 'Human in the Loop', icon: CheckCircle2, module: 'Module 5' },
  { id: 6, tab: 'export', number: '06', title: 'Export', subtitle: 'Multi-Channel Dispatch', icon: DownloadCloud, module: 'Module 6' },
];

export default function PipelineStepIndicator({ 
  activeModule, 
  activeStep, 
  activeTab,
  onStepClick,
  canNavigateToStep
}) {
  // Resolve current numeric step
  let currentStep = activeStep || activeModule;
  if (!currentStep && activeTab) {
    const tabMap = {
      'create': 1,
      'understand': 2,
      'transform': 3,
      'workspace': 3,
      'communicate': 4,
      'review': 5,
      'export': 6
    };
    currentStep = tabMap[activeTab] || 1;
  }
  if (!currentStep) currentStep = 1;

  const currentStepObj = PIPELINE_STEPS.find(s => s.id === currentStep) || PIPELINE_STEPS[0];

  const handleStepClick = (stepId) => {
    if (!onStepClick) return;
    const isPast = stepId < currentStep;
    const isCurrent = stepId === currentStep;
    const canAccess = isPast || isCurrent || (canNavigateToStep && canNavigateToStep(stepId));
    
    if (canAccess) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs mb-6 transition-colors">
      
      {/* Workflow Header (Requirements 13 & 19) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-primary dark:bg-accent/30 relative">
            <span className="animate-ping absolute inset-0 rounded-full bg-accent/30 opacity-75"></span>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Content Transformation Workflow
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Six-stage human-in-the-loop GenAI pipeline
            </p>
          </div>
        </div>

        {/* Current Stage Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-accent bg-surface-selected px-3 py-1 rounded-full border border-primary/30 dark:border-primary/40">
          <Sparkles className="w-3.5 h-3.5 text-text-primary0" />
          <span>Stage {currentStep} of 6: {currentStepObj.title} • {currentStepObj.subtitle}</span>
        </div>
      </div>

      {/* 6-Stage Progress Cards (Desktop: 6 in 1 row; Tablet: 3 cols; Mobile: 2 cols) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isPast = step.id < currentStep;
          const isFuture = step.id > currentStep;
          const isAllowed = isPast || isCurrent || (canNavigateToStep && canNavigateToStep(step.id));

          return (
            <div
              key={step.id}
              role={onStepClick && isAllowed ? 'button' : undefined}
              tabIndex={onStepClick && isAllowed ? 0 : undefined}
              onClick={() => handleStepClick(step.id)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onStepClick && isAllowed) {
                  e.preventDefault();
                  handleStepClick(step.id);
                }
              }}
              title={
                isCurrent 
                  ? `Stage ${step.number}: ${step.title} (Active Stage)`
                  : isPast 
                  ? `Stage ${step.number}: ${step.title} (Completed - Click to inspect)`
                  : isAllowed
                  ? `Stage ${step.number}: ${step.title} (Available)`
                  : `Stage ${step.number}: ${step.title} (Locked - Complete preceding stages first)`
              }
              className={`relative flex flex-col justify-between p-3 rounded-lg border transition-all select-none ${
                onStepClick && isAllowed
                  ? 'cursor-pointer hover:border-primary dark:hover:border-primary hover:shadow-xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  : isFuture
                  ? 'cursor-not-allowed opacity-65'
                  : ''
              } ${
                isCurrent
                  ? 'bg-surface-selected/60 border-primary/300 dark:border-primary/40 shadow-xs ring-1 ring-primary'
                  : isPast
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              {/* Card Top: Number, Icon & Status Pill (Requirements 15 & 16) */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                      isCurrent
                        ? 'bg-primary text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <Icon className={`w-3.5 h-3.5 ${
                    isCurrent 
                      ? 'text-primary dark:text-accent'
                      : isPast 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-400 dark:text-slate-500'
                  }`} />
                </div>

                {/* Status Badges: Completed, Current, Locked */}
                {isPast ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-1.5 py-0.2 rounded">
                    <Check className="w-2.5 h-2.5" />
                    <span>Done</span>
                  </span>
                ) : isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-accent bg-surface-selected px-1.5 py-0.2 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent/30 animate-pulse" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Card Bottom: Title & Subtitle */}
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${
                  isCurrent 
                    ? 'text-text-primary dark:text-accent font-extrabold' 
                    : isPast
                    ? 'text-emerald-950 dark:text-emerald-200'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
