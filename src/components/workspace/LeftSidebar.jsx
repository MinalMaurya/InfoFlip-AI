import React, { useState } from 'react';
import {
  Plus,
  Compass,
  Library,
  CalendarClock,
  MessageSquare,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Share2,
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
  Video,
  Info,
  Layers,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { WORKSPACE_FORMATS } from '../../services/workspace/chatPipelineOrchestrator.js';

const FORMAT_ICON_MAP = {
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

export default function LeftSidebar({
  activeSection,
  activeCollectionFormat,
  activeConversationId,
  conversations = [],
  contentItemsById = {},
  onNewChat,
  onSelectSection,
  onSelectCollection,
  onSelectConversation,
  isCollapsed = false,
  onCollapseDesktop,
  onExpandDesktop,
  onCloseMobileDrawer,
  isMobileDrawer = false
}) {
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);

  const allSavedItems = Object.values(contentItemsById || {});
  const totalLibraryCount = allSavedItems.length;

  // Count saved items per formatId without duplicating records
  const countByFormat = {};
  for (const item of allSavedItems) {
    const fmt = String(item.formatId || item.channelId || '').toLowerCase();
    if (fmt) {
      countByFormat[fmt] = (countByFormat[fmt] || 0) + 1;
    }
  }

  // Filter conversations by title or message/source content
  const filteredConversations = conversations.filter((conv) => {
    if (!chatSearchQuery.trim()) return true;
    const q = chatSearchQuery.trim().toLowerCase();
    const inTitle = (conv.title || '').toLowerCase().includes(q);
    const inMessages = Array.isArray(conv.messages) && conv.messages.some(
      m => (m.prompt || '').toLowerCase().includes(q) ||
           (m.sourceAttachment?.fileName || '').toLowerCase().includes(q) ||
           (m.analysisSummary?.mainTopic || '').toLowerCase().includes(q)
    );
    return inTitle || inMessages;
  });

  // Show primary collections first, with toggle to expand all 13 supported formats
  const visibleCollections = showAllCollections
    ? WORKSPACE_FORMATS
    : WORKSPACE_FORMATS.slice(0, 7);

  const handleNavAction = (callback) => {
    callback();
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  // ===========================================================================
  // COLLAPSED DESKTOP ICON RAIL (Requirements A.1 – A.6, A.9)
  // ===========================================================================
  if (isCollapsed && !isMobileDrawer) {
    return (
      <aside
        aria-label="Collapsed Workspace Navigation Rail"
        data-collapsed="true"
        className="h-full w-16 bg-sidebar-bg border-r border-border flex flex-col items-center select-none text-text-primary shrink-0 transition-colors"
      >
        {/* Top Direct Expand Control */}
        <div className="h-14 w-full flex items-center justify-center border-b border-border shrink-0">
          <button
            type="button"
            onClick={onExpandDesktop}
            aria-label="Expand left sidebar"
            title="Expand left sidebar"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Icon Control */}
        <div className="pt-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => onNewChat()}
            aria-label="New Chat"
            title="New Chat — Start a fresh conversation"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary hover:bg-primary-hover text-primary-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Navigation + Supported Content Collections Rail */}
        <div className="flex-1 w-full overflow-y-auto px-2 py-1.5 flex flex-col items-center gap-1">
          <nav aria-label="Primary Workspace Sections" className="w-full flex flex-col items-center gap-1">
            {/* Explore */}
            <button
              type="button"
              onClick={() => onSelectSection('explore')}
              aria-label="Explore"
              aria-current={activeSection === 'explore' ? 'page' : undefined}
              title="Explore (Preview)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                activeSection === 'explore'
                  ? 'bg-surface-selected text-text-primary border border-border'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Library */}
            <button
              type="button"
              onClick={() => onSelectSection('library')}
              aria-label="Library"
              aria-current={activeSection === 'library' && !activeCollectionFormat ? 'page' : undefined}
              title={`Library (${totalLibraryCount} saved items)`}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                activeSection === 'library' && !activeCollectionFormat
                  ? 'bg-surface-selected text-text-primary border border-border'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <Library className="w-4 h-4" />
              {totalLibraryCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {totalLibraryCount > 99 ? '99+' : totalLibraryCount}
                </span>
              )}
            </button>

            {/* Scheduled Posts — Coming Soon */}
            <button
              type="button"
              onClick={() => onSelectSection('scheduled')}
              aria-label="Scheduled Posts — Coming soon"
              aria-current={activeSection === 'scheduled' ? 'page' : undefined}
              title="Scheduled Posts (Coming soon)"
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                activeSection === 'scheduled'
                  ? 'bg-surface-selected text-text-primary border border-border'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span
                className="w-2 h-2 rounded-full bg-warning absolute top-1.5 right-1.5"
                aria-hidden="true"
              />
            </button>
          </nav>

          <div className="w-8 border-t border-divider my-1.5 shrink-0" role="separator" />

          {/* Supported Content Collections Icon Rail */}
          <div
            role="list"
            aria-label="Content format collections"
            className="w-full flex flex-col items-center gap-1"
          >
            {WORKSPACE_FORMATS.map((fmt) => {
              const Icon = FORMAT_ICON_MAP[fmt.iconName] || FileText;
              const isSelected = activeSection === 'collection' && activeCollectionFormat === fmt.id;
              const count = countByFormat[fmt.id] || 0;

              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => onSelectCollection(fmt.id)}
                  aria-label={`${fmt.collectionLabel} Collection`}
                  aria-current={isSelected ? 'page' : undefined}
                  title={`${fmt.collectionLabel} Collection (${count} saved)`}
                  className={`relative w-10 h-9 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isSelected
                      ? 'bg-surface-selected text-text-primary border border-border'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Prototype Account Avatar (Requirement A.3) */}
        <div className="p-2 border-t border-border bg-sidebar-bg shrink-0 relative w-full flex justify-center">
          {showProfileInfo && (
            <div
              role="dialog"
              aria-label="Prototype Workspace Information"
              className="fixed bottom-4 left-18 w-64 p-3 rounded-xl bg-surface-elevated border border-border shadow-lg text-xs space-y-2 z-50 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-accent" />
                  <span>Minal Maurya • Free plan</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowProfileInfo(false)}
                  className="text-text-secondary hover:text-text-primary"
                  aria-label="Close workspace info"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Local prototype profile for SIH 2026 (ID 26154). Conversations and generated items are stored in your browser. No account authentication is active in V0.1.0.
              </p>
              <div className="pt-1.5 border-t border-border flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileInfo(false);
                    onSelectSection('about');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary font-semibold text-[11px] flex items-center justify-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  <span>About InfoFlip-AI</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowProfileInfo(!showProfileInfo)}
            aria-expanded={showProfileInfo}
            aria-label="Prototype account area: Minal Maurya, Free plan"
            title="Prototype account: Minal Maurya (Free plan)"
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              MM
            </div>
          </button>
        </div>
      </aside>
    );
  }

  // ===========================================================================
  // EXPANDED SIDEBAR (Desktop Expanded & Mobile Slide-Out Drawer)
  // ===========================================================================
  return (
    <aside
      aria-label="Workspace Navigation Sidebar"
      data-collapsed="false"
      className="h-full w-64 sm:w-68 bg-sidebar-bg border-r border-border flex flex-col select-none text-text-primary transition-colors"
    >
      {/* Top Brand Header & Collapse Control */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => handleNavAction(() => onSelectSection('chat'))}
          className="flex items-center gap-2.5 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          title="InfoFlip-AI Content Transformation Workspace"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center shrink-0">
            <img
              src="/infoflip-logo.png"
              alt="InfoFlip-AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-text-primary">
                InfoFlip<span className="text-primary dark:text-accent">-AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-surface-selected text-text-primary border border-border">
                V0.1
              </span>
            </div>
            <p className="text-[10px] text-text-secondary truncate">
              Content Studio • SIH 26154
            </p>
          </div>
        </button>

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            aria-label="Close navigation drawer"
            title="Close navigation drawer"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCollapseDesktop}
            aria-label="Collapse left sidebar"
            title="Collapse left sidebar"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Prominent Compact New Chat Button */}
      <div className="p-3 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => handleNavAction(onNewChat)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-hover shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </span>
          <span className="text-[10px] font-normal opacity-90">
            Fresh workspace
          </span>
        </button>
      </div>

      {/* Scrollable Navigation + Collections + Recent Chats */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-5">
        {/* Primary Navigation Links */}
        <nav aria-label="Primary Workspace Sections" className="space-y-0.5">
          {/* Explore */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onSelectSection('explore'))}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              activeSection === 'explore'
                ? 'bg-surface-selected text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Compass className={`w-4 h-4 ${activeSection === 'explore' ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
              <span>Explore</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-secondary border border-border font-medium">
              Preview
            </span>
          </button>

          {/* Library */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onSelectSection('library'))}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              activeSection === 'library' && !activeCollectionFormat
                ? 'bg-surface-selected text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Library className={`w-4 h-4 ${activeSection === 'library' && !activeCollectionFormat ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
              <span>Library</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-text-primary border border-border font-bold">
              {totalLibraryCount}
            </span>
          </button>

          {/* Scheduled Posts — Coming Soon */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onSelectSection('scheduled'))}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              activeSection === 'scheduled'
                ? 'bg-surface-selected text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <CalendarClock className={`w-4 h-4 shrink-0 ${activeSection === 'scheduled' ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
              <span className="truncate">Scheduled Posts</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning-subtle text-warning border border-warning/30 font-bold shrink-0">
              Soon
            </span>
          </button>
        </nav>

        {/* Content Collections (Functional Filters over Saved Library Items) */}
        <div className="space-y-1">
          <div className="px-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Content Collections
            </span>
            <button
              type="button"
              onClick={() => setShowAllCollections(!showAllCollections)}
              className="text-[10px] font-semibold text-primary dark:text-accent hover:underline focus-visible:outline-none"
            >
              {showAllCollections ? 'Less' : `All (${WORKSPACE_FORMATS.length})`}
            </button>
          </div>

          <div className="space-y-0.5" role="list" aria-label="Content format collections">
            {visibleCollections.map((fmt) => {
              const Icon = FORMAT_ICON_MAP[fmt.iconName] || FileText;
              const isSelected = activeSection === 'collection' && activeCollectionFormat === fmt.id;
              const count = countByFormat[fmt.id] || 0;

              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleNavAction(() => onSelectCollection(fmt.id))}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isSelected
                      ? 'bg-surface-selected text-text-primary font-bold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
                    <span className="truncate">{fmt.collectionLabel}</span>
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface text-text-primary border border-border font-semibold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Chats Section */}
        <div className="space-y-2 pt-1 border-t border-divider">
          <div className="px-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Recent Chats
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              {conversations.length}
            </span>
          </div>

          {/* Search Saved Conversations */}
          {conversations.length > 0 && (
            <div className="px-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  aria-label="Search recent conversations"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-input-bg border border-input-border text-xs text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
            </div>
          )}

          {/* Recent Chat List */}
          {filteredConversations.length === 0 ? (
            <div className="px-2.5 py-4 text-center rounded-xl bg-surface/60 border border-dashed border-border">
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {conversations.length === 0
                  ? 'No saved chats yet. Submit a source or prompt to start.'
                  : 'No conversations match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5" role="list" aria-label="Recent conversations">
              {filteredConversations.map((conv) => {
                const isActive = activeSection === 'chat' && conv.conversationId === activeConversationId;
                const turnCount = conv.messages?.filter(m => m.role === 'assistant').length || 0;

                return (
                  <button
                    key={conv.conversationId}
                    type="button"
                    onClick={() => handleNavAction(() => onSelectConversation(conv.conversationId))}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                      isActive
                        ? 'bg-surface-selected text-text-primary font-bold border border-border'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
                      <div className="min-w-0">
                        <div className="truncate leading-snug text-text-primary">{conv.title || 'New Chat'}</div>
                        <div className="text-[10px] text-text-secondary font-normal truncate mt-0.5">
                          {turnCount > 0 ? `${turnCount} generation${turnCount > 1 ? 's' : ''}` : 'Draft conversation'}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Prototype Account Area (No Authentication / No Login-Logout) */}
      <div className="p-2.5 border-t border-border bg-sidebar-bg shrink-0 relative">
        {showProfileInfo && (
          <div
            role="dialog"
            aria-label="Prototype Workspace Information"
            className="absolute bottom-16 left-2.5 right-2.5 p-3 rounded-xl bg-surface-elevated border border-border shadow-lg text-xs space-y-2 z-30 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-accent" />
                <span>Prototype Workspace</span>
              </span>
              <button
                type="button"
                onClick={() => setShowProfileInfo(false)}
                className="text-text-secondary hover:text-text-primary"
                aria-label="Close workspace info"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Local prototype profile for SIH 2026 (ID 26154). Conversations and generated items are stored in your browser. No account authentication is active in V0.1.0.
            </p>
            <div className="pt-1.5 border-t border-border flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowProfileInfo(false);
                  handleNavAction(() => onSelectSection('about'));
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Info className="w-3 h-3" />
                <span>About InfoFlip-AI</span>
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowProfileInfo(!showProfileInfo)}
          aria-expanded={showProfileInfo}
          aria-label="Prototype account area: Minal Maurya, Free plan"
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-hover transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              MM
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text-primary truncate">
                Minal Maurya
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <span>Free plan</span>
                <span>•</span>
                <span className="text-primary dark:text-accent font-medium">Prototype</span>
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${showProfileInfo ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
}
