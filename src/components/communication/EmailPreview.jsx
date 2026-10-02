import React, { useState } from 'react';
import { Mail, Copy, Check, Send, Paperclip, ExternalLink } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit Email Content
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={14}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
          placeholder="Enter email content with Subject: and Preview: lines..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Email Meta Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {subject}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </div>

        {previewText && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Snippet:</span>
            <span className="italic truncate">{previewText}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">From: </span>
            <span>InfoFlip Dispatch Desk &lt;notifications@infoflip.internal&gt;</span>
          </div>
          <span className="text-[11px]">Today, 10:00 AM</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans max-w-3xl">
          {text}
        </div>
      </div>
    </div>
  );
}
