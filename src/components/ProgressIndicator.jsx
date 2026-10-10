import React from 'react';
import { 
  FileSearch, 
  BrainCircuit, 
  Users2, 
  Wand2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Source Analysis', icon: FileSearch, desc: 'Entity extraction & factual grounding' },
  { id: 2, label: 'Context & Intent', icon: BrainCircuit, desc: 'Objective & urgency classification' },
  { id: 3, label: 'Audience Adaptation', icon: Users2, desc: 'Cohort vocabulary & tone calibration' },
  { id: 4, label: 'Content Transformation', icon: Wand2, desc: 'Multi-format synchronized synthesis' },
];

export default function ProgressIndicator({ currentStep, stepTitle, stepDetail }) {
  return (
    <div className="bg-surface rounded-2xl p-6 text-text-primary shadow-md border border-border animate-fade-in my-6 transition-colors">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-selected border border-primary/30 flex items-center justify-center text-primary dark:text-accent">
            <Loader2 className="w-4 h-4 animate-spin text-primary dark:text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
              Context-Aware GenAI Engine In Progress
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-surface-selected text-primary dark:text-accent border border-primary/30">
                Step {currentStep} of 4
              </span>
            </h3>
            <p className="text-xs text-text-secondary">
              {stepDetail || 'Synthesizing verified multi-format communication...'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-text-secondary">
          Latency: ~1.4s (Interactive Prototype)
        </div>
      </div>

      {/* Steps Pipeline Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-surface-selected border-primary text-text-primary shadow-xs ring-1 ring-focus-ring/40'
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-sidebar-bg border-border text-text-secondary opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                  Step 0{s.id}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary dark:text-accent animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-text-secondary" />
                )}
              </div>
              <div className="text-xs font-bold leading-snug">
                {s.label}
              </div>
              <div className="text-[10px] mt-0.5 line-clamp-1 opacity-80">
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Linear Bar */}
      <div className="w-full bg-sidebar-bg rounded-full h-1.5 mt-5 overflow-hidden border border-border">
        <div 
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

    </div>
  );
}
