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
  Share2,
  FileText,
  Wand2,
  DownloadCloud,
  Check
} from 'lucide-react';

export default function AboutView({ onStartTransforming }) {
  const pipelineStages = [
    {
      num: '01',
      title: 'Smart Input & Ingestion',
      desc: 'Normalizes plain text, documents (PDF, DOCX), images (OCR), and web URLs into validated data contracts.',
      icon: FileText
    },
    {
      num: '02',
      title: 'AI Content Understanding',
      desc: 'Extracts domain, audience, tone, key facts, entities, dates/numbers, and intent vectors via Gemini 3.8 Flash.',
      icon: BrainCircuit
    },
    {
      num: '03',
      title: 'Transformation & Output Engine',
      desc: 'Multi-format generation supporting executive briefs, advisories, infographics, summaries, and presentations.',
      icon: Wand2
    },
    {
      num: '04',
      title: 'Social & Communication Generator',
      desc: 'Channel specialization for LinkedIn, Twitter/X, WhatsApp, Email, SMS, Public Announcements, CTAs, and Hashtags.',
      icon: Share2
    },
    {
      num: '05',
      title: 'Review, QA & Human Approval',
      desc: 'Fact consistency, source grounding, tone/sentiment audit, edit tracking, and mandatory quality-gate approvals.',
      icon: CheckCircle2
    },
    {
      num: '06',
      title: 'Export & Distribution Engine',
      desc: 'Multi-format delivery of human-approved assets: ZIP bundle, JSON manifest, TXT briefs, printable PDF, and clipboard.',
      icon: DownloadCloud
    }
  ];

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
      title: 'Tone & Urgency Modulation',
      desc: 'Seamlessly shift between Urgent emergency warnings, Formal memorandums, or Informative bulletins.',
      icon: Sliders
    },
    {
      title: 'Multilingual Vernacular Adaptation',
      desc: 'Authentic generation supporting English, Hindi, and Marathi with localized idioms and cultural accuracy.',
      icon: Languages
    },
    {
      title: 'Human-in-the-Loop Validation',
      desc: 'Built-in audit, fact consistency checks, and manual approval gates before distribution to ensure responsible AI.',
      icon: ShieldCheck
    },
    {
      title: 'Full Lineage & Audit Trail',
      desc: 'Cryptographic source IDs, transformation hashes, provider attribution, and approval audit timestamps.',
      icon: LayoutGrid
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Hero Badge & Mascot */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm border border-primary/40 bg-white dark:bg-slate-900 flex items-center justify-center">
          <img 
            src="/infoflip-logo.png" 
            alt="InfoFlip-AI Mascot" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-selected text-primary dark:text-accent border border-primary/40 mb-3">
          <Cpu className="w-3.5 h-3.5 text-primary dark:text-accent" /> SIH Problem Statement: SIH26154
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          InfoFlip<span className="text-primary dark:text-accent">-AI</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-2 font-medium">
          GenAI Content Transformation Platform (SIH 26154)
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
          Transforms complex source information into audience-specific, multi-channel communication deliverables using a verified six-stage Human-in-the-Loop AI pipeline.
        </p>
      </div>

      {/* Problem & Solution Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs mb-8">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary dark:bg-accent/30"></span>
          <span>The Problem & Solution (SIH26154)</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          In emergencies, public administration, healthcare, and enterprise crises, a single piece of critical information (such as a weather advisory or policy change) must be rapidly communicated to diverse groups: citizens need simple directives; field teams need operational SOPs; leaders need executive summaries; and media outlets need formal press releases.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-red-900 dark:text-red-300">
            <strong className="block text-red-800 dark:text-red-200 mb-1 font-bold">The Challenge:</strong>
            Manual rewriting takes hours, introduces departmental inconsistency, and causes catastrophic delays in public communication.
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300">
            <strong className="block text-emerald-800 dark:text-emerald-200 mb-1 font-bold">The InfoFlip-AI Solution:</strong>
            One ingested source is analyzed for semantic intent and synthesized into 8+ channel deliverables with guaranteed source grounding and human review.
          </div>
        </div>
      </div>

      {/* Six-Stage Transformation Pipeline (Requirement 9) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary dark:text-accent" />
            <span>The Six-Stage Pipeline</span>
          </h2>
          <span className="text-xs font-semibold text-primary dark:text-accent bg-surface-selected px-2.5 py-0.5 rounded-full border border-primary/30 dark:border-primary/40">
            Modules 1 – 6 Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
                      {stage.num}
                    </span>
                    <Icon className="w-4 h-4 text-primary dark:text-accent" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Capabilities Grid */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>Enterprise Capabilities</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-surface-selected text-primary dark:text-accent shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cap.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Architecture Roadmap */}
      <div className="bg-sidebar-bg rounded-2xl p-6 text-text-primary shadow-sm mb-8 border border-border transition-colors">
        <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-text-primary">
          <Sparkles className="w-4 h-4 text-primary dark:text-accent" />
          Production-Ready Architecture
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Built with an enterprise-grade hybrid pipeline: Google Gemini 3.8 Flash for zero-shot semantic understanding with automatic deterministic fallback guarantees.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-surface rounded-xl border border-border text-text-secondary">
            <strong className="block text-primary dark:text-accent mb-1">1. Hybrid GenAI</strong>
            Gemini 3.8 Flash with 429 quota exhaustion fast-fallback.
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border text-text-secondary">
            <strong className="block text-primary dark:text-accent mb-1">2. Human-in-the-Loop</strong>
            Audit gate prevents unverified distribution of claims.
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border text-text-secondary">
            <strong className="block text-primary dark:text-accent mb-1">3. Multi-Channel Export</strong>
            ZIP packages, JSON manifests, PDF documents, and clipboard.
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <button
          type="button"
          onClick={onStartTransforming}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-white shadow-sm transition-colors active:scale-[0.98]"
        >
          <span>Start Transformation Workflow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
