import React, { useState } from 'react';
import { FileText, Eye, ChevronDown, ChevronUp, Clock, Hash, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../../utils/fileValidation.js';

export default function SourceTraceabilityCard({ sourceData, traceability }) {
  const [showSourceText, setShowSourceText] = useState(false);

  if (!sourceData && !traceability) return null;

  const rawText = sourceData?.extractedText || sourceData?.rawText || '';
  const fileName = sourceData?.fileName || traceability?.fileName;
  const sourceType = sourceData?.sourceType || traceability?.sourceType || 'text';
  const words = traceability?.analyzedWords || sourceData?.metadata?.wordCount || 0;
  const chars = traceability?.analyzedCharacters || sourceData?.metadata?.characterCount || 0;
  const pages = sourceData?.metadata?.pageCount;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
      
      {/* Traceability Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
            {sourceType.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {fileName || 'Normalized Input Stream'}
              </span>
              <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {sourceType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              <span>{words.toLocaleString()} words</span>
              <span>•</span>
              <span>{chars.toLocaleString()} chars</span>
              {pages && (
                <>
                  <span>•</span>
                  <span>{pages} page(s)</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rawText && (
            <button
              type="button"
              onClick={() => setShowSourceText(!showSourceText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{showSourceText ? 'Hide Source Text' : 'Inspect Source Text'}</span>
              {showSourceText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Source Text Drawer */}
      {showSourceText && rawText && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Original Ingested Content (Module 1 Hand-off):</span>
            <span className="font-mono text-[10px]">ID: {sourceData?.sourceId || traceability?.sourceId}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap">
            {rawText}
          </div>
        </div>
      )}

    </div>
  );
}
