import React, { useState } from 'react';
import { Megaphone, Copy, Check, ShieldAlert, Award, FileText } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit Public Announcement Text
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={14}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
          placeholder="Enter formal public announcement..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-100 dark:border-purple-950 shadow-md overflow-hidden">
      {/* Official Announcement Banner Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-purple-200">
                Official Communication
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                Public Notice
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Public Directive & Advisory Bulletin
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 transition-colors shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-purple-700" />}
          <span>{copied ? 'Copied!' : 'Copy Announcement'}</span>
        </button>
      </div>

      {/* Official Seal Strip */}
      <div className="px-6 py-2.5 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between text-xs text-purple-900 dark:text-purple-300">
        <span className="font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-purple-600" />
          Authorized for General Circulation & Multi-Channel Broadcast
        </span>
        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
          Ref: PB-{Date.now().toString().slice(-6)}
        </span>
      </div>

      {/* Main Notice Content */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans max-w-3xl">
          {text}
        </div>
      </div>
    </div>
  );
}
