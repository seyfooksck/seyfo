const seyfo = require('./index');
const installers = require('./installers');

describe('Seyfo CLI', () => {
  describe('getAvailableSoftware', () => {
    test('yazılım listesi döndürmeli', () => {
      const software = seyfo.getAvailableSoftware();
      expect(Array.isArray(software)).toBe(true);
      expect(software.length).toBeGreaterThan(0);
    });

    test('her yazılımın id, name ve description alanı olmalı', () => {
      const software = seyfo.getAvailableSoftware();
      software.forEach((sw) => {
        expect(sw).toHaveProperty('id');
        expect(sw).toHaveProperty('name');
        expect(sw).toHaveProperty('description');
      });
    });
  });

  describe('getInstaller', () => {
    test('mongodb installer döndürmeli', () => {
      const installer = seyfo.getInstaller('mongodb');
      expect(installer).toBeDefined();
      expect(installer.name).toBe('MongoDB');
    });

    test('geçersiz isim için null döndürmeli', () => {
      const installer = seyfo.getInstaller('invalid');
      expect(installer).toBeNull();
    });
  });

  describe('getVersion', () => {
    test('versiyon döndürmeli', () => {
      const version = seyfo.getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });
  });
});

describe('Installers', () => {
  const installerNames = ['mongodb', 'docker', 'nginx', 'postgresql', 'redis', 'certbot', 'cloudron'];

  installerNames.forEach((name) => {
    describe(name, () => {
      const installer = installers[name];

      test('name ve description olmalı', () => {
        expect(installer.name).toBeDefined();
        expect(installer.description).toBeDefined();
      });

      test('getInstallCommands fonksiyonu olmalı', () => {
        expect(typeof installer.getInstallCommands).toBe('function');
      });

      test('getInstallCommands array döndürmeli', () => {
        const commands = installer.getInstallCommands();
        expect(Array.isArray(commands)).toBe(true);
        expect(commands.length).toBeGreaterThan(0);
      });

      test('her komutun title ve command alanı olmalı', () => {
        const commands = installer.getInstallCommands();
        commands.forEach((cmd) => {
          expect(cmd).toHaveProperty('title');
          expect(cmd).toHaveProperty('command');
        });
      });

      test('getPostInstallInfo fonksiyonu olmalı', () => {
        expect(typeof installer.getPostInstallInfo).toBe('function');
        const info = installer.getPostInstallInfo();
        expect(typeof info).toBe('string');
      });
    });
  });
});
