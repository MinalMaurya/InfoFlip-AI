import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Trash2, 
  CloudRain, 
  HeartPulse, 
  ShieldAlert, 
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

export default function SourceInput({ 
  source, 
  setSource, 
  onLoadScenario,
  error 
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const wordCount = source.trim() ? source.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = source.length;

  const handleSelectDemo = (scenario) => {
    onLoadScenario(scenario);
    setShowDemoMenu(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Source Information
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Unstructured input)
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide any news report, advisory, policy document, or raw communication notes
            </p>
          </div>
        </div>

        {/* Demo Content Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-selected hover:bg-surface-hover dark:hover:bg-surface-hover text-primary dark:text-accent border border-primary/40 transition-colors shadow-2xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span>Load Demo Content</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-primary0" />
          </button>

          {/* Demo Scenarios Dropdown */}
          {showDemoMenu && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowDemoMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-30 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    Select a Preloaded SIH Demo
                  </span>
                </div>
                {DEMO_SCENARIOS.map((scenario) => {
                  let Icon = CloudRain;
                  if (scenario.id === 'health') Icon = HeartPulse;
                  if (scenario.id === 'security') Icon = ShieldAlert;

                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleSelectDemo(scenario)}
                      className="w-full text-left px-3 py-2.5 hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors flex items-start gap-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0"
                    >
                      <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-surface-hover">
                        <Icon className="w-4 h-4 text-primary dark:text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {scenario.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          Target: {scenario.audience} • {scenario.language}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="p-5">
        <div className="relative">
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={7}
            placeholder="Paste a news article, advisory, report, incident description, policy document or any source information here..."
            className={`w-full rounded-xl border p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y leading-relaxed font-normal ${
              error 
                ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 dark:bg-rose-950/20' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-slate-900'
            }`}
          />
        </div>

        {error && (
          <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            ⚠️ {error}
          </p>
        )}

        {/* Footer info: Counts & Actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-medium">
              Words: <strong className="text-slate-800 dark:text-slate-200">{wordCount}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-medium">
              Characters: <strong className="text-slate-800 dark:text-slate-200">{charCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {source && (
              <button
                type="button"
                onClick={() => setSource('')}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
