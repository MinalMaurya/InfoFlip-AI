import React, { useState } from 'react';
import { Megaphone, Copy, Check, Award } from 'lucide-react';

export default function AnnouncementPreview({
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
      console.error('Failed to copy Announcement:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit Public Announcement Text
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={14}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter formal public announcement..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden transition-colors">
      {/* Official Announcement Banner Header */}
      <div className="bg-sidebar-bg dark:bg-surface-elevated border-b border-border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary dark:text-accent">
                Official Communication
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
                Public Notice
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary mt-0.5">
              Public Directive & Advisory Bulletin
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-text-primary border border-border transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-primary dark:text-accent" />}
          <span>{copied ? 'Copied!' : 'Copy Announcement'}</span>
        </button>
      </div>

      {/* Official Seal Strip */}
      <div className="px-6 py-2.5 bg-surface-selected/60 border-b border-border flex items-center justify-between text-xs text-text-primary">
        <span className="font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-primary dark:text-accent" />
          Authorized for General Circulation & Multi-Channel Broadcast
        </span>
        <span className="text-[11px] text-text-secondary font-mono">
          Ref: PB-{Date.now().toString().slice(-6)}
        </span>
      </div>

      {/* Main Notice Content */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans max-w-3xl">
          {text}
        </div>
      </div>
    </div>
  );
}
