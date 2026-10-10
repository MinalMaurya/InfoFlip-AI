import React from 'react';
import { 
  Layers, 
  Users, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  ArrowDown, 
  Sparkles, 
  Zap 
} from 'lucide-react';

export default function ValueSection() {
  const cards = [
    {
      title: 'One Source',
      highlight: 'Multiple communication formats',
      description: 'Ingest raw reports, press notes, or policy documents once. Automatically generate emails, briefs, social updates, and press releases.',
      icon: Layers,
      color: 'primary'
    },
    {
      title: 'Audience Control',
      highlight: 'Adapt content for different audiences',
      description: 'Dynamically rephrase tone, vocabulary, and reading level for citizens, students, media, leadership, or departmental staff.',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Consistent Context',
      highlight: 'Preserve crucial facts across formats',
      description: 'Zero message hallucination or drift. Key figures, warning levels, timelines, and directives stay strictly synchronized.',
      icon: Compass,
      color: 'cyan'
    },
    {
      title: 'Human Review',
      highlight: 'Review and refine before publishing',
      description: 'Responsible AI by design. Communication officers can edit, approve, and verify every single artefact before public release.',
      icon: ShieldCheck,
      color: 'emerald'
    }
  ];

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-selected text-primary dark:text-accent border border-primary/40 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary dark:text-accent" /> SIH26154 Value Proposition
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Why InfoFlip-AI?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Eliminate repetitive drafting, prevent message distortion, and accelerate crisis response from hours to seconds.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-surface-selected border border-primary/30 text-primary dark:text-accent flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent">
                  {c.title}
                </h3>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                  {c.highlight}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Workflow Flowchart */}
      <div className="bg-sidebar-bg text-text-primary rounded-2xl p-6 shadow-sm border border-border transition-colors">
        <div className="text-xs font-mono uppercase tracking-widest text-primary dark:text-accent mb-3 text-center sm:text-left">
          End-to-End Transformation Pipeline
        </div>
        
        {/* Flow steps container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          
          {/* Step 1 */}
          <div className="bg-surface p-3.5 rounded-xl border border-border flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-primary dark:text-accent">Input</span>
            <span className="text-sm font-bold mt-0.5 text-text-primary">1 Raw Source</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Advisory, Report, Policy</span>
          </div>

          {/* Step 2 */}
          <div className="bg-surface p-3.5 rounded-xl border border-border flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-primary dark:text-accent">Phase 01</span>
            <span className="text-sm font-bold mt-0.5 text-text-primary">Context & Intent</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Semantic Analysis & Urgency</span>
          </div>

          {/* Step 3 */}
          <div className="bg-surface p-3.5 rounded-xl border border-border flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-primary dark:text-accent">Phase 02</span>
            <span className="text-sm font-bold mt-0.5 text-text-primary">Audience + Tone + Language</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Vernacular & Formality Tuning</span>
          </div>

          {/* Step 4 */}
          <div className="bg-surface-selected p-3.5 rounded-xl border border-primary/30 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Output</span>
            <span className="text-sm font-bold mt-0.5 text-text-primary">Multiple Artefacts</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Social, Briefs, Emails, Press</span>
          </div>

        </div>
      </div>

    </section>
  );
}
