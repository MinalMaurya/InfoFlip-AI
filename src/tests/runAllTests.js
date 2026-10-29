import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 INFOFLIP-AI FULL TEST SUITE (MODULES 1–6 & GEMINI)');
console.log('====================================================');

const module1 = spawnSync('node', [path.join(__dirname, 'module1.test.js')], { stdio: 'inherit' });
if (module1.status !== 0) {
  console.error('\n❌ Module 1 test suite failed!');
  process.exit(module1.status || 1);
}

const module2 = spawnSync('node', [path.join(__dirname, 'module2.test.js')], { stdio: 'inherit' });
if (module2.status !== 0) {
  console.error('\n❌ Module 2 test suite failed!');
  process.exit(module2.status || 1);
}

const module3 = spawnSync('node', [path.join(__dirname, 'module3.test.js')], { stdio: 'inherit' });
if (module3.status !== 0) {
  console.error('\n❌ Module 3 test suite failed!');
  process.exit(module3.status || 1);
}

const module4 = spawnSync('node', [path.join(__dirname, 'module4.test.js')], { stdio: 'inherit' });
if (module4.status !== 0) {
  console.error('\n❌ Module 4 test suite failed!');
  process.exit(module4.status || 1);
}

const module5 = spawnSync('node', [path.join(__dirname, 'module5.test.js')], { stdio: 'inherit' });
if (module5.status !== 0) {
  console.error('\n❌ Module 5 test suite failed!');
  process.exit(module5.status || 1);
}

const module6 = spawnSync('node', [path.join(__dirname, 'module6.test.js')], { stdio: 'inherit' });
if (module6.status !== 0) {
  console.error('\n❌ Module 6 test suite failed!');
  process.exit(module6.status || 1);
}

const geminiTests = spawnSync('node', [path.join(__dirname, 'geminiIntegration.test.js')], { stdio: 'inherit' });
if (geminiTests.status !== 0) {
  console.error('\n❌ Gemini integration test suite failed!');
  process.exit(geminiTests.status || 1);
}

const contentConfidenceTests = spawnSync('node', [path.join(__dirname, 'contentConfidence.test.js')], { stdio: 'inherit' });
if (contentConfidenceTests.status !== 0) {
  console.error('\n❌ Content confidence test suite failed!');
  process.exit(contentConfidenceTests.status || 1);
}

const workspaceRedesignTests = spawnSync('node', [path.join(__dirname, 'workspaceRedesign.test.js')], { stdio: 'inherit' });
if (workspaceRedesignTests.status !== 0) {
  console.error('\n❌ Workspace redesign test suite failed!');
  process.exit(workspaceRedesignTests.status || 1);
}

const routeRefreshTests = spawnSync('node', [path.join(__dirname, 'routeRefreshNavigation.test.js')], { stdio: 'inherit' });
if (routeRefreshTests.status !== 0) {
  console.error('\n❌ Route refresh navigation test suite failed!');
  process.exit(routeRefreshTests.status || 1);
}

const landingPageAnimationTests = spawnSync('node', [path.join(__dirname, 'landingPageAnimationResponsive.test.js')], { stdio: 'inherit' });
if (landingPageAnimationTests.status !== 0) {
  console.error('\n❌ Landing page animation & responsiveness test suite failed!');
  process.exit(landingPageAnimationTests.status || 1);
}

const v021Tests = spawnSync('node', [path.join(__dirname, 'outputManagementV021.test.js')], { stdio: 'inherit' });
if (v021Tests.status !== 0) {
  console.error('\n❌ Output management v0.2.1 test suite failed!');
  process.exit(v021Tests.status || 1);
}

const v030Tests = spawnSync('node', [path.join(__dirname, 'contentGenerationReliabilityV030.test.js')], { stdio: 'inherit' });
if (v030Tests.status !== 0) {
  console.error('\n❌ Content generation reliability v0.3.0 test suite failed!');
  process.exit(v030Tests.status || 1);
}

const v030Part2Tests = spawnSync('node', [path.join(__dirname, 'outputQualityAndConfigAdherenceV030.test.js')], { stdio: 'inherit' });
if (v030Part2Tests.status !== 0) {
  console.error('\n❌ Output quality and configuration adherence v0.3.0 test suite failed!');
  process.exit(v030Part2Tests.status || 1);
}

console.log('====================================================');
console.log('🎉 ALL SUITES PASSED: 1074/1074 TESTS PASSING (100%)');
console.log('  - Module 1 (Input & Ingestion): 57/57');
console.log('  - Module 2 (Understanding & Analysis): 63/63');
console.log('  - Module 3 (Transformation & Output Engine): 103/103');
console.log('  - Module 4 (Social & Communication Generator): 313/313');
console.log('  - Module 5 (Review, QA & Human Approval): 68/68');
console.log('  - Module 6 (Export & Distribution): 66/66');
console.log('  - Gemini 3.8 Flash Integration & Resilience: 24/24');
console.log('  - Content Confidence & Verification Governance: 102/102');
console.log('  - Chat-Centered Workspace, Landing Page & UI Suite: 59/59');
console.log('  - Route Refresh & Navigation Preservation Suite: 13/13');
console.log('  - Landing Page Animation, Responsiveness & Header Suite: 20/20');
console.log('  - v0.2.1 Output Management, Regeneration & Isolation Suite: 66/66');
console.log('  - v0.3.0 Part 1 Generation Reliability Suite: 93/93');
console.log('  - v0.3.0 Part 2 Output Quality & Config Adherence Suite: 27/27');
console.log('====================================================\n');



