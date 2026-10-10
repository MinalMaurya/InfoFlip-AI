import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, MessageSquare, Repeat2, Send } from 'lucide-react';

export default function LinkedInCommunicationPreview({
  content,
  structuredData,
  isEditing,
  onUpdateContent,
  audience = 'Professionals',
  tone = 'Professional'
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy LinkedIn post:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit LinkedIn Post Content
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={12}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter LinkedIn post text..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-4 transition-colors">
      {/* LinkedIn Post Header Simulation */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-2xs">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">
                InfoFlip Communication Desk
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-selected text-text-primary font-bold border border-border">
                1st
              </span>
              {structuredData?.isEmergency && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-subtle text-warning font-bold border border-warning/30">
                  ⚠️ Public Safety
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-secondary">
              Target Audience: {audience} • Tone: {tone} • 1h • 🌐
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sidebar-bg hover:bg-surface-hover text-text-primary border border-border transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          title="Copy post to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
          <span>{copied ? 'Copied!' : 'Copy Post'}</span>
        </button>
      </div>

      {/* Post Text Body */}
      <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans">
        {text}
      </div>

      {/* Simulated Engagement Bar */}
      <div className="pt-3 border-t border-divider flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
            <ThumbsUp className="w-4 h-4" /> Like
          </span>
          <span className="flex items-center gap-1.5 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
            <MessageSquare className="w-4 h-4" /> Comment
          </span>
          <span className="flex items-center gap-1.5 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
            <Repeat2 className="w-4 h-4" /> Repost
          </span>
          <span className="flex items-center gap-1.5 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
            <Send className="w-4 h-4" /> Send
          </span>
        </div>
      </div>
    </div>
  );
}
