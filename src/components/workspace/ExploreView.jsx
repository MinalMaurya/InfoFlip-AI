import React from 'react';
import { Compass, Clock, ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';

/**
 * ExploreView — Minimal "Coming soon" Placeholder for Explore Navigation Entry (Section 3B & 9)
 * Also provides quick access to the existing verified DEMO_SCENARIOS if the user wants
 * to load an existing sample source into the chat composer.
 */
export default function ExploreView({ onBackToChat, onUseDemoScenario }) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-app-bg px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Coming Soon Banner Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-surface-selected border border-primary/20 flex items-center justify-center text-primary dark:text-accent">
              <Compass className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-selected text-primary dark:text-accent border border-primary/20">
              <Clock className="w-3.5 h-3.5" />
              Coming soon
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              Explore Templates & Workflows — Coming Soon
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              The Explore directory is a placeholder for a future release of InfoFlip-AI. In the meantime, you can start a conversation directly or try one of the existing built-in source scenarios below.
            </p>
          </div>

          {onBackToChat && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onBackToChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Chat Workspace
              </button>
            </div>
          )}
        </div>

        {/* Existing Demo Scenarios (Reused from src/data/demoScenarios.js) */}
        {Array.isArray(DEMO_SCENARIOS) && DEMO_SCENARIOS.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Built-In Source Scenarios (V0.1.0)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-surface rounded-xl border border-border p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                      <span className="text-xs font-bold text-text-primary">
                        {scenario.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-3 leading-relaxed">
                      {scenario.source}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[10px] font-medium text-text-secondary">
                      {scenario.audience} · {scenario.tone}
                    </span>
                    {onUseDemoScenario && (
                      <button
                        type="button"
                        onClick={() => onUseDemoScenario(scenario)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-accent hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
                      >
                        <Sparkles className="w-3 h-3" />
                        Load in Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
