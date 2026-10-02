import React, { useRef, useState } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { formatFileSize, validateFile } from '../../utils/fileValidation';
import { SAMPLE_PRESETS } from '../../services/ingestionService';

export default function ImageUploader({
  imageFile,
  imagePreview,
  imageMetadata,
  onImageSelect,
  onRemoveImage,
  error
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
      onImageSelect(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onImageSelect(selectedFiles[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Load sample image preset
  const handleLoadSampleImage = () => {
    const preset = SAMPLE_PRESETS.image;
    // Create a mock image file
    const blob = new Blob([preset.dataUrl], { type: 'image/png' });
    const mockFile = new File([blob], preset.fileName, { type: 'image/png' });
    mockFile._presetDataUrl = preset.dataUrl;
    mockFile._presetText = preset.text;
    mockFile._presetMetadata = preset.metadata;
    onImageSelect(mockFile);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200">
      
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Image Ingestion Zone
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            (Infographics, advisories, diagrams)
          </span>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleImage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Sample Radar Chart</span>
        </button>
      </div>

      <div className="p-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />

        {!imageFile && !imagePreview ? (
          /* Dropzone */
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
              <ImageIcon className="w-7 h-7" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Upload source image
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drag & drop an image here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">
                Browse Files
              </span>
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Supported: <strong className="text-slate-700 dark:text-slate-200">PNG · JPG · JPEG · WEBP</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Max file size: <strong className="text-slate-700 dark:text-slate-200">10 MB</strong></span>
            </div>
          </div>
        ) : (
          /* Image Preview Card */
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-800/40">
              <div className="relative aspect-video max-h-56 bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={imagePreview}
                  alt={imageFile?.name || 'Uploaded preview'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold">
                  <Eye className="w-3 h-3 text-indigo-400" />
                  <span>Preview</span>
                </div>
              </div>

              {/* Image Info Bar */}
              <div className="p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={imageFile?.name || 'Image source'}>
                    {imageFile?.name || 'Image source'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{imageFile ? formatFileSize(imageFile.size) : 'Ready'}</span>
                    {imageMetadata?.dimensions && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>{imageMetadata.dimensions.width} × {imageMetadata.dimensions.height} px</span>
                      </>
                    )}
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>Image pixel buffer and metadata staged for Module 2 Multimodal AI Analysis.</span>
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div role="alert" className="mt-3.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="font-semibold flex-1">{error}</p>
          </div>
        )}

      </div>
    </div>
  );
}
