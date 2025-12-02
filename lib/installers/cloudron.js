/**
 * Cloudron Kurulum Modülü
 */

const name = 'Cloudron';
const description = 'Self-hosted uygulama platformu';
const version = 'latest';

/**
 * Cloudron kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  const domain = options.domain || 'example.com';
  
  return [
    {
      title: 'Sistem güncelleniyor',
      command: 'sudo apt-get update && sudo apt-get upgrade -y',
    },
    {
      title: 'Gerekli paketler kuruluyor',
      command: 'sudo apt-get install -y curl',
    },
    {
      title: 'Cloudron kurulum scripti indiriliyor ve çalıştırılıyor',
      command: 'wget https://cloudron.io/cloudron-setup && chmod +x cloudron-setup && sudo ./cloudron-setup',
      interactive: true,
    },
  ];
}

/**
 * Kurulum öncesi gereksinimleri döndürür
 */
function getRequirements() {
  return `
Cloudron Gereksinimleri:
  - Ubuntu 22.04 veya 24.04 (temiz kurulum önerilir)
  - Minimum 2GB RAM (4GB önerilir)
  - Minimum 20GB disk alanı
  - Geçerli bir domain adı
  - DNS ayarlarının yapılmış olması

Desteklenen bulut sağlayıcıları:
  - DigitalOcean
  - Linode
  - Vultr
  - Hetzner
  - AWS EC2
  - Google Cloud
  - Azure
`;
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  return `
Cloudron kurulumu başlatıldı!

Kurulum tamamlandıktan sonra:
  1. https://my.<domain> adresine gidin
  2. Admin hesabınızı oluşturun
  3. Uygulamalarınızı kurmaya başlayın

Kullanışlı komutlar:
  cloudron status           # Durumu kontrol et
  cloudron logs            # Logları görüntüle
  cloudron backup create   # Yedek oluştur

Konfigürasyon: /home/yellowtent/configs
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  return [
    {
      title: 'Cloudron kaldırılıyor',
      command: 'sudo cloudron-uninstall',
      interactive: true,
    },
  ];
}

module.exports = {
  name,
  description,
  version,
  getInstallCommands,
  getRequirements,
  getPostInstallInfo,
  getUninstallCommands,
};
