/**
 * Nginx Kurulum Modülü
 */

const isWindows = process.platform === 'win32';

const name = 'Nginx';
const description = 'Web sunucusu ve reverse proxy';
const version = 'latest';

/**
 * Nginx kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  // Windows kurulumu (winget)
  if (isWindows) {
    return [
      {
        title: 'Nginx kuruluyor (winget)',
        command: 'winget install -e --id Nginx.Nginx --accept-source-agreements --accept-package-agreements',
      },
    ];
  }

  // Linux kurulumu
  const mainline = options.mainline || false;
  
  const commands = [
    {
      title: 'Gerekli paketler kuruluyor',
      command: 'sudo apt-get update && sudo apt-get install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring',
    },
  ];
  
  if (mainline) {
    commands.push(
      {
        title: 'Nginx signing key ekleniyor',
        command: 'curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null',
      },
      {
        title: 'Nginx mainline repository ekleniyor',
        command: 'echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list',
      }
    );
  }
  
  commands.push(
    {
      title: 'Paket listesi güncelleniyor',
      command: 'sudo apt-get update',
    },
    {
      title: 'Nginx kuruluyor',
      command: 'sudo apt-get install -y nginx',
    },
    {
      title: 'Nginx başlatılıyor',
      command: 'sudo systemctl start nginx && sudo systemctl enable nginx',
    },
    {
      title: 'Firewall ayarlanıyor',
      command: 'sudo ufw allow "Nginx Full" 2>/dev/null || true',
    }
  );
  
  return commands;
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  if (isWindows) {
    return `
Nginx başarıyla kuruldu!

Test: Tarayıcıda http://localhost adresine gidin

Kullanışlı komutlar:
  nginx                            # Nginx başlat
  nginx -s stop                    # Durdur
  nginx -s reload                  # Konfigürasyonu yeniden yükle
  nginx -t                         # Konfigürasyon test

Varsayılan dizin: C:\\nginx
Konfigürasyon: C:\\nginx\\conf\\nginx.conf
`;
  }

  return `
Nginx başarıyla kuruldu!

Test: Tarayıcıda http://sunucu-ip adresine gidin

Kullanışlı komutlar:
  sudo systemctl status nginx      # Durumu kontrol et
  sudo systemctl reload nginx      # Konfigürasyonu yeniden yükle
  sudo systemctl restart nginx     # Yeniden başlat
  sudo nginx -t                    # Konfigürasyon test

Önemli dizinler:
  /etc/nginx/                      # Ana konfigürasyon
  /etc/nginx/sites-available/     # Site konfigürasyonları
  /etc/nginx/sites-enabled/       # Aktif siteler
  /var/www/html/                   # Varsayılan web root
  /var/log/nginx/                  # Log dosyaları

Yeni site eklemek:
  1. /etc/nginx/sites-available/ altına config oluştur
  2. sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/
  3. sudo nginx -t && sudo systemctl reload nginx
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  if (isWindows) {
    return [
      {
        title: 'Nginx kaldırılıyor',
        command: 'winget uninstall --id Nginx.Nginx',
      },
    ];
  }

  return [
    {
      title: 'Nginx durduruluyor',
      command: 'sudo systemctl stop nginx',
    },
    {
      title: 'Nginx kaldırılıyor',
      command: 'sudo apt-get purge -y nginx nginx-common',
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
