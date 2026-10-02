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
import AnalysisLoadingTracker from './AnalysisLoadingTracker.jsx';
import AnalysisDataContractModal from './AnalysisDataContractModal.jsx';
import { analyzeContent, SAMPLE_ANALYSIS } from '../../services/analysisService.js';
import { SAMPLE_PRESETS } from '../../services/ingestionService.js';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      
      {/* Page Header (Requirement 10) */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                Module 2
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                SIH 2026 Problem Statement ID 26154
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Understand Your Content
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              AI analyzes your source to identify its topic, intent, audience, key facts, and important context before transformation.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {analysis && (
              <>
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                  title="Inspect Module 2 Structured Analysis Contract"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Analysis JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={loadingState.isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
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
        /* ANALYSIS DASHBOARD (Requirement 12) */
        <div className="space-y-6">
          
          {/* Source Traceability Strip (Requirement 13) */}
          <SourceTraceabilityCard
            sourceData={sourceData}
            traceability={analysis.sourceTraceability}
          />

          {/* Section 1: Overview & Intent/Audience */}
          <OverviewCard 
            overview={analysis.overview} 
            confidence={analysis.confidence} 
          />

          {/* Section 2: Intent & Audience Signals */}
          <IntentAudienceCard 
            intent={analysis.intent} 
            audience={analysis.audience} 
          />

          {/* Section 3: Tone & Urgency Signals */}
          <ToneUrgencyCard 
            tone={analysis.tone} 
            urgency={analysis.urgency} 
          />

          {/* Section 4: Grounded Key Facts */}
          <KeyFactsCard 
            keyFacts={analysis.keyFacts} 
          />

          {/* Section 5: Named Entities */}
          <EntitiesCard 
            entities={analysis.entities} 
          />

          {/* Section 6: Important Dates & Numbers */}
          <DatesNumbersCard 
            importantDates={analysis.importantDates} 
            importantNumbers={analysis.importantNumbers} 
          />

          {/* Section 7: Claims & Statements Separation */}
          <ClaimsCard 
            claims={analysis.claims} 
          />

          {/* Section 8: Keywords & Topics */}
          <KeywordsTopicsCard 
            keywords={analysis.keywords} 
            topics={analysis.topics} 
          />

          {/* Bottom Action Strip: Continue to Module 3 (Requirement 18) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Ready for Content Transformation (Module 3)</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Analysis Complete
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect JSON</span>
              </button>

              {onContinueToTransform && (
                <button
                  type="button"
                  onClick={() => onContinueToTransform({ source: sourceData, analysis })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-300/40 dark:shadow-indigo-950 active:scale-[0.99]"
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
