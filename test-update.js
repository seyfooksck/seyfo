#!/usr/bin/env node

/**
 * Test script for update checker functionality
 */

const chalk = require('chalk');

// Test version comparison
function compareVersions(current, latest) {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (c[i] < l[i]) return -1;
    if (c[i] > l[i]) return 1;
  }
  
  return 0;
}

console.log(chalk.cyan('\n🧪 Versiyon Karşılaştırma Testleri\n'));

const tests = [
  { current: '1.4.0', latest: '1.4.0', expected: 0, desc: 'Eşit versiyonlar' },
  { current: '1.4.0', latest: '1.5.0', expected: -1, desc: 'Minor güncelleme' },
  { current: '1.4.0', latest: '2.0.0', expected: -1, desc: 'Major güncelleme (kritik)' },
  { current: '1.4.0', latest: '1.4.1', expected: -1, desc: 'Patch güncelleme' },
  { current: '1.5.0', latest: '1.4.0', expected: 1, desc: 'Dev versiyonu' },
  { current: '2.0.0', latest: '1.9.9', expected: 1, desc: 'Yüksek versiyon' },
];

let passed = 0;
let failed = 0;

tests.forEach((test, i) => {
  const result = compareVersions(test.current, test.latest);
  const status = result === test.expected ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
  
  console.log(`${i + 1}. ${test.desc}`);
  console.log(`   ${test.current} vs ${test.latest}`);
  console.log(`   Beklenen: ${test.expected}, Sonuç: ${result}`);
  console.log(`   ${status}\n`);
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
});

console.log(chalk.cyan('─'.repeat(50)));
console.log(`Toplam: ${tests.length} test`);
console.log(`${chalk.green('Başarılı:')} ${passed}`);
console.log(`${chalk.red('Başarısız:')} ${failed}`);

if (failed === 0) {
  console.log(chalk.green.bold('\n✅ Tüm testler başarılı!\n'));
  process.exit(0);
} else {
  console.log(chalk.red.bold('\n❌ Bazı testler başarısız!\n'));
  process.exit(1);
}
