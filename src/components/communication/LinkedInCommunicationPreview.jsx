import React, { useState } from 'react';
import { Share2, Copy, Check, ThumbsUp, MessageSquare, Repeat2, Send } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit LinkedIn Post Content
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={12}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          placeholder="Enter LinkedIn post text..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* LinkedIn Post Header Simulation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                InfoFlip Communication Desk
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                1st
              </span>
              {structuredData?.isEmergency && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900">
                  ⚠️ Public Safety
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Target Audience: {audience} • Tone: {tone} • 1h • 🌐
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
          title="Copy post to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied!' : 'Copy Post'}</span>
        </button>
      </div>

      {/* Post Text Body */}
      <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
        {text}
      </div>

      {/* Simulated Engagement Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors cursor-pointer">
            <ThumbsUp className="w-4 h-4" /> Like
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors cursor-pointer">
            <MessageSquare className="w-4 h-4" /> Comment
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors cursor-pointer">
            <Repeat2 className="w-4 h-4" /> Repost
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors cursor-pointer">
            <Send className="w-4 h-4" /> Send
          </span>
        </div>
      </div>
    </div>
  );
}
