import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  RotateCcw, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  Columns, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function ContentEditor({ 
  content, 
  originalContent, 
  isEdited = false, 
  onSave, 
  onCancel,
  channelId = 'output'
}) {
  const [draftContent, setDraftContent] = useState(content || '');
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'split' | 'diff'
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setDraftContent(content || '');
  }, [content]);

  // Live metrics
  const charCount = draftContent.length;
  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;
  const sentenceCount = draftContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  const hasUnsavedChanges = draftContent !== content;
  const isDifferentFromOriginal = draftContent !== (originalContent || content);

  const handleSave = () => {
    if (onSave) {
      onSave(draftContent);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleResetToOriginal = () => {
    const orig = originalContent || content;
    setDraftContent(orig);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      {/* Header with Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-primary dark:text-accent" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Human-in-the-Loop Content Editor
          </h4>
          {isEdited && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-primary dark:text-accent border border-primary/20">
              Edited by Human
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Split View
          </button>
        </div>
      </div>

      {/* Editor Main Area */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Original Content */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> AI Generated Original
            </span>
            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {originalContent || content}
            </div>
          </div>

          {/* Editable Draft */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-accent flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Human Revised Version
            </span>
            <textarea
              rows={10}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-primary/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:outline-none font-sans text-xs leading-relaxed resize-y max-h-80"
              placeholder="Edit content here..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={8}
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none font-sans text-xs leading-relaxed resize-y"
            placeholder="Edit communication content..."
          />
        </div>
      )}

      {/* Live Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-slate-800 dark:text-slate-200">{wordCount}</strong></span>
          <span>Characters: <strong className="text-slate-800 dark:text-slate-200">{charCount}</strong></span>
          <span>Sentences: <strong className="text-slate-800 dark:text-slate-200">{sentenceCount}</strong></span>
          {channelId === 'sms' && (
            <span className={charCount > 160 ? 'text-amber-500 font-semibold' : 'text-emerald-500'}>
              SMS Segments: {Math.ceil(charCount / 160) || 1} ({charCount}/160)
            </span>
          )}
          {channelId === 'twitter' && (
            <span className={charCount > 280 ? 'text-amber-500 font-semibold' : 'text-emerald-500'}>
              X Limit: {charCount}/280 {charCount > 280 && '(Thread mode)'}
            </span>
          )}
        </div>

        {isDifferentFromOriginal && (
          <span className="text-[10px] text-primary dark:text-accent font-medium">
            Modified from original AI output
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={handleResetToOriginal}
          disabled={!isDifferentFromOriginal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Original</span>
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges && !isDifferentFromOriginal}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              savedSuccess
                ? 'bg-emerald-600'
                : 'bg-primary hover:bg-primary-hover active:scale-[0.98]'
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved & Re-evaluated</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save & Re-evaluate Checks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
