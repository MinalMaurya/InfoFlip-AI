import React, { useState } from 'react';
import { MousePointerClick, Copy, Check, ArrowRight } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit CTA Content
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter CTA variants..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Grounded Call-to-Action (CTA) Variants
            </h4>
            <p className="text-xs text-text-secondary">
              Action-oriented prompts grounded strictly in verified source directives.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sidebar-bg hover:bg-surface-hover text-text-primary border border-border transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
          <span>{copiedAll ? 'All Copied!' : 'Copy All CTAs'}</span>
        </button>
      </div>

      {/* Grid of Variants */}
      {variants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-border bg-sidebar-bg dark:bg-surface-elevated hover:border-primary/60 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-accent">
                    {v.type || `CTA ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVariant(v.text, idx)}
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    title="Copy this CTA"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-text-primary leading-relaxed font-semibold">
                  {v.text}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-primary dark:text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Deploy CTA</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans">
          {text}
        </div>
      )}
    </div>
  );
}
