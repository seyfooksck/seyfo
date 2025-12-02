const pm = require('./pm');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Test için geçici dizin
const TEST_HOME = path.join(os.tmpdir(), 'seyfo-test-' + Date.now());

describe('Seyfo Process Manager', () => {
  beforeAll(() => {
    // Test dizinini ayarla
    process.env.SEYFO_HOME = TEST_HOME;
  });

  afterAll(() => {
    // Test dizinini temizle
    try {
      fs.rmSync(TEST_HOME, { recursive: true, force: true });
    } catch (e) {
      // Temizleme hatası - ignore
      void e;
    }
  });

  describe('formatUptime', () => {
    test('saniye formatı', () => {
      expect(pm.formatUptime(5000)).toBe('5sn');
    });

    test('dakika formatı', () => {
      expect(pm.formatUptime(120000)).toBe('2d 0sn');
    });

    test('saat formatı', () => {
      expect(pm.formatUptime(3700000)).toBe('1s 1d');
    });

    test('gün formatı', () => {
      expect(pm.formatUptime(90000000)).toBe('1g 1s');
    });

    test('null için tire döndürmeli', () => {
      expect(pm.formatUptime(null)).toBe('-');
    });
  });

  describe('isProcessRunning', () => {
    test('mevcut process ID için true döndürmeli', () => {
      expect(pm.isProcessRunning(process.pid)).toBe(true);
    });

    test('geçersiz PID için false döndürmeli', () => {
      expect(pm.isProcessRunning(999999999)).toBe(false);
    });

    test('null PID için false döndürmeli', () => {
      expect(pm.isProcessRunning(null)).toBe(false);
    });
  });

  describe('getHome', () => {
    test('home dizini döndürmeli', () => {
      const home = pm.getHome();
      expect(typeof home).toBe('string');
      expect(home.length).toBeGreaterThan(0);
    });
  });

  describe('list', () => {
    test('array döndürmeli', () => {
      const processes = pm.list();
      expect(Array.isArray(processes)).toBe(true);
    });
  });

  describe('start/stop/remove', () => {
    const testScript = path.join(TEST_HOME, 'test-app.js');
    
    beforeAll(() => {
      // Test script oluştur
      if (!fs.existsSync(TEST_HOME)) {
        fs.mkdirSync(TEST_HOME, { recursive: true });
      }
      fs.writeFileSync(testScript, `
        setInterval(() => {
          console.log('Test app running...');
        }, 1000);
      `);
    });

    test('process başlatabilmeli', () => {
      const proc = pm.start({
        name: 'test-app',
        script: testScript,
      });

      expect(proc.name).toBe('test-app');
      expect(proc.pid).toBeDefined();
      expect(proc.status).toBe('online');
    });

    test('aynı isimle tekrar başlatınca hata vermeli', () => {
      expect(() => {
        pm.start({
          name: 'test-app',
          script: testScript,
        });
      }).toThrow();
    });

    test('process durdurabilmeli', () => {
      const proc = pm.stop('test-app');
      expect(proc.status).toBe('stopped');
    });

    test('process silebilmeli', () => {
      const proc = pm.remove('test-app');
      expect(proc.name).toBe('test-app');
      
      // Listede olmamalı
      const list = pm.list();
      const found = list.find(p => p.name === 'test-app');
      expect(found).toBeUndefined();
    });

    test('olmayan process için hata vermeli', () => {
      expect(() => pm.stop('non-existent')).toThrow();
      expect(() => pm.remove('non-existent')).toThrow();
    });
  });
});
