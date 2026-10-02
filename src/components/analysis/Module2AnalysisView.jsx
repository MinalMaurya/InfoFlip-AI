import React, { useState, useEffect } from 'react';
import OverviewCard from './OverviewCard.jsx';
import IntentAudienceCard from './IntentAudienceCard.jsx';
import KeyFactsCard from './KeyFactsCard.jsx';
import EntitiesCard from './EntitiesCard.jsx';
import DatesNumbersCard from './DatesNumbersCard.jsx';
import ToneUrgencyCard from './ToneUrgencyCard.jsx';
import ClaimsCard from './ClaimsCard.jsx';
import KeywordsTopicsCard from './KeywordsTopicsCard.jsx';
import SourceTraceabilityCard from './SourceTraceabilityCard.jsx';
import ContextOverview from './ContextOverview.jsx';
import AnalysisLoadingTracker from './AnalysisLoadingTracker.jsx';
import AnalysisDataContractModal from './AnalysisDataContractModal.jsx';
import { analyzeContent, SAMPLE_ANALYSIS } from '../../services/analysisService.js';
import { SAMPLE_PRESETS } from '../../services/ingestionService.js';
import { getActiveAIProvider } from '../../services/ai/providerRegistry.js';
import { createSourcePayload } from '../../types/source.js';
import { 
  ArrowRight, 
  RotateCcw, 
  Code, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  BrainCircuit,
  PlusCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Module2AnalysisView({
  sourceData,
  onContinueToTransform,
  onBackToInput
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    step: 1,
    title: 'Understanding your content...',
    detail: 'Reading source document...'
  });
  const [error, setError] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);

  // Automatically trigger analysis if sourceData is provided and not yet analyzed
  useEffect(() => {
    if (sourceData && !analysis && !loadingState.isLoading && !error) {
      handleRunAnalysis(sourceData);
    }
  }, [sourceData]);

  const handleRunAnalysis = async (dataToAnalyze = sourceData) => {
    if (!dataToAnalyze) return;

    setLoadingState({
      isLoading: true,
      step: 1,
      title: 'Understanding your content...',
      detail: 'Reading source document...'
    });
    setError(null);

    try {
      const result = await analyzeContent(dataToAnalyze, {
        onProgress: (prog) => {
          setLoadingState({
            isLoading: true,
            step: prog.step,
            title: prog.title,
            detail: prog.detail
          });
        }
      });
      setAnalysis(result);
    } catch (err) {
      console.error('Module 2 analysis error:', err);
      setError(err.message || "We couldn't analyze this content. The source is still available and no content has been lost.");
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Preloaded sample analysis loader
  const handleLoadSampleAnalysis = () => {
    setAnalysis(SAMPLE_ANALYSIS);
    setError(null);
  };

  // Re-run analysis
  const handleReanalyze = () => {
    if (sourceData) {
      handleRunAnalysis(sourceData);
    } else {
      handleLoadSampleAnalysis();
    }
  };

  const activeProvider = getActiveAIProvider();
  const providerLabel = activeProvider?.name === 'GeminiAIProvider' ? 'Gemini 3.8 Flash' : 'Deterministic fallback';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      
      {/* Page Header (Pass 2 UI Refinement) */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                UNDERSTAND
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Content Understanding
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Analyze the source for topic, intent, entities, key facts, audience signals, and other contextual information before transformation.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {analysis && (
              <>
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Inspect Module 2 Structured Analysis Contract"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Analysis JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={loadingState.isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  title="Re-run AI analysis"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Re-analyze</span>
                </button>
              </>
            )}

            {onContinueToTransform && analysis && (
              <button
                type="button"
                onClick={() => onContinueToTransform({ source: sourceData, analysis })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Continue to Transform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loadingState.isLoading ? (
        /* Loading Experience (Requirement 15) */
        <div className="py-12">
          <AnalysisLoadingTracker
            currentStep={loadingState.step}
            title={loadingState.title}
            detail={loadingState.detail}
          />
        </div>
      ) : error ? (
        /* Error State (Requirement 16) */
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              We couldn't analyze this content
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {error}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
              ✓ The source is still available and no content has been lost.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReanalyze}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Try Again
            </button>
            {onBackToInput && (
              <button
                type="button"
                onClick={onBackToInput}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Back to Source Input
              </button>
            )}
          </div>
        </div>
      ) : !analysis ? (
        /* Empty State: No Source Loaded */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Awaiting Source Content for Understanding
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Module 2 requires structured source data from Module 1 (Smart Input & Ingestion) to identify topics, intent, facts, and audience signals.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {onBackToInput && (
              <button
                type="button"
                onClick={onBackToInput}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Go to Module 1 (Input)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleLoadSampleAnalysis}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Load Pre-Analyzed Weather Sample</span>
            </button>
          </div>
        </div>
      ) : (
        /* ANALYSIS DASHBOARD (Pass 2 UI Refined) */
        <div className="space-y-6">
          
          {/* Analysis Status Bar (Section 3.2) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Analysis completed
              </span>
              {typeof analysis.confidence?.overall === 'number' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {Math.round(analysis.confidence.overall * 100)}% Confidence
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Provider: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{providerLabel}</strong>
              </span>
            </div>
          </div>

          {/* Section 1: Summary — Strongest Primary Hero Card (Section 3.3) */}
          <OverviewCard 
            overview={analysis.overview} 
            confidence={analysis.confidence} 
          />

          {/* Section 2: Context Overview (Section 3.4) */}
          <ContextOverview 
            analysis={analysis} 
          />

          {/* Section 3: Grounded Key Facts & Recognized Entities (Section 3.5 & 3.6) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <KeyFactsCard 
              keyFacts={analysis.keyFacts} 
            />
            <EntitiesCard 
              entities={analysis.entities} 
            />
          </div>

          {/* Section 4: Intent, Audience, Tone & Urgency Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <IntentAudienceCard 
              intent={analysis.intent} 
              audience={analysis.audience} 
            />
            <ToneUrgencyCard 
              tone={analysis.tone} 
              urgency={analysis.urgency} 
            />
          </div>

          {/* Section 5: Dates & Numbers & Claims Separation (Section 3.7 & 3.8) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <DatesNumbersCard 
              importantDates={analysis.importantDates} 
              importantNumbers={analysis.importantNumbers} 
            />
            <ClaimsCard 
              claims={analysis.claims} 
            />
          </div>

          {/* Section 6: Keywords & Topics (Section 3.9) */}
          <KeywordsTopicsCard 
            keywords={analysis.keywords} 
            topics={analysis.topics} 
          />

          {/* Section 7: Source Traceability (Section 3.11) */}
          <SourceTraceabilityCard
            sourceData={sourceData}
            traceability={analysis.sourceTraceability}
          />

          {/* Bottom Action Strip: Continue to Module 3 (Section 3.13) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Ready for Content Transformation (Module 3)</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Verified
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pass structured source context and verified facts to Module 3 for multi-format synthesis.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect JSON</span>
              </button>

              {onContinueToTransform && (
                <button
                  type="button"
                  onClick={() => onContinueToTransform({ source: sourceData, analysis })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-300/40 dark:shadow-indigo-950 active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span>Continue to Transform →</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Analysis Data Contract Modal */}
      <AnalysisDataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        analysisData={analysis}
      />

    </div>
  );
}
