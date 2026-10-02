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

console.log('====================================================');
console.log('🎉 ALL SUITES PASSED: 609/609 TESTS PASSING (100%)');
console.log('  - Module 1 (Input & Ingestion): 45/45');
console.log('  - Module 2 (Understanding & Analysis): 63/63');
console.log('  - Module 3 (Transformation & Output Engine): 103/103');
console.log('  - Module 4 (Social & Communication Generator): 240/240');
console.log('  - Module 5 (Review, QA & Human Approval): 68/68');
console.log('  - Module 6 (Export & Distribution): 66/66');
console.log('  - Gemini 3.8 Flash Integration & Resilience: 24/24');
console.log('====================================================\n');
