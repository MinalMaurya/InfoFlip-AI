import React, { useState, useEffect } from 'react';
import PipelineStepIndicator from '../input/PipelineStepIndicator.jsx';
import TransformationProgressTracker from './TransformationProgressTracker.jsx';
import TransformationDataContractModal from './TransformationDataContractModal.jsx';
import LinkedInPreview from './previews/LinkedInPreview.jsx';
import TwitterPreview from './previews/TwitterPreview.jsx';
import ExecutiveSummaryPreview from './previews/ExecutiveSummaryPreview.jsx';
import AdvisoryPreview from './previews/AdvisoryPreview.jsx';
import InfographicPreview from './previews/InfographicPreview.jsx';
import PresentationPreview from './previews/PresentationPreview.jsx';
import VideoScriptPreview from './previews/VideoScriptPreview.jsx';

import { 
  transformContent, 
  regenerateSingleOutput 
} from '../../services/transformation/transformationService.js';
import { 
  getAllOutputFormats, 
  getOutputFormatById 
} from '../../services/transformation/outputFormatRegistry.js';
import { 
  TARGET_AUDIENCES, 
  TRANSFORMATION_TONES, 
  TRANSFORMATION_LANGUAGES, 
  DETAIL_LEVELS, 
  COMMUNICATION_OBJECTIVES, 
  CONTENT_STYLES,
  OUTPUT_FORMAT_IDS,
  OUTPUT_STATUSES
} from '../../types/transformation.js';
import { SAMPLE_ANALYSIS } from '../../services/analysisService.js';

import { 
  Wand2, 
  RotateCcw, 
  Code, 
  Copy, 
  Check, 
  Download, 
  PlusCircle, 
  BrainCircuit, 
  Sliders, 
  Share2, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Presentation, 
  Video, 
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const ICON_MAP = {
  Share2: Share2,
  MessageSquare: MessageSquare,
  FileText: FileText,
  AlertTriangle: AlertTriangle,
  BarChart3: BarChart3,
  Presentation: Presentation,
  Video: Video
};

export default function Module3TransformView({
  sourceData,
  analysisData,
  onBackToInput,
  onBackToUnderstand,
  onLoadDemo
}) {
  // Configuration State
  const [targetAudience, setTargetAudience] = useState(
    (analysisData?.audience?.detected && analysisData.audience.detected.length > 0)
      ? analysisData.audience.detected[0]
      : 'General Public'
  );
  const [customAudience, setCustomAudience] = useState('');
  const [showCustomAudienceInput, setShowCustomAudienceInput] = useState(false);

  const [tone, setTone] = useState(analysisData?.tone?.primary || 'Informative');
  const [language, setLanguage] = useState(analysisData?.language?.name || 'English');
  const [detailLevel, setDetailLevel] = useState(DETAIL_LEVELS.BALANCED);
  const [objective, setObjective] = useState(analysisData?.intent?.primary || 'Inform');
  const [contentStyle, setContentStyle] = useState('Structured');

  // Format selection state (default: LinkedIn, Executive Summary, Presentation)
  const [selectedFormats, setSelectedFormats] = useState([
    OUTPUT_FORMAT_IDS.LINKEDIN,
    OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
    OUTPUT_FORMAT_IDS.PRESENTATION
  ]);

  // Generation & Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState({
    step: 1,
    title: '',
    detail: ''
  });
  const [transformationResult, setTransformationResult] = useState(null);
  const [activeOutputFormat, setActiveOutputFormat] = useState(OUTPUT_FORMAT_IDS.LINKEDIN);
  const [isEditingActiveOutput, setIsEditingActiveOutput] = useState(false);
  const [formatError, setFormatError] = useState('');
  const [generalError, setGeneralError] = useState(null);

  // Modals & Action feedbacks
  const [showContractModal, setShowContractModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [regeneratingFormatId, setRegeneratingFormatId] = useState(null);

  // Synchronize initial configuration when analysisData arrives
  useEffect(() => {
    if (analysisData) {
      if (analysisData.audience?.detected?.length > 0 && analysisData.audience.detected[0] !== 'Not detected') {
        setTargetAudience(analysisData.audience.detected[0]);
      }
      if (analysisData.tone?.primary) {
        setTone(analysisData.tone.primary);
      }
      if (analysisData.language?.name && ['English', 'Hindi', 'Marathi'].includes(analysisData.language.name)) {
        setLanguage(analysisData.language.name);
      }
      if (analysisData.intent?.primary) {
        setObjective(analysisData.intent.primary);
      }
    }
  }, [analysisData]);

  // Toggle format selection
  const handleToggleFormat = (formatId) => {
    setFormatError('');
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length === 1) {
        setFormatError('At least one output format must remain selected.');
        return;
      }
      setSelectedFormats(selectedFormats.filter(f => f !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  const handleSelectAllFormats = () => {
    setFormatError('');
    setSelectedFormats(getAllOutputFormats().map(f => f.id));
  };

  const handleResetFormats = () => {
    setFormatError('');
    setSelectedFormats([
      OUTPUT_FORMAT_IDS.LINKEDIN,
      OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY,
      OUTPUT_FORMAT_IDS.PRESENTATION
    ]);
  };

  // Run batch transformation
  const handleGenerate = async () => {
    if (selectedFormats.length === 0) {
      setFormatError('Select at least one output format.');
      return;
    }

    if (!sourceData) {
      setGeneralError('No source content available. Please load or ingest a source first.');
      return;
    }

    if (!analysisData) {
      setGeneralError('Module 2 content understanding is required before transformation.');
      return;
    }

    setIsGenerating(true);
    setGeneralError(null);
    setFormatError('');

    const resolvedAudience = showCustomAudienceInput && customAudience.trim()
      ? [customAudience.trim()]
      : [targetAudience];

    const request = {
      source: sourceData,
      analysis: analysisData,
      configuration: {
        targetAudience: resolvedAudience,
        tone,
        language,
        detailLevel,
        objective,
        contentStyle
      },
      requestedOutputs: selectedFormats
    };

    try {
      const result = await transformContent(request, {
        onProgress: (prog) => {
          setProgressState(prog);
        }
      });

      setTransformationResult(result);
      if (result.outputs.length > 0) {
        setActiveOutputFormat(result.outputs[0].format);
      }
      setIsEditingActiveOutput(false);
    } catch (err) {
      console.error('Transformation error:', err);
      setGeneralError(err.message || 'Transformation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Single format regeneration
  const handleRegenerateSingle = async (formatId) => {
    if (!transformationResult) return;
    setRegeneratingFormatId(formatId);

    const existingOutput = transformationResult.outputs.find(o => o.format === formatId);
    const resolvedAudience = showCustomAudienceInput && customAudience.trim()
      ? [customAudience.trim()]
      : [targetAudience];

    const baseRequest = {
      source: sourceData,
      analysis: analysisData,
      configuration: {
        targetAudience: resolvedAudience,
        tone,
        language,
        detailLevel,
        objective,
        contentStyle
      }
    };

    try {
      const updatedOutput = await regenerateSingleOutput(
        baseRequest, 
        existingOutput?.outputId, 
        formatId,
        { delayMs: 100 }
      );

      setTransformationResult(prev => ({
        ...prev,
        outputs: prev.outputs.map(o => o.format === formatId ? updatedOutput : o)
      }));
    } catch (err) {
      console.error('Failed to regenerate single format:', err);
    } finally {
      setRegeneratingFormatId(null);
    }
  };

  // Update content of active output
  const handleUpdateActiveContent = (newContent) => {
    if (!transformationResult) return;

    setTransformationResult(prev => ({
      ...prev,
      outputs: prev.outputs.map(out => {
        if (out.format === activeOutputFormat) {
          return {
            ...out,
            content: newContent,
            metadata: {
              ...out.metadata,
              isEdited: true
            }
          };
        }
        return out;
      })
    }));
  };

  // Copy active output content
  const handleCopyActive = async () => {
    const activeItem = transformationResult?.outputs?.find(o => o.format === activeOutputFormat);
    if (!activeItem) return;

    let textToCopy = '';
    if (typeof activeItem.content === 'string') {
      textToCopy = activeItem.content;
    } else if (activeItem.content?.text) {
      textToCopy = activeItem.content.text;
    } else if (activeItem.content?.posts) {
      textToCopy = activeItem.content.posts.join('\n\n');
    } else {
      textToCopy = JSON.stringify(activeItem.content, null, 2);
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(activeOutputFormat);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  // Download all generated outputs as bundle
  const handleDownloadAllBundle = () => {
    if (!transformationResult?.outputs?.length) return;

    const bundleText = transformationResult.outputs.map(out => {
      const def = getOutputFormatById(out.format);
      let body = '';
      if (typeof out.content === 'string') body = out.content;
      else if (out.content?.text) body = out.content.text;
      else if (out.content?.posts) body = out.content.posts.join('\n\n');
      else body = JSON.stringify(out.content, null, 2);

      return `========================================\n` +
             `FORMAT: ${def?.name?.toUpperCase() || out.format.toUpperCase()}\n` +
             `STATUS: ${out.status.toUpperCase()} | PROVIDER: ${out.metadata?.provider}${out.metadata?.reason ? ` | REASON: ${out.metadata.reason}` : ''}\n` +
             `========================================\n\n` +
             `${body}\n\n`;
    }).join('\n');

    const blob = new Blob([bundleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infoflip_bundle_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeOutputItem = transformationResult?.outputs?.find(o => o.format === activeOutputFormat);
  const activeFormatDef = getOutputFormatById(activeOutputFormat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      
      {/* Page Header (Requirement 23) */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                Module 3
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Transform Content Into Multiple Outputs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Synthesize your understood source into tailored formats (LinkedIn, X/Twitter, Executive Briefs, Advisories, Infographics, Decks & Scripts).
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {transformationResult && (
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                title="Inspect Module 3 Output Contract"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Transformation JSON</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetFormats}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              title="Reset configuration defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Pipeline Indicator (Requirement 23) */}
        <div className="mt-5">
          <PipelineStepIndicator activeModule={3} />
        </div>
      </div>

      {/* Check 1: Missing Source Check */}
      {!sourceData ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            No source content available
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Module 3 requires source information ingested from Module 1 and semantic analysis from Module 2 before generating transformations.
          </p>
          <div className="mt-6 flex justify-center gap-2.5">
            {onBackToInput && (
              <button
                type="button"
                onClick={onBackToInput}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Return to Input (Module 1)</span>
              </button>
            )}
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Weather Demo</span>
              </button>
            )}
          </div>
        </div>
      ) : !analysisData ? (
        /* Check 2: Missing Module 2 Analysis Check */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-indigo-200 dark:border-indigo-900/60 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Content understanding is required before transformation
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Module 3 consumes verified facts, intent, and anti-hallucination guardrails from Module 2 to synthesize accurate outputs.
          </p>
          <div className="mt-6 flex justify-center gap-2.5">
            {onBackToUnderstand && (
              <button
                type="button"
                onClick={onBackToUnderstand}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Return to Understand (Module 2)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MAIN TRANSFORMATION INTERFACE */
        <div className="space-y-8">
          
          {/* Active Context Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">
                Grounding Source:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                {sourceData.fileName || `${sourceData.sourceType.toUpperCase()} Document`} ({sourceData.metadata?.wordCount || sourceData.extractedText?.split(/\s+/).length || 0} words)
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300">
                Topic: <strong className="text-slate-800 dark:text-slate-100">{analysisData.overview?.mainTopic}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {analysisData.keyFacts?.length || 0} Verified Facts
              </span>
            </div>

            <button
              type="button"
              onClick={onBackToUnderstand}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Module 2 Understanding</span>
              <span>→</span>
            </button>
          </div>

          {/* Configuration & Output Format Selection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: User Configuration Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  User Transformation Parameters
                </h3>
              </div>

              {/* 1. Target Audience */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Target Audience
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomAudienceInput(!showCustomAudienceInput)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {showCustomAudienceInput ? 'Choose from list' : '+ Custom Cohort'}
                  </button>
                </div>

                {showCustomAudienceInput ? (
                  <input
                    type="text"
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                    placeholder="Enter custom audience (e.g. Healthcare Staff)..."
                    className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {TARGET_AUDIENCES.map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => setTargetAudience(aud)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          targetAudience === aud
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tone of Voice
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TRANSFORMATION_TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        tone === t
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Output Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Output Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRANSFORMATION_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        language === lang.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/20'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Level of Detail (Concise ── Balanced ── Detailed) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Level of Detail
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {detailLevel}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {Object.values(DETAIL_LEVELS).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDetailLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        detailLevel === lvl
                          ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Communication Objective & Style */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Objective:
                  </label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {COMMUNICATION_OBJECTIVES.map((obj) => (
                      <option key={obj} value={obj}>{obj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Content Style:
                  </label>
                  <select
                    value={contentStyle}
                    onChange={(e) => setContentStyle(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {CONTENT_STYLES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Right Column: Output Format Selection Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Select Transformation Outputs</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {selectedFormats.length} of 7 Selected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    One source synthesized simultaneously into multiple audience-ready formats.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFormats}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleResetFormats}
                    className="text-xs font-semibold text-slate-500 hover:underline"
                  >
                    Defaults
                  </button>
                </div>
              </div>

              {/* Format Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getAllOutputFormats().map((fmt) => {
                  const isSelected = selectedFormats.includes(fmt.id);
                  const Icon = ICON_MAP[fmt.iconName] || FileText;

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => handleToggleFormat(fmt.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all select-none flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-500/80 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-400/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {fmt.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {fmt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {fmt.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Format Selection Error Notice */}
              {formatError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold animate-shake">
                  ⚠ {formatError}
                </p>
              )}

              {/* Main Transform CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-300/40 dark:shadow-indigo-950 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>
                    ✦ Generate {selectedFormats.length} Output {selectedFormats.length > 1 ? 'Formats' : 'Format'}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* In-Flight Generation Progress Tracker */}
          {isGenerating && (
            <div className="py-6 animate-fade-in">
              <TransformationProgressTracker
                currentStep={progressState.step}
                title={progressState.title}
                detail={progressState.detail}
                requestedFormats={selectedFormats}
              />
            </div>
          )}

          {/* General Failure Error Card */}
          {generalError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Transformation Error:</strong> {generalError}
              </div>
            </div>
          )}

          {/* RESULTS WORKSPACE (Requirements 17 - 21) */}
          {transformationResult && !isGenerating && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
              
              {/* User-facing status notice when quota is exhausted (Requirement 6) */}
              {transformationResult.outputs?.[0]?.metadata?.reason === 'Gemini quota exhausted' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium animate-fade-in shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p>
                    <strong>Notice:</strong> Gemini quota exhausted — using deterministic fallback.
                  </p>
                </div>
              )}

              {/* Results Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Transformation Results
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {transformationResult.outputs?.length} Formats Synthesized
                    </span>
                  </div>
                  
                  {/* Configuration Summary Pill Strip (Requirement 21) */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Audience: <strong className="text-slate-800 dark:text-slate-200">{targetAudience}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Tone: <strong className="text-slate-800 dark:text-slate-200">{tone}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Language: <strong className="text-slate-800 dark:text-slate-200">{language}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Detail: <strong className="text-slate-800 dark:text-slate-200">{detailLevel}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Objective: <strong className="text-slate-800 dark:text-slate-200">{objective}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Style: <strong className="text-slate-800 dark:text-slate-200">{contentStyle}</strong>
                    </span>
                  </div>
                </div>

                {/* Engine Provenance Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    transformationResult.outputs?.[0]?.metadata?.isFallback
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Provider: {transformationResult.outputs?.[0]?.metadata?.provider}</span>
                    {transformationResult.outputs?.[0]?.metadata?.reason && (
                      <span className="text-[11px] font-medium pl-1.5 border-l border-amber-300 dark:border-amber-700">
                        Reason: {transformationResult.outputs[0].metadata.reason}
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={handleDownloadAllBundle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All</span>
                  </button>
                </div>
              </div>

              {/* Format Tabs Bar (Requirement 17) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
                {transformationResult.outputs.map((out) => {
                  const def = getOutputFormatById(out.format);
                  const Icon = ICON_MAP[def?.iconName] || FileText;
                  const isActive = activeOutputFormat === out.format;
                  const isError = out.status === OUTPUT_STATUSES.NEEDS_REGENERATION;

                  return (
                    <button
                      key={out.outputId}
                      type="button"
                      onClick={() => {
                        setActiveOutputFormat(out.format);
                        setIsEditingActiveOutput(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{def?.shortName || out.format}</span>
                      {isError ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Needs regeneration" />
                      ) : out.metadata?.isEdited ? (
                        <span className="text-[10px] opacity-80">✎</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Generated" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Format Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeFormatDef?.name}
                  </span>
                  <span>•</span>
                  <span>{activeOutputItem?.metadata?.wordCount || 0} words</span>
                  <span>•</span>
                  <span>{activeOutputItem?.metadata?.charCount || 0} chars</span>
                  {activeOutputItem?.metadata?.isEdited && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Edited by human ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsEditingActiveOutput(!isEditingActiveOutput)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      isEditingActiveOutput
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isEditingActiveOutput ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditingActiveOutput ? 'Done Editing' : 'Edit Output'}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyActive}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      copiedId === activeOutputFormat
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {copiedId === activeOutputFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === activeOutputFormat ? 'Copied ✓' : 'Copy'}</span>
                  </button>

                  {/* Regenerate Single Format */}
                  <button
                    type="button"
                    onClick={() => handleRegenerateSingle(activeOutputFormat)}
                    disabled={regeneratingFormatId === activeOutputFormat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Regenerate only this format"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${regeneratingFormatId === activeOutputFormat ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Format-Specific Active Renderer */}
              {activeOutputItem && (
                <div className="space-y-4">
                  {activeOutputItem.status === OUTPUT_STATUSES.NEEDS_REGENERATION ? (
                    /* Partial Failure Notice Card */
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 text-center space-y-3">
                      <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        This format needs regeneration
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                        {activeOutputItem.metadata?.errorReason || 'Output synthesis did not meet validation standards.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRegenerateSingle(activeOutputFormat)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-colors"
                      >
                        Regenerate Now
                      </button>
                    </div>
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.LINKEDIN ? (
                    <LinkedInPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                      audience={targetAudience}
                      tone={tone}
                      language={language}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.TWITTER ? (
                    <TwitterPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                      audience={targetAudience}
                      language={language}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY ? (
                    <ExecutiveSummaryPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                      audience={targetAudience}
                      tone={tone}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.ADVISORY ? (
                    <AdvisoryPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                      audience={targetAudience}
                      tone={tone}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.INFOGRAPHIC ? (
                    <InfographicPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                      audience={targetAudience}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.PRESENTATION ? (
                    <PresentationPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                    />
                  ) : activeOutputFormat === OUTPUT_FORMAT_IDS.VIDEO_SCRIPT ? (
                    <VideoScriptPreview
                      content={activeOutputItem.content}
                      isEditing={isEditingActiveOutput}
                      onUpdateContent={handleUpdateActiveContent}
                    />
                  ) : null}
                </div>
              )}

              {/* Bottom Handoff Strip: Modules 4 & 5 Ready Notice (Requirement 25) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Transformation Engine Complete (Module 3)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Standard Contract Ready
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Structured outputs ready for Module 4 (Social & Communication) and Module 5 (Visual & Slide Export).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowContractModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
                  >
                    <Code className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspect Output JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAllBundle}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-300/40 dark:shadow-indigo-950 active:scale-[0.99]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Formats</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Transformation Data Contract Modal */}
      <TransformationDataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        transformationResult={transformationResult}
      />

    </div>
  );
}
