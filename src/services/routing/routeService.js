/**
 * InfoFlip-AI — Client-Side Route & Navigation Service
 *
 * Provides bidirectional synchronization between application screens and the browser URL
 * (supporting hash routes, path routes, query parameters, and browser history popstate).
 *
 * Guarantees that refreshing the browser, direct link navigation, or using browser Back/Forward
 * preserves the exact view (Landing Page, Workspace, Library, Collections, Previous Prototype).
 */

export const ROUTE_SECTIONS = {
  LANDING: 'landing',
  WORKSPACE: 'workspace',
  CHAT: 'chat',
  LIBRARY: 'library',
  COLLECTION: 'collection',
  PIPELINE: 'pipeline',
  ABOUT: 'about'
};

/**
 * Parses raw query string into a key-value dictionary.
 */
export function parseQueryString(queryString = '') {
  const query = {};
  if (!queryString) return query;
  const clean = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  if (!clean) return query;

  for (const pair of clean.split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    const key = decodeURIComponent(rawKey.trim());
    const value = decodeURIComponent(rawValue.trim());
    if (key) {
      query[key] = value;
    }
  }
  return query;
}

/**
 * Parses the current browser location (hash, pathname, search) into normalized route state.
 *
 * Supported route structures:
 * - Hash routes (primary / static-hosting safe):
 *   - `#/` or `#/landing` -> Landing Page
 *   - `#/workspace` or `#/chat` -> Workspace / Chat
 *   - `#/workspace?conv=:id` or `#/chat/:id` -> Workspace with active conversation
 *   - `#/library` -> Library view
 *   - `#/collection/:formatId` (e.g., `#/collection/linkedin`) -> Content collection filter
 *   - `#/pipeline` or `#/prototype` (with optional `?tab=:tab` or `/:tab`) -> Previous Prototype
 *   - `#/about` -> About view
 * - Path-based routes (for hosts with SPA rewrite):
 *   - `/` or `/landing` -> Landing Page
 *   - `/workspace` or `/chat` -> Workspace
 *   - `/library` -> Library
 *   - `/collection/:formatId` -> Collection
 *   - `/pipeline` or `/prototype` -> Previous Prototype
 *   - `/about` -> About
 * - Query-based fallbacks:
 *   - `?page=workspace`, `?section=library`, `?format=linkedin`, `?tab=review`
 */
export function parseCurrentRoute(location) {
  const loc = location || (typeof window !== 'undefined' ? window.location : null);
  if (!loc) {
    return {
      showLandingPage: true,
      activeSection: 'chat',
      activeCollectionFormat: null,
      pipelineTab: 'create',
      conversationId: null,
      rawPath: '/'
    };
  }

  const rawHash = (loc.hash || '').trim();
  const rawPathname = (loc.pathname || '/').trim();
  const rawSearch = (loc.search || '').trim();

  // 1. Check Hash Routing first (e.g., `#/collection/linkedin?foo=bar`)
  if (rawHash && rawHash.length > 1) {
    // Strip leading `#` and optional leading `/`
    const hashWithoutPound = rawHash.replace(/^#\/?/, '');
    const [pathPart, queryPart = ''] = hashWithoutPound.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const query = {
      ...parseQueryString(rawSearch),
      ...parseQueryString(queryPart)
    };

    const firstSegment = (segments[0] || '').toLowerCase();

    if (!firstSegment || firstSegment === 'landing') {
      return {
        showLandingPage: true,
        activeSection: 'chat',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: '#/' + (firstSegment || '')
      };
    }

    if (firstSegment === 'workspace' || firstSegment === 'chat') {
      const convId = segments[1] || query.conv || query.id || null;
      return {
        showLandingPage: false,
        activeSection: 'chat',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: convId,
        rawPath: '#/' + pathPart
      };
    }

    if (firstSegment === 'library') {
      return {
        showLandingPage: false,
        activeSection: 'library',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: '#/library'
      };
    }

    if (firstSegment === 'collection') {
      const formatId = segments[1] || query.format || null;
      return {
        showLandingPage: false,
        activeSection: formatId ? 'collection' : 'library',
        activeCollectionFormat: formatId ? formatId.toLowerCase() : null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: '#/' + pathPart
      };
    }

    if (firstSegment === 'pipeline' || firstSegment === 'prototype') {
      const tab = segments[1] || query.tab || 'create';
      return {
        showLandingPage: false,
        activeSection: 'pipeline',
        activeCollectionFormat: null,
        pipelineTab: tab.toLowerCase(),
        conversationId: null,
        rawPath: '#/' + pathPart
      };
    }

    if (firstSegment === 'about') {
      return {
        showLandingPage: false,
        activeSection: 'about',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: '#/about'
      };
    }
  }

  // 2. Check Pathname Routing (e.g., `/collection/linkedin`, `/workspace`)
  const pathSegments = rawPathname.split('/').filter(Boolean);
  const firstPathSegment = (pathSegments[0] || '').toLowerCase();
  const searchParams = parseQueryString(rawSearch);

  if (firstPathSegment === 'workspace' || firstPathSegment === 'chat') {
    const convId = pathSegments[1] || searchParams.conv || searchParams.id || null;
    return {
      showLandingPage: false,
      activeSection: 'chat',
      activeCollectionFormat: null,
      pipelineTab: 'create',
      conversationId: convId,
      rawPath: rawPathname
    };
  }

  if (firstPathSegment === 'library') {
    return {
      showLandingPage: false,
      activeSection: 'library',
      activeCollectionFormat: null,
      pipelineTab: 'create',
      conversationId: null,
      rawPath: '/library'
    };
  }

  if (firstPathSegment === 'collection') {
    const formatId = pathSegments[1] || searchParams.format || null;
    return {
      showLandingPage: false,
      activeSection: formatId ? 'collection' : 'library',
      activeCollectionFormat: formatId ? formatId.toLowerCase() : null,
      pipelineTab: 'create',
      conversationId: null,
      rawPath: rawPathname
    };
  }

  if (firstPathSegment === 'pipeline' || firstPathSegment === 'prototype') {
    const tab = pathSegments[1] || searchParams.tab || 'create';
    return {
      showLandingPage: false,
      activeSection: 'pipeline',
      activeCollectionFormat: null,
      pipelineTab: tab.toLowerCase(),
      conversationId: null,
      rawPath: rawPathname
    };
  }

  if (firstPathSegment === 'about') {
    return {
      showLandingPage: false,
      activeSection: 'about',
      activeCollectionFormat: null,
      pipelineTab: 'create',
      conversationId: null,
      rawPath: '/about'
    };
  }

  if (firstPathSegment === 'landing') {
    return {
      showLandingPage: true,
      activeSection: 'chat',
      activeCollectionFormat: null,
      pipelineTab: 'create',
      conversationId: null,
      rawPath: '/landing'
    };
  }

  // 3. Check Query Parameters fallback (e.g., `/?section=pipeline&tab=review`)
  if (searchParams.section || searchParams.page) {
    const target = (searchParams.section || searchParams.page || '').toLowerCase();
    if (target === 'landing') {
      return {
        showLandingPage: true,
        activeSection: 'chat',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: rawPathname + rawSearch
      };
    }
    if (target === 'library') {
      return {
        showLandingPage: false,
        activeSection: 'library',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: rawPathname + rawSearch
      };
    }
    if (target === 'collection') {
      const formatId = searchParams.format || null;
      return {
        showLandingPage: false,
        activeSection: formatId ? 'collection' : 'library',
        activeCollectionFormat: formatId ? formatId.toLowerCase() : null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: rawPathname + rawSearch
      };
    }
    if (target === 'pipeline' || target === 'prototype') {
      return {
        showLandingPage: false,
        activeSection: 'pipeline',
        activeCollectionFormat: null,
        pipelineTab: (searchParams.tab || 'create').toLowerCase(),
        conversationId: null,
        rawPath: rawPathname + rawSearch
      };
    }
    if (target === 'about') {
      return {
        showLandingPage: false,
        activeSection: 'about',
        activeCollectionFormat: null,
        pipelineTab: 'create',
        conversationId: null,
        rawPath: rawPathname + rawSearch
      };
    }
  }

  // 4. Default for Root URL (`/`): Landing Page is the first page visitors see
  return {
    showLandingPage: true,
    activeSection: 'chat',
    activeCollectionFormat: null,
    pipelineTab: 'create',
    conversationId: null,
    rawPath: '/'
  };
}

/**
 * Builds a hash URL representing the current application screen state.
 */
export function buildRouteUrl({
  showLandingPage = false,
  activeSection = 'chat',
  activeCollectionFormat = null,
  pipelineTab = 'create',
  activeConversationId = null
} = {}) {
  if (showLandingPage) {
    return '#/landing';
  }

  if (activeSection === 'library') {
    return '#/library';
  }

  if (activeSection === 'collection' && activeCollectionFormat) {
    return `#/collection/${encodeURIComponent(activeCollectionFormat.toLowerCase())}`;
  }

  if (activeSection === 'pipeline') {
    return pipelineTab && pipelineTab !== 'create'
      ? `#/pipeline?tab=${encodeURIComponent(pipelineTab.toLowerCase())}`
      : '#/pipeline';
  }

  if (activeSection === 'about') {
    return '#/about';
  }

  // Default to workspace / chat
  if (activeConversationId) {
    return `#/workspace?conv=${encodeURIComponent(activeConversationId)}`;
  }
  return '#/workspace';
}

/**
 * Synchronizes the browser address bar with the current application route state.
 *
 * Uses `history.pushState` or `history.replaceState` so that:
 * 1. The URL updates immediately.
 * 2. Browser Back / Forward buttons work properly.
 * 3. Refreshing the browser preserves the exact route.
 */
export function syncRouteToUrl(routeState, { replace = false } = {}) {
  if (typeof window === 'undefined' || !window.history) return;

  const targetHash = buildRouteUrl(routeState);
  const currentHash = window.location.hash || '';

  // Avoid unnecessary history mutations if already on target hash
  if (currentHash === targetHash) return;

  // Root URL exception: if user is on root `/` and landing page is active, do not force `#/landing`
  if (
    routeState.showLandingPage &&
    (!currentHash || currentHash === '#/' || currentHash === '#/landing') &&
    window.location.pathname === '/'
  ) {
    return;
  }

  try {
    if (replace) {
      window.history.replaceState(null, '', targetHash);
    } else {
      window.history.pushState(null, '', targetHash);
    }
  } catch (err) {
    // Fallback if pushState is restricted
    try {
      window.location.hash = targetHash;
    } catch {
      // Ignored in non-browser test environments
    }
  }
}
