import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Eye, 
  Code, 
  FileText, 
  Layers, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { formatFileSize } from '../../utils/fileValidation';

export default function SourcePreview({
  sourceType = 'text',
  title = '',
  content = '',
  fileSize = null,
  metadata = {},
  hasContent = false,
  onOpenDataContract = null,
  onSwitchToText = null,
  onSwitchToFile = null,
  onLoadQuickDemo = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no content has been entered yet, render Requirement 24 Empty State
  if (!hasContent) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[380px] shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
          <Layers className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
          Start with your source
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Paste text or upload a file to begin. InfoFlip-AI will validate, extract, and normalize the content for AI transformation.
        </p>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {onSwitchToText && (
            <button
              type="button"
              onClick={onSwitchToText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Paste Text</span>
            </button>
          )}

          {onSwitchToFile && (
            <button
              type="button"
              onClick={onSwitchToFile}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Upload File</span>
            </button>
          )}

          {onLoadQuickDemo && (
            <button
              type="button"
              onClick={onLoadQuickDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Quick Demo</span>
            </button>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
          Module 1 processes text, PDF, DOCX, TXT, and Images into clean structured data contracts.
        </div>
      </div>
    );
  }

  // Determine Type Badge Color
  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50';
      case 'docx':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
      case 'image':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50';
    }
  };

  const previewSnippet = content.length > 280 && !isExpanded 
    ? content.slice(0, 280) + '...' 
    : content;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>SOURCE PREVIEW</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getTypeBadge(sourceType)}`}>
                {sourceType.toUpperCase()}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {title || 'Normalized Ingestion Buffer'}
            </p>
          </div>
        </div>

        {/* Ready status badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ready for analysis</span>
          </div>

          {onOpenDataContract && (
            <button
              type="button"
              onClick={onOpenDataContract}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Inspect structured data contract for Module 2"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-50/30 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800/60 text-center">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Words
          </span>
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {metadata.wordCount ? metadata.wordCount.toLocaleString() : '0'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Characters
          </span>
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {metadata.characterCount ? metadata.characterCount.toLocaleString() : '0'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {sourceType === 'image' ? 'Resolution' : 'Pages'}
          </span>
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate block">
            {sourceType === 'image' 
              ? (metadata.dimensions ? `${metadata.dimensions.width}×${metadata.dimensions.height}` : 'HD')
              : (metadata.pageCount || 1)
            }
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Est. Reading
          </span>
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {metadata.readingTimeMinutes || 1} min
          </span>
        </div>
      </div>

      {/* Content Preview Snippet */}
      <div className="p-5">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Extracted Content Preview</span>
          {fileSize && (
            <span className="text-[11px] font-normal text-slate-400">
              Payload size: {formatFileSize(fileSize)}
            </span>
          )}
        </div>

        <div className="relative rounded-xl p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
          {previewSnippet || 'Content prepared and verified.'}
        </div>

        {content.length > 280 && (
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <span>{isExpanded ? 'View less' : 'View more'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Language: <strong className="text-slate-700 dark:text-slate-300">{metadata.detectedLanguage || 'English'}</strong></span>
          <span>Normalized & UTF-8 Validated</span>
        </div>
      </div>
    </div>
  );
}
