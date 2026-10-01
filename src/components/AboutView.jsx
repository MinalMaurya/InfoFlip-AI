import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Users, 
  Sliders, 
  Languages, 
  LayoutGrid, 
  ShieldCheck, 
  Repeat, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function AboutView({ onStartTransforming }) {
  const capabilities = [
    {
      title: 'Context-Aware Transformation',
      desc: 'Extracts core intent, domain context, urgency tier, and factual directives to prevent distortion.',
      icon: BrainCircuit
    },
    {
      title: 'Audience Control',
      desc: 'Dynamically re-engineers vocabulary and formality for general public, students, press, or officials.',
      icon: Users
    },
    {
      title: 'Tone Control',
      desc: 'Seamlessly shift between Urgent emergency warnings, Formal memorandums, or Informative bulletins.',
      icon: Sliders
    },
    {
      title: 'Language Adaptation',
      desc: 'Vernacular generation supporting authentic English, Hindi, and Marathi terminologies.',
      icon: Languages
    },
    {
      title: 'Multi-Format Generation',
      desc: 'Parallel synthesis of Social Media posts, Executive Briefs, Emails, Press Releases, and Awareness notices.',
      icon: LayoutGrid
    },
    {
      title: 'Human Review & Control',
      desc: 'Built-in edit, audit, and verification gates before final public distribution to ensure responsible AI.',
      icon: ShieldCheck
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Hero Badge */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
          <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> SIH Problem Statement: SIH26154
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          InfoFlip<span className="text-indigo-600 dark:text-indigo-400">-AI</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Gen AI Platform for Automated Content Transformation (SIH26154)
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
          Transforms unstructured information into audience-specific communication artefacts using configurable content transformation workflows.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs mb-8">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
          Problem Statement: SIH26154
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          In emergencies, public administration, healthcare, and enterprise crises, a single piece of critical information (such as a weather advisory or policy change) must be rapidly communicated to diverse groups: citizens need simple, reassuring directives; field teams need operational SOPs; senior leaders need executive summaries; and media outlets need formal press releases.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">The Current Bottleneck:</div>
          <p>• Manual rewriting takes hours and causes response delays.</p>
          <p>• Information gets distorted or inconsistent across departments.</p>
          <p>• Translation into vernacular languages introduces critical misinterpretations.</p>
        </div>
      </div>

      {/* Core Capabilities Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>Core Capabilities</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{cap.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Architecture Roadmap */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 border border-indigo-800/50">
        <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Production-Ready Architecture Roadmap
        </h3>
        <p className="text-xs text-indigo-100/90 leading-relaxed mb-4">
          While this prototype runs a self-contained smart transformation engine for reliable, zero-latency judging evaluation, the production system is architected for:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <strong className="block text-indigo-300 mb-1">1. LLM Integration</strong>
            Gemini 1.5 Pro / Flash via Google GenAI SDK for zero-shot semantic parsing.
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <strong className="block text-indigo-300 mb-1">2. Multimodal Ingestion</strong>
            Ingest PDFs, audio recordings, press conference streams, and satellite alerts.
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <strong className="block text-indigo-300 mb-1">3. Automated Dispatch</strong>
            Direct API pushes to WhatsApp Business, Twitter/X, SMS gateways, and portals.
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <button
          type="button"
          onClick={onStartTransforming}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-300 dark:shadow-indigo-950 transition-colors"
        >
          <span>Try Demo in Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
