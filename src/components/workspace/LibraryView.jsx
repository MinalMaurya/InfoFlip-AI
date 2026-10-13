import React, { useState, useMemo } from 'react';
import {
  Library,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  X
} from 'lucide-react';
import { WORKSPACE_FORMATS, WORKSPACE_FORMAT_MAP } from '../../services/workspace/chatPipelineOrchestrator.js';
import { APPROVAL_STATUSES } from '../../types/review.js';
import GeneratedOutputRenderer from './GeneratedOutputRenderer';

/**
 * LibraryView — Real Workspace Section for Saved Generated Content Items
 * Serves both:
 *  - "Library" (all saved generated items with optional format/status filter)
 *  - "Content Collections" (focused view filtered to a specific supported format)
 *
 * Uses the canonical `contentItemsById` store so edits, approvals, and status changes
 * stay synchronized between the originating conversation, Library, and Content Collections.
 */
export default function LibraryView({
  contentItemsById = {},
  conversations = [],
  collectionFormatId = null, // When set, acts as a dedicated Content Collection view
  onSelectCollectionFormat,
  onOpenConversation,
  onEditItem,
  onApproveItem,
  onRejectItem,
  onRegenerateItem,
  onRestoreApprovedItem,
  regeneratingItemId: externalRegeneratingItemId = null,
  onStartNewChat
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'FLAGGED'
  const [localFormatFilter, setLocalFormatFilter] = useState('ALL');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [localRegeneratingItemId, setLocalRegeneratingItemId] = useState(null);

  const regeneratingItemId = externalRegeneratingItemId || localRegeneratingItemId;
  const effectiveFormatFilter = collectionFormatId || (localFormatFilter === 'ALL' ? null : localFormatFilter);
  const activeFormatSpec = effectiveFormatFilter ? WORKSPACE_FORMAT_MAP[effectiveFormatFilter] : null;

  // Map conversations by conversationId for quick title & source lookup
  const conversationMap = useMemo(() => {
    const map = {};
    if (Array.isArray(conversations)) {
      for (const conv of conversations) {
        if (conv && conv.conversationId) {
          map[conv.conversationId] = conv;
        }
      }
    }
    return map;
  }, [conversations]);

  // All canonical items sorted newest first
  const allItems = useMemo(() => {
    return Object.values(contentItemsById || {})
      .filter((item) => item && typeof item === 'object' && item.itemId)
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [contentItemsById]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (effectiveFormatFilter && item.formatId !== effectiveFormatFilter) {
        return false;
      }
      if (statusFilter === 'APPROVED' && item.approvalStatus !== APPROVAL_STATUSES.APPROVED) {
        return false;
      }
      if (statusFilter === 'PENDING_REVIEW' && item.approvalStatus !== APPROVAL_STATUSES.PENDING_REVIEW) {
        return false;
      }
      if (
        statusFilter === 'FLAGGED' &&
        item.approvalStatus !== APPROVAL_STATUSES.REJECTED &&
        item.overallStatus !== 'WARNING' &&
        item.overallStatus !== 'FAIL'
      ) {
        return false;
      }
      if (!q) return true;

      const formatSpec = WORKSPACE_FORMAT_MAP[item.formatId];
      const formatName = (formatSpec?.name || item.formatId || '').toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const textMatch = (item.content || '').toLowerCase().includes(q);
      const convTitle = (conversationMap[item.conversationId]?.title || '').toLowerCase();
      return titleMatch || formatName.includes(q) || textMatch || convTitle.includes(q);
    });
  }, [allItems, effectiveFormatFilter, statusFilter, searchQuery, conversationMap]);

  const handleRegenerate = async (itemId) => {
    if (!onRegenerateItem) return;
    setLocalRegeneratingItemId(itemId);
    try {
      await onRegenerateItem(itemId);
    } finally {
      setLocalRegeneratingItemId(null);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return 'Recently';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-app-bg px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-selected border border-primary/20 flex items-center justify-center text-primary dark:text-accent">
                <Library className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {activeFormatSpec ? `${activeFormatSpec.collectionLabel || activeFormatSpec.name} Collection` : 'Content Library'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sidebar-bg text-text-secondary border border-border">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {activeFormatSpec
                ? `Saved ${activeFormatSpec.name} outputs generated across your conversations. Linked directly to source context and approval state.`
                : 'All generated content items across supported formats. Open any item to review, edit, approve, export, or return to its conversation.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {collectionFormatId && onSelectCollectionFormat && (
              <button
                type="button"
                onClick={() => onSelectCollectionFormat(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary bg-surface border border-border hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <X className="w-3.5 h-3.5" />
                View All Formats
              </button>
            )}
            {onStartNewChat && (
              <button
                type="button"
                onClick={onStartNewChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Sparkles className="w-3.5 h-3.5" />
                New Chat
              </button>
            )}
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved content by title, text, format, or conversation..."
              aria-label="Search library items"
              className="w-full pl-8 pr-7 py-2 text-xs rounded-lg bg-input-bg border border-input-border text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-focus-ring/30 focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Format selector (only shown when not locked to a sidebar collection) */}
          {!collectionFormatId && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-text-muted shrink-0 hidden sm:block" />
              <select
                value={localFormatFilter}
                onChange={(e) => setLocalFormatFilter(e.target.value)}
                aria-label="Filter by content format"
                className="px-2.5 py-2 rounded-lg text-xs font-medium bg-input-bg border border-input-border text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Formats ({allItems.length})</option>
                {WORKSPACE_FORMATS.map((fmt) => {
                  const count = allItems.filter((i) => i.formatId === fmt.id).length;
                  return (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Review status filter */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'PENDING_REVIEW', label: 'Pending Review' },
              { id: 'FLAGGED', label: 'Flagged' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  statusFilter === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-bg border border-border flex items-center justify-center mx-auto text-text-muted">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-text-primary">
                {allItems.length === 0
                  ? 'No saved content items yet'
                  : activeFormatSpec
                  ? `No saved ${activeFormatSpec.name} items yet`
                  : 'No items match your current filter'}
              </h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                {allItems.length === 0
                  ? 'Start a conversation and generate content in LinkedIn, X/Twitter, WhatsApp, Email, SMS, or Summary formats. Every generated output is automatically saved here.'
                  : 'Try clearing the search filter or generating new content in the conversation workspace.'}
              </p>
            </div>
            {onStartNewChat && allItems.length === 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onStartNewChat}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Create Content in Chat
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Item Cards List */
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isExpanded = expandedItemId === item.itemId;
              const conv = conversationMap[item.conversationId];
              const convTitle = conv?.title || 'Originating Conversation';
              const formatSpec = WORKSPACE_FORMAT_MAP[item.formatId];
              const formatLabel = formatSpec?.name || item.formatId;
              const isApproved = item.approvalStatus === APPROVAL_STATUSES.APPROVED;
              const isRejected = item.approvalStatus === APPROVAL_STATUSES.REJECTED;
              const sourceFileName =
                item.sourceReference?.fileName ||
                conv?.activeSource?.fileName ||
                'Source Document';
              const previewSnippet = (item.content || '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 200);

              return (
                <div
                  key={item.itemId}
                  className="bg-surface rounded-xl border border-border shadow-2xs overflow-hidden transition-all duration-200 hover:border-primary/40"
                >
                  {/* Summary Header Row */}
                  <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-selected text-primary dark:text-accent border border-primary/30 dark:border-primary/40">
                          {formatLabel}
                        </span>

                        {/* Review / Approval Status Badge */}
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        ) : isRejected || item.overallStatus === 'FAIL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            <AlertTriangle className="w-3 h-3" />
                            {isRejected ? 'Rejected' : 'Review Required'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                            Pending Review
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-sidebar-bg text-text-secondary border border-border">
                          <FileText className="w-3 h-3 text-primary dark:text-accent" />
                          <span className="truncate max-w-[140px]">{sourceFileName}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(item.updatedAt || item.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                        {item.title || `${formatLabel} Output`}
                      </h3>

                      {!isExpanded && previewSnippet && (
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {previewSnippet}
                          {(item.content || '').length > 200 ? '...' : ''}
                        </p>
                      )}
                    </div>

                    {/* Item Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.conversationId && onOpenConversation && (
                        <button
                          type="button"
                          onClick={() => onOpenConversation(item.conversationId)}
                          title={`Open conversation: ${convTitle}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-text-secondary bg-sidebar-bg border border-border hover:bg-surface-hover hover:text-primary dark:hover:text-accent active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span className="max-w-[130px] truncate">{convTitle}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.itemId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-selected text-primary dark:text-accent border border-border hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      >
                        {isExpanded ? (
                          <>
                            <span>Collapse</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Open Content</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Full Output View (Reuses GeneratedOutputRenderer for full edit/review/export) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border bg-sidebar-bg animate-slide-down">
                      <GeneratedOutputRenderer
                        item={item}
                        config={conv?.config || {}}
                        sourceDocument={conv?.activeSource || item.sourceReference}
                        onEdit={onEditItem}
                        onApprove={onApproveItem}
                        onReject={onRejectItem}
                        onRegenerate={() => handleRegenerate(item.itemId)}
                        onRestoreApproved={onRestoreApprovedItem}
                        isRegenerating={regeneratingItemId === item.itemId}
                        onOpenOriginConversation={
                          item.conversationId && onOpenConversation
                            ? () => onOpenConversation(item.conversationId)
                            : null
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
