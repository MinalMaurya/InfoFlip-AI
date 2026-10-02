import React, { useState } from 'react';
import { Send, Copy, Check, AlertTriangle, Smartphone } from 'lucide-react';

export default function SMSPreview({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';
  const charCount = text.length;
  const isOver160 = charCount > 160;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SMS:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit SMS Alert Content
          </label>
          <span className={`text-xs font-bold ${isOver160 ? 'text-amber-600' : 'text-slate-500'}`}>
            {charCount}/160 chars ({segmentCount} SMS {segmentCount === 1 ? 'part' : 'parts'})
          </span>
        </div>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className={`w-full p-4 rounded-2xl border bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 leading-relaxed ${
            isOver160 ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
          }`}
          placeholder="Enter concise SMS alert..."
        />
        {isOver160 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Note: SMS messages over 160 characters will be split into multiple billable segments by telecom carriers.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-900 text-white rounded-[32px] p-4 sm:p-5 shadow-xl border-4 border-slate-700 dark:border-slate-800">
      {/* Mobile top status bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mb-4">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5">
            <div className="bg-white h-full w-3/4 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Recipient Header */}
      <div className="text-center pb-3 border-b border-slate-800 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-700 mx-auto flex items-center justify-center font-bold text-sm text-slate-300 mb-1">
          <Smartphone className="w-5 h-5 text-indigo-400" />
        </div>
        <h5 className="text-xs font-bold text-slate-200">Alert Center</h5>
        <span className="text-[10px] text-slate-500">Official SMS Broadcast</span>
      </div>

      {/* SMS Message Bubble */}
      <div className="space-y-2 mb-4 min-h-[120px] flex flex-col justify-end">
        <div className="bg-indigo-600 text-white p-3.5 sm:p-4 rounded-2xl rounded-br-2xs text-sm leading-relaxed shadow-sm">
          {text}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <span>Delivered</span>
            <span>•</span>
            <span className={isOver160 ? 'text-amber-400 font-bold' : ''}>
              {charCount}/160 chars ({segmentCount} SMS)
            </span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {isOver160 && (
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Exceeds standard 160-char SMS threshold. Will send as {segmentCount} parts.</span>
        </div>
      )}
    </div>
  );
}
