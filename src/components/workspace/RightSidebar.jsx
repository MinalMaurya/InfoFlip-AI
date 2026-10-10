import React, { useState } from 'react';
import {
  PanelRightClose,
  PanelRightOpen,
  X,
  Check,
  Sliders,
  Layers,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Share2,
  MessageSquare,
  Smartphone,
  Mail,
  Send,
  Megaphone,
  MousePointerClick,
  Hash,
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video
} from 'lucide-react';
import { WORKSPACE_FORMATS } from '../../services/workspace/chatPipelineOrchestrator.js';
import {
  TARGET_AUDIENCES,
  TRANSFORMATION_TONES,
  TRANSFORMATION_LANGUAGES,
  DETAIL_LEVELS,
  COMMUNICATION_OBJECTIVES,
  CONTENT_STYLES
} from '../../types/transformation.js';
import { DEFAULT_GENERATION_CONFIG } from '../../services/storage/workspaceStorageService.js';

const ICON_MAP = {
  Share2,
  MessageSquare,
  Smartphone,
  Mail,
  Send,
  Megaphone,
  MousePointerClick,
  Hash,
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video
};

export default function RightSidebar({
  config = DEFAULT_GENERATION_CONFIG,
  onUpdateConfig,
  isCollapsed = false,
  onCollapseDesktop,
  onExpandDesktop,
  onCloseMobileDrawer,
  isMobileDrawer = false
}) {
  const [expandedGroup, setExpandedGroup] = useState(null); // 'tone' | 'audience' | 'language' | 'detail' | 'objective' | null
  const [formatHint, setFormatHint] = useState('');

  const selectedFormats = Array.isArray(config?.selectedFormats)
    ? config.selectedFormats
    : DEFAULT_GENERATION_CONFIG.selectedFormats;

  const handleToggleFormat = (formatId) => {
    setFormatHint('');
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length === 1) {
        setFormatHint('Keep at least 1 format selected.');
        return;
      }
      onUpdateConfig({
        selectedFormats: selectedFormats.filter(f => f !== formatId)
      });
    } else {
      onUpdateConfig({
        selectedFormats: [...selectedFormats, formatId]
      });
    }
  };

  const handleSelectAllFormats = () => {
    setFormatHint('');
    onUpdateConfig({
      selectedFormats: WORKSPACE_FORMATS.map(f => f.id)
    });
  };

  const handleResetDefaults = () => {
    setFormatHint('');
    onUpdateConfig({ ...DEFAULT_GENERATION_CONFIG });
  };

  const toggleAccordion = (key) => {
    setExpandedGroup(prev => (prev === key ? null : key));
  };

  const socialAndMessagingFormats = WORKSPACE_FORMATS.filter(f => f.group === 'Social & Messaging');
  const briefsAndMediaFormats = WORKSPACE_FORMATS.filter(f => f.group === 'Briefs & Media');

  // ===========================================================================
  // COLLAPSED DESKTOP RIGHT ICON RAIL (Requirements A.7 – A.9)
  // ===========================================================================
  if (isCollapsed && !isMobileDrawer) {
    return (
      <aside
        aria-label="Collapsed Output Formats Rail"
        data-collapsed="true"
        className="h-full w-16 bg-sidebar-bg border-l border-border flex flex-col items-center select-none text-text-primary shrink-0 transition-colors"
      >
        {/* Top Direct Expand Control */}
        <div className="h-14 w-full flex flex-col items-center justify-center border-b border-border shrink-0">
          <button
            type="button"
            onClick={onExpandDesktop}
            aria-label="Expand right sidebar"
            title="Expand output formats & settings sidebar"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Formats Count Badge */}
        <div
          className="pt-2.5 pb-1 shrink-0"
          title={`${selectedFormats.length} output format(s) selected for generation`}
        >
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
            {selectedFormats.length}/{WORKSPACE_FORMATS.length}
          </span>
        </div>

        {/* Direct Format Selection Icon Rail (Toggle formats without expanding) */}
        <div
          role="group"
          aria-label="Quick output format toggles"
          className="flex-1 w-full overflow-y-auto px-2 py-1.5 flex flex-col items-center gap-1"
        >
          {WORKSPACE_FORMATS.map((fmt) => {
            const isSelected = selectedFormats.includes(fmt.id);
            const Icon = ICON_MAP[fmt.iconName] || FileText;

            return (
              <button
                key={fmt.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Toggle ${fmt.name}`}
                title={`${fmt.name} (${isSelected ? 'Selected — click to deselect' : 'Not selected — click to select'})`}
                onClick={() => handleToggleFormat(fmt.id)}
                className={`relative w-10 h-9 rounded-lg flex items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  isSelected
                    ? 'bg-surface-selected border-border text-text-primary'
                    : 'bg-transparent border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {isSelected && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xs"
                    aria-hidden="true"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Reset Control */}
        <div className="p-2 border-t border-border bg-sidebar-bg shrink-0 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={handleResetDefaults}
            aria-label="Reset output formats and settings to defaults"
            title="Reset output formats and settings to defaults"
            className="w-10 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  // ===========================================================================
  // EXPANDED RIGHT SIDEBAR (Desktop Expanded & Mobile Slide-Out Drawer)
  // ===========================================================================
  const renderFormatRow = (fmt) => {
    const isSelected = selectedFormats.includes(fmt.id);
    const Icon = ICON_MAP[fmt.iconName] || FileText;

    return (
      <div
        key={fmt.id}
        role="checkbox"
        aria-checked={isSelected}
        aria-label={fmt.name}
        tabIndex={0}
        onClick={() => handleToggleFormat(fmt.id)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggleFormat(fmt.id);
          }
        }}
        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
          isSelected
            ? 'bg-surface-selected border-border text-text-primary font-semibold'
            : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
          <span className="truncate">{fmt.name}</span>
        </div>

        <div
          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-input-border bg-input-bg'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>
    );
  };

  return (
    <aside
      aria-label="Output Formats and Generation Settings Sidebar"
      data-collapsed="false"
      className="h-full w-72 bg-sidebar-bg border-l border-border flex flex-col select-none text-text-primary transition-colors"
    >
      {/* Panel Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary dark:text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Output Config
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
            {selectedFormats.length} selected
          </span>
        </div>

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            aria-label="Close output settings drawer"
            title="Close output settings drawer"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCollapseDesktop}
            aria-label="Collapse right sidebar"
            title="Collapse right sidebar"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* A. Output-Format Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-primary">
              Output Formats
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAllFormats}
                className="font-semibold text-primary dark:text-accent hover:underline focus-visible:outline-none"
              >
                All ({WORKSPACE_FORMATS.length})
              </button>
              <span className="text-text-secondary">•</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="font-semibold text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none"
              >
                Defaults
              </button>
            </div>
          </div>

          {formatHint && (
            <p className="text-[11px] text-warning font-medium">
              {formatHint}
            </p>
          )}

          {/* Group 1: Social & Messaging (Module 4 + Module 3) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary px-0.5">
              Social & Messaging
            </span>
            <div className="space-y-1">
              {socialAndMessagingFormats.map(renderFormatRow)}
            </div>
          </div>

          {/* Group 2: Briefs & Media (Module 3) */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary px-0.5">
              Briefs, Decks & Scripts
            </span>
            <div className="space-y-1">
              {briefsAndMediaFormats.map(renderFormatRow)}
            </div>
          </div>
        </div>

        {/* B. Expandable Generation Settings */}
        <div className="pt-3 border-t border-divider space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary dark:text-accent" />
              <span>Generation Settings</span>
            </span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[10px] text-text-secondary hover:text-text-primary flex items-center gap-1 focus-visible:outline-none"
              title="Reset settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Tone Accordion */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => toggleAccordion('tone')}
              aria-expanded={expandedGroup === 'tone'}
              className="w-full px-3 py-2 flex items-center justify-between text-xs bg-surface hover:bg-surface-hover transition-colors focus-visible:outline-none"
            >
              <span className="font-semibold text-text-primary">Tone</span>
              <span className="flex items-center gap-1.5 text-primary dark:text-accent font-bold">
                <span>{config.tone}</span>
                {expandedGroup === 'tone' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>
            {expandedGroup === 'tone' && (
              <div className="p-2.5 bg-surface flex flex-wrap gap-1.5 border-t border-border">
                {TRANSFORMATION_TONES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateConfig({ tone: t })}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      config.tone === t
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-sidebar-bg text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Target Audience Accordion */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => toggleAccordion('audience')}
              aria-expanded={expandedGroup === 'audience'}
              className="w-full px-3 py-2 flex items-center justify-between text-xs bg-surface hover:bg-surface-hover transition-colors focus-visible:outline-none"
            >
              <span className="font-semibold text-text-primary">Target Audience</span>
              <span className="flex items-center gap-1.5 text-primary dark:text-accent font-bold truncate max-w-[120px]">
                <span className="truncate">{config.targetAudience}</span>
                {expandedGroup === 'audience' ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </span>
            </button>
            {expandedGroup === 'audience' && (
              <div className="p-2.5 bg-surface space-y-2 border-t border-border">
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_AUDIENCES.map(aud => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => onUpdateConfig({ targetAudience: aud })}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        config.targetAudience === aud
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-sidebar-bg text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={config.targetAudience}
                  onChange={(e) => onUpdateConfig({ targetAudience: e.target.value || 'General Public' })}
                  placeholder="Or type custom audience..."
                  aria-label="Custom target audience"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-input-border bg-input-bg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
            )}
          </div>

          {/* 3. Language Accordion */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => toggleAccordion('language')}
              aria-expanded={expandedGroup === 'language'}
              className="w-full px-3 py-2 flex items-center justify-between text-xs bg-surface hover:bg-surface-hover transition-colors focus-visible:outline-none"
            >
              <span className="font-semibold text-text-primary">Language</span>
              <span className="flex items-center gap-1.5 text-primary dark:text-accent font-bold">
                <span>{config.language}</span>
                {expandedGroup === 'language' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>
            {expandedGroup === 'language' && (
              <div className="p-2.5 bg-surface grid grid-cols-3 gap-1.5 border-t border-border">
                {TRANSFORMATION_LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => onUpdateConfig({ language: lang.id })}
                    className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-colors ${
                      config.language === lang.id
                        ? 'border-primary bg-surface-selected text-text-primary'
                        : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Detail / Length Accordion */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => toggleAccordion('detail')}
              aria-expanded={expandedGroup === 'detail'}
              className="w-full px-3 py-2 flex items-center justify-between text-xs bg-surface hover:bg-surface-hover transition-colors focus-visible:outline-none"
            >
              <span className="font-semibold text-text-primary">Detail / Length</span>
              <span className="flex items-center gap-1.5 text-primary dark:text-accent font-bold">
                <span>{config.detailLevel}</span>
                {expandedGroup === 'detail' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>
            {expandedGroup === 'detail' && (
              <div className="p-2.5 bg-surface grid grid-cols-3 gap-1.5 border-t border-border">
                {Object.values(DETAIL_LEVELS).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onUpdateConfig({ detailLevel: lvl })}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      config.detailLevel === lvl
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-sidebar-bg text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Communication Objective & Style Accordion */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => toggleAccordion('objective')}
              aria-expanded={expandedGroup === 'objective'}
              className="w-full px-3 py-2 flex items-center justify-between text-xs bg-surface hover:bg-surface-hover transition-colors focus-visible:outline-none"
            >
              <span className="font-semibold text-text-primary">Objective & Style</span>
              <span className="flex items-center gap-1.5 text-primary dark:text-accent font-bold">
                <span>{config.objective}</span>
                {expandedGroup === 'objective' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>
            {expandedGroup === 'objective' && (
              <div className="p-2.5 bg-surface space-y-2.5 border-t border-border">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Communication Objective
                  </label>
                  <select
                    value={config.objective}
                    onChange={(e) => onUpdateConfig({ objective: e.target.value })}
                    aria-label="Communication objective"
                    className="w-full p-1.5 rounded-lg border border-input-border bg-input-bg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  >
                    {COMMUNICATION_OBJECTIVES.map(obj => (
                      <option key={obj} value={obj}>{obj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Content Style
                  </label>
                  <select
                    value={config.contentStyle}
                    onChange={(e) => onUpdateConfig({ contentStyle: e.target.value })}
                    aria-label="Content style"
                    className="w-full p-1.5 rounded-lg border border-input-border bg-input-bg text-xs text-text-primary focus:outline-none focus:ring-2 focus-ring-focus-ring"
                  >
                    {CONTENT_STYLES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Footer Note */}
      <div className="p-3 border-t border-border bg-sidebar-bg text-[10px] text-text-secondary leading-relaxed shrink-0">
        Changes apply to the next generation or follow-up message in this chat without altering saved outputs.
      </div>
    </aside>
  );
}
