import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Download, 
  Check, 
  Code, 
  ShieldCheck, 
  Layers, 
  FileCheck2
} from 'lucide-react';

export default function ReviewDataContractModal({
  isOpen,
  onClose,
  reviewResult,
  exportPackage
}) {
  const [activeTab, setActiveTab] = useState('reviewResult'); // 'reviewResult' | 'exportPackage'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentData = activeTab === 'reviewResult' ? reviewResult : exportPackage;
  const currentJson = currentData ? JSON.stringify(currentData, null, 2) : '{\n  "message": "No data available"\n}';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'reviewResult' 
      ? `module5-review-${reviewResult?.reviewId || 'contract'}.json`
      : `module6-export-package-${exportPackage?.exportId || 'ready'}.json`;

    const blob = new Blob([currentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-surface-selected text-primary dark:text-accent">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Contract Inspection (SIH 2026 Schema)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect raw immutable contracts for Module 5 Review and Module 6 Export handoff.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reviewResult')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviewResult'
                  ? 'bg-white dark:bg-slate-800 text-primary dark:text-accent shadow-2xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Module 5 Review Result</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exportPackage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'exportPackage'
                  ? 'bg-white dark:bg-slate-800 text-primary dark:text-accent shadow-2xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Module 6 Export Handoff Package</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="flex-1 p-5 overflow-auto bg-sidebar-bg dark:bg-app-bg font-mono text-xs text-text-primary leading-relaxed">
          <pre>{currentJson}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {activeTab === 'reviewResult' 
              ? `Review ID: ${reviewResult?.reviewId || 'N/A'}` 
              : `Export Package ID: ${exportPackage?.exportId || 'Ready for Mod 6'}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
