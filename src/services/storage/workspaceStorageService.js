/**
 * InfoFlip-AI V0.1.0 — Browser Persistence & Storage Abstraction
 *
 * Provides a clean, versioned storage layer for:
 * - Conversations and chronological message turns
 * - Canonical generated content items (shared across Conversations, Library, and Content Collections)
 * - Independent sidebar and workspace UI preferences
 *
 * Designed so the prototype can migrate to a backend database and per-user storage
 * in a future phase without changing workspace or component logic.
 */

export const STORAGE_KEYS = {
  WORKSPACE_STATE: 'infoflip_workspace_v1',
  UI_PREFERENCES: 'infoflip_ui_prefs_v1'
};

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_GENERATION_CONFIG = {
  targetAudience: 'General Public',
  tone: 'Informative',
  language: 'English',
  detailLevel: 'Balanced',
  objective: 'Inform',
  contentStyle: 'Structured',
  selectedFormats: ['linkedin', 'twitter', 'whatsapp', 'executive-summary']
};

export const DEFAULT_UI_PREFERENCES = {
  leftSidebarCollapsed: false,
  rightSidebarCollapsed: false,
  activeSection: 'chat', // 'chat' | 'library' | 'collection' | 'scheduled' | 'explore' | 'pipeline' | 'about'
  activeCollectionFormat: null
};

const FORBIDDEN_SECRET_KEYS = new Set([
  'apikey',
  'api_key',
  'geminiapikey',
  'secret',
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'credential',
  'credentials'
]);

/**
 * Recursively strips any accidental secret/credential keys before persisting to browser storage.
 */
export function stripSecrets(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map(stripSecrets);
  }
  const cleaned = {};
  for (const [k, v] of Object.entries(value)) {
    if (FORBIDDEN_SECRET_KEYS.has(k.toLowerCase())) {
      continue;
    }
    cleaned[k] = stripSecrets(v);
  }
  return cleaned;
}

/**
 * Generates a deterministic, privacy-conscious title for a conversation
 * from the user's initial prompt, file name, or source content without an AI call.
 */
export function generateConversationTitle({ prompt = '', sourceText = '', fileName = '', mainTopic = '' } = {}) {
  const candidates = [
    prompt ? String(prompt).trim() : '',
    mainTopic && mainTopic !== 'General Document' ? String(mainTopic).trim() : '',
    fileName ? String(fileName).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim() : '',
    sourceText ? String(sourceText).trim() : ''
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    // Take first non-empty line, strip markdown/bullet symbols
    const firstLine = raw
      .split(/\r?\n/)
      .map(l => l.replace(/^[#*>•\-–—\s]+/, '').trim())
      .find(l => l.length >= 3);

    if (firstLine) {
      const normalized = firstLine.replace(/\s+/g, ' ');
      if (normalized.length <= 56) {
        return normalized;
      }
      const truncated = normalized.slice(0, 54);
      const lastSpace = truncated.lastIndexOf(' ');
      return (lastSpace > 24 ? truncated.slice(0, lastSpace) : truncated).trim() + '…';
    }
  }

  return 'New Content Workspace';
}

/**
 * Validates and repairs a stored workspace state object so malformed or outdated
 * browser data never crashes the application.
 */
export function sanitizeWorkspaceState(raw) {
  const emptyState = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeConversationId: null,
    conversations: [],
    contentItemsById: {},
    updatedAt: new Date().toISOString()
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return emptyState;
  }

  // Validate contentItemsById map
  const safeItemsById = {};
  if (raw.contentItemsById && typeof raw.contentItemsById === 'object' && !Array.isArray(raw.contentItemsById)) {
    for (const [id, item] of Object.entries(raw.contentItemsById)) {
      if (item && typeof item === 'object' && typeof item.itemId === 'string' && typeof item.formatId === 'string') {
        safeItemsById[id] = {
          itemId: item.itemId,
          outputId: item.outputId || item.itemId,
          conversationId: item.conversationId || 'conv-unknown',
          messageId: item.messageId || 'msg-unknown',
          formatId: String(item.formatId).toLowerCase(),
          channelId: String(item.channelId || item.formatId).toLowerCase(),
          title: typeof item.title === 'string' && item.title.trim() ? item.title : 'Generated Content',
          content: typeof item.content === 'string' ? item.content : '',
          originalContent: typeof item.originalContent === 'string' ? item.originalContent : (typeof item.content === 'string' ? item.content : ''),
          structuredData: item.structuredData && typeof item.structuredData === 'object' ? item.structuredData : null,
          overallStatus: item.overallStatus || 'PASS',
          approvalStatus: item.approvalStatus || 'PENDING_REVIEW',
          requiresHumanReview: item.requiresHumanReview ?? (item.approvalStatus !== 'APPROVED'),
          isEdited: Boolean(item.isEdited),
          reviewerNotes: typeof item.reviewerNotes === 'string' ? item.reviewerNotes : '',
          checks: item.checks && typeof item.checks === 'object' ? item.checks : {},
          summary: item.summary && typeof item.summary === 'object' ? item.summary : { passed: 0, warnings: 0, failed: 0 },
          metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
          sourceTraceability: Array.isArray(item.sourceTraceability) ? item.sourceTraceability : [],
          approvalInfo: item.approvalInfo && typeof item.approvalInfo === 'object' ? item.approvalInfo : null,
          lineage: item.lineage && typeof item.lineage === 'object' ? item.lineage : {
            sourceId: item.sourceId || 'src-unknown',
            analysisId: item.analysisId || 'ana-unknown',
            transformationId: item.transformationId || 'trans-unknown',
            communicationId: item.communicationId || 'comm-unknown',
            reviewId: item.reviewId || 'rev-unknown'
          },
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
        };
      }
    }
  }

  // Validate conversations array
  const safeConversations = [];
  if (Array.isArray(raw.conversations)) {
    for (const conv of raw.conversations) {
      if (!conv || typeof conv !== 'object' || typeof conv.conversationId !== 'string') {
        continue;
      }

      const safeMessages = [];
      if (Array.isArray(conv.messages)) {
        for (const msg of conv.messages) {
          if (!msg || typeof msg !== 'object' || typeof msg.messageId !== 'string') continue;
          safeMessages.push({
            messageId: msg.messageId,
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            prompt: typeof msg.prompt === 'string' ? msg.prompt : '',
            sourceAttachment: msg.sourceAttachment && typeof msg.sourceAttachment === 'object' ? msg.sourceAttachment : null,
            requestedFormats: Array.isArray(msg.requestedFormats) ? msg.requestedFormats : [],
            configSnapshot: msg.configSnapshot && typeof msg.configSnapshot === 'object' ? msg.configSnapshot : { ...DEFAULT_GENERATION_CONFIG },
            outputItemIds: Array.isArray(msg.outputItemIds)
              ? msg.outputItemIds.filter(id => Boolean(safeItemsById[id]))
              : [],
            unsupportedFormats: Array.isArray(msg.unsupportedFormats) ? msg.unsupportedFormats : [],
            analysisSummary: msg.analysisSummary && typeof msg.analysisSummary === 'object' ? msg.analysisSummary : null,
            lineage: msg.lineage && typeof msg.lineage === 'object' ? msg.lineage : null,
            createdAt: msg.createdAt || new Date().toISOString()
          });
        }
      }

      const cfg = conv.config && typeof conv.config === 'object' ? conv.config : {};
      safeConversations.push({
        conversationId: conv.conversationId,
        title: typeof conv.title === 'string' && conv.title.trim() ? conv.title : 'New Content Workspace',
        createdAt: conv.createdAt || new Date().toISOString(),
        updatedAt: conv.updatedAt || conv.createdAt || new Date().toISOString(),
        messages: safeMessages,
        activeSource: conv.activeSource && typeof conv.activeSource === 'object' ? conv.activeSource : null,
        activeAnalysis: conv.activeAnalysis && typeof conv.activeAnalysis === 'object' ? conv.activeAnalysis : null,
        lastTransformationResult: conv.lastTransformationResult && typeof conv.lastTransformationResult === 'object' ? conv.lastTransformationResult : null,
        lastCommunicationResult: conv.lastCommunicationResult && typeof conv.lastCommunicationResult === 'object' ? conv.lastCommunicationResult : null,
        lastReviewResult: conv.lastReviewResult && typeof conv.lastReviewResult === 'object' ? conv.lastReviewResult : null,
        lastExportPackage: conv.lastExportPackage && typeof conv.lastExportPackage === 'object' ? conv.lastExportPackage : null,
        config: {
          targetAudience: cfg.targetAudience || DEFAULT_GENERATION_CONFIG.targetAudience,
          tone: cfg.tone || DEFAULT_GENERATION_CONFIG.tone,
          language: cfg.language || DEFAULT_GENERATION_CONFIG.language,
          detailLevel: cfg.detailLevel || DEFAULT_GENERATION_CONFIG.detailLevel,
          objective: cfg.objective || DEFAULT_GENERATION_CONFIG.objective,
          contentStyle: cfg.contentStyle || DEFAULT_GENERATION_CONFIG.contentStyle,
          selectedFormats: Array.isArray(cfg.selectedFormats) && cfg.selectedFormats.length > 0
            ? [...cfg.selectedFormats]
            : [...DEFAULT_GENERATION_CONFIG.selectedFormats]
        },
        draft: conv.draft && typeof conv.draft === 'object'
          ? {
              prompt: typeof conv.draft.prompt === 'string' ? conv.draft.prompt : '',
              sourceText: typeof conv.draft.sourceText === 'string' ? conv.draft.sourceText : ''
            }
          : { prompt: '', sourceText: '' }
      });
    }
  }

  const validActiveId = safeConversations.some(c => c.conversationId === raw.activeConversationId)
    ? raw.activeConversationId
    : (safeConversations[0]?.conversationId || null);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeConversationId: validActiveId,
    conversations: safeConversations,
    contentItemsById: safeItemsById,
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Sanitizes stored UI preferences.
 */
export function sanitizeUIPreferences(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_UI_PREFERENCES };
  }
  return {
    leftSidebarCollapsed: Boolean(raw.leftSidebarCollapsed),
    rightSidebarCollapsed: Boolean(raw.rightSidebarCollapsed),
    activeSection: ['chat', 'library', 'collection', 'scheduled', 'explore', 'pipeline', 'about'].includes(raw.activeSection)
      ? raw.activeSection
      : 'chat',
    activeCollectionFormat: typeof raw.activeCollectionFormat === 'string' ? raw.activeCollectionFormat : null
  };
}

/**
 * Creates a new empty conversation object with sensible default settings.
 */
export function createEmptyConversation(overrides = {}) {
  const now = new Date().toISOString();
  const baseConfig = overrides.config || {};
  return {
    conversationId: overrides.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: overrides.title || 'New Chat',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    messages: Array.isArray(overrides.messages) ? overrides.messages : [],
    activeSource: overrides.activeSource || null,
    activeAnalysis: overrides.activeAnalysis || null,
    lastTransformationResult: null,
    lastCommunicationResult: null,
    lastReviewResult: null,
    lastExportPackage: null,
    config: {
      targetAudience: baseConfig.targetAudience || DEFAULT_GENERATION_CONFIG.targetAudience,
      tone: baseConfig.tone || DEFAULT_GENERATION_CONFIG.tone,
      language: baseConfig.language || DEFAULT_GENERATION_CONFIG.language,
      detailLevel: baseConfig.detailLevel || DEFAULT_GENERATION_CONFIG.detailLevel,
      objective: baseConfig.objective || DEFAULT_GENERATION_CONFIG.objective,
      contentStyle: baseConfig.contentStyle || DEFAULT_GENERATION_CONFIG.contentStyle,
      selectedFormats: Array.isArray(baseConfig.selectedFormats) && baseConfig.selectedFormats.length > 0
        ? [...baseConfig.selectedFormats]
        : [...DEFAULT_GENERATION_CONFIG.selectedFormats]
    },
    draft: {
      prompt: overrides.draft?.prompt || '',
      sourceText: overrides.draft?.sourceText || ''
    }
  };
}

/**
 * Creates a storage service instance backed by the provided Web Storage API
 * (defaults to window.localStorage when available).
 */
export function createWorkspaceStorage(customStorage = null) {
  const getStorage = () => {
    if (customStorage) return customStorage;
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  };

  const loadWorkspaceState = () => {
    const storage = getStorage();
    if (!storage) {
      return {
        state: sanitizeWorkspaceState(null),
        warning: 'Browser storage is unavailable in this environment.'
      };
    }

    try {
      const rawStr = storage.getItem(STORAGE_KEYS.WORKSPACE_STATE);
      if (!rawStr) {
        return { state: sanitizeWorkspaceState(null), warning: null };
      }
      const parsed = JSON.parse(rawStr);
      return { state: sanitizeWorkspaceState(parsed), warning: null };
    } catch {
      return {
        state: sanitizeWorkspaceState(null),
        warning: 'Stored workspace data was malformed or outdated and has been safely reset.'
      };
    }
  };

  const saveWorkspaceState = (state) => {
    const storage = getStorage();
    if (!storage) {
      return {
        success: false,
        error: 'Browser storage is unavailable. Your conversation could not be saved locally.'
      };
    }

    try {
      const sanitized = sanitizeWorkspaceState(stripSecrets(state));
      const payload = {
        ...sanitized,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString()
      };
      storage.setItem(STORAGE_KEYS.WORKSPACE_STATE, JSON.stringify(payload));
      return { success: true, state: payload, error: null };
    } catch (err) {
      const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22 || String(err?.message || '').toLowerCase().includes('quota');
      return {
        success: false,
        error: isQuota
          ? 'Browser storage is full. Please export your work or clear space to save new items.'
          : 'Unable to save to browser storage. Changes are kept in memory for this session only.'
      };
    }
  };

  const loadUIPreferences = () => {
    const storage = getStorage();
    if (!storage) {
      return sanitizeUIPreferences(null);
    }
    try {
      const rawStr = storage.getItem(STORAGE_KEYS.UI_PREFERENCES);
      if (!rawStr) return sanitizeUIPreferences(null);
      return sanitizeUIPreferences(JSON.parse(rawStr));
    } catch {
      return sanitizeUIPreferences(null);
    }
  };

  const saveUIPreferences = (prefs) => {
    const storage = getStorage();
    if (!storage) {
      return { success: false, error: 'Browser storage is unavailable.' };
    }
    try {
      const clean = sanitizeUIPreferences(prefs);
      storage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(clean));
      return { success: true, preferences: clean, error: null };
    } catch {
      return {
        success: false,
        error: 'Could not save UI preferences to browser storage.'
      };
    }
  };

  /**
   * Returns all saved content items sorted newest first.
   * Library and Content Collections read from the exact same underlying map.
   */
  const getLibraryItems = (state, { formatFilter = null, statusFilter = null, searchQuery = '' } = {}) => {
    if (!state || !state.contentItemsById) return [];
    const allItems = Object.values(state.contentItemsById);

    return allItems
      .filter(item => {
        if (formatFilter && formatFilter !== 'ALL') {
          if (item.formatId !== formatFilter.toLowerCase()) return false;
        }
        if (statusFilter && statusFilter !== 'ALL') {
          if (item.approvalStatus !== statusFilter) return false;
        }
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const inTitle = (item.title || '').toLowerCase().includes(q);
          const inContent = (item.content || '').toLowerCase().includes(q);
          const inFormat = (item.formatId || '').toLowerCase().includes(q);
          if (!inTitle && !inContent && !inFormat) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  };

  /**
   * Resolves a conversation along with hydrated content items for each assistant turn.
   */
  const hydrateConversation = (state, conversationId) => {
    if (!state || !Array.isArray(state.conversations)) return null;
    const conv = state.conversations.find(c => c.conversationId === conversationId);
    if (!conv) return null;

    const hydratedMessages = conv.messages.map(msg => {
      if (msg.role !== 'assistant') return msg;
      const outputs = (msg.outputItemIds || [])
        .map(id => state.contentItemsById?.[id])
        .filter(Boolean);
      return {
        ...msg,
        outputs
      };
    });

    return {
      ...conv,
      messages: hydratedMessages
    };
  };

  return {
    loadWorkspaceState,
    saveWorkspaceState,
    loadUIPreferences,
    saveUIPreferences,
    getLibraryItems,
    hydrateConversation
  };
}

export const defaultWorkspaceStorage = createWorkspaceStorage();
