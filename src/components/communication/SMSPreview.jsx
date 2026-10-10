import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, Smartphone } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit SMS Alert Content
          </label>
          <span className={`text-xs font-bold ${isOver160 ? 'text-warning' : 'text-text-secondary'}`}>
            {charCount}/160 chars ({segmentCount} SMS {segmentCount === 1 ? 'part' : 'parts'})
          </span>
        </div>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className={`w-full p-4 rounded-2xl border bg-input-bg text-sm font-sans text-text-primary focus:outline-none focus:ring-2 leading-relaxed ${
            isOver160 ? 'border-warning focus:ring-warning' : 'border-input-border focus:ring-focus-ring'
          }`}
          placeholder="Enter concise SMS alert..."
        />
        {isOver160 && (
          <p className="text-xs text-warning flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Note: SMS messages over 160 characters will be split into multiple billable segments by telecom carriers.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-surface text-text-primary rounded-[28px] p-4 sm:p-5 shadow-xs border-2 border-border transition-colors">
      {/* Mobile top status bar */}
      <div className="flex items-center justify-between text-[11px] text-text-secondary px-2 mb-4">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <div className="w-5 h-2.5 border border-border rounded-sm p-0.5">
            <div className="bg-primary dark:bg-accent h-full w-3/4 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Recipient Header */}
      <div className="text-center pb-3 border-b border-divider mb-4">
        <div className="w-10 h-10 rounded-full bg-surface-selected mx-auto flex items-center justify-center font-bold text-sm text-primary dark:text-accent mb-1">
          <Smartphone className="w-5 h-5" />
        </div>
        <h5 className="text-xs font-bold text-text-primary">Alert Center</h5>
        <span className="text-[10px] text-text-secondary">Official SMS Broadcast</span>
      </div>

      {/* SMS Message Bubble */}
      <div className="space-y-2 mb-4 min-h-[120px] flex flex-col justify-end p-3 rounded-2xl bg-sidebar-bg border border-border">
        <div className="bg-primary text-primary-foreground p-3.5 sm:p-4 rounded-2xl rounded-br-2xs text-sm leading-relaxed shadow-2xs">
          {text}
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-secondary px-1 pt-1">
          <span className="flex items-center gap-1">
            <span>Delivered</span>
            <span>•</span>
            <span className={isOver160 ? 'text-warning font-bold' : ''}>
              {charCount}/160 chars ({segmentCount} SMS)
            </span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded px-1"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {isOver160 && (
        <div className="p-2.5 rounded-xl bg-warning-subtle border border-warning/30 text-[11px] text-warning flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Exceeds standard 160-char SMS threshold. Will send as {segmentCount} parts.</span>
        </div>
      )}
    </div>
  );
}
