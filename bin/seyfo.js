#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');
const seyfo = require('../lib/index');
const installers = require('../lib/installers');
const { executeCommands, checkSystem } = require('../lib/executor');
const pm = require('../lib/pm');
const platformInfo = require('../lib/platform');
const updateChecker = require('../lib/update-checker');

const isWindows = process.platform === 'win32';

// Her komut çalıştığında kullanım sayacını artır
updateChecker.incrementUsage();

program
  .name('seyfo')
  .description('Cross-platform kurulum kolaylaştırma ve process yönetim CLI aracı')
  .version(pkg.version);

// Banner göster
function showBanner() {
  console.log(chalk.cyan(`
  ███████╗███████╗██╗   ██╗███████╗ ██████╗ 
  ██╔════╝██╔════╝╚██╗ ██╔╝██╔════╝██╔═══██╗
  ███████╗█████╗   ╚████╔╝ █████╗  ██║   ██║
  ╚════██║██╔══╝    ╚██╔╝  ██╔══╝  ██║   ██║
  ███████║███████╗   ██║   ██║     ╚██████╔╝
  ╚══════╝╚══════╝   ╚═╝   ╚═╝      ╚═════╝ 
  `));
  console.log(chalk.yellow('  Cross-Platform Kurulum ve Process Manager v' + pkg.version));
  console.log(chalk.gray('  ─────────────────────────────────────────\n'));
}

// Kurulabilir yazılımları listele
program
  .command('list')
  .description('Kurulabilir yazılımları listeler')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    console.log(chalk.yellow('📦 Kurulabilir Yazılımlar:\n'));
    
    const software = seyfo.getAvailableSoftware();
    software.forEach((item, index) => {
      console.log(chalk.white(`  ${index + 1}. ${chalk.green(item.name.padEnd(15))} - ${item.description}`));
    });
    
    console.log(chalk.gray('\n  Kurulum için: seyfo install <yazılım-adı>'));
    console.log(chalk.gray('  Detay için:   seyfo info <yazılım-adı>\n'));
  });

// Yazılım bilgisi göster
program
  .command('info [software]')
  .description('Yazılım hakkında detaylı bilgi gösterir')
  .action(async (software) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    
    if (!software) {
      // Genel bilgi
      const sysInfo = platformInfo.getSystemInfo();
      
      console.log(chalk.cyan('ℹ️  Seyfo CLI Hakkında\n'));
      console.log(`  Versiyon:  ${chalk.green(pkg.version)}`);
      console.log(`  Node.js:   ${chalk.green(sysInfo.nodeVersion)}`);
      console.log(`  Platform:  ${chalk.green(sysInfo.distro)}`);
      console.log(`  OS Ver:    ${chalk.green(sysInfo.distroVersion || sysInfo.release)}`);
      console.log(`  Mimari:    ${chalk.green(sysInfo.arch)}`);
      
      console.log(chalk.gray('\n  Komutlar:'));
      console.log(chalk.gray('    seyfo list     - Kurulabilir yazılımlar'));
      console.log(chalk.gray('    seyfo system   - Sistem bilgileri'));
      console.log(chalk.gray('    seyfo ps       - Process listesi'));
      console.log(chalk.gray('    seyfo update   - Güncelleme kontrolü'));
      console.log(chalk.gray('    seyfo --help   - Tüm komutlar'));
      console.log();
      return;
    }
    
    const installer = installers[software.toLowerCase()];
    if (!installer) {
      console.log(chalk.red(`❌ "${software}" bulunamadı.`));
      console.log(chalk.gray('   Mevcut yazılımlar için: seyfo list\n'));
      return;
    }
    
    console.log(chalk.cyan(`📋 ${installer.name} Bilgileri\n`));
    console.log(`  Açıklama: ${installer.description}`);
    console.log(`  Versiyon: ${installer.version}`);
    
    // Platform desteği
    const platformSupport = installer.platforms || ['linux'];
    console.log(`  Platform: ${chalk.green(platformSupport.join(', '))}`);
    
    if (installer.getRequirements) {
      console.log(chalk.yellow(installer.getRequirements()));
    }
    
    console.log(chalk.gray(`\n  Kurulum için: seyfo install ${software}\n`));
  });

// Yazılım kur
program
  .command('install <software>')
  .description('Yazılım kurulumu yapar')
  .option('-y, --yes', 'Onay sormadan kur')
  .option('-v, --verbose', 'Detaylı çıktı göster')
  .option('--dry-run', 'Komutları çalıştırmadan göster')
  .option('--version <ver>', 'Belirli versiyon kur')
  .action(async (software, options) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    
    // Sistem kontrolü
    const sysInfo = checkSystem();
    
    // Linux için dağıtım uyarısı
    if (sysInfo.isLinux && !sysInfo.isUbuntu && !sysInfo.isDebian) {
      console.log(chalk.yellow('⚠️  Uyarı: Bu araç Ubuntu/Debian için optimize edilmiştir.'));
      console.log(chalk.yellow('   Diğer dağıtımlarda sorunlar yaşanabilir.\n'));
    }
    
    const installer = installers[software.toLowerCase()];
    if (!installer) {
      console.log(chalk.red(`❌ "${software}" bulunamadı.`));
      console.log(chalk.gray('   Mevcut yazılımlar için: seyfo list\n'));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`📦 ${installer.name} Kurulumu\n`));
    
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 DRY-RUN modu - Komutlar çalıştırılmayacak\n'));
    }
    
    const commands = installer.getInstallCommands({
      version: options.version,
    });
    
    // Komutları göster
    if (!options.yes && !options.dryRun) {
      console.log(chalk.gray('Çalıştırılacak adımlar:'));
      commands.forEach((cmd, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${cmd.title}`));
      });
      console.log();
      
      const inquirer = require('inquirer');
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Kuruluma devam edilsin mi?',
        default: true,
      }]);
      
      if (!confirm) {
        console.log(chalk.yellow('\n⚠️  Kurulum iptal edildi.\n'));
        return;
      }
    }
    
    // Kurulumu başlat
    try {
      const result = await executeCommands(commands, {
        verbose: options.verbose,
        dryRun: options.dryRun,
      });
      
      if (result.success && !options.dryRun) {
        console.log(chalk.green('✅ Kurulum başarıyla tamamlandı!\n'));
        console.log(chalk.cyan(installer.getPostInstallInfo()));
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Kurulum sırasında hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Yazılım kaldır
program
  .command('uninstall <software>')
  .description('Yazılımı kaldırır')
  .option('-y, --yes', 'Onay sormadan kaldır')
  .option('--dry-run', 'Komutları çalıştırmadan göster')
  .action(async (software, options) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    
    const installer = installers[software.toLowerCase()];
    if (!installer) {
      console.log(chalk.red(`❌ "${software}" bulunamadı.\n`));
      process.exit(1);
    }
    
    if (!installer.getUninstallCommands) {
      console.log(chalk.red(`❌ "${software}" için kaldırma desteği yok.\n`));
      process.exit(1);
    }
    
    console.log(chalk.red(`🗑️  ${installer.name} Kaldırılıyor\n`));
    
    const commands = installer.getUninstallCommands();
    
    if (!options.yes && !options.dryRun) {
      const inquirer = require('inquirer');
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `${installer.name} kaldırılacak. Emin misiniz?`,
        default: false,
      }]);
      
      if (!confirm) {
        console.log(chalk.yellow('\n⚠️  İşlem iptal edildi.\n'));
        return;
      }
    }
    
    try {
      await executeCommands(commands, { dryRun: options.dryRun });
      console.log(chalk.green(`\n✅ ${installer.name} başarıyla kaldırıldı.\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Kaldırma sırasında hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Sistem bilgisi
program
  .command('system')
  .description('Sistem bilgilerini gösterir')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    console.log(chalk.cyan('💻 Sistem Bilgileri\n'));
    
    const sysInfo = platformInfo.getSystemInfo();
    const pkgMgr = platformInfo.getPackageManager();
    
    console.log(`  Platform:     ${chalk.green(sysInfo.platform)}`);
    console.log(`  İşletim Sis.: ${chalk.green(sysInfo.distro)}`);
    console.log(`  OS Versiyon:  ${chalk.green(sysInfo.distroVersion || sysInfo.release)}`);
    console.log(`  Mimari:       ${chalk.green(sysInfo.arch)}`);
    console.log(`  Node.js:      ${chalk.green(sysInfo.nodeVersion)}`);
    console.log(`  Hostname:     ${chalk.green(sysInfo.hostname)}`);
    console.log(`  Kullanıcı:    ${chalk.green(sysInfo.user)}`);
    console.log(`  CPU:          ${chalk.green(sysInfo.cpus + ' çekirdek')}`);
    console.log(`  RAM:          ${chalk.green(sysInfo.freeMemory + ' / ' + sysInfo.totalMemory)}`);
    console.log(`  Uptime:       ${chalk.green(sysInfo.uptime)}`);
    console.log(`  Paket Yön.:   ${chalk.green(pkgMgr.primary || 'Bulunamadı')}`);
    
    if (sysInfo.isLinux) {
      console.log(`  Ubuntu:       ${sysInfo.isUbuntu ? chalk.green('Evet') : chalk.yellow('Hayır')}`);
      console.log(`  Debian:       ${sysInfo.isDebian ? chalk.green('Evet') : chalk.yellow('Hayır')}`);
    }
    
    console.log();
  });

// Hızlı kurulum - interaktif menü
program
  .command('setup')
  .description('İnteraktif kurulum menüsü')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    
    const inquirer = require('inquirer');
    const software = seyfo.getAvailableSoftware();
    
    const { selected } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: 'Kurmak istediğiniz yazılımları seçin:',
      choices: software.map(s => ({
        name: `${s.name} - ${s.description}`,
        value: s.id,
      })),
    }]);
    
    if (selected.length === 0) {
      console.log(chalk.yellow('\n⚠️  Hiçbir yazılım seçilmedi.\n'));
      return;
    }
    
    console.log(chalk.cyan(`\n📦 ${selected.length} yazılım kurulacak:\n`));
    selected.forEach(s => console.log(chalk.gray(`   - ${s}`)));
    
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '\nKuruluma başlansın mı?',
      default: true,
    }]);
    
    if (!confirm) {
      console.log(chalk.yellow('\n⚠️  Kurulum iptal edildi.\n'));
      return;
    }
    
    // Sırayla kur
    for (const sw of selected) {
      console.log(chalk.cyan(`\n${'═'.repeat(50)}`));
      console.log(chalk.cyan(`📦 ${sw} kuruluyor...`));
      console.log(chalk.cyan(`${'═'.repeat(50)}\n`));
      
      const installer = installers[sw];
      if (installer) {
        try {
          const commands = installer.getInstallCommands();
          await executeCommands(commands);
          console.log(chalk.green(`\n✅ ${installer.name} kuruldu!\n`));
        } catch (error) {
          console.log(chalk.red(`\n❌ ${installer.name} kurulurken hata: ${error.message}\n`));
        }
      }
    }
    
    console.log(chalk.green('\n🎉 Tüm kurulumlar tamamlandı!\n'));
  });

// ==========================================
// PROCESS MANAGER KOMUTLARI
// ==========================================

// Process başlat
program
  .command('start <script>')
  .description('Bir uygulamayı başlatır')
  .option('-n, --name <name>', 'Process adı')
  .option('-i, --interpreter <interpreter>', 'Yorumlayıcı (node, python, bash)', 'node')
  .option('--cwd <path>', 'Çalışma dizini')
  .option('--watch', 'Dosya değişikliklerini izle')
  .action(async (script, options) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const name = options.name || script.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
      
      const proc = pm.start({
        name,
        script,
        interpreter: options.interpreter,
        cwd: options.cwd || process.cwd(),
        watch: options.watch || false,
      });
      
      console.log(chalk.green(`\n✅ ${proc.name} başlatıldı!`));
      console.log(chalk.gray(`   PID: ${proc.pid}`));
      console.log(chalk.gray(`   Log: ${proc.logFile}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Process durdur
program
  .command('stop <name>')
  .description('Bir process\'i durdurur')
  .action(async (name) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const proc = pm.stop(name);
      console.log(chalk.yellow(`\n⏹️  ${proc.name} durduruldu.\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Process yeniden başlat
program
  .command('restart <name>')
  .description('Bir process\'i yeniden başlatır')
  .action(async (name) => {
    try {
      console.log(chalk.yellow(`\n🔄 ${name} yeniden başlatılıyor...`));
      const proc = await pm.restart(name);
      console.log(chalk.green(`✅ ${proc.name} yeniden başlatıldı!`));
      console.log(chalk.gray(`   PID: ${proc.pid}`));
      console.log(chalk.gray(`   Yeniden başlatma: ${proc.restarts}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Tüm process'leri durdur
program
  .command('stop-all')
  .description('Tüm process\'leri durdurur')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    const stopped = pm.stopAll();
    console.log(chalk.yellow(`\n⏹️  ${stopped.length} process durduruldu.\n`));
  });

// Process'i sil
program
  .command('delete <name>')
  .description('Bir process\'i listeden siler')
  .action(async (name) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const proc = pm.remove(name);
      console.log(chalk.red(`\n🗑️  ${proc.name} silindi.\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Process listesi
program
  .command('ps')
  .alias('status')
  .description('Çalışan process\'leri listeler')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    const processes = pm.list();
    
    console.log(chalk.cyan('\n🔄 Process Listesi\n'));
    
    if (processes.length === 0) {
      console.log(chalk.gray('   Çalışan process yok.\n'));
      console.log(chalk.gray('   Başlatmak için: seyfo start <script.js>\n'));
      return;
    }
    
    // Tablo başlığı
    console.log(chalk.gray('   ─────────────────────────────────────────────────────────────────────────'));
    console.log(
      chalk.white('   ') +
      chalk.white('ID'.padEnd(10)) +
      chalk.white('İsim'.padEnd(15)) +
      chalk.white('PID'.padEnd(10)) +
      chalk.white('Durum'.padEnd(12)) +
      chalk.white('Restart'.padEnd(10)) +
      chalk.white('Uptime'.padEnd(15))
    );
    console.log(chalk.gray('   ─────────────────────────────────────────────────────────────────────────'));
    
    processes.forEach(proc => {
      const statusColor = proc.status === 'online' ? chalk.green : chalk.red;
      const status = proc.status === 'online' ? '● online' : '○ stopped';
      
      console.log(
        '   ' +
        chalk.gray(proc.id.substring(0, 8).padEnd(10)) +
        chalk.cyan(proc.name.padEnd(15)) +
        chalk.white((proc.pid || '-').toString().padEnd(10)) +
        statusColor(status.padEnd(12)) +
        chalk.yellow(proc.restarts.toString().padEnd(10)) +
        chalk.green(pm.formatUptime(proc.uptime).padEnd(15))
      );
    });
    
    console.log(chalk.gray('   ─────────────────────────────────────────────────────────────────────────\n'));
  });

// Process detayları
program
  .command('describe <name>')
  .alias('show')
  .description('Process detaylarını gösterir')
  .action(async (name) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const proc = pm.describe(name);
      
      console.log(chalk.cyan(`\n📋 ${proc.name} Detayları\n`));
      console.log(chalk.gray('   ─────────────────────────────────────────'));
      console.log(`   ID:           ${chalk.white(proc.id)}`);
      console.log(`   İsim:         ${chalk.cyan(proc.name)}`);
      console.log(`   Script:       ${chalk.white(proc.script)}`);
      console.log(`   Interpreter:  ${chalk.white(proc.interpreter)}`);
      console.log(`   CWD:          ${chalk.white(proc.cwd)}`);
      console.log(`   PID:          ${chalk.white(proc.pid || '-')}`);
      console.log(`   Durum:        ${proc.running ? chalk.green('● online') : chalk.red('○ stopped')}`);
      console.log(`   Restart:      ${chalk.yellow(proc.restarts)}`);
      console.log(`   Uptime:       ${chalk.green(pm.formatUptime(proc.uptime))}`);
      console.log(`   Oluşturulma:  ${chalk.white(proc.createdAt)}`);
      console.log(`   Başlatılma:   ${chalk.white(proc.startedAt || '-')}`);
      console.log(chalk.gray('   ─────────────────────────────────────────'));
      console.log(`   Log:          ${chalk.gray(proc.logFile)}`);
      console.log(`   Error Log:    ${chalk.gray(proc.errorLogFile)}`);
      console.log(chalk.gray('   ─────────────────────────────────────────\n'));
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Process logları
program
  .command('logs <name>')
  .description('Process loglarını gösterir')
  .option('-n, --lines <number>', 'Gösterilecek satır sayısı', '50')
  .option('-f, --follow', 'Logları canlı takip et')
  .option('--error', 'Sadece hata loglarını göster')
  .action(async (name, options) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const type = options.error ? 'error' : 'all';
      const logData = pm.logs(name, { 
        lines: parseInt(options.lines), 
        type 
      });
      
      console.log(chalk.cyan(`\n📝 ${name} Logları\n`));
      
      if (logData.out) {
        console.log(chalk.green('─── Çıktı ───────────────────────────────────'));
        console.log(logData.out);
      }
      
      if (logData.error) {
        console.log(chalk.red('\n─── Hatalar ─────────────────────────────────'));
        console.log(logData.error);
      }
      
      if (!logData.out && !logData.error) {
        console.log(chalk.gray('   Log bulunamadı.\n'));
      }
      
      console.log();
      
      // Follow modu
      if (options.follow) {
        const proc = pm.describe(name);
        const fs = require('fs');
        
        console.log(chalk.yellow('📡 Canlı log takibi başladı (Çıkmak için Ctrl+C)\n'));
        
        // Dosyaları izle
        const watchFile = (file, prefix) => {
          if (fs.existsSync(file)) {
            let lastSize = fs.statSync(file).size;
            
            fs.watchFile(file, { interval: 1000 }, (curr) => {
              if (curr.size > lastSize) {
                const stream = fs.createReadStream(file, {
                  start: lastSize,
                  end: curr.size,
                });
                stream.on('data', (chunk) => {
                  process.stdout.write(prefix + chunk.toString());
                });
                lastSize = curr.size;
              }
            });
          }
        };
        
        watchFile(proc.logFile, '');
        watchFile(proc.errorLogFile, chalk.red('[ERR] '));
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Logları temizle
program
  .command('flush [name]')
  .description('Process loglarını temizler')
  .action(async (name) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      if (name) {
        pm.flushLogs(name);
        console.log(chalk.green(`\n✅ ${name} logları temizlendi.\n`));
      } else {
        pm.flushAllLogs();
        console.log(chalk.green('\n✅ Tüm loglar temizlendi.\n'));
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// Ecosystem dosyasından başlat
program
  .command('startfile <config>')
  .alias('ecosystem')
  .description('Config dosyasından process\'leri başlatır')
  .action(async (config) => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    try {
      const started = pm.startFromConfig(config);
      console.log(chalk.green(`\n✅ ${started.length} process başlatıldı:\n`));
      started.forEach(proc => {
        console.log(chalk.gray(`   - ${proc.name} (PID: ${proc.pid})`));
      });
      console.log();
    } catch (error) {
      console.log(chalk.red(`\n❌ Hata: ${error.message}\n`));
      process.exit(1);
    }
  });

// PM bilgisi
program
  .command('pm-info')
  .description('Process Manager bilgilerini gösterir')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    const sysInfo = platformInfo.getSystemInfo();
    
    console.log(chalk.cyan('\n📊 Seyfo Process Manager\n'));
    console.log(`   Versiyon:    ${chalk.green(pkg.version)}`);
    console.log(`   Platform:    ${chalk.green(sysInfo.distro)}`);
    console.log(`   Home:        ${chalk.gray(pm.SEYFO_HOME)}`);
    console.log(`   Logs:        ${chalk.gray(pm.LOGS_DIR)}`);
    console.log(`   PIDs:        ${chalk.gray(pm.PIDS_DIR)}`);
    
    const processes = pm.list();
    const running = processes.filter(p => p.running).length;
    
    console.log(`   Process'ler: ${chalk.yellow(processes.length)} toplam, ${chalk.green(running)} çalışıyor`);
    console.log();
  });

// Platform bilgisi
program
  .command('platform')
  .description('Platform ve paket yöneticisi bilgilerini gösterir')
  .action(async () => {
    // Güncelleme kontrolü
    await updateChecker.checkAndEnforceUpdate();
    
    showBanner();
    console.log(chalk.cyan('🖥️  Platform Bilgileri\n'));
    
    const sysInfo = platformInfo.getSystemInfo();
    const pkgMgr = platformInfo.getPackageManager();
    const shell = platformInfo.getShellInfo();
    const serviceMgr = platformInfo.getServiceManager();
    
    console.log(chalk.yellow('  İşletim Sistemi:'));
    console.log(`    Platform:    ${chalk.green(sysInfo.platform)}`);
    console.log(`    Dağıtım:     ${chalk.green(sysInfo.distro)}`);
    console.log(`    Versiyon:    ${chalk.green(sysInfo.distroVersion || sysInfo.release)}`);
    console.log(`    Mimari:      ${chalk.green(sysInfo.arch)}`);
    
    console.log(chalk.yellow('\n  Sistem:'));
    console.log(`    Hostname:    ${chalk.green(sysInfo.hostname)}`);
    console.log(`    Kullanıcı:   ${chalk.green(sysInfo.user)}`);
    console.log(`    CPU:         ${chalk.green(sysInfo.cpus + ' çekirdek')}`);
    console.log(`    RAM:         ${chalk.green(sysInfo.totalMemory)}`);
    console.log(`    Uptime:      ${chalk.green(sysInfo.uptime)}`);
    
    console.log(chalk.yellow('\n  Paket Yöneticisi:'));
    console.log(`    Birincil:    ${chalk.green(pkgMgr.primary || 'Bulunamadı')}`);
    console.log('    Mevcut:');
    pkgMgr.managers.filter(m => m.available).forEach(m => {
      console.log(`      - ${chalk.green(m.name)}`);
    });
    
    console.log(chalk.yellow('\n  Shell:'));
    console.log(`    Varsayılan:  ${chalk.green(shell.default)}`);
    console.log(`    Mevcut:      ${chalk.green(shell.available.join(', '))}`);
    
    console.log(chalk.yellow('\n  Servis Yöneticisi:'));
    console.log(`    Tür:         ${chalk.green(serviceMgr.name)}`);
    
    console.log(chalk.yellow('\n  Yüklü Yazılımlar:'));
    const checkSoftware = ['node', 'npm', 'git', 'docker', 'python'];
    checkSoftware.forEach(sw => {
      const installed = platformInfo.isInstalled(sw);
      console.log(`    ${sw.padEnd(10)} ${installed ? chalk.green('✓') : chalk.red('✗')}`);
    });
    
    console.log();
  });

// Güncelleme kontrolü
program
  .command('update-check')
  .description('Güncelleme kontrolü yapar')
  .action(async () => {
    await updateChecker.checkAndEnforceUpdate(true);
  });

// Manuel güncelleme
program
  .command('update')
  .description('Seyfo\'yu en son sürüme günceller')
  .action(async () => {
    await updateChecker.manualUpdate();
  });

// Kullanım istatistikleri
program
  .command('usage-stats')
  .description('Kullanım istatistiklerini gösterir')
  .action(() => {
    updateChecker.showUsageStats();
  });

// Varsayılan - yardım göster
program
  .action(() => {
    showBanner();
    program.help();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  showBanner();
  program.help();
}
