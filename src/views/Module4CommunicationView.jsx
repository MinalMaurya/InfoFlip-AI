import React, { useState, useEffect } from 'react';
import PipelineStepIndicator from '../components/input/PipelineStepIndicator.jsx';
import CommunicationProgressTracker from '../components/communication/CommunicationProgressTracker.jsx';
import CommunicationDataContractModal from '../components/communication/CommunicationDataContractModal.jsx';

// Previews
import LinkedInCommunicationPreview from '../components/communication/LinkedInCommunicationPreview.jsx';
import TwitterCommunicationPreview from '../components/communication/TwitterCommunicationPreview.jsx';
import WhatsAppPreview from '../components/communication/WhatsAppPreview.jsx';
import EmailPreview from '../components/communication/EmailPreview.jsx';
import SMSPreview from '../components/communication/SMSPreview.jsx';
import AnnouncementPreview from '../components/communication/AnnouncementPreview.jsx';
import CTASection from '../components/communication/CTASection.jsx';
import HashtagSection from '../components/communication/HashtagSection.jsx';

import { 
  generateCommunication, 
  regenerateSingleChannel, 
  updateOutputContent 
} from '../services/communication/communicationService.js';
import { 
  getAllCommunicationChannels, 
  getCommunicationChannelById 
} from '../services/communication/communicationChannelRegistry.js';
import { 
  COMMUNICATION_CHANNEL_IDS, 
  ALL_COMMUNICATION_CHANNELS 
} from '../types/communication.js';

import { 
  Share2, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Send, 
  Megaphone, 
  MousePointerClick, 
  Hash, 
  Check, 
  Copy, 
  RefreshCw, 
  Edit3, 
  Save, 
  Download, 
  Code, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Sliders, 
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';

const ICON_MAP = {
  Share2: Share2,
  MessageSquare: MessageSquare,
  Smartphone: Smartphone,
  Mail: Mail,
  Send: Send,
  Megaphone: Megaphone,
  MousePointerClick: MousePointerClick,
  Hash: Hash
};

export default function Module4CommunicationView({
  sourceData,
  analysisData,
  transformationResult,
  onBackToInput,
  onBackToUnderstand,
  onBackToTransform,
  onProceedToModule5,
  onLoadDemo
}) {
  // Selected channels state (default: all 8 channels)
  const [selectedChannels, setSelectedChannels] = useState([
    COMMUNICATION_CHANNEL_IDS.LINKEDIN,
    COMMUNICATION_CHANNEL_IDS.TWITTER,
    COMMUNICATION_CHANNEL_IDS.WHATSAPP,
    COMMUNICATION_CHANNEL_IDS.EMAIL,
    COMMUNICATION_CHANNEL_IDS.SMS,
    COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT,
    COMMUNICATION_CHANNEL_IDS.CTA,
    COMMUNICATION_CHANNEL_IDS.HASHTAGS
  ]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState({
    step: 1,
    title: '',
    detail: ''
  });
  const [communicationResult, setCommunicationResult] = useState(null);
  const [activeChannelTab, setActiveChannelTab] = useState(COMMUNICATION_CHANNEL_IDS.LINKEDIN);
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [regeneratingChannelId, setRegeneratingChannelId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showTraceabilityFor, setShowTraceabilityFor] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [showModule5Modal, setShowModule5Modal] = useState(false);

  // Sync active channel tab if selected channels change
  useEffect(() => {
    if (selectedChannels.length > 0 && !selectedChannels.includes(activeChannelTab)) {
      setActiveChannelTab(selectedChannels[0]);
    }
  }, [selectedChannels]);

  // Handle Channel Selection Toggling
  const handleToggleChannel = (channelId) => {
    setGeneralError(null);
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length === 1) {
        setGeneralError('At least one communication channel must remain selected.');
        return;
      }
      setSelectedChannels(selectedChannels.filter(c => c !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleSelectAllChannels = () => {
    setGeneralError(null);
    setSelectedChannels(ALL_COMMUNICATION_CHANNELS);
  };

  const handleClearChannels = () => {
    if (ALL_COMMUNICATION_CHANNELS.length > 0) {
      setSelectedChannels([ALL_COMMUNICATION_CHANNELS[0]]);
    }
  };

  // Generate All Selected Channels
  const handleGenerate = async () => {
    setGeneralError(null);
    setIsGenerating(true);
    setIsEditingActive(false);

    try {
      const requestPayload = {
        sourceId: sourceData?.sourceId || 'src-1',
        transformationId: transformationResult?.transformationId || 'trans-1',
        analysisId: analysisData?.analysisId || 'ana-1',
        sourceContent: sourceData || {},
        analysis: analysisData || {},
        transformationOutputs: transformationResult?.outputs || [],
        config: {
          targetAudience: transformationResult?.configuration?.targetAudience?.[0] || 'General Public',
          tone: transformationResult?.configuration?.tone || 'Informative',
          language: transformationResult?.configuration?.language || 'English',
          detailLevel: transformationResult?.configuration?.detailLevel || 'Balanced',
          objective: transformationResult?.configuration?.objective || 'Inform',
          style: transformationResult?.configuration?.contentStyle || 'Structured'
        },
        requestedChannels: selectedChannels
      };

      const result = await generateCommunication(requestPayload, {
        onProgress: (prog) => {
          setProgressState(prog);
        }
      });

      setCommunicationResult(result);
      if (result.outputs.length > 0) {
        setActiveChannelTab(result.outputs[0].channelId);
      }
    } catch (err) {
      console.error('Communication generation error:', err);
      setGeneralError(err.message || 'An error occurred during communication generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate Single Channel
  const handleRegenerateSingle = async (channelId) => {
    if (!communicationResult) return;
    setRegeneratingChannelId(channelId);
    setGeneralError(null);

    try {
      const existingItem = communicationResult.outputs.find(o => o.channelId === channelId);
      const outputId = existingItem?.outputId;

      const baseRequest = {
        sourceId: sourceData?.sourceId || communicationResult.sourceId,
        transformationId: transformationResult?.transformationId || communicationResult.transformationId,
        analysisId: analysisData?.analysisId || communicationResult.analysisId,
        sourceContent: sourceData || {},
        analysis: analysisData || {},
        transformationOutputs: transformationResult?.outputs || [],
        config: {
          targetAudience: transformationResult?.configuration?.targetAudience?.[0] || 'General Public',
          tone: transformationResult?.configuration?.tone || 'Informative',
          language: transformationResult?.configuration?.language || 'English',
          detailLevel: transformationResult?.configuration?.detailLevel || 'Balanced',
          objective: transformationResult?.configuration?.objective || 'Inform',
          style: transformationResult?.configuration?.contentStyle || 'Structured'
        }
      };

      const updatedItem = await regenerateSingleChannel(baseRequest, outputId, channelId);

      setCommunicationResult(prev => ({
        ...prev,
        outputs: prev.outputs.map(o => o.channelId === channelId ? updatedItem : o)
      }));
    } catch (err) {
      console.error(`Regeneration error for ${channelId}:`, err);
      setGeneralError(`Failed to regenerate ${channelId}: ${err.message}`);
    } finally {
      setRegeneratingChannelId(null);
    }
  };

  // Update Active Output Content from Edit Mode
  const handleUpdateActiveContent = (newContent) => {
    if (!communicationResult) return;
    const activeItem = communicationResult.outputs.find(o => o.channelId === activeChannelTab);
    if (!activeItem) return;

    const updated = updateOutputContent(activeItem, newContent);

    setCommunicationResult(prev => ({
      ...prev,
      outputs: prev.outputs.map(o => o.channelId === activeChannelTab ? updated : o)
    }));
  };

  // Copy Single Output Item
  const handleCopySingle = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.outputId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  // Copy All Generated Assets
  const handleCopyAll = async () => {
    if (!communicationResult || communicationResult.outputs.length === 0) return;
    const bundle = communicationResult.outputs.map(o => {
      const def = getCommunicationChannelById(o.channelId);
      return `========================================\nCHANNEL: ${(def?.name || o.channelId).toUpperCase()}\nPROVIDER: ${o.metadata?.provider || 'InfoFlip'}\n========================================\n\n${o.content}\n\n`;
    }).join('\n');

    try {
      await navigator.clipboard.writeText(bundle);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  // Download All Assets Bundle
  const handleDownloadAllBundle = () => {
    if (!communicationResult || communicationResult.outputs.length === 0) return;
    const bundle = communicationResult.outputs.map(o => {
      const def = getCommunicationChannelById(o.channelId);
      return `========================================\nCHANNEL: ${(def?.name || o.channelId).toUpperCase()}\nPROVIDER: ${o.metadata?.provider || 'InfoFlip'}\n========================================\n\n${o.content}\n\n`;
    }).join('\n');

    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infoflip_communications_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset Communication Result
  const handleReset = () => {
    setCommunicationResult(null);
    setIsEditingActive(false);
    setGeneralError(null);
  };

  // Active Output Item
  const activeOutputItem = communicationResult?.outputs?.find(o => o.channelId === activeChannelTab);
  const activeChannelDef = getCommunicationChannelById(activeChannelTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Module 4 Pipeline Step Indicator */}
      <PipelineStepIndicator activeModule={4} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>SIH 26154 • Module 4 Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Social & Communication Generator
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Specialize Module 3 structured transformations into platform-specific, communication-ready assets across 8 channels.
          </p>
        </div>
      </div>

      {/* Source & Transformation Context Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Topic: </span>
            <span>{analysisData?.overview?.mainTopic || 'General Document'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Source ID: </span>
            <span className="font-mono">{sourceData?.sourceId || 'src-direct'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Trans ID: </span>
            <span className="font-mono">{transformationResult?.transformationId || 'trans-active'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Language: </span>
            <span>{transformationResult?.configuration?.language || 'English'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Tone: </span>
            <span>{transformationResult?.configuration?.tone || 'Informative'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToTransform && (
            <button
              type="button"
              onClick={onBackToTransform}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Transform</span>
            </button>
          )}

          {(!sourceData || !transformationResult) && onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {generalError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-xs font-bold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Channel Selector Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Target Communication Channels</span>
              <span className="text-xs font-normal text-slate-400">
                ({selectedChannels.length} of {ALL_COMMUNICATION_CHANNELS.length} selected)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select which communication formats to generate from the Module 3 transformation outputs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllChannels}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={handleClearChannels}
              className="text-xs font-semibold text-slate-500 hover:underline px-2 py-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 8 Channels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {getAllCommunicationChannels().map((channel) => {
            const Icon = ICON_MAP[channel.iconName] || MessageSquare;
            const isSelected = selectedChannels.includes(channel.id);

            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleToggleChannel(channel.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-2xs ring-1 ring-indigo-400/30'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <span className={`text-xs font-bold block truncate ${
                    isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {channel.shortName}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                    {channel.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Grounding engine active • Anti-hallucination verified
          </span>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || selectedChannels.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-300/40 dark:shadow-indigo-950 disabled:opacity-50 transition-all active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Assets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {selectedChannels.length} Channels</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Tracker during generation */}
      {isGenerating && (
        <CommunicationProgressTracker
          progressState={progressState}
          requestedChannels={selectedChannels}
        />
      )}

      {/* Generated Outputs Area */}
      {communicationResult && !isGenerating && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Bar for Results: Channel Tabs & Global Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {/* Horizontal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
              {communicationResult.outputs.map((out) => {
                const def = getCommunicationChannelById(out.channelId);
                const Icon = ICON_MAP[def?.iconName] || MessageSquare;
                const isActive = activeChannelTab === out.channelId;

                return (
                  <button
                    key={out.channelId}
                    type="button"
                    onClick={() => {
                      setActiveChannelTab(out.channelId);
                      setIsEditingActive(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{def?.shortName || out.channelId}</span>
                    {out.validation?.warnings?.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Channel has formatting warnings" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 px-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              >
                {copyAllSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copyAllSuccess ? 'All Copied!' : 'Copy All'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Reset generated outputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Active Channel Details Strip */}
          {activeOutputItem && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {activeChannelDef?.name || activeOutputItem.channelId}
                </span>

                {/* Provider Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  activeOutputItem.metadata?.isFallback
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  Provider: {activeOutputItem.metadata?.provider}
                  {activeOutputItem.metadata?.fallbackReason && ` (${activeOutputItem.metadata.fallbackReason})`}
                </span>

                {/* Character & Word count metrics */}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeOutputItem.metadata?.characterCount} chars • {activeOutputItem.metadata?.wordCount} words
                </span>

                {activeOutputItem.metadata?.isEdited && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    Edited by User
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Traceability Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTraceabilityFor(showTraceabilityFor === activeChannelTab ? null : activeChannelTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    showTraceabilityFor === activeChannelTab
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Traceability ({activeOutputItem.sourceTraceability?.length || 0})</span>
                </button>

                {/* Edit Toggle */}
                <button
                  type="button"
                  onClick={() => setIsEditingActive(!isEditingActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isEditingActive
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isEditingActive ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isEditingActive ? 'Save Changes' : 'Edit Content'}</span>
                </button>

                {/* Regenerate Single */}
                <button
                  type="button"
                  onClick={() => handleRegenerateSingle(activeChannelTab)}
                  disabled={regeneratingChannelId === activeChannelTab}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Regenerate only this channel"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${regeneratingChannelId === activeChannelTab ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                {/* Copy Single */}
                <button
                  type="button"
                  onClick={() => handleCopySingle(activeOutputItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  {copiedId === activeOutputItem.outputId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedId === activeOutputItem.outputId ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Warnings Callout if output has warnings */}
          {activeOutputItem?.validation?.warnings?.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{activeOutputItem.validation.warnings.join(' • ')}</span>
            </div>
          )}

          {/* Traceability Details Accordion */}
          {showTraceabilityFor === activeChannelTab && activeOutputItem?.sourceTraceability && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Anti-Hallucination Source Traceability Facts
                </span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  {activeOutputItem.sourceTraceability.length} Grounded References
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Every statement in this asset is directly verified against these ground-truth source extractions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activeOutputItem.sourceTraceability.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-[11px] text-slate-900 dark:text-slate-100">
                        {item.fact}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Origin: {item.origin || 'source'} • ID: {item.sourceId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Channel Component Renderer */}
          {activeOutputItem && (
            <div className="space-y-4">
              {activeChannelTab === COMMUNICATION_CHANNEL_IDS.LINKEDIN ? (
                <LinkedInCommunicationPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                  audience={transformationResult?.configuration?.targetAudience?.[0] || 'General Public'}
                  tone={transformationResult?.configuration?.tone || 'Informative'}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.TWITTER ? (
                <TwitterCommunicationPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.WHATSAPP ? (
                <WhatsAppPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.EMAIL ? (
                <EmailPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.SMS ? (
                <SMSPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.ANNOUNCEMENT ? (
                <AnnouncementPreview
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.CTA ? (
                <CTASection
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : activeChannelTab === COMMUNICATION_CHANNEL_IDS.HASHTAGS ? (
                <HashtagSection
                  content={activeOutputItem.content}
                  structuredData={activeOutputItem.structuredData}
                  isEditing={isEditingActive}
                  onUpdateContent={handleUpdateActiveContent}
                />
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-line">
                  {activeOutputItem.content}
                </div>
              )}
            </div>
          )}

          {/* Bottom Handoff Strip: Continue to Module 5 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Module 4 Communication Complete</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Standard Contract Ready
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Communication assets synthesized, grounded, and ready for human-in-the-loop review (Module 5).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect Communication JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAllBundle}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Assets</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onProceedToModule5) {
                    onProceedToModule5({
                      source: sourceData,
                      analysis: analysisData,
                      transformation: transformationResult,
                      communication: communicationResult
                    });
                  } else {
                    setShowModule5Modal(true);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-300/40 dark:shadow-emerald-950 active:scale-[0.99]"
              >
                <span>Continue to Module 5 (Review)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Communication Data Contract Modal */}
      <CommunicationDataContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        communicationResult={communicationResult}
      />

      {/* Module 5 Handoff Confirmation Modal */}
      {showModule5Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Ready for Module 5 (Review)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Module 4 has successfully produced grounded communication assets with full source traceability.
                Module 5 (Human-in-the-Loop Review) will consume this standard contract.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
              <div>Communication ID: {communicationResult?.communicationId}</div>
              <div>Outputs Generated: {communicationResult?.outputs?.length} channels</div>
              <div>Source ID: {communicationResult?.sourceId}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowModule5Modal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Close Notice
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
