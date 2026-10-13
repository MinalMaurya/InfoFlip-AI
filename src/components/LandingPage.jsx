import React from 'react';
import {
  ArrowRight,
  FileText,
  BrainCircuit,
  Layers,
  Share2,
  ShieldCheck,
  Download,
  CheckCircle2,
  Link2,
  Sparkles,
  ExternalLink,
  Code2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

export const GITHUB_REPOSITORY_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_REPO_URL) ||
  'https://github.com/MinalMaurya/InfoFlip-AI';

export const SIX_STAGE_WORKFLOW = [
  {
    step: 1,
    id: 'input',
    title: 'Input',
    summary: 'Upload or paste source content.',
    description:
      'Ingest raw text or attach .txt, .pdf, .docx, and image files (.png, .jpg) up to 5 MB with client-side validation, word-count normalization, and ready-to-test SIH demo scenarios.',
    statusLabel: 'Implemented',
    icon: FileText
  },
  {
    step: 2,
    id: 'understand',
    title: 'Understand',
    summary: 'Extract context, facts, and intent.',
    description:
      'Analyze the source document to extract main topic, core message, target audience, recommended tone, urgency level, grounded source facts (fact-1, fact-2, …), and high-risk numeric or deadline claims.',
    statusLabel: 'Implemented',
    icon: BrainCircuit
  },
  {
    step: 3,
    id: 'transform',
    title: 'Transform',
    summary: 'Generate selected content formats.',
    description:
      'Produce structured analytical and visual deliverables directly from the grounded source contract, including Executive Summaries, Stakeholder Advisories, Infographic Blueprints, Slide Decks, and Video Scripts.',
    statusLabel: 'Implemented',
    icon: Layers
  },
  {
    step: 4,
    id: 'communicate',
    title: 'Communicate',
    summary: 'Prepare channel-specific content.',
    description:
      'Adapt key messages into audience-targeted outreach for LinkedIn, X/Twitter threads, WhatsApp broadcasts, Email newsletters, SMS alerts, Official Announcements, Call-to-Action blocks, and Hashtag kits.',
    statusLabel: 'Implemented',
    icon: Share2
  },
  {
    step: 5,
    id: 'review',
    title: 'Review',
    summary: 'Run quality checks and perform human review.',
    description:
      'Evaluate each generated output across 10 quality dimensions (factual alignment with the source, completeness, tone, clarity, length, and safety) with inline editing, single-output regeneration, and explicit human approval.',
    statusLabel: 'Implemented',
    icon: ShieldCheck
  },
  {
    step: 6,
    id: 'export',
    title: 'Export',
    summary: 'Export eligible approved content.',
    description:
      'Package and download human-approved deliverables in .txt, .json, .pdf, or .zip format, or copy to clipboard with full lineage metadata. Automated social scheduling and external publishing APIs are planned for future releases.',
    statusLabel: 'Implemented',
    icon: Download
  }
];

export const KEY_CAPABILITIES = [
  {
    id: 'multi-format-generation',
    title: 'Multi-Format Generation',
    description:
      'Select any combination of 13 supported structured and outreach formats in the Output Config panel and generate tailored deliverables from a single source submission.',
    icon: Layers
  },
  {
    id: 'source-traceability',
    title: 'Source Traceability',
    description:
      'Every generated output preserves a direct provenance link to the source document, displaying word count, grounded source facts, and highlighted high-risk claims.',
    icon: Link2
  },
  {
    id: 'quality-checks',
    title: 'Quality Checks',
    description:
      'Automated 10-dimension QA auditing inspects source-claim grounding, formatting compliance, length constraints, and safety before an item is eligible for batch approval.',
    icon: CheckCircle2
  },
  {
    id: 'human-review',
    title: 'Human Review',
    description:
      'Reviewers can edit outputs inline, regenerate individual formats without overwriting other deliverables, and explicitly approve or reject each item.',
    icon: ShieldCheck
  },
  {
    id: 'approved-content-export',
    title: 'Approved-Content Export',
    description:
      'Export controls enforce review governance by packaging only human-approved deliverables into downloadable TXT, JSON, PDF, and ZIP archives.',
    icon: Download
  }
];

export default function LandingPage({
  onGetStarted,
  savedConversationsCount = 0,
  savedItemsCount = 0
}) {
  const handleScrollToHowItWorks = (e) => {
    if (e) e.preventDefault();
    if (typeof document !== 'undefined') {
      const target = document.getElementById('how-it-works');
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-app-bg text-text-primary font-sans flex flex-col selection:bg-primary selection:text-primary-foreground transition-colors">
      {/* =====================================================================
          TOP NAVIGATION HEADER
         ===================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-xs border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Brand Logo & Product Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-sidebar-bg flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/infoflip-logo.png"
                alt="InfoFlip-AI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-text-primary">
                  InfoFlip<span className="text-primary dark:text-accent">-AI</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
                  SIH 26154 • V0.1.0
                </span>
              </div>
              <p className="text-[11px] text-text-secondary truncate hidden sm:block">
                Grounded Multi-Format Content Transformation Studio
              </p>
            </div>
          </div>

          {/* Navigation Links + Theme Toggle + Primary CTA */}
          <nav aria-label="Landing page navigation" className="flex items-center gap-2 sm:gap-3">
            <a
              href="#how-it-works"
              onClick={handleScrollToHowItWorks}
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Capabilities
            </a>
            <a
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Code2 className="w-3.5 h-3.5 text-primary dark:text-accent" />
              <span>View Source Code</span>
            </a>

            <ThemeToggle />

            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground shadow-2xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* =====================================================================
          MAIN LANDING PAGE CONTENT
         ===================================================================== */}
      <main className="flex-1">
        {/* -------------------------------------------------------------------
            1. HERO SECTION & SOURCE-TO-MULTIPLE-OUTPUTS WORKFLOW VISUAL
           ------------------------------------------------------------------- */}
        <section
          aria-labelledby="landing-hero-heading"
          className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Platform Explanation, and Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-selected border border-border text-xs font-semibold text-text-primary">
                <Sparkles className="w-3.5 h-3.5 text-primary dark:text-accent" />
                <span>Smart India Hackathon 2026 • Problem Statement SIH26154</span>
              </div>

              <h1
                id="landing-hero-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]"
              >
                Turn information into something more.
              </h1>

              <div className="text-base sm:text-lg font-bold text-primary dark:text-accent">
                One source. Multiple formats. Smarter communication.
              </div>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
                Transform source documents into clear, audience-ready content across multiple formats, with source traceability, quality checks, human review, and controlled export.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground shadow-xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleScrollToHowItWorks}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-sidebar-bg hover:bg-surface-hover active:scale-[0.98] text-text-primary border border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span>How It Works</span>
                </button>
              </div>

              {/* Saved Workspace Continuity Notice (when local conversations or items exist) */}
              {(savedConversationsCount > 0 || savedItemsCount > 0) && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sidebar-bg border border-border text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>
                    Your local workspace has{' '}
                    <strong className="text-text-primary">{savedConversationsCount}</strong> saved conversation
                    {savedConversationsCount === 1 ? '' : 's'} and{' '}
                    <strong className="text-text-primary">{savedItemsCount}</strong> generated item
                    {savedItemsCount === 1 ? '' : 's'} ready to resume.
                  </span>
                </div>
              )}

              {/* Quick Governance Summary Pills */}
              <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg border-t border-border">
                <div>
                  <div className="text-xs font-extrabold text-text-primary">13 Formats</div>
                  <div className="text-[11px] text-text-secondary">Structured & outreach</div>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-text-primary">10 QA Checks</div>
                  <div className="text-[11px] text-text-secondary">Source-claim grounded</div>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-text-primary">Human-Gated</div>
                  <div className="text-[11px] text-text-secondary">Approve before export</div>
                </div>
              </div>
            </div>

            {/* Right Column: Central Visual Idea — Source-to-Multiple-Outputs Workflow Diagram */}
            <div className="lg:col-span-6">
              <div
                aria-label="Source-to-Multiple-Outputs Workflow Diagram"
                className="rounded-2xl bg-sidebar-bg border border-border p-4 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      Source-to-Multiple-Outputs Architecture
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface text-text-secondary border border-border">
                    End-to-End Traceable
                  </span>
                </div>

                {/* Stage A: Single Source Document */}
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary">
                      <FileText className="w-4 h-4 text-primary dark:text-accent" />
                      <span>1. Single Source Document</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-selected text-text-primary border border-border">
                      TXT • PDF • DOCX • Image
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Extracts normalized text, key intent, grounded source facts (<code className="font-mono text-text-primary">fact-1</code>, <code className="font-mono text-text-primary">fact-2</code>), and flags numeric or deadline claims.
                  </p>
                </div>

                {/* Visual Connector */}
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-primary dark:text-accent">
                  <span className="h-px flex-1 bg-border" />
                  <span>Understand → Transform → Communicate</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                {/* Stage B: Multi-Format Grounded Outputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">Executive Summary</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-subtle text-success font-semibold">
                        QA Passed
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Structured leadership brief with grounded key takeaways.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">LinkedIn &amp; X Posts</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-subtle text-success font-semibold">
                        QA Passed
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Audience-adapted social copy with character &amp; tone checks.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">WhatsApp &amp; SMS Alert</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-subtle text-success font-semibold">
                        QA Passed
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Concise rapid-response messaging preserving source dates.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">Slide Deck &amp; Script</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-selected text-text-primary font-semibold border border-border">
                        13 Formats Total
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Presentation outlines, infographic blueprints, and video scripts.
                    </p>
                  </div>
                </div>

                {/* Stage C: Human Review & Approved Export Gate */}
                <div className="p-3.5 rounded-xl bg-surface-selected border border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary dark:text-accent shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-text-primary">
                        Human Review &amp; Approved Export Gate
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Approve Passed or inspect individual items → Export TXT, JSON, PDF, or ZIP
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-surface text-text-primary border border-border">
                    Provenance Preserved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            2. HOW IT WORKS — THE SIX-STAGE WORKFLOW
           ------------------------------------------------------------------- */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-app-bg scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent">
                Six-Stage Transformation Pipeline
              </div>
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
              >
                How It Works
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                InfoFlip-AI executes a structured six-stage pipeline that keeps every generated output tethered to your original source document from ingestion through final export.
              </p>
            </div>

            {/* 6-Stage Grid */}
            <ol
              aria-label="Six-stage workflow"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {SIX_STAGE_WORKFLOW.map((stage) => {
                const Icon = stage.icon;
                return (
                  <li
                    key={stage.id}
                    className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-4 shadow-2xs cursor-default"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold inline-flex items-center justify-center shrink-0">
                            {stage.step}
                          </span>
                          <h3 className="text-base font-extrabold text-text-primary">
                            {stage.title}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-selected text-text-primary border border-border">
                          <Icon className="w-3 h-3 text-primary dark:text-accent" />
                          <span>{stage.statusLabel}</span>
                        </span>
                      </div>

                      <p className="text-xs font-bold text-primary dark:text-accent">
                        {stage.summary}
                      </p>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Honest Prototype Scope & Transparency Disclosure */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span>Transparent Prototype Scope &amp; Verification Notice</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  All six pipeline stages, 10-dimension QA checks, browser-persisted workspace history, and multi-format exports (TXT, JSON, PDF, ZIP) run locally in this prototype without requiring user login. Automated QA checks verify alignment against the provided source document—not independent external fact verification. External social media publishing and scheduled post queues are labeled as <strong className="text-text-primary">Coming soon</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground shadow-2xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            3. KEY CAPABILITIES SECTION
           ------------------------------------------------------------------- */}
        <section
          id="capabilities"
          aria-labelledby="capabilities-heading"
          className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent">
                Core Platform Architecture
              </div>
              <h2
                id="capabilities-heading"
                className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
              >
                Key Capabilities
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Built for institutional, public-sector, and enterprise communication workflows where accuracy, consistency, and editorial oversight are mandatory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {KEY_CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.id}
                    className="p-5 rounded-2xl bg-sidebar-bg border border-border space-y-3 cursor-default"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-primary dark:text-accent">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-text-primary">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                );
              })}

              {/* 6th Card: Direct CTA into the Existing Workspace */}
              <div
                role="region"
                aria-label="Get started in workspace"
                className="p-5 rounded-2xl bg-surface-selected border border-border flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-accent">
                    <Clock className="w-3.5 h-3.5" />
                    <span>No Login Required</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-text-primary">
                    Ready to Evaluate in Your Browser
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Launch the workspace directly with pre-loaded SIH demo scenarios or upload your own source document. Saved conversations and library collections remain intact.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground shadow-2xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <span>Get Started in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER WITH PROJECT INFORMATION & GITHUB REPOSITORY LINK
         ===================================================================== */}
      <footer
        aria-label="Project information and links"
        className="bg-sidebar-bg border-t border-border py-8 px-4 sm:px-6 lg:px-8 text-xs text-text-secondary"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <img
                src="/infoflip-logo.png"
                alt="InfoFlip-AI Logo"
                className="w-6 h-6 rounded-md border border-border object-cover"
              />
              <span className="font-extrabold text-text-primary text-sm">
                InfoFlip-AI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-text-primary border border-border">
                SIH26154 • Prototype V0.1.0
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Smart India Hackathon 2026 Prototype • Multi-Format Content Transformation &amp; Grounded Communication Studio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover active:scale-[0.98] text-text-primary border border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <span>Open Workspace</span>
            </button>

            <a
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Source Code on GitHub"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-surface hover:bg-surface-hover active:scale-[0.98] text-text-primary border border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Code2 className="w-3.5 h-3.5 text-primary dark:text-accent" />
              <span>View Source Code</span>
              <ExternalLink className="w-3 h-3 text-text-secondary" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
