/**
 * PostgreSQL Kurulum Modülü
 */

const isWindows = process.platform === 'win32';

const name = 'PostgreSQL';
const description = 'İlişkisel veritabanı sistemi';
const version = '16';

/**
 * PostgreSQL kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  const pgVersion = options.version || '16';
  
  // Windows kurulumu (winget)
  if (isWindows) {
    return [
      {
        title: 'PostgreSQL kuruluyor (winget)',
        command: 'winget install -e --id PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements',
      },
      {
        title: 'pgAdmin 4 kuruluyor (GUI)',
        command: 'winget install -e --id PostgreSQL.pgAdmin --accept-source-agreements --accept-package-agreements',
      },
    ];
  }

  // Linux kurulumu
  return [
    {
      title: 'PostgreSQL GPG anahtarı ekleniyor',
      command: 'curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg',
    },
    {
      title: 'PostgreSQL repository ekleniyor',
      command: 'echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list',
    },
    {
      title: 'Paket listesi güncelleniyor',
      command: 'sudo apt-get update',
    },
    {
      title: 'PostgreSQL kuruluyor',
      command: `sudo apt-get install -y postgresql-${pgVersion} postgresql-contrib`,
    },
    {
      title: 'PostgreSQL başlatılıyor',
      command: 'sudo systemctl start postgresql && sudo systemctl enable postgresql',
    },
  ];
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  if (isWindows) {
    return `
PostgreSQL başarıyla kuruldu!

Kullanışlı komutlar:
  psql -U postgres                   # PostgreSQL shell
  pgAdmin 4                          # GUI ile yönet

Windows Servisi:
  net start postgresql               # Servisi başlat
  net stop postgresql                # Servisi durdur

Varsayılan bağlantı: localhost:5432
Kullanıcı: postgres
`;
  }

  return `
PostgreSQL başarıyla kuruldu!

Kullanışlı komutlar:
  sudo systemctl status postgresql    # Durumu kontrol et
  sudo -u postgres psql              # PostgreSQL shell
  sudo -u postgres createuser        # Kullanıcı oluştur
  sudo -u postgres createdb          # Veritabanı oluştur

İlk kullanıcı ve veritabanı oluşturmak:
  sudo -u postgres psql
  CREATE USER myuser WITH PASSWORD 'mypassword';
  CREATE DATABASE mydb OWNER myuser;
  GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
  \\q

Konfigürasyon dosyaları:
  /etc/postgresql/16/main/postgresql.conf
  /etc/postgresql/16/main/pg_hba.conf

Uzaktan erişim için pg_hba.conf düzenleyin ve
postgresql.conf'ta listen_addresses = '*' yapın
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  if (isWindows) {
    return [
      {
        title: 'PostgreSQL kaldırılıyor',
        command: 'winget uninstall --id PostgreSQL.PostgreSQL',
      },
      {
        title: 'pgAdmin 4 kaldırılıyor',
        command: 'winget uninstall --id PostgreSQL.pgAdmin',
      },
    ];
  }

  return [
    {
      title: 'PostgreSQL durduruluyor',
      command: 'sudo systemctl stop postgresql',
    },
    {
      title: 'PostgreSQL kaldırılıyor',
      command: 'sudo apt-get purge -y postgresql*',
    },
    {
      title: 'Data dizini temizleniyor',
      command: 'sudo rm -rf /var/lib/postgresql',
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
