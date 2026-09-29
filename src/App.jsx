import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import SourceInput from './components/SourceInput';
import TransformationControls from './components/TransformationControls';
import ProgressIndicator from './components/ProgressIndicator';
import ContextIntentCard from './components/ContextIntentCard';
import GeneratedCard from './components/GeneratedCard';
import ValueSection from './components/ValueSection';
import HistoryView from './components/HistoryView';
import AboutView from './components/AboutView';
import Footer from './components/Footer';
import { DEMO_SCENARIOS, INITIAL_HISTORY } from './data/demoScenarios';
import { generateContent } from './services/transformationService';
import { 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Download, 
  Check, 
  ArrowDown, 
  Layers, 
  CheckCircle2, 
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'history' | 'about'

  // Input & Configuration State
  const [source, setSource] = useState(DEMO_SCENARIOS[0].source);
  const [audience, setAudience] = useState('General Public');
  const [tone, setTone] = useState('Informative');
  const [language, setLanguage] = useState('English');
  const [selectedFormats, setSelectedFormats] = useState([
    'Social Media Post',
    'Short Brief',
    'Email'
  ]);

  // Generation & Pipeline State
  const [isTransforming, setIsTransforming] = useState(false);
  const [progressState, setProgressState] = useState({
    step: 1,
    title: '',
    detail: ''
  });
  const [contextSummary, setContextSummary] = useState(null);
  const [artefacts, setArtefacts] = useState([]);
  
  // Validation Errors
  const [sourceError, setSourceError] = useState('');
  const [formatError, setFormatError] = useState('');
  
  // Global Notifications & History
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [historyItems, setHistoryItems] = useState(INITIAL_HISTORY);

  const resultsRef = useRef(null);

  // Load a demo scenario
  const handleLoadScenario = (scenario) => {
    setSource(scenario.source);
    setAudience(scenario.audience);
    setTone(scenario.tone);
    setLanguage(scenario.language);
    setSelectedFormats(scenario.selectedFormats);
    setSourceError('');
    setFormatError('');
  };

  // Reset workspace
  const handleReset = () => {
    setSource('');
    setAudience('General Public');
    setTone('Informative');
    setLanguage('English');
    setSelectedFormats(['Social Media Post', 'Short Brief', 'Email']);
    setArtefacts([]);
    setContextSummary(null);
    setSourceError('');
    setFormatError('');
  };

  // Run Transformation
  const handleTransform = async () => {
    let hasError = false;

    if (!source || !source.trim()) {
      setSourceError('Please enter or load source information first.');
      hasError = true;
    } else {
      setSourceError('');
    }

    if (!selectedFormats || selectedFormats.length === 0) {
      setFormatError('Select at least one communication format.');
      hasError = true;
    } else {
      setFormatError('');
    }

    if (hasError) return;

    setIsTransforming(true);

    try {
      const result = await generateContent({
        source,
        audience,
        tone,
        language,
        formats: selectedFormats,
        onProgress: (prog) => {
          setProgressState(prog);
        }
      });

      setContextSummary(result.contextSummary);
      setArtefacts(result.artefacts);

      // Add to session history
      const newHistoryEntry = {
        id: `hist-${Date.now()}`,
        title: `${result.contextSummary.domain} (${result.contextSummary.intent})`,
        category: result.contextSummary.domain,
        sourceSnippet: source.slice(0, 110) + '...',
        source: source,
        audience,
        tone,
        language,
        formatsCount: result.artefacts.length,
        formats: selectedFormats,
        timestamp: 'Just now',
        verified: true
      };

      setHistoryItems([newHistoryEntry, ...historyItems]);

      // Scroll to results smoothly
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Transformation error:', err);
      setSourceError(err.message || 'An error occurred during transformation.');
    } finally {
      setIsTransforming(false);
    }
  };

  // Update single artefact content after human edit
  const handleUpdateArtefactContent = (id, newContent) => {
    setArtefacts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              content: newContent,
              isEdited: true,
              wordCount: newContent.split(/\s+/).filter(Boolean).length,
              charCount: newContent.length
            }
          : item
      )
    );
  };

  // Copy all generated artefacts together
  const handleCopyAll = async () => {
    if (artefacts.length === 0) return;
    const combined = artefacts
      .map(
        (a) =>
          `==============================\n` +
          `FORMAT: ${a.format.toUpperCase()}\n` +
          `AUDIENCE: ${a.audience} | TONE: ${a.tone} | LANGUAGE: ${a.language}\n` +
          `==============================\n\n` +
          `${a.content}\n\n`
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(combined);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2000);
    } catch (err) {
      console.error('Copy all failed: ', err);
    }
  };

  // Download all artefacts in one bundle
  const handleDownloadAll = () => {
    if (artefacts.length === 0) return;
    const combined = artefacts
      .map(
        (a) =>
          `==============================\n` +
          `FORMAT: ${a.format.toUpperCase()}\n` +
          `AUDIENCE: ${a.audience} | TONE: ${a.tone} | LANGUAGE: ${a.language}\n` +
          `==============================\n\n` +
          `${a.content}\n\n`
      )
      .join('\n');

    const element = document.createElement('a');
    const file = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `infoflip_bundle_${language.toLowerCase()}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle clicking a history item
  const handleSelectHistoryItem = (item) => {
    setSource(item.source || item.sourceSnippet);
    setAudience(item.audience || 'General Public');
    setTone(item.tone || 'Informative');
    setLanguage(item.language || 'English');
    if (item.formats) {
      setSelectedFormats(item.formats);
    }
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'history' ? (
          <HistoryView
            historyItems={historyItems}
            onSelectHistoryItem={handleSelectHistoryItem}
            onBackToWorkspace={() => setActiveTab('workspace')}
          />
        ) : activeTab === 'about' ? (
          <AboutView 
            onStartTransforming={() => setActiveTab('workspace')} 
          />
        ) : (
          /* WORKSPACE TAB */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Hero / Header Section */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    GenAI Content Transformation Platform
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">
                    Transform one source into audience-specific communication content.
                  </p>
                </div>

                {/* Quick actions top bar */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadScenario(DEMO_SCENARIOS[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition-colors"
                    title="Reset workspace"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Concept reminder banner */}
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-900 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700">SIH26154 Concept Flow:</span>
                  <span className="text-slate-600">
                    1 Source ➔ Understand Context & Intent ➔ Configure Transformation ➔ Generate Formats ➔ Human Review
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Audited & Verifiable</span>
                </div>
              </div>
            </div>

            {/* Input Grid: Section 1 & Section 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Source Information (5 cols) */}
              <div className="lg:col-span-6 space-y-6">
                <SourceInput
                  source={source}
                  setSource={setSource}
                  onLoadScenario={handleLoadScenario}
                  error={sourceError}
                />
              </div>

              {/* Right Column: Transformation Controls (7 cols) */}
              <div className="lg:col-span-6 space-y-6">
                <TransformationControls
                  audience={audience}
                  setAudience={setAudience}
                  tone={tone}
                  setTone={setTone}
                  language={language}
                  setLanguage={setLanguage}
                  selectedFormats={selectedFormats}
                  setSelectedFormats={setSelectedFormats}
                  onTransform={handleTransform}
                  isTransforming={isTransforming}
                  formatError={formatError}
                />
              </div>

            </div>

            {/* In-Flight Pipeline Indicator */}
            {isTransforming && (
              <ProgressIndicator
                currentStep={progressState.step}
                stepTitle={progressState.title}
                stepDetail={progressState.detail}
              />
            )}

            {/* Results Section */}
            <div ref={resultsRef} className="mt-10">
              {artefacts.length > 0 ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* AI Understanding Diagnostic Card */}
                  <ContextIntentCard contextSummary={contextSummary} />

                  {/* Results Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          Generated Communication
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                          {artefacts.length} Artefacts
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        1 source transformed into {artefacts.length} communication artefacts for <strong className="text-slate-800">{audience}</strong> in <strong className="text-slate-800">{language}</strong>.
                      </p>
                    </div>

                    {/* Batch Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyAll}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                          copyAllSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {copyAllSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>All Copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy All</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadAll}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Download Bundle</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New</span>
                      </button>
                    </div>
                  </div>

                  {/* Artefacts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {artefacts.map((artefact) => (
                      <GeneratedCard
                        key={artefact.id}
                        artefact={artefact}
                        onUpdateContent={handleUpdateArtefactContent}
                      />
                    ))}
                  </div>

                  {/* Human in the loop confirmation notice */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Human Review Active:</strong> Every generated artefact can be directly edited above before release. All modifications are tracked to guarantee complete editorial control.
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty State (Before Generation) */
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Your transformed communication will appear here.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Configure your audience, tone, language and output formats, then click <strong className="text-indigo-600">✦ Transform Content</strong> to see the GenAI engine synthesize your artefacts.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleLoadScenario(DEMO_SCENARIOS[0])}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Load Preloaded Weather Emergency Scenario</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SIH Impact & Value Section */}
            <ValueSection />

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onReset={handleReset} />

    </div>
  );
}
