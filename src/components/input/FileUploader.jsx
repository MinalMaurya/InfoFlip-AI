import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Loader2,
  File,
  RotateCcw
} from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/fileValidation';
import { SAMPLE_PRESETS } from '../../services/ingestionService';

export default function FileUploader({
  file,
  onFileSelect,
  onRemoveFile,
  error,
  isProcessing = false
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      onFileSelect(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onFileSelect(selectedFiles[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Preloaded sample file loaders
  const handleLoadSamplePdf = () => {
    const preset = SAMPLE_PRESETS.pdf;
    // Create a mock File object
    const blob = new Blob([preset.text], { type: 'application/pdf' });
    const sampleFile = new File([blob], preset.fileName, { type: 'application/pdf' });
    // Attach custom preset text so extractor can directly parse it
    sampleFile._presetText = preset.text;
    sampleFile._presetMetadata = preset.metadata;
    onFileSelect(sampleFile);
  };

  const handleLoadSampleDocx = () => {
    const preset = SAMPLE_PRESETS.docx;
    const blob = new Blob([preset.text], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const sampleFile = new File([blob], preset.fileName, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    sampleFile._presetText = preset.text;
    sampleFile._presetMetadata = preset.metadata;
    onFileSelect(sampleFile);
  };

  // File Icon Helper
  const getFileIcon = (filename = '') => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
          PDF
        </div>
      );
    }
    if (ext === 'docx' || ext === 'doc') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
          DOC
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200">
      
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Document Ingestion Zone
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            (Client-side binary parsing)
          </span>
        </div>

        {/* Quick sample file loader pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSamplePdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Sample PDF</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSampleDocx}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Sample DOCX</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        {!file ? (
          /* Drag and Drop Zone */
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFileInput();
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.008]'
                : error
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/10'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3.5 shadow-2xs group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Upload your source file
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drag & drop your file here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">
                Browse Files
              </span>
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <span>Supported: <strong className="text-slate-600 dark:text-slate-300">PDF • DOCX • TXT • JPG • PNG</strong></span>
              <span>•</span>
              <span>Maximum size: <strong className="text-slate-600 dark:text-slate-300">10 MB</strong></span>
            </div>
          </div>
        ) : (
          /* Uploaded File Card */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {getFileIcon(file.name)}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    {isProcessing ? (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing & extracting...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Replace file"
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Instruction footnote */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span>✓</span>
              <span>Client-side sandbox isolation active. No sensitive document data leaves your browser unencrypted.</span>
            </p>
          </div>
        )}

        {/* Friendly Error Display */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-[11px] underline font-bold text-rose-700 dark:text-rose-300 shrink-0"
            >
              Try Another
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
