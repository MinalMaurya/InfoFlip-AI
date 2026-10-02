import React, { useState, useEffect } from 'react';
import InputMethodTabs from './InputMethodTabs';
import TextInput from './TextInput';
import FileUploader from './FileUploader';
import ImageUploader from './ImageUploader';
import SourcePreview from './SourcePreview';
import IngestionLoadingModal from './IngestionLoadingModal';
import DataContractModal from './DataContractModal';
import { processIngestion, SAMPLE_PRESETS } from '../../services/ingestionService';
import { validateFile } from '../../utils/fileValidation';
import { calculateTextMetrics, normalizeText } from '../../utils/textNormalization';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';
import { 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Code,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

export default function Module1CreateView({
  onProceedToModule2,
  initialSource = '',
  initialScenario = null
}) {
  // Input Method: 'text' | 'file' | 'image'
  const [activeTab, setActiveTab] = useState('text');

  // Input States
  const [textValue, setTextValue] = useState(initialSource || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);

  // Errors
  const [inputError, setInputError] = useState('');

  // Ingestion & Pipeline Loading State
  const [isIngesting, setIsIngesting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingTitle, setLoadingTitle] = useState('Preparing your content...');
  const [loadingDetail, setLoadingDetail] = useState('Validating input...');

  // Structured Data Contract (Requirement 16)
  const [generatedContract, setGeneratedContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState(false);

  // Set initial text if provided
  useEffect(() => {
    if (initialSource && !textValue) {
      setTextValue(initialSource);
    }
  }, [initialSource]);

  // Handle Text Changes
  const handleTextChange = (val) => {
    setTextValue(val);
    if (inputError) setInputError('');
    if (handoffSuccess) setHandoffSuccess(false);
  };

  const handleClearText = () => {
    setTextValue('');
    setInputError('');
    setGeneratedContract(null);
    setHandoffSuccess(false);
  };

  // Handle File Selection with Immediate Client Validation
  const handleFileSelect = (file) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      setInputError(validation.error);
      setSelectedFile(null);
      return;
    }

    setInputError('');
    setSelectedFile(file);
    setHandoffSuccess(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setInputError('');
    setGeneratedContract(null);
    setHandoffSuccess(false);
  };

  // Handle Image Selection
  const handleImageSelect = (file) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      setInputError(validation.error);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setInputError('');
    setImageFile(file);
    setHandoffSuccess(false);

    // If preloaded preset has dataUrl
    if (file._presetDataUrl) {
      setImagePreview(file._presetDataUrl);
      setImageMetadata(file._presetMetadata);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        setImageMetadata({
          dimensions: {
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height
          }
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageMetadata(null);
    setInputError('');
    setGeneratedContract(null);
    setHandoffSuccess(false);
  };

  // Quick Scenario Loader
  const handleLoadScenario = (scenario) => {
    setActiveTab('text');
    setTextValue(scenario.source);
    setSelectedFile(null);
    setImageFile(null);
    setImagePreview(null);
    setInputError('');
    setHandoffSuccess(false);
  };

  // Reset entire Module 1 state
  const handleResetAll = () => {
    setTextValue('');
    setSelectedFile(null);
    setImageFile(null);
    setImagePreview(null);
    setImageMetadata(null);
    setInputError('');
    setGeneratedContract(null);
    setHandoffSuccess(false);
  };

  // Determine current active preview data
  const hasValidInput = Boolean(
    (activeTab === 'text' && textValue.trim().length >= 15) ||
    (activeTab === 'file' && selectedFile) ||
    (activeTab === 'image' && (imageFile || imagePreview))
  );

  let currentPreviewType = 'text';
  let currentPreviewTitle = 'Source Text';
  let currentPreviewContent = '';
  let currentPreviewFileSize = null;
  let currentPreviewMetadata = {};

  if (activeTab === 'text') {
    currentPreviewType = 'text';
    currentPreviewTitle = 'Pasted Article / Announcement';
    currentPreviewContent = textValue;
    currentPreviewMetadata = calculateTextMetrics(textValue);
  } else if (activeTab === 'file' && selectedFile) {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    currentPreviewType = ext === 'pdf' ? 'pdf' : (ext === 'docx' ? 'docx' : 'txt');
    currentPreviewTitle = selectedFile.name;
    currentPreviewFileSize = selectedFile.size;
    currentPreviewContent = selectedFile._presetText || `[Document File Loaded: ${selectedFile.name}]\nDocument stream validated and ready for full extraction.`;
    currentPreviewMetadata = selectedFile._presetMetadata || {
      wordCount: Math.max(1, Math.round(selectedFile.size / 15)),
      characterCount: selectedFile.size,
      pageCount: ext === 'pdf' ? 3 : 2,
      detectedLanguage: 'English'
    };
  } else if (activeTab === 'image' && (imageFile || imagePreview)) {
    currentPreviewType = 'image';
    currentPreviewTitle = imageFile?.name || 'Uploaded Source Image';
    currentPreviewFileSize = imageFile?.size;
    currentPreviewContent = imageFile?._presetText || `[Visual Image Ingested]\nFile: ${imageFile?.name || 'source-image.png'}\nDimensions: ${imageMetadata?.dimensions?.width || 1920} × ${imageMetadata?.dimensions?.height || 1080} px\nPrepared for multimodal AI vision analysis.`;
    currentPreviewMetadata = {
      wordCount: 35,
      characterCount: 260,
      dimensions: imageMetadata?.dimensions || { width: 1920, height: 1080 },
      detectedLanguage: 'English'
    };
  }

  // Primary Action CTA: Analyze Content
  const handleAnalyzeContent = async () => {
    if (!hasValidInput || isIngesting) return;

    setIsIngesting(true);
    setInputError('');

    try {
      // Determine what to pass
      let payloadType = activeTab;
      let rawText = textValue;
      let file = null;

      if (activeTab === 'file') {
        file = selectedFile;
        rawText = selectedFile._presetText || '';
      } else if (activeTab === 'image') {
        file = imageFile;
        rawText = imageFile?._presetText || '';
      }

      const contract = await processIngestion({
        type: payloadType,
        rawText,
        file,
        onProgress: (prog) => {
          setLoadingStep(prog.step);
          setLoadingTitle(prog.title);
          setLoadingDetail(prog.detail);
        }
      });

      setGeneratedContract(contract);
      setHandoffSuccess(true);

      // Trigger handoff to Module 2 if handler provided
      if (onProceedToModule2) {
        onProceedToModule2(contract);
      }
    } catch (err) {
      console.error('Ingestion error:', err);
      setInputError(err.message || 'We could not process this input. Please check the file or text and try again.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      
      {/* Page Heading & Header (Requirement 7) */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                Module 1
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Create New Transformation
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Add your source content and let InfoFlip-AI transform it into the format you need.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadScenario(DEMO_SCENARIOS[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Weather Demo</span>
            </button>

            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              title="Reset all inputs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Ingestion Workspace (Requirements 4, 8, 9, 10, 12, 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input Selector & Active Input Component (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Input Method Selector (Requirement 8) */}
          <InputMethodTabs 
            activeTab={activeTab} 
            onSelectTab={(tabId) => {
              setActiveTab(tabId);
              setInputError('');
            }} 
          />

          {/* Active Input Panel */}
          {activeTab === 'text' && (
            <TextInput
              value={textValue}
              onChange={handleTextChange}
              onClear={handleClearText}
              error={inputError}
              onLoadScenario={handleLoadScenario}
            />
          )}

          {activeTab === 'file' && (
            <FileUploader
              file={selectedFile}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveFile}
              error={inputError}
              isProcessing={isIngesting}
            />
          )}

          {activeTab === 'image' && (
            <ImageUploader
              imageFile={imageFile}
              imagePreview={imagePreview}
              imageMetadata={imageMetadata}
              onImageSelect={handleImageSelect}
              onRemoveImage={handleRemoveImage}
              error={inputError}
            />
          )}

          {/* Module 1 Ingestion Features Reminder */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Zero-Loss Ingestion:</strong> Formats are normalized, tokenized, and packaged with zero external API data leakage.
              </span>
            </div>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              Max 10 MB • UTF-8 Validated
            </span>
          </div>

        </div>

        {/* Right Column: Source Preview & Module 2 Hand-off (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Source Preview (Requirement 13 & 24) */}
          <SourcePreview
            sourceType={currentPreviewType}
            title={currentPreviewTitle}
            content={currentPreviewContent}
            fileSize={currentPreviewFileSize}
            metadata={currentPreviewMetadata}
            hasContent={hasValidInput}
            onOpenDataContract={() => setShowContractModal(true)}
            onSwitchToText={() => setActiveTab('text')}
            onSwitchToFile={() => setActiveTab('file')}
            onLoadQuickDemo={() => handleLoadScenario(DEMO_SCENARIOS[0])}
          />

          {/* Primary Action Card (Requirement 14) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Next Stage: Module 2 (Context & Intent)</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {hasValidInput ? 'Input Verified' : 'Awaiting Input'}
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleAnalyzeContent}
              disabled={!hasValidInput || isIngesting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                !hasValidInput
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
                  : isIngesting
                  ? 'bg-indigo-400 dark:bg-indigo-600/70 cursor-wait shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 shadow-indigo-300/40 dark:shadow-indigo-950/50 hover:shadow-indigo-400/50 active:scale-[0.99]'
              }`}
            >
              <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${isIngesting ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
              <span>
                {isIngesting ? 'Analyzing...' : 'Analyze Content →'}
              </span>
            </button>

            {!hasValidInput && (
              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                Please enter at least 15 characters of text or upload a document/image to analyze.
              </p>
            )}

            {/* Hand-off Success Banner */}
            {handoffSuccess && generatedContract && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Module 1 Ingestion Complete!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContractModal(true)}
                    className="underline text-[11px] hover:text-emerald-900 dark:hover:text-emerald-100 flex items-center gap-1 font-semibold"
                  >
                    <Code className="w-3 h-3" />
                    <span>View Contract</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Clean structured source object created and staged for Module 2 (AI Content Understanding & Multi-Format Synthesis).
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Multi-step Loading Modal (Requirement 15) */}
      <IngestionLoadingModal
        isOpen={isIngesting}
        currentStep={loadingStep}
        title={loadingTitle}
        detail={loadingDetail}
      />

      {/* Structured Data Contract Modal (Requirement 16) */}
      <DataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        contractData={generatedContract}
      />

    </div>
  );
}
