/**
 * Seyfo - Ubuntu Kurulum Kolaylaştırma ve Process Manager CLI
 */

const installers = require('./installers');
const pm = require('./pm');
const platform = require('./platform');

/**
 * Kurulabilir yazılımların listesini döndürür
 * @returns {Array} Yazılım listesi
 */
function getAvailableSoftware() {
  return [
    { id: 'mongodb', name: 'MongoDB', description: 'NoSQL veritabanı sistemi' },
    { id: 'cloudron', name: 'Cloudron', description: 'Self-hosted uygulama platformu' },
    { id: 'docker', name: 'Docker', description: 'Container platformu' },
    { id: 'nginx', name: 'Nginx', description: 'Web sunucusu ve reverse proxy' },
    { id: 'postgresql', name: 'PostgreSQL', description: 'İlişkisel veritabanı' },
    { id: 'redis', name: 'Redis', description: 'In-memory veri deposu' },
    { id: 'certbot', name: 'Certbot', description: 'Let\'s Encrypt SSL aracı' },
  ];
}

/**
 * Belirli bir yazılımın installer'ını döndürür
 * @param {string} name - Yazılım adı
 * @returns {Object|null} Installer objesi
 */
function getInstaller(name) {
  return installers[name.toLowerCase()] || null;
}

/**
 * Versiyon bilgisini döndürür
 * @returns {string} Versiyon
 */
function getVersion() {
  return require('../package.json').version;
}

/**
 * Tüm installer'ları döndürür
 * @returns {Object} Installer'lar
 */
function getAllInstallers() {
  return installers;
}

module.exports = {
  getAvailableSoftware,
  getInstaller,
  getVersion,
  getAllInstallers,
  installers,
  pm,
  platform,
};
