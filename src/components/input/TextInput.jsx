import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Clipboard, 
  Sparkles, 
  ChevronDown, 
  CloudRain, 
  HeartPulse, 
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';
import { calculateTextMetrics } from '../../utils/textNormalization';

export default function TextInput({
  value,
  onChange,
  onClear,
  error = null,
  onLoadScenario = null
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const textareaRef = useRef(null);

  const metrics = calculateTextMetrics(value);

  // Paste from clipboard helper
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleSelectScenario = (scenario) => {
    if (onLoadScenario) {
      onLoadScenario(scenario);
    } else {
      onChange(scenario.source);
    }
    setShowDemoMenu(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200">
      
      {/* Action Bar Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Source Text Editor
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            (Markdown & plain text supported)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Paste Button */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
          </button>

          {/* Load Sample Content Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sample Content</span>
              <ChevronDown className="w-3 h-3 text-indigo-500" />
            </button>

            {showDemoMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowDemoMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    Select a Preloaded Advisory
                  </div>
                  {DEMO_SCENARIOS.map((scenario) => {
                    let Icon = CloudRain;
                    if (scenario.id === 'health') Icon = HeartPulse;
                    if (scenario.id === 'security') Icon = ShieldAlert;

                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => handleSelectScenario(scenario)}
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors flex items-start gap-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0"
                      >
                        <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {scenario.title}
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

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Editable Area */}
      <div className="p-4 sm:p-5">
        <label htmlFor="source-textarea" className="sr-only">
          Source text input
        </label>
        <textarea
          id="source-textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={9}
          placeholder="Paste your article, report, advisory, announcement or other source content here…"
          className={`w-full bg-slate-50/40 dark:bg-slate-800/30 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border transition-all resize-y leading-relaxed outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 ${
            error 
              ? 'border-rose-400 dark:border-rose-600 ring-1 ring-rose-400/20' 
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-500'
          }`}
        />

        {error && (
          <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 animate-fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {/* Counter & Reading time footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span>
              Words: <strong className="text-slate-800 dark:text-slate-200">{metrics.wordCount.toLocaleString()}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              Characters: <strong className="text-slate-800 dark:text-slate-200">{metrics.characterCount.toLocaleString()}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Est. Reading: <strong className="text-slate-800 dark:text-slate-200">{metrics.readingTimeMinutes} min</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {value.trim().length > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Text input ready</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
