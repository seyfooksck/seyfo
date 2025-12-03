/**
 * Seyfo - Güncelleme Kontrol Modülü
 * Kullanım sayacı ve npm paket güncelleme kontrolü
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');
const chalk = require('chalk');

const SEYFO_HOME = path.join(os.homedir(), '.seyfo');
const USAGE_FILE = path.join(SEYFO_HOME, 'usage.json');

// Dizinleri oluştur
if (!fs.existsSync(SEYFO_HOME)) {
  fs.mkdirSync(SEYFO_HOME, { recursive: true });
}

/**
 * Kullanım verilerini yükler
 */
function loadUsageData() {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    }
  } catch (error) {
    // Hata durumunda varsayılan değerler döndür
  }
  
  return {
    totalUsage: 0,
    dailyUsage: {},
    lastUpdateCheck: null,
    currentVersion: require('../package.json').version,
    updateNotified: false,
  };
}

/**
 * Kullanım verilerini kaydeder
 */
function saveUsageData(data) {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    // Sessizce hata yut
  }
}

/**
 * Bugünün tarih anahtarını döndürür (YYYY-MM-DD)
 */
function getTodayKey() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Bugünkü kullanım sayısını artırır
 */
function incrementUsage() {
  const data = loadUsageData();
  const today = getTodayKey();
  
  data.totalUsage = (data.totalUsage || 0) + 1;
  
  if (!data.dailyUsage) {
    data.dailyUsage = {};
  }
  
  data.dailyUsage[today] = (data.dailyUsage[today] || 0) + 1;
  
  // Eski günleri temizle (son 30 günü tut)
  const keys = Object.keys(data.dailyUsage).sort();
  if (keys.length > 30) {
    keys.slice(0, keys.length - 30).forEach(key => {
      delete data.dailyUsage[key];
    });
  }
  
  saveUsageData(data);
  return data;
}

/**
 * Bugünkü kullanım sayısını döndürür
 */
function getTodayUsage() {
  const data = loadUsageData();
  const today = getTodayKey();
  return data.dailyUsage?.[today] || 0;
}

/**
 * NPM'den en son sürümü kontrol eder
 */
function checkLatestVersion(packageName, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: `/${packageName}/latest`,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'seyfo-cli',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            resolve(json.version);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

/**
 * Versiyon karşılaştırması yapar
 * @returns {number} current < latest ise -1, eşitse 0, büyükse 1
 */
function compareVersions(current, latest) {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (c[i] < l[i]) return -1;
    if (c[i] > l[i]) return 1;
  }
  
  return 0;
}

/**
 * Güncelleme kontrolü yapar ve gerekirse kullanıcıyı zorlar
 */
async function checkAndEnforceUpdate(force = false) {
  const data = loadUsageData();
  const currentVersion = require('../package.json').version;
  const today = getTodayKey();
  const todayUsage = data.dailyUsage?.[today] || 0;
  
  // Bugün en az 1 kere kullanıldı mı?
  if (todayUsage < 1 && !force) {
    return { updateRequired: false, message: 'İlk kullanım' };
  }
  
  // Son güncelleme kontrolünden bu yana bir gün geçti mi?
  const shouldCheck = !data.lastUpdateCheck || 
    data.lastUpdateCheck !== today ||
    force;
  
  if (!shouldCheck) {
    return { updateRequired: false, message: 'Bugün zaten kontrol edildi' };
  }
  
  try {
    console.log(chalk.gray('🔍 Güncelleme kontrol ediliyor...'));
    
    const latestVersion = await checkLatestVersion('seyfo');
    
    // Güncelleme kontrolü yapıldı olarak işaretle
    data.lastUpdateCheck = today;
    data.currentVersion = currentVersion;
    saveUsageData(data);
    
    const comparison = compareVersions(currentVersion, latestVersion);
    
    if (comparison < 0) {
      // Güncelleme var!
      console.log('\n' + '═'.repeat(60));
      console.log(chalk.red.bold('⚠️  YENİ SÜRÜM MEVCUT!'));
      console.log('═'.repeat(60));
      console.log(chalk.yellow(`Mevcut sürüm: ${currentVersion}`));
      console.log(chalk.green(`Yeni sürüm:   ${latestVersion}`));
      console.log('\n' + chalk.cyan('Güncellemek için:'));
      console.log(chalk.white('  npm install -g seyfo@latest'));
      console.log('\n' + chalk.gray('veya'));
      console.log(chalk.white('  npm update -g seyfo'));
      console.log('═'.repeat(60) + '\n');
      
      // Kritik güncelleme mi? (major version değişikliği)
      const currentMajor = parseInt(currentVersion.split('.')[0]);
      const latestMajor = parseInt(latestVersion.split('.')[0]);
      
      if (latestMajor > currentMajor) {
        // Major versiyon güncellemesi - ZORUNLU
        console.log(chalk.red.bold('🚨 KRİTİK GÜNCELLEME GEREKLİ!'));
        console.log(chalk.red('Bu major versiyon güncellemesidir ve devam etmek için güncelleme zorunludur.'));
        console.log(chalk.yellow('\nLütfen önce güncelleyin:'));
        console.log(chalk.white('  npm install -g seyfo@latest\n'));
        process.exit(1);
      }
      
      // Minor/patch güncellemesi - uyarı ver ama devam et
      return { 
        updateRequired: true, 
        currentVersion, 
        latestVersion,
        isCritical: false,
      };
    } else if (comparison > 0) {
      // Kullanıcı geliştirilme sürümü kullanıyor
      console.log(chalk.yellow('⚠️  Geliştirme sürümü kullanıyorsunuz.'));
      return { updateRequired: false, message: 'Dev sürümü' };
    } else {
      // Güncel
      console.log(chalk.green('✅ Seyfo güncel! (v' + currentVersion + ')'));
      return { updateRequired: false, message: 'Güncel' };
    }
  } catch (error) {
    // Ağ hatası veya başka bir sorun - sessizce devam et
    console.log(chalk.gray('ℹ️  Güncelleme kontrolü yapılamadı (ağ hatası)'));
    return { updateRequired: false, error: error.message };
  }
}

/**
 * Manuel güncelleme komutu
 */
async function manualUpdate() {
  try {
    const currentVersion = require('../package.json').version;
    console.log(chalk.cyan('\n🔄 Seyfo güncelleniyor...\n'));
    console.log(chalk.gray(`Mevcut sürüm: ${currentVersion}`));
    
    // npm update komutunu çalıştır
    execSync('npm update -g seyfo', { stdio: 'inherit' });
    
    console.log(chalk.green('\n✅ Güncelleme tamamlandı!\n'));
  } catch (error) {
    console.log(chalk.red('\n❌ Güncelleme hatası: ' + error.message));
    console.log(chalk.yellow('\nManuel güncelleme için:'));
    console.log(chalk.white('  npm install -g seyfo@latest\n'));
    process.exit(1);
  }
}

/**
 * Kullanım istatistiklerini gösterir
 */
function showUsageStats() {
  const data = loadUsageData();
  const today = getTodayKey();
  
  console.log(chalk.cyan('\n📊 Kullanım İstatistikleri\n'));
  console.log(`  Toplam kullanım:  ${chalk.yellow(data.totalUsage)}`);
  console.log(`  Bugünkü kullanım: ${chalk.yellow(data.dailyUsage?.[today] || 0)}`);
  console.log(`  Mevcut sürüm:     ${chalk.green(data.currentVersion)}`);
  console.log(`  Son kontrol:      ${chalk.gray(data.lastUpdateCheck || 'Hiç')}`);
  
  if (Object.keys(data.dailyUsage || {}).length > 1) {
    console.log(chalk.gray('\n  Son 7 gün:'));
    const keys = Object.keys(data.dailyUsage).sort().slice(-7);
    keys.forEach(key => {
      const count = data.dailyUsage[key];
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`    ${key}  ${chalk.green(bar)} ${count}`);
    });
  }
  
  console.log();
}

module.exports = {
  incrementUsage,
  getTodayUsage,
  checkAndEnforceUpdate,
  manualUpdate,
  showUsageStats,
  loadUsageData,
};
