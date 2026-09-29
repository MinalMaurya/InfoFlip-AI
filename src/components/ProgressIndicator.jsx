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
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/50 animate-fade-in my-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Context-Aware GenAI Engine In Progress
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Step {currentStep} of 4
              </span>
            </h3>
            <p className="text-xs text-indigo-200/80">
              {stepDetail || 'Synthesizing verified multi-format communication...'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-indigo-300/80">
          Latency: ~1.4s (Interactive Prototype)
        </div>
      </div>

      {/* Steps Pipeline Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          const isUpcoming = currentStep < s.id;

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/50'
                  : isDone
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                  Step 0{s.id}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
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
      <div className="w-full bg-indigo-950 rounded-full h-1.5 mt-5 overflow-hidden border border-indigo-800/40">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

    </div>
  );
}
