/**
 * Komut Çalıştırma Modülü
 */

const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const os = require('os');

const isWindows = process.platform === 'win32';

/**
 * Tek bir komutu çalıştırır
 * @param {Object} cmd - Komut objesi
 * @param {Object} options - Çalıştırma seçenekleri
 */
async function executeCommand(cmd, options = {}) {
  const spinner = ora(cmd.title).start();
  
  try {
    if (options.dryRun) {
      spinner.info(chalk.yellow(`[DRY-RUN] ${cmd.command}`));
      return { success: true, dryRun: true };
    }
    
    // Platform'a göre komutu ayarla
    let command = cmd.command;
    if (isWindows && cmd.windowsCommand) {
      command = cmd.windowsCommand;
    }
    
    if (cmd.interactive) {
      spinner.stop();
      console.log(chalk.cyan(`\n▶ ${cmd.title}`));
      console.log(chalk.gray(`  Komut: ${command}\n`));
      
      // Interactive komutlar için spawn kullan
      return new Promise((resolve, reject) => {
        const child = spawn(command, {
          shell: true,
          stdio: 'inherit',
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true });
          } else {
            reject(new Error(`Komut hata kodu ile sonlandı: ${code}`));
          }
        });
        
        child.on('error', (err) => {
          reject(err);
        });
      });
    }
    
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: options.verbose ? 'inherit' : 'pipe',
      shell: true,
    });
    
    spinner.succeed(chalk.green(cmd.title));
    
    if (options.verbose && output) {
      console.log(chalk.gray(output));
    }
    
    return { success: true, output };
  } catch (error) {
    spinner.fail(chalk.red(cmd.title));
    
    if (options.verbose) {
      console.error(chalk.red(`Hata: ${error.message}`));
    }
    
    if (!options.continueOnError) {
      throw error;
    }
    
    return { success: false, error };
  }
}

/**
 * Komut listesini sırayla çalıştırır
 * @param {Array} commands - Komut listesi
 * @param {Object} options - Çalıştırma seçenekleri
 */
async function executeCommands(commands, options = {}) {
  console.log(chalk.cyan('\n🚀 Kurulum başlıyor...\n'));
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const cmd of commands) {
    try {
      const result = await executeCommand(cmd, options);
      results.push({ ...cmd, ...result });
      if (result.success) successCount++;
    } catch (error) {
      results.push({ ...cmd, success: false, error });
      failCount++;
      
      if (!options.continueOnError) {
        console.log(chalk.red('\n❌ Kurulum hata nedeniyle durduruldu.\n'));
        break;
      }
    }
  }
  
  // Özet
  console.log(chalk.cyan('\n📊 Kurulum Özeti:'));
  console.log(chalk.green(`   ✓ Başarılı: ${successCount}`));
  if (failCount > 0) {
    console.log(chalk.red(`   ✗ Başarısız: ${failCount}`));
  }
  console.log();
  
  return {
    success: failCount === 0,
    results,
    successCount,
    failCount,
  };
}

/**
 * Sistem bilgisini kontrol eder
 */
function checkSystem() {
  const info = {
    isWindows,
    isLinux: process.platform === 'linux',
    isMac: process.platform === 'darwin',
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    nodeVersion: process.version,
  };

  // Windows
  if (isWindows) {
    info.isSupported = true;
    info.version = os.release();
    info.distro = 'Windows';
    return info;
  }

  // macOS
  if (process.platform === 'darwin') {
    info.isSupported = true;
    info.isMac = true;
    try {
      const swVers = execSync('sw_vers -productVersion', { encoding: 'utf-8' });
      info.version = swVers.trim();
      info.distro = 'macOS';
    } catch (e) {
      info.version = os.release();
      info.distro = 'macOS';
    }
    return info;
  }

  // Linux
  try {
    const osRelease = execSync('cat /etc/os-release 2>/dev/null || echo "Unknown"', {
      encoding: 'utf-8',
    });
    
    info.isUbuntu = osRelease.toLowerCase().includes('ubuntu');
    info.isDebian = osRelease.toLowerCase().includes('debian') || info.isUbuntu;
    info.isFedora = osRelease.toLowerCase().includes('fedora');
    info.isCentOS = osRelease.toLowerCase().includes('centos');
    info.isArch = osRelease.toLowerCase().includes('arch');
    
    // Versiyon bilgisi
    let version = 'Unknown';
    const versionMatch = osRelease.match(/VERSION_ID="?([^"\n]+)"?/);
    if (versionMatch) {
      version = versionMatch[1];
    }
    
    // Distro adı
    const nameMatch = osRelease.match(/^NAME="?([^"\n]+)"?/m);
    info.distro = nameMatch ? nameMatch[1] : 'Linux';
    
    info.version = version;
    info.isSupported = true;
    info.raw = osRelease;
    
  } catch (error) {
    info.isUbuntu = false;
    info.isDebian = false;
    info.isSupported = true; // Genel Linux desteği
    info.version = 'Unknown';
    info.distro = 'Linux';
    info.error = error.message;
  }
  
  return info;
}

/**
 * Root/sudo yetkisi kontrolü
 */
function checkSudo() {
  try {
    execSync('sudo -n true 2>/dev/null');
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  executeCommand,
  executeCommands,
  checkSystem,
  checkSudo,
};
