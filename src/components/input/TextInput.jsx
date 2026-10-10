import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { deriveQuickInsights } from '../../utils/quickInsights';

export default function TextInput({
  value,
  onChange,
  onClear,
  error = null,
  onLoadScenario = null
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCleanupPreview, setShowCleanupPreview] = useState(false);
  const [insightsState, setInsightsState] = useState(null);
  const textareaRef = useRef(null);

  const metrics = calculateTextMetrics(value);
  useEffect(() => {
    if (!value.trim()) {
      setInsightsState(null);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setInsightsState({ source: value, insights: deriveQuickInsights(value) });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [value]);
  const smartInsights = insightsState?.source === value ? insightsState.insights : null;

  const cleanedText = useMemo(
    () => value
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
    [value]
  );

  const handleCopyInsights = async () => {
    if (!smartInsights) return;

    const payload = [
      `Headline: ${smartInsights.headline}`,
      `Focus: ${smartInsights.focus}`,
      `Urgency: ${smartInsights.urgency}`,
      '',
      `Summary: ${smartInsights.summary}`,
      '',
      `Keywords: ${smartInsights.keywords.length ? smartInsights.keywords.join(', ') : 'No keyword cues detected'}`,
      `Actions: ${smartInsights.actions.length ? smartInsights.actions.join(' • ') : 'No clear action phrases detected'}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(payload);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1800);
    } catch (err) {
      console.warn('Quick insight copy failed:', err);
    }
  };

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
          <FileText className="w-4 h-4 text-primary dark:text-accent" />
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCleanupPreview((visible) => !visible)}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-accent hover:bg-surface-hover dark:hover:bg-surface-hover border border-slate-200 dark:border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview whitespace cleanup"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showCleanupPreview ? 'Hide cleanup' : 'Tidy text'}</span>
          </button>

          {/* Load Sample Content Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-selected hover:bg-surface-hover dark:hover:bg-surface-hover text-primary dark:text-accent border border-primary/40 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary dark:text-accent" />
              <span>Sample Content</span>
              <ChevronDown className="w-3 h-3 text-text-primary0" />
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
                        className="w-full text-left px-3 py-2.5 hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors flex items-start gap-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 outline-none focus-visible:bg-surface-selected dark:focus-visible:bg-surface-selected"
                      >
                        <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-primary dark:text-accent">
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
          className={`w-full bg-slate-50/40 dark:bg-slate-800/30 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border transition-all resize-y leading-relaxed outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary ${
            error 
              ? 'border-rose-400 dark:border-rose-600 ring-1 ring-rose-400/20' 
              : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
          }`}
        />

        {showCleanupPreview && (
          <div className="mt-3 rounded-xl border border-primary/40 bg-surface-selected/60 p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Text cleanup preview</p>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Trims trailing spaces, normalizes line endings, and reduces excess blank lines. Your source stays unchanged until applied.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCleanupPreview(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={cleanedText === value}
                  onClick={() => {
                    onChange(cleanedText);
                    setShowCleanupPreview(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply cleanup
                </button>
              </div>
            </div>
            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-primary/30 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {cleanedText || 'Nothing to preview.'}
            </pre>
            {cleanedText === value && (
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">This text is already tidy.</p>
            )}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>{error}</span>
          </div>
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

        {smartInsights && (
          <div className="mt-4 rounded-2xl border border-border bg-sidebar-bg p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Sparkles className="w-4 h-4 text-primary dark:text-accent" />
                <span>Quick Insights</span>
              </div>

              <button
                type="button"
                onClick={handleCopyInsights}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface hover:bg-surface-hover text-primary dark:text-accent border border-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied!' : 'Copy summary'}</span>
              </button>
            </div>

            <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
              Rule-based estimates. Verify these cues before using them.
              {!smartInsights.englishHeuristicsSupported && ' Keyword and action extraction is currently English-focused.'}
              {smartInsights.isTruncated && ' Insights use only the first 20,000 characters.'}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Headline</div>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{smartInsights.headline}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Focus</div>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{smartInsights.focus}</p>
                <p className="mt-1 text-[11px] text-primary dark:text-accent font-semibold">{smartInsights.urgency}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Summary</div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{smartInsights.summary}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Key Topics</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {smartInsights.keywords.map((keyword) => (
                    <span key={keyword} className="px-2 py-1 rounded-full bg-surface-selected text-[11px] font-semibold text-primary dark:text-accent border border-primary/30">
                      {keyword}
                    </span>
                  ))}
                  {smartInsights.keywords.length === 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">No supported keyword cues detected.</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Suggested Actions</div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {smartInsights.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
                {smartInsights.actions.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No clear action phrases detected.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
