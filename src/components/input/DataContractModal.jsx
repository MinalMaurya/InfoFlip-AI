import React, { useState } from 'react';
import { X, Copy, Check, Code, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DataContractModal({ isOpen, onClose, contractData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !contractData) return null;

  // Format clean JSON string (omitting large base64 strings from display for readability)
  const displayObject = { ...contractData };
  if (displayObject.imageData && displayObject.imageData.length > 100) {
    displayObject.imageData = `${displayObject.imageData.substring(0, 80)}... [Base64 Encoded Image Data (${displayObject.imageData.length} bytes)]`;
  }
  const formattedJson = JSON.stringify(displayObject, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(contractData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent flex items-center justify-center font-mono font-bold text-xs">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 id="contract-modal-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Module 1 Structured Data Contract
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Decoupled schema passed to Module 2 (AI Content Understanding)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-6 overflow-y-auto flex-1 bg-sidebar-bg dark:bg-app-bg text-text-primary font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap">{formattedJson}</pre>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Standardized ISO 8601 & UTF-8 Ingestion Schema</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
