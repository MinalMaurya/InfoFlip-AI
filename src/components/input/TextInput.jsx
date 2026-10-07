import React, { useMemo, useRef, useState } from 'react';
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

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'around', 'been', 'before', 'being', 'below', 'between', 'both',
  'could', 'from', 'into', 'just', 'more', 'most', 'must', 'over', 'same', 'should', 'that', 'their', 'them',
  'there', 'these', 'they', 'this', 'those', 'through', 'under', 'very', 'with', 'your', 'have', 'will',
  'been', 'where', 'when', 'what', 'which', 'while', 'would', 'upon', 'than', 'then', 'only', 'once', 'also',
  'across', 'among', 'within', 'without', 'during', 'because', 'public', 'state', 'official', 'information',
  'people', 'alert', 'notice', 'advisory', 'update', 'issued', 'following', 'according', 'report', 'reports',
  'due', 'said', 'team', 'teams', 'today', 'tomorrow', 'safety', 'citizens', 'residents', 'department', 'authorities'
]);

function deriveSmartInsights(text) {
  if (!text || !text.trim()) return null;

  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentenceMatches = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  const words = normalized.toLowerCase().match(/[a-zA-ZÀ-ž0-9]+/g) || [];
  const filteredWords = words.filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  const keywordCounts = {};
  filteredWords.forEach((word) => {
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });

  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  const actionItems = sentenceMatches
    .filter((sentence) => /must|should|required|avoid|ensure|report|call|dial|monitor|verify|immediately|follow|remain|activate/i.test(sentence))
    .slice(0, 3)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim());

  const summary = sentenceMatches.slice(0, 2).join(' ').trim();
  const headline = sentenceMatches[0]
    ? sentenceMatches[0].replace(/\s+/g, ' ').slice(0, 110)
    : 'Source content ready for transformation';
  const urgency = /urgent|emergency|critical|alert|warning|warning|immediate|risk|attack|cyclone|flood|phishing/i.test(normalized)
    ? 'High priority'
    : 'Routine update';

  const focus = /rain|flood|storm|cyclone|weather|disaster|warning/i.test(normalized)
    ? 'Weather safety response'
    : /health|fever|dengue|medical|clinic|hospital|virus|care/i.test(normalized)
    ? 'Public health alert'
    : /security|cyber|phishing|mfa|password|attack|breach/i.test(normalized)
    ? 'Security compliance brief'
    : 'Policy communication brief';

  return {
    headline,
    summary: summary || normalized.slice(0, 220),
    keywords,
    actions: actionItems.length ? actionItems : ['Review the source, identify the main request, and prepare audience-specific messaging.'],
    focus,
    urgency
  };
}

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
  const textareaRef = useRef(null);

  const metrics = calculateTextMetrics(value);
  const smartInsights = useMemo(() => deriveSmartInsights(value), [value]);
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
      `Keywords: ${smartInsights.keywords.join(', ')}`,
      `Actions: ${smartInsights.actions.join(' • ')}`
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCleanupPreview((visible) => !visible)}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors flex items-start gap-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 outline-none focus-visible:bg-indigo-50 dark:focus-visible:bg-indigo-950/60"
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
          className={`w-full bg-slate-50/40 dark:bg-slate-800/30 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border transition-all resize-y leading-relaxed outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 ${
            error 
              ? 'border-rose-400 dark:border-rose-600 ring-1 ring-rose-400/20' 
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-500'
          }`}
        />

        {showCleanupPreview && (
          <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5">
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
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply cleanup
                </button>
              </div>
            </div>
            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
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
          <div className="mt-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Quick Insights</span>
              </div>

              <button
                type="button"
                onClick={handleCopyInsights}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied!' : 'Copy summary'}</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Headline</div>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{smartInsights.headline}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Focus</div>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{smartInsights.focus}</p>
                <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-300 font-semibold">{smartInsights.urgency}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Summary</div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{smartInsights.summary}</p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Key Topics</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {smartInsights.keywords.map((keyword) => (
                    <span key={keyword} className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Suggested Actions</div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {smartInsights.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
