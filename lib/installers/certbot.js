/**
 * Certbot (Let's Encrypt) Kurulum Modülü
 */

const name = 'Certbot';
const description = 'Let\'s Encrypt SSL sertifikası aracı';
const version = 'latest';

/**
 * Certbot kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  const webserver = options.webserver || 'nginx';
  
  const commands = [
    {
      title: 'Snapd kuruluyor/güncelleniyor',
      command: 'sudo apt-get update && sudo apt-get install -y snapd',
    },
    {
      title: 'Snapd core güncelleniyor',
      command: 'sudo snap install core && sudo snap refresh core',
    },
    {
      title: 'Eski certbot kaldırılıyor (varsa)',
      command: 'sudo apt-get remove -y certbot 2>/dev/null || true',
    },
    {
      title: 'Certbot kuruluyor',
      command: 'sudo snap install --classic certbot',
    },
    {
      title: 'Certbot PATH\'e ekleniyor',
      command: 'sudo ln -sf /snap/bin/certbot /usr/bin/certbot',
    },
  ];
  
  if (webserver === 'nginx') {
    commands.push({
      title: 'Certbot Nginx eklentisi kuruluyor',
      command: 'sudo snap install certbot-dns-cloudflare 2>/dev/null || true',
    });
  } else if (webserver === 'apache') {
    commands.push({
      title: 'Certbot Apache eklentisi kuruluyor', 
      command: 'sudo apt-get install -y python3-certbot-apache',
    });
  }
  
  return commands;
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  return `
Certbot başarıyla kuruldu!

SSL sertifikası almak:

  Nginx için:
    sudo certbot --nginx -d example.com -d www.example.com

  Apache için:
    sudo certbot --apache -d example.com -d www.example.com

  Sadece sertifika (manuel):
    sudo certbot certonly --standalone -d example.com

  Wildcard sertifika (DNS doğrulama):
    sudo certbot certonly --manual --preferred-challenges dns -d *.example.com

Kullanışlı komutlar:
  sudo certbot certificates           # Mevcut sertifikaları listele
  sudo certbot renew                  # Sertifikaları yenile
  sudo certbot renew --dry-run       # Yenileme testi
  sudo certbot delete                # Sertifika sil

Otomatik yenileme zaten aktif (snap ile).
Test: sudo certbot renew --dry-run

Sertifikalar: /etc/letsencrypt/live/<domain>/
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  return [
    {
      title: 'Certbot kaldırılıyor',
      command: 'sudo snap remove certbot',
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
