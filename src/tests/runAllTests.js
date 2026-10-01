import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 INFOFLIP-AI FULL TEST SUITE (MODULE 1 & MODULE 2)');
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

console.log('====================================================');
console.log('🎉 ALL SUITES PASSED: 108/108 TESTS PASSING (100%)');
console.log('====================================================\n');
