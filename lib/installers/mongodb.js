/**
 * MongoDB Kurulum Modülü
 */

const os = require('os');
const isWindows = process.platform === 'win32';

const name = 'MongoDB';
const description = 'NoSQL veritabanı sistemi';
const version = '7.0';

/**
 * MongoDB kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  const mongoVersion = options.version || '7.0';
  
  // Windows kurulumu (winget)
  if (isWindows) {
    return [
      {
        title: 'MongoDB kuruluyor (winget)',
        command: 'winget install -e --id MongoDB.Server --accept-source-agreements --accept-package-agreements',
      },
      {
        title: 'MongoDB Compass kuruluyor (GUI)',
        command: 'winget install -e --id MongoDB.Compass.Full --accept-source-agreements --accept-package-agreements',
      },
      {
        title: 'MongoDB Shell kuruluyor',
        command: 'winget install -e --id MongoDB.Shell --accept-source-agreements --accept-package-agreements',
      },
    ];
  }
  
  // Linux kurulumu
  return [
    {
      title: 'GPG anahtarı ekleniyor',
      command: 'curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor',
    },
    {
      title: 'MongoDB repository ekleniyor',
      command: `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/${mongoVersion} multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-${mongoVersion}.list`,
    },
    {
      title: 'Paket listesi güncelleniyor',
      command: 'sudo apt-get update',
    },
    {
      title: 'MongoDB kuruluyor',
      command: 'sudo apt-get install -y mongodb-org',
    },
    {
      title: 'MongoDB servisi başlatılıyor',
      command: 'sudo systemctl start mongod',
    },
    {
      title: 'MongoDB otomatik başlatma aktif ediliyor',
      command: 'sudo systemctl enable mongod',
    },
  ];
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  if (isWindows) {
    return `
MongoDB başarıyla kuruldu!

Kullanışlı komutlar:
  mongosh                         # MongoDB shell'e bağlan
  MongoDB Compass                 # GUI ile yönet

Windows Servisi:
  net start MongoDB               # Servisi başlat
  net stop MongoDB                # Servisi durdur
  
Varsayılan bağlantı: mongodb://localhost:27017
`;
  }

  return `
MongoDB başarıyla kuruldu!

Kullanışlı komutlar:
  sudo systemctl status mongod    # Durumu kontrol et
  sudo systemctl restart mongod   # Yeniden başlat
  mongosh                         # MongoDB shell'e bağlan

Konfigürasyon: /etc/mongod.conf
Log dosyası: /var/log/mongodb/mongod.log
Data dizini: /var/lib/mongodb
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  if (isWindows) {
    return [
      {
        title: 'MongoDB kaldırılıyor',
        command: 'winget uninstall --id MongoDB.Server',
      },
      {
        title: 'MongoDB Compass kaldırılıyor',
        command: 'winget uninstall --id MongoDB.Compass.Full',
      },
      {
        title: 'MongoDB Shell kaldırılıyor',
        command: 'winget uninstall --id MongoDB.Shell',
      },
    ];
  }

  return [
    {
      title: 'MongoDB servisi durduruluyor',
      command: 'sudo systemctl stop mongod',
    },
    {
      title: 'MongoDB kaldırılıyor',
      command: 'sudo apt-get purge -y mongodb-org*',
    },
    {
      title: 'Data dizinleri temizleniyor',
      command: 'sudo rm -rf /var/log/mongodb /var/lib/mongodb',
    },
  ];
}

module.exports = {
  name,
  description,
  version,
  getInstallCommands,
  getPostInstallInfo,
  getUninstallCommands,
};
