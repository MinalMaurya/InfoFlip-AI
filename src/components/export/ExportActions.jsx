import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Code, 
  Archive, 
  Printer, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  copyAll, 
  generateTXT, 
  generateJSON, 
  generatePDF, 
  generatePackage, 
  downloadFile, 
  generateFileName 
} from '../../services/export/exportService.js';

export default function ExportActions({ 
  exportPackage, 
  onInspectContracts, 
  onExportSuccess 
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  if (!exportPackage) return null;

  const handleCopyAll = async () => {
    try {
      const res = await copyAll(exportPackage);
      if (res.success) {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2500);
        if (onExportSuccess) {
          onExportSuccess({ format: 'clipboard', itemCount: exportPackage.approvedOutputs.length });
        }
      }
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  const handleDownloadTxt = () => {
    try {
      setDownloadingFormat('txt');
      const text = generateTXT(exportPackage);
      const filename = generateFileName(exportPackage, 'txt');
      downloadFile(text, filename, 'text/plain;charset=utf-8');
      if (onExportSuccess) onExportSuccess({ format: 'txt', fileName: filename });
    } catch (err) {
      console.error('TXT download error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 500);
    }
  };

  const handleDownloadJson = () => {
    try {
      setDownloadingFormat('json');
      const jsonStr = generateJSON(exportPackage);
      const filename = generateFileName(exportPackage, 'json');
      downloadFile(jsonStr, filename, 'application/json;charset=utf-8');
      if (onExportSuccess) onExportSuccess({ format: 'json', fileName: filename });
    } catch (err) {
      console.error('JSON download error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 500);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setDownloadingFormat('pdf');
      const pdfData = generatePDF(exportPackage);
      const filename = generateFileName(exportPackage, 'pdf');
      downloadFile(pdfData, filename, 'application/pdf');
      if (onExportSuccess) onExportSuccess({ format: 'pdf', fileName: filename });
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 500);
    }
  };

  const handleDownloadPackage = () => {
    try {
      setDownloadingFormat('package');
      const zipData = generatePackage(exportPackage);
      const filename = generateFileName(exportPackage, 'package');
      downloadFile(zipData, filename, 'application/zip');
      if (onExportSuccess) onExportSuccess({ format: 'package', fileName: filename });
    } catch (err) {
      console.error('Package download error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 800);
    }
  };

  return (
    <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary dark:text-accent" />
            <span>Multi-Format Export Actions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export certified deliverables in standardized formats preserving full audit trails.
          </p>
        </div>

        {onInspectContracts && (
          <button
            type="button"
            onClick={onInspectContracts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Code className="w-3.5 h-3.5 text-text-primary0" />
            <span>Inspect Contracts JSON</span>
          </button>
        )}
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Copy All */}
        <button
          type="button"
          onClick={handleCopyAll}
          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold transition-all shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            copiedAll
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {copiedAll ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-text-primary0" />}
            <span className="font-bold">{copiedAll ? 'Copied to Clipboard' : 'Copy All'}</span>
          </div>
          <span className="text-[10px] opacity-75 font-normal">All channel deliverables</span>
        </button>

        {/* Download TXT */}
        <button
          type="button"
          onClick={handleDownloadTxt}
          disabled={downloadingFormat === 'txt'}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {downloadingFormat === 'txt' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-bold">Download .TXT</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Plain text deliverable</span>
        </button>

        {/* Download JSON */}
        <button
          type="button"
          onClick={handleDownloadJson}
          disabled={downloadingFormat === 'json'}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {downloadingFormat === 'json' ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <Code className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-bold">Download .JSON</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Full schema & metadata</span>
        </button>

        {/* Download PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadingFormat === 'pdf'}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {downloadingFormat === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            ) : (
              <Printer className="w-4 h-4 text-rose-500" />
            )}
            <span className="font-bold">Download .PDF</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Print-optimized format</span>
        </button>

        {/* Download Package (.zip) */}
        <button
          type="button"
          onClick={handleDownloadPackage}
          disabled={downloadingFormat === 'package'}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {downloadingFormat === 'package' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
            <span className="font-bold">Package (.zip)</span>
          </div>
          <span className="text-[10px] text-white/80 font-normal">Archive + Manifest</span>
        </button>
      </div>
    </div>
  );
}
