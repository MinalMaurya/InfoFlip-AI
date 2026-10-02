import React, { useState } from 'react';
import { MousePointerClick, Copy, Check, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CTASection({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  // Extract structured variants if present
  let variants = structuredData?.variants || [];
  if (variants.length === 0 && text.includes('Variant')) {
    // Parse variants from text if present
    const rawChunks = text.split(/(?=Variant\s+\d+:)/i).map(c => c.trim()).filter(Boolean);
    if (rawChunks.length > 0) {
      variants = rawChunks.map((chunk, idx) => ({
        type: `Variant ${idx + 1}`,
        text: chunk.replace(/^Variant\s+\d+:\s*/i, '').trim()
      }));
    }
  }

  const handleCopyVariant = async (variantText, idx) => {
    try {
      await navigator.clipboard.writeText(variantText);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy CTA variant:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all CTAs:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit CTA Content
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed font-mono"
          placeholder="Enter CTA variants..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Grounded Call-to-Action (CTA) Variants
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Action-oriented prompts grounded strictly in verified source directives.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedAll ? 'All Copied!' : 'Copy All CTAs'}</span>
        </button>
      </div>

      {/* Grid of Variants */}
      {variants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-300 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {v.type || `CTA ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVariant(v.text, idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                    title="Copy this CTA"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {v.text}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Deploy CTA</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
          {text}
        </div>
      )}
    </div>
  );
}
