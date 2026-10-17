import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('✨ INFOFLIP-AI LANDING PAGE ANIMATION & RESPONSIVENESS SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

const landingPagePath = path.join(SRC_DIR, 'components/LandingPage.jsx');
const scrollRevealPath = path.join(SRC_DIR, 'components/common/ScrollReveal.jsx');
const indexCssPath = path.join(SRC_DIR, 'index.css');

const landingPageSource = fs.readFileSync(landingPagePath, 'utf8');
const scrollRevealSource = fs.readFileSync(scrollRevealPath, 'utf8');
const indexCssSource = fs.readFileSync(indexCssPath, 'utf8');

// --- Section 1: Scroll-Triggered Fade-In Animations ---
console.log('--- Suite 1: Scroll-Triggered Fade-In Animations ---');

test('1. ScrollReveal component and useScrollReveal hook exist and use IntersectionObserver', () => {
  assert(fs.existsSync(scrollRevealPath), 'ScrollReveal.jsx must exist');
  assert(scrollRevealSource.includes('export function useScrollReveal'), 'useScrollReveal hook must be exported');
  assert(scrollRevealSource.includes('export default function ScrollReveal'), 'ScrollReveal default component must be exported');
  assert(scrollRevealSource.includes('IntersectionObserver'), 'Must use IntersectionObserver API');
  assert(scrollRevealSource.includes('observer.unobserve'), 'Must unobserve once visible to prevent repeating animations');
});

test('2. Scroll animation uses subtle 20-35px vertical movement and 600-850ms duration with natural easing', () => {
  assert(indexCssSource.includes('.reveal-on-scroll'), 'CSS must define .reveal-on-scroll');
  assert(indexCssSource.includes('transform: translateY(26px)') || indexCssSource.includes('transform: translateY(24px)'), 'Must use subtle vertical movement (20-35px)');
  assert(indexCssSource.includes('transition-duration: 720ms') || indexCssSource.includes('transition-duration: 700ms') || indexCssSource.includes('transition-duration: 750ms'), 'Must use moderate speed (600-850ms)');
  assert(indexCssSource.includes('cubic-bezier(0.16, 1, 0.3, 1)') || indexCssSource.includes('ease-out'), 'Must use natural ease-out curve');
  assert(indexCssSource.includes('opacity: 0'), 'Initial opacity must be 0');
  assert(indexCssSource.includes('.reveal-on-scroll.is-visible') && indexCssSource.includes('opacity: 1') && indexCssSource.includes('transform: translateY(0)'), 'is-visible must set opacity: 1 and translateY(0)');
});

test('3. Respects prefers-reduced-motion and provides fallback timer to prevent permanently hidden content', () => {
  assert(scrollRevealSource.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion in JS');
  assert(scrollRevealSource.includes('fallbackTimer') || scrollRevealSource.includes('setTimeout'), 'Must include safety fallback timer');
  assert(indexCssSource.includes('@media (prefers-reduced-motion: reduce)'), 'CSS must handle prefers-reduced-motion');
  assert(indexCssSource.includes('.reveal-on-scroll') && indexCssSource.includes('opacity: 1 !important'), 'Reduced motion must immediately force opacity 1 and transform none');
});

test('4. Stagger delays between sibling cards are in the 80-120ms range', () => {
  assert(landingPageSource.includes('delay={index * 100}'), 'Card groups must stagger with 100ms interval (80-120ms range)');
  assert(landingPageSource.includes('delay={0}') && landingPageSource.includes('delay={90}') && landingPageSource.includes('delay={180}'), 'Hero elements must sequence smoothly');
});

// --- Section 2: Subtle Card and Text Highlights ---
console.log('\n--- Suite 2: Subtle Card and Text Highlights ---');

test('5. Cards feature subtle hover lift (2-4px), enhanced shadow/border, and smooth 200-300ms return', () => {
  assert(indexCssSource.includes('.saas-card-interactive'), 'CSS must define .saas-card-interactive');
  assert(indexCssSource.includes('transform: translateY(-3px)'), 'Must use small lift effect of 2-4px (-3px)');
  assert(indexCssSource.includes('transition-duration: 250ms'), 'Transition duration must be 200-300ms (250ms)');
  assert(landingPageSource.includes('hover:border-primary/50'), 'Cards must strengthen border on hover with existing primary theme token');
  assert(landingPageSource.includes('hover:shadow-md'), 'Cards must subtly elevate shadow on hover');
});

test('6. Mobile touch devices are protected from sticky hover lift via pointer fine media query', () => {
  assert(indexCssSource.includes('@media (hover: hover) and (pointer: fine)'), 'Hover lift must only apply to pointer devices, not touch screens');
});

test('7. Headings, stage titles, and capability titles have subtle hover transition highlights', () => {
  assert(landingPageSource.includes('group-hover:text-primary dark:group-hover:text-accent transition-colors duration-200'), 'Card titles must highlight smoothly on card hover');
  assert(landingPageSource.includes('group-hover:scale-105 transition-all duration-200'), 'Card icons/badges must subtly scale on hover');
});

test('8. Buttons have smooth hover, focus-visible ring, and pressed active states', () => {
  assert(landingPageSource.includes('hover:bg-primary-hover active:scale-[0.98]'), 'Buttons must have smooth hover and active pressed state');
  assert(landingPageSource.includes('focus-visible:ring-2 focus-visible:ring-focus-ring'), 'Buttons must preserve visible keyboard focus rings');
});

// --- Section 3: Complete Website Responsiveness ---
console.log('\n--- Suite 3: Complete Website Responsiveness ---');

test('9. Root container has overflow-x-hidden preventing horizontal scrolling across viewports', () => {
  assert(landingPageSource.includes('overflow-x-hidden'), 'Root wrapper must have overflow-x-hidden');
});

test('10. Multi-column grids adapt responsively for mobile (320px-390px), tablet (768px), and desktop (1024px-1440px)', () => {
  // Hero section grid: 1 col on mobile/tablet, 12-col split on desktop
  assert(landingPageSource.includes('grid-cols-1 lg:grid-cols-12'), 'Hero must be 1 column on mobile/tablet and split on lg desktop');
  
  // How it works grid: 1 col on mobile, 2 col on md tablet, 3 col on lg desktop
  assert(landingPageSource.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'), 'Stage cards must stack 1 col on mobile, 2 col on tablet, 3 col on desktop');
  
  // Deliverables mini-cards: 1 col on small mobile, 2 col on sm+
  assert(landingPageSource.includes('grid-cols-1 sm:grid-cols-2'), 'Deliverables cards must adapt on mobile');
});

test('11. Small screen (320px) optimizations: text wrapping, scalable headings, and flexible buttons', () => {
  assert(landingPageSource.includes('break-words'), 'Hero heading must have break-words to prevent clipping at 320px');
  assert(landingPageSource.includes('text-2xl sm:text-4xl lg:text-5xl'), 'Hero heading must scale naturally from 2xl on mobile to 5xl on desktop');
  assert(landingPageSource.includes('max-w-full'), 'Badges must fit within 320px without overflow');
  assert(landingPageSource.includes('w-full sm:w-auto'), 'Buttons must expand for touch targets on mobile and size naturally on desktop');
});

test('12. Theme consistency: Zero forbidden color classes (indigo, brand, purple, violet, fuchsia)', () => {
  const forbiddenRegex = /\b(indigo|brand|purple|violet|fuchsia)-/i;
  assert(!forbiddenRegex.test(landingPageSource), 'LandingPage.jsx must have zero forbidden classes');
  assert(!forbiddenRegex.test(scrollRevealSource), 'ScrollReveal.jsx must have zero forbidden classes');
});

// --- Section 4: Content and Feature Integrity ---
console.log('\n--- Suite 4: Content and Feature Integrity ---');

test('13. All 6 workflow stages and status labels are preserved with exact content', () => {
  assert(landingPageSource.includes("title: 'Input'"), 'Input stage preserved');
  assert(landingPageSource.includes("title: 'Understand'"), 'Understand stage preserved');
  assert(landingPageSource.includes("title: 'Transform'"), 'Transform stage preserved');
  assert(landingPageSource.includes("title: 'Communicate'"), 'Communicate stage preserved');
  assert(landingPageSource.includes("title: 'Review'"), 'Review stage preserved');
  assert(landingPageSource.includes("title: 'Export'"), 'Export stage preserved');
  assert(landingPageSource.includes('Implemented'), 'Implemented status preserved');
});

test('14. All 5 capabilities + 6th evaluate CTA card are preserved with exact content', () => {
  assert(landingPageSource.includes("title: 'Multi-Format Generation'"), 'Multi-Format Generation preserved');
  assert(landingPageSource.includes("title: 'Source Traceability'"), 'Source Traceability preserved');
  assert(landingPageSource.includes("title: 'Quality Checks'"), 'Quality Checks preserved');
  assert(landingPageSource.includes("title: 'Human Review'"), 'Human Review preserved');
  assert(landingPageSource.includes("title: 'Approved-Content Export'"), 'Approved-Content Export preserved');
  assert(landingPageSource.includes('Ready to Evaluate in Your Browser'), 'Evaluate CTA preserved');
});

test('15. Footer retains SIH26154 info, GitHub repository link, and no credentials', () => {
  assert(landingPageSource.includes('SIH26154'), 'SIH26154 label preserved');
  assert(landingPageSource.includes('https://github.com/MinalMaurya/InfoFlip-AI'), 'GitHub URL preserved');
  assert(landingPageSource.includes('<span>View Source Code</span>'), 'View Source Code text preserved');
  assert(!landingPageSource.includes('AIza'), 'Zero API keys');
  assert(!landingPageSource.includes('sk-'), 'Zero secrets');
});

// --- Section 5: Workspace Header Decluttering & Landing Page Entry ---
console.log('\n--- Suite 5: Workspace Header Decluttering & Landing Page Entry ---');

const chatWorkspacePath = path.join(SRC_DIR, 'components/workspace/ChatWorkspace.jsx');
const leftSidebarPath = path.join(SRC_DIR, 'components/workspace/LeftSidebar.jsx');
const chatWorkspaceSource = fs.readFileSync(chatWorkspacePath, 'utf8');
const leftSidebarSource = fs.readFileSync(leftSidebarPath, 'utf8');

test('16. Root URL defaults to Landing Page as initial entry point', async () => {
  const { parseCurrentRoute } = await import('../services/routing/routeService.js');
  const route = parseCurrentRoute({ pathname: '/', hash: '', search: '' });
  assert.strictEqual(route.showLandingPage, true, 'Root URL must show landing page');
});

test('17. Redundant Landing Page button is removed from workspace top header', () => {
  assert(!chatWorkspaceSource.includes('title="Return to Landing Page"'), 'Redundant Landing Page button must be removed from ChatWorkspace top header');
  assert(!chatWorkspaceSource.includes('<span className="hidden sm:inline">Landing Page</span>'), 'Header text must be removed');
});

test('18. LeftSidebar preserves Landing Page navigation item and routing', () => {
  assert(leftSidebarSource.includes('<span>Landing Page</span>') || leftSidebarSource.includes('Landing Page'), 'LeftSidebar must retain Landing Page item');
});

test('19. Previous Prototype button and ThemeToggle remain in top header with full functionality', () => {
  assert(chatWorkspaceSource.includes('<span>Previous Prototype</span>'), 'Previous Prototype button must remain in top header');
  assert(chatWorkspaceSource.includes('<ThemeToggle />'), 'ThemeToggle must remain in top header');
});

test('20. Five-stage progress strip is hidden visually to reduce workspace header clutter while preserving logic', () => {
  assert(chatWorkspaceSource.includes('aria-label="Transformation Workflow Hierarchy"'), 'Workflow hierarchy preserved in DOM for accessibility');
  assert(chatWorkspaceSource.includes('className="hidden"'), 'Progress strip must be hidden visually with className="hidden"');
  assert(chatWorkspaceSource.includes('<span>Source Document</span>'), 'Underlying stage 1 preserved');
  assert(chatWorkspaceSource.includes('<span>Selected Formats</span>'), 'Underlying stage 2 preserved');
  assert(chatWorkspaceSource.includes('<span>Generated Outputs</span>'), 'Underlying stage 3 preserved');
  assert(chatWorkspaceSource.includes('<span>Quality Review</span>'), 'Underlying stage 4 preserved');
  assert(chatWorkspaceSource.includes('<span>Approved Export</span>'), 'Underlying stage 5 preserved');
});

console.log('\n====================================================');
console.log(`ANIMATION & RESPONSIVENESS SUITE: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}

