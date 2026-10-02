import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Module1CreateView from './components/input/Module1CreateView';
import Module2AnalysisView from './components/analysis/Module2AnalysisView';
import Module3TransformView from './components/transformation/Module3TransformView';
import HistoryView from './components/HistoryView';
import AboutView from './components/AboutView';
import Footer from './components/Footer';
import DataContractModal from './components/input/DataContractModal';
import AnalysisDataContractModal from './components/analysis/AnalysisDataContractModal';
import { DEMO_SCENARIOS, INITIAL_HISTORY } from './data/demoScenarios';
import { SAMPLE_ANALYSIS } from './services/analysisService';
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
  AlertCircle,
  FileCheck2,
  Code,
  PlusCircle,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';

export default function App() {
  // Navigation State: 'create' (Module 1) | 'understand' (Module 2) | 'workspace' (Module 3 & Transformation) | 'history' | 'about'
  const [activeTab, setActiveTab] = useState('create');

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

  // Ingested Data Contract from Module 1
  const [ingestedContract, setIngestedContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);

  // Analysis Data Contract from Module 2 (AI Content Understanding)
  const [analysisData, setAnalysisData] = useState(null);
  const [showAnalysisContractModal, setShowAnalysisContractModal] = useState(false);

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
    setIngestedContract(null);
    setAnalysisData(null);
    setSourceError('');
    setFormatError('');
  };

  // Handle Handoff from Module 1 (Smart Input & Ingestion) to Module 2
  const handleProceedToModule2 = (contract) => {
    if (!contract) return;
    setIngestedContract(contract);
    setSource(contract.extractedText || contract.rawText);

    if (contract.metadata?.detectedLanguage && ['English', 'Hindi', 'Marathi'].includes(contract.metadata.detectedLanguage)) {
      setLanguage(contract.metadata.detectedLanguage);
    }

    setSourceError('');
    setFormatError('');

    // Switch to Module 2 AI Understanding tab
    setActiveTab('understand');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Handoff from Module 2 (AI Content Understanding) to Module 3 (Transformation)
  const handleContinueToTransform = ({ source: src, analysis }) => {
    if (analysis) {
      setAnalysisData(analysis);
      if (src) {
        setIngestedContract(src);
        setSource(src.extractedText || src.rawText);
      }
      if (analysis.audience?.detected?.length > 0 && analysis.audience.detected[0] !== 'Not detected') {
        setAudience(analysis.audience.detected[0]);
      }
      if (analysis.tone?.primary) {
        setTone(analysis.tone.primary);
      }
      if (analysis.language?.name && ['English', 'Hindi', 'Marathi'].includes(analysis.language.name)) {
        setLanguage(analysis.language.name);
      }
    }
    setActiveTab('transform');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Run Transformation (Module 2 AI Understanding -> Downstream Formats)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'create' ? (
          /* MODULE 1: SMART INPUT & CONTENT INGESTION */
          <Module1CreateView
            initialSource={source}
            onProceedToModule2={handleProceedToModule2}
          />
        ) : activeTab === 'understand' ? (
          /* MODULE 2: AI CONTENT UNDERSTANDING & ANALYSIS */
          <Module2AnalysisView
            sourceData={ingestedContract || (source ? {
              sourceId: `src-direct-${Date.now()}`,
              sourceType: 'text',
              fileName: 'Pasted Text Source',
              rawText: source,
              extractedText: source,
              metadata: {
                wordCount: source.split(/\s+/).filter(Boolean).length,
                characterCount: source.length
              },
              createdAt: new Date().toISOString()
            } : null)}
            onContinueToTransform={handleContinueToTransform}
            onBackToInput={() => setActiveTab('create')}
          />
        ) : activeTab === 'history' ? (
          <HistoryView
            historyItems={historyItems}
            onSelectHistoryItem={handleSelectHistoryItem}
            onBackToWorkspace={() => setActiveTab('transform')}
          />
        ) : activeTab === 'about' ? (
          <AboutView 
            onStartTransforming={() => setActiveTab('create')} 
          />
        ) : (
          /* MODULE 3: TRANSFORMATION & OUTPUT ENGINE (activeTab === 'transform' || 'workspace') */
          <Module3TransformView
            sourceData={ingestedContract || (source ? {
              sourceId: `src-direct-${Date.now()}`,
              sourceType: 'text',
              fileName: 'Active Source Document',
              rawText: source,
              extractedText: source,
              metadata: {
                wordCount: source.split(/\s+/).filter(Boolean).length,
                characterCount: source.length
              },
              createdAt: new Date().toISOString()
            } : null)}
            analysisData={analysisData}
            onBackToInput={() => setActiveTab('create')}
            onBackToUnderstand={() => setActiveTab('understand')}
            onLoadDemo={() => {
              handleLoadScenario(DEMO_SCENARIOS[0]);
              setAnalysisData(SAMPLE_ANALYSIS);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onReset={handleReset} />

      {/* Ingestion Data Contract Inspection Modal */}
      <DataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        contractData={ingestedContract}
      />

      {/* Analysis Data Contract Inspection Modal */}
      <AnalysisDataContractModal
        isOpen={showAnalysisContractModal}
        onClose={() => setShowAnalysisContractModal(false)}
        analysisData={analysisData}
      />

    </div>
  );
}
