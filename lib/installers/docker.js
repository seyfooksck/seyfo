/**
 * Docker Kurulum Modülü
 */

const isWindows = process.platform === 'win32';

const name = 'Docker';
const description = 'Container platformu';
const version = 'latest';

/**
 * Docker kurulum komutlarını döndürür
 * @param {Object} options - Kurulum seçenekleri
 * @returns {Array} Kurulum komutları
 */
function getInstallCommands(options = {}) {
  // Windows kurulumu (winget)
  if (isWindows) {
    return [
      {
        title: 'Docker Desktop kuruluyor (winget)',
        command: 'winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements',
      },
    ];
  }
  
  // Linux kurulumu
  const commands = [
    {
      title: 'Eski Docker versiyonları kaldırılıyor',
      command: 'sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true',
    },
    {
      title: 'Gerekli paketler kuruluyor',
      command: 'sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg lsb-release',
    },
    {
      title: 'Docker GPG anahtarı ekleniyor',
      command: 'sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && sudo chmod a+r /etc/apt/keyrings/docker.gpg',
    },
    {
      title: 'Docker repository ekleniyor',
      command: 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
    },
    {
      title: 'Paket listesi güncelleniyor',
      command: 'sudo apt-get update',
    },
    {
      title: 'Docker kuruluyor',
      command: 'sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
    },
    {
      title: 'Kullanıcı docker grubuna ekleniyor',
      command: 'sudo usermod -aG docker $USER',
    },
    {
      title: 'Docker servisi başlatılıyor',
      command: 'sudo systemctl start docker && sudo systemctl enable docker',
    },
  ];
  
  return commands;
}

/**
 * Kurulum sonrası bilgileri döndürür
 */
function getPostInstallInfo() {
  if (isWindows) {
    return `
Docker Desktop başarıyla kuruldu!

ÖNEMLİ: Bilgisayarı yeniden başlatmanız gerekebilir.
        WSL 2 aktif değilse Docker Desktop sizi yönlendirecektir.

Kullanışlı komutlar:
  docker --version              # Versiyon kontrolü
  docker ps                     # Çalışan container'lar
  docker images                 # Mevcut image'lar
  docker compose up -d          # Compose ile başlat

Test:
  docker run hello-world
`;
  }

  return `
Docker başarıyla kuruldu!

ÖNEMLİ: Docker'ı sudo olmadan kullanmak için oturumu kapatıp açın
         veya şu komutu çalıştırın: newgrp docker

Kullanışlı komutlar:
  docker --version              # Versiyon kontrolü
  docker ps                     # Çalışan container'lar
  docker images                 # Mevcut image'lar
  docker compose up -d          # Compose ile başlat
  docker system prune -a        # Temizlik

Test:
  docker run hello-world
`;
}

/**
 * Kaldırma komutlarını döndürür
 */
function getUninstallCommands() {
  if (isWindows) {
    return [
      {
        title: 'Docker Desktop kaldırılıyor',
        command: 'winget uninstall --id Docker.DockerDesktop',
      },
    ];
  }

  return [
    {
      title: 'Docker servisi durduruluyor',
      command: 'sudo systemctl stop docker',
    },
    {
      title: 'Docker paketleri kaldırılıyor',
      command: 'sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
    },
    {
      title: 'Docker verileri temizleniyor',
      command: 'sudo rm -rf /var/lib/docker /var/lib/containerd',
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
