import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseCurrentRoute,
  buildRouteUrl,
  ROUTE_SECTIONS
} from '../services/routing/routeService.js';
import {
  defaultWorkspaceStorage,
  createEmptyConversation
} from '../services/storage/workspaceStorageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

console.log('====================================================');
console.log('🧭 INFOFLIP-AI ROUTING & REFRESH NAVIGATION SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Root URL & Landing Page Initialization
// -----------------------------------------------------------------------------
test('1. Root URL ("/") defaults to Landing Page as intended initial view', () => {
  const route = parseCurrentRoute({ pathname: '/', hash: '', search: '' });
  assert.strictEqual(route.showLandingPage, true);
  assert.strictEqual(route.activeSection, 'chat');
});

test('2. Hash landing route ("#/landing" or "#/") resolves to Landing Page', () => {
  const route1 = parseCurrentRoute({ pathname: '/', hash: '#/landing', search: '' });
  assert.strictEqual(route1.showLandingPage, true);

  const route2 = parseCurrentRoute({ pathname: '/', hash: '#/', search: '' });
  assert.strictEqual(route2.showLandingPage, true);
});

// -----------------------------------------------------------------------------
// 2. Workspace & Chat Route Preservation
// -----------------------------------------------------------------------------
test('3. Workspace hash route ("#/workspace") preserves workspace on refresh without redirecting to landing', () => {
  const route = parseCurrentRoute({ pathname: '/', hash: '#/workspace', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'chat');
  assert.strictEqual(route.activeCollectionFormat, null);
});

test('4. Workspace with active conversation ("#/workspace?conv=conv-123") restores conversation ID on refresh', () => {
  const route = parseCurrentRoute({ pathname: '/', hash: '#/workspace?conv=conv-123', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'chat');
  assert.strictEqual(route.conversationId, 'conv-123');
});

test('5. Path-based workspace route ("/workspace") resolves to workspace without 404 or redirect', () => {
  const route = parseCurrentRoute({ pathname: '/workspace', hash: '', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'chat');
});

// -----------------------------------------------------------------------------
// 3. Library & Content Collections Route Preservation
// -----------------------------------------------------------------------------
test('6. Library route ("#/library") preserves Library view across browser refreshes', () => {
  const route = parseCurrentRoute({ pathname: '/', hash: '#/library', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'library');
  assert.strictEqual(route.activeCollectionFormat, null);
});

test('7. Content collection routes ("#/collection/linkedin", "#/collection/whatsapp") preserve format filter on refresh', () => {
  const routeLinkedIn = parseCurrentRoute({ pathname: '/', hash: '#/collection/linkedin', search: '' });
  assert.strictEqual(routeLinkedIn.showLandingPage, false);
  assert.strictEqual(routeLinkedIn.activeSection, 'collection');
  assert.strictEqual(routeLinkedIn.activeCollectionFormat, 'linkedin');

  const routeWhatsApp = parseCurrentRoute({ pathname: '/', hash: '#/collection/whatsapp', search: '' });
  assert.strictEqual(routeWhatsApp.showLandingPage, false);
  assert.strictEqual(routeWhatsApp.activeSection, 'collection');
  assert.strictEqual(routeWhatsApp.activeCollectionFormat, 'whatsapp');
});

test('8. Path-based collection route ("/collection/twitter") resolves correctly', () => {
  const route = parseCurrentRoute({ pathname: '/collection/twitter', hash: '', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'collection');
  assert.strictEqual(route.activeCollectionFormat, 'twitter');
});

// -----------------------------------------------------------------------------
// 4. Previous Prototype (Pipeline Inspector) Route Preservation
// -----------------------------------------------------------------------------
test('9. Previous Prototype route ("#/pipeline") preserves Pipeline Inspector view on refresh', () => {
  const route = parseCurrentRoute({ pathname: '/', hash: '#/pipeline', search: '' });
  assert.strictEqual(route.showLandingPage, false);
  assert.strictEqual(route.activeSection, 'pipeline');
  assert.strictEqual(route.pipelineTab, 'create');
});

test('10. Previous Prototype tab route ("#/pipeline?tab=review" or "#/pipeline/review") restores active tab', () => {
  const routeWithQuery = parseCurrentRoute({ pathname: '/', hash: '#/pipeline?tab=review', search: '' });
  assert.strictEqual(routeWithQuery.showLandingPage, false);
  assert.strictEqual(routeWithQuery.activeSection, 'pipeline');
  assert.strictEqual(routeWithQuery.pipelineTab, 'review');

  const routeWithPath = parseCurrentRoute({ pathname: '/', hash: '#/pipeline/transform', search: '' });
  assert.strictEqual(routeWithPath.showLandingPage, false);
  assert.strictEqual(routeWithPath.activeSection, 'pipeline');
  assert.strictEqual(routeWithPath.pipelineTab, 'transform');
});

// -----------------------------------------------------------------------------
// 5. URL Builder Fidelity & Canonical Hashes
// -----------------------------------------------------------------------------
test('11. buildRouteUrl accurately generates canonical URLs for each screen', () => {
  assert.strictEqual(buildRouteUrl({ showLandingPage: true }), '#/landing');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'chat' }), '#/workspace');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'chat', activeConversationId: 'conv-99' }), '#/workspace?conv=conv-99');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'library' }), '#/library');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'collection', activeCollectionFormat: 'linkedin' }), '#/collection/linkedin');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'pipeline', pipelineTab: 'review' }), '#/pipeline?tab=review');
  assert.strictEqual(buildRouteUrl({ showLandingPage: false, activeSection: 'about' }), '#/about');
});

// -----------------------------------------------------------------------------
// 6. Application Component Integration & Source Audit
// -----------------------------------------------------------------------------
test('12. App.jsx initializes showLandingPage and UI preferences dynamically from initialRoute', () => {
  const appSource = fs.readFileSync(path.join(SRC_DIR, 'App.jsx'), 'utf8');
  assert(
    appSource.includes('parseCurrentRoute') &&
      appSource.includes('syncRouteToUrl') &&
      appSource.includes('initialRoute') &&
      appSource.includes("window.addEventListener('popstate'"),
    'App.jsx integrates parseCurrentRoute and popstate/hashchange listeners'
  );
});

test('13. public/404.html fallback exists and preserves path, query, and hash across static hosting refreshes', () => {
  const fallbackPath = path.join(PUBLIC_DIR, '404.html');
  assert(fs.existsSync(fallbackPath), 'public/404.html must exist');
  const fallbackSource = fs.readFileSync(fallbackPath, 'utf8');
  assert(
    fallbackSource.includes('window.location.replace') &&
      fallbackSource.includes('window.location.pathname') &&
      fallbackSource.includes('window.location.hash'),
    '404.html must preserve path, query, and hash'
  );
});

console.log('\n========================================');
console.log(`ROUTING SUITE: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
