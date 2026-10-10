import React, { useState } from 'react';
import { Copy, Check, CheckCheck, Smartphone } from 'lucide-react';

export default function WhatsAppPreview({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy WhatsApp message:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit WhatsApp Broadcast Message
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={12}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter WhatsApp broadcast content..."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-2xs bg-surface transition-colors">
      {/* Broadcast Header bar */}
      <div className="bg-sidebar-bg dark:bg-surface-elevated text-text-primary p-3.5 sm:p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-selected border border-border flex items-center justify-center text-primary dark:text-accent font-bold text-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-text-primary">InfoFlip Official Broadcast</h4>
            <p className="text-[11px] text-text-secondary">WhatsApp Broadcast Channel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-primary dark:text-accent" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Chat Area Background */}
      <div className="p-4 sm:p-6 bg-app-bg min-h-[240px] flex flex-col justify-center">
        {/* Date pill */}
        <div className="text-center mb-4">
          <span className="px-3 py-1 rounded-md text-[10px] font-semibold bg-surface border border-border text-text-secondary shadow-2xs uppercase">
            TODAY
          </span>
        </div>

        {/* Outgoing Message Card */}
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-surface-selected text-text-primary p-4 sm:p-5 rounded-2xl rounded-tr-none shadow-2xs border border-border space-y-2">
            <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
              {text}
            </div>

            <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-text-secondary">
              <span>Just now</span>
              <CheckCheck className="w-3.5 h-3.5 text-primary dark:text-accent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
