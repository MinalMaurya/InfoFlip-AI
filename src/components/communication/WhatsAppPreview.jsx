import React, { useState } from 'react';
import { Smartphone, Copy, Check, CheckCheck, MoreVertical, Phone, Video } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit WhatsApp Broadcast Message
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={12}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          placeholder="Enter WhatsApp broadcast content..."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs bg-slate-100 dark:bg-slate-900">
      {/* WhatsApp Header bar */}
      <div className="bg-[#075E54] dark:bg-[#003831] text-white p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            📢
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">InfoFlip Official Broadcast</h4>
            <p className="text-[11px] text-emerald-200">Tap here for group / channel info</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Chat Area Background */}
      <div className="p-4 sm:p-6 bg-[#EFEAE2] dark:bg-[#0B141A] min-h-[260px] flex flex-col justify-center">
        {/* Date pill */}
        <div className="text-center mb-4">
          <span className="px-3 py-1 rounded-md text-[10px] font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-2xs uppercase">
            TODAY
          </span>
        </div>

        {/* Green Outgoing Bubble */}
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-[#D9FDD3] dark:bg-[#005C4B] text-slate-900 dark:text-slate-100 p-4 sm:p-5 rounded-2xl rounded-tr-none shadow-xs border border-emerald-200/50 dark:border-emerald-800/50 space-y-2">
            <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
              {text}
            </div>

            <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-slate-500 dark:text-emerald-200">
              <span>Just now</span>
              <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
