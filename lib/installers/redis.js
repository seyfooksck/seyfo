/**
 * Redis Kurulum Modülü
 */

const isWindows = process.platform === 'win32';

const name = 'Redis';
const description = 'In-memory veri yapısı deposu';
const version = 'latest';

/**
 * Redis kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  // Windows kurulumu (winget - Memurai Redis uyumlu)
  if (isWindows) {
    return [
      {
        title: 'Memurai (Redis for Windows) kuruluyor',
        command: 'winget install -e --id Memurai.MemuraiDeveloper --accept-source-agreements --accept-package-agreements',
      },
    ];
  }

  // Linux kurulumu
  return [
    {
      title: 'Redis GPG anahtarı ekleniyor',
      command: 'curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg',
    },
    {
      title: 'Redis repository ekleniyor',
      command: 'echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list',
    },
    {
      title: 'Paket listesi güncelleniyor',
      command: 'sudo apt-get update',
    },
    {
      title: 'Redis kuruluyor',
      command: 'sudo apt-get install -y redis',
    },
    {
      title: 'Redis başlatılıyor',
      command: 'sudo systemctl start redis-server && sudo systemctl enable redis-server',
    },
  ];
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  if (isWindows) {
    return `
Memurai (Redis for Windows) başarıyla kuruldu!

Kullanışlı komutlar:
  memurai-cli                        # Redis CLI'ya bağlan
  memurai-cli ping                   # Bağlantı testi (PONG döner)

Windows Servisi:
  net start memurai                  # Servisi başlat
  net stop memurai                   # Servisi durdur

Varsayılan port: 6379
Not: Memurai, Windows için tam Redis uyumlu bir alternatiftir.
`;
  }

  return `
Redis başarıyla kuruldu!

Kullanışlı komutlar:
  sudo systemctl status redis-server   # Durumu kontrol et
  redis-cli                            # Redis CLI'ya bağlan
  redis-cli ping                       # Bağlantı testi (PONG döner)
  redis-cli info                       # Sunucu bilgisi

Redis CLI içinde:
  SET key "value"                      # Değer kaydet
  GET key                              # Değer al
  KEYS *                               # Tüm anahtarları listele
  FLUSHALL                             # Tüm verileri sil

Konfigürasyon: /etc/redis/redis.conf

Güvenlik için şifre eklemek:
  1. /etc/redis/redis.conf dosyasını düzenle
  2. requirepass <şifre> satırını ekle
  3. sudo systemctl restart redis-server
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  if (isWindows) {
    return [
      {
        title: 'Memurai kaldırılıyor',
        command: 'winget uninstall --id Memurai.MemuraiDeveloper',
      },
    ];
  }

  return [
    {
      title: 'Redis durduruluyor',
      command: 'sudo systemctl stop redis-server',
    },
    {
      title: 'Redis kaldırılıyor',
      command: 'sudo apt-get purge -y redis',
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
