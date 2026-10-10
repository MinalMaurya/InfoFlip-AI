import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function EmailPreview({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  // Extract Subject and Preview if formatted
  const subjectMatch = text.match(/Subject:\s*(.+)/i);
  const previewMatch = text.match(/Preview:\s*(.+)/i);
  const subject = structuredData?.subject || (subjectMatch ? subjectMatch[1].trim() : 'Important Communication Update');
  const previewText = structuredData?.previewText || (previewMatch ? previewMatch[1].trim() : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit Email Content
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={14}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter email content with Subject: and Preview: lines..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden transition-colors">
      {/* Email Meta Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-sidebar-bg dark:bg-surface-elevated space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subject:</span>
            <span className="text-sm font-bold text-text-primary">
              {subject}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border hover:bg-surface-hover text-text-primary transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </div>

        {previewText && (
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Snippet:</span>
            <span className="italic truncate">{previewText}</span>
          </div>
        )}

        <div className="pt-2 border-t border-divider flex items-center justify-between text-xs text-text-secondary">
          <div>
            <span className="font-semibold text-text-primary">From: </span>
            <span>InfoFlip Dispatch Desk &lt;notifications@infoflip.internal&gt;</span>
          </div>
          <span className="text-[11px]">Today, 10:00 AM</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans max-w-3xl">
          {text}
        </div>
      </div>
    </div>
  );
}
