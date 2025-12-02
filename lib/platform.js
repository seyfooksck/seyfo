/**
 * Platform Algılama ve Cross-Platform Destek Modülü
 */

const os = require('os');
const { execSync } = require('child_process');

/**
 * Platform bilgisi
 */
const platform = {
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
  isUnix: process.platform !== 'win32',
  type: process.platform,
  arch: process.arch,
  hostname: os.hostname(),
  release: os.release(),
};

/**
 * Detaylı sistem bilgisi döndürür
 * @returns {Object} Sistem bilgisi
 */
function getSystemInfo() {
  const info = {
    platform: platform.type,
    arch: platform.arch,
    hostname: platform.hostname,
    release: platform.release,
    isWindows: platform.isWindows,
    isLinux: platform.isLinux,
    isMac: platform.isMac,
    nodeVersion: process.version,
    cpus: os.cpus().length,
    totalMemory: formatBytes(os.totalmem()),
    freeMemory: formatBytes(os.freemem()),
    uptime: formatUptime(os.uptime()),
    homeDir: os.homedir(),
    tmpDir: os.tmpdir(),
    user: os.userInfo().username,
  };

  // Linux için ek bilgiler
  if (platform.isLinux) {
    try {
      const osRelease = execSync('cat /etc/os-release 2>/dev/null', { encoding: 'utf-8' });
      
      const nameMatch = osRelease.match(/^NAME="?([^"\n]+)"?/m);
      const versionMatch = osRelease.match(/VERSION_ID="?([^"\n]+)"?/m);
      const idMatch = osRelease.match(/^ID=([^\n]+)/m);
      
      info.distro = nameMatch ? nameMatch[1] : 'Unknown';
      info.distroVersion = versionMatch ? versionMatch[1] : 'Unknown';
      info.distroId = idMatch ? idMatch[1].replace(/"/g, '') : 'unknown';
      info.isUbuntu = info.distroId === 'ubuntu';
      info.isDebian = info.distroId === 'debian' || info.distroId === 'ubuntu';
      info.isFedora = info.distroId === 'fedora';
      info.isCentOS = info.distroId === 'centos';
      info.isRHEL = info.distroId === 'rhel';
      info.isArch = info.distroId === 'arch';
    } catch (e) {
      info.distro = 'Unknown Linux';
      info.distroVersion = 'Unknown';
    }
  }

  // macOS için ek bilgiler
  if (platform.isMac) {
    try {
      const swVers = execSync('sw_vers 2>/dev/null', { encoding: 'utf-8' });
      const versionMatch = swVers.match(/ProductVersion:\s*(.+)/);
      info.distro = 'macOS';
      info.distroVersion = versionMatch ? versionMatch[1].trim() : 'Unknown';
    } catch (e) {
      info.distro = 'macOS';
      info.distroVersion = 'Unknown';
    }
  }

  // Windows için ek bilgiler
  if (platform.isWindows) {
    try {
      const winVer = execSync('ver', { encoding: 'utf-8' });
      info.distro = 'Windows';
      info.distroVersion = winVer.trim();
      
      // PowerShell ile daha detaylı bilgi
      try {
        const psInfo = execSync('powershell -command "(Get-CimInstance Win32_OperatingSystem).Caption"', { encoding: 'utf-8' });
        info.distro = psInfo.trim();
      } catch (e) {
        // PowerShell yoksa varsayılanı kullan
        void e;
      }
    } catch (e) {
      info.distro = 'Windows';
      info.distroVersion = 'Unknown';
    }
  }

  return info;
}

/**
 * Paket yöneticisi bilgisi döndürür
 * @returns {Object} Paket yöneticisi bilgisi
 */
function getPackageManager() {
  if (platform.isWindows) {
    // Windows paket yöneticileri
    const managers = [];
    
    try {
      execSync('winget --version', { encoding: 'utf-8', stdio: 'pipe' });
      managers.push({ name: 'winget', command: 'winget install', available: true });
    } catch (e) {
      managers.push({ name: 'winget', available: false });
    }
    
    try {
      execSync('choco --version', { encoding: 'utf-8', stdio: 'pipe' });
      managers.push({ name: 'chocolatey', command: 'choco install', available: true });
    } catch (e) {
      managers.push({ name: 'chocolatey', available: false });
    }
    
    try {
      execSync('scoop --version', { encoding: 'utf-8', stdio: 'pipe' });
      managers.push({ name: 'scoop', command: 'scoop install', available: true });
    } catch (e) {
      managers.push({ name: 'scoop', available: false });
    }
    
    const available = managers.find(m => m.available);
    return {
      platform: 'windows',
      primary: available?.name || null,
      managers,
    };
  }

  if (platform.isMac) {
    let brewAvailable = false;
    try {
      execSync('brew --version', { encoding: 'utf-8', stdio: 'pipe' });
      brewAvailable = true;
    } catch (e) {
      void e;
    }
    
    return {
      platform: 'macos',
      primary: brewAvailable ? 'homebrew' : null,
      managers: [
        { name: 'homebrew', command: 'brew install', available: brewAvailable },
      ],
    };
  }

  // Linux paket yöneticileri
  const linuxManagers = [
    { name: 'apt', command: 'sudo apt install -y', check: 'apt --version', distros: ['ubuntu', 'debian'] },
    { name: 'dnf', command: 'sudo dnf install -y', check: 'dnf --version', distros: ['fedora', 'rhel', 'centos'] },
    { name: 'yum', command: 'sudo yum install -y', check: 'yum --version', distros: ['centos', 'rhel'] },
    { name: 'pacman', command: 'sudo pacman -S --noconfirm', check: 'pacman --version', distros: ['arch'] },
    { name: 'zypper', command: 'sudo zypper install -y', check: 'zypper --version', distros: ['opensuse'] },
    { name: 'apk', command: 'apk add', check: 'apk --version', distros: ['alpine'] },
  ];

  const managers = linuxManagers.map(m => {
    try {
      execSync(m.check, { encoding: 'utf-8', stdio: 'pipe' });
      return { ...m, available: true };
    } catch (e) {
      return { ...m, available: false };
    }
  });

  const available = managers.find(m => m.available);
  return {
    platform: 'linux',
    primary: available?.name || null,
    managers,
  };
}

/**
 * Shell bilgisi döndürür
 * @returns {Object} Shell bilgisi
 */
function getShellInfo() {
  if (platform.isWindows) {
    return {
      default: 'cmd.exe',
      available: ['cmd.exe', 'powershell.exe'],
      current: process.env.COMSPEC || 'cmd.exe',
    };
  }

  const defaultShell = process.env.SHELL || '/bin/bash';
  const shells = [];
  
  ['/bin/bash', '/bin/zsh', '/bin/sh', '/bin/fish'].forEach(shell => {
    try {
      execSync(`test -f ${shell}`, { stdio: 'pipe' });
      shells.push(shell);
    } catch (e) {
      void e;
    }
  });

  return {
    default: defaultShell,
    available: shells,
    current: defaultShell,
  };
}

/**
 * Yönetici yetkisi kontrolü
 * @returns {boolean} Yönetici mi
 */
function isAdmin() {
  if (platform.isWindows) {
    try {
      execSync('net session', { stdio: 'pipe' });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Unix sistemlerde root kontrolü
  return process.getuid && process.getuid() === 0;
}

/**
 * Sudo/yönetici komutu döndürür
 * @param {string} command - Çalıştırılacak komut
 * @returns {string} Yönetici yetkili komut
 */
function elevate(command) {
  if (platform.isWindows) {
    // Windows'ta PowerShell ile elevation
    return `powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb RunAs"`;
  }
  return `sudo ${command}`;
}

/**
 * Path ayırıcısı
 */
const pathSeparator = platform.isWindows ? '\\' : '/';

/**
 * Byte formatla
 * @param {number} bytes - Byte sayısı
 * @returns {string} Formatlanmış string
 */
function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Uptime formatla
 * @param {number} seconds - Saniye
 * @returns {string} Formatlanmış string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  
  return parts.join(' ') || '< 1d';
}

/**
 * Yazılım yüklü mü kontrol et
 * @param {string} name - Yazılım adı
 * @returns {boolean} Yüklü mü
 */
function isInstalled(name) {
  const checkCommands = {
    node: 'node --version',
    npm: 'npm --version',
    git: 'git --version',
    docker: 'docker --version',
    python: platform.isWindows ? 'python --version' : 'python3 --version',
    java: 'java -version',
    go: 'go version',
    rust: 'rustc --version',
    nginx: platform.isWindows ? 'nginx -v' : 'nginx -v 2>&1',
    redis: platform.isWindows ? 'redis-server --version' : 'redis-server --version',
    mongodb: 'mongod --version',
    postgresql: platform.isWindows ? 'psql --version' : 'psql --version',
    mysql: 'mysql --version',
  };

  const cmd = checkCommands[name.toLowerCase()];
  if (!cmd) {
    // Genel komut kontrolü
    try {
      if (platform.isWindows) {
        execSync(`where ${name}`, { stdio: 'pipe' });
      } else {
        execSync(`which ${name}`, { stdio: 'pipe' });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Service yöneticisi bilgisi
 * @returns {Object} Service manager bilgisi
 */
function getServiceManager() {
  if (platform.isWindows) {
    return {
      name: 'sc',
      start: (service) => `sc start ${service}`,
      stop: (service) => `sc stop ${service}`,
      restart: (service) => `sc stop ${service} && sc start ${service}`,
      status: (service) => `sc query ${service}`,
      enable: (service) => `sc config ${service} start=auto`,
      disable: (service) => `sc config ${service} start=disabled`,
    };
  }

  // systemd kontrolü
  try {
    execSync('systemctl --version', { stdio: 'pipe' });
    return {
      name: 'systemd',
      start: (service) => `sudo systemctl start ${service}`,
      stop: (service) => `sudo systemctl stop ${service}`,
      restart: (service) => `sudo systemctl restart ${service}`,
      status: (service) => `systemctl status ${service}`,
      enable: (service) => `sudo systemctl enable ${service}`,
      disable: (service) => `sudo systemctl disable ${service}`,
    };
  } catch (e) {
    void e;
  }

  // init.d fallback
  return {
    name: 'init.d',
    start: (service) => `sudo service ${service} start`,
    stop: (service) => `sudo service ${service} stop`,
    restart: (service) => `sudo service ${service} restart`,
    status: (service) => `service ${service} status`,
    enable: () => 'N/A',
    disable: () => 'N/A',
  };
}

module.exports = {
  platform,
  getSystemInfo,
  getPackageManager,
  getShellInfo,
  isAdmin,
  elevate,
  pathSeparator,
  formatBytes,
  formatUptime,
  isInstalled,
  getServiceManager,
};
