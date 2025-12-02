/**
 * Seyfo Process Manager - PM2 benzeri process yönetim sistemi
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Seyfo data dizini
const SEYFO_HOME = process.env.SEYFO_HOME || path.join(os.homedir(), '.seyfo');
const PROCESSES_FILE = path.join(SEYFO_HOME, 'processes.json');
const LOGS_DIR = path.join(SEYFO_HOME, 'logs');
const PIDS_DIR = path.join(SEYFO_HOME, 'pids');

/**
 * Gerekli dizinleri oluşturur
 */
function ensureDirectories() {
  [SEYFO_HOME, LOGS_DIR, PIDS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Process listesini yükler
 * @returns {Object} Process listesi
 */
function loadProcesses() {
  ensureDirectories();
  
  if (fs.existsSync(PROCESSES_FILE)) {
    try {
      const data = fs.readFileSync(PROCESSES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
  return {};
}

/**
 * Process listesini kaydeder
 * @param {Object} processes - Process listesi
 */
function saveProcesses(processes) {
  ensureDirectories();
  fs.writeFileSync(PROCESSES_FILE, JSON.stringify(processes, null, 2));
}

/**
 * Benzersiz ID oluşturur
 * @returns {string} Benzersiz ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Process'in çalışıp çalışmadığını kontrol eder
 * @param {number} pid - Process ID
 * @returns {boolean} Çalışıyor mu
 */
function isProcessRunning(pid) {
  if (!pid) return false;
  
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Yeni bir process başlatır
 * @param {Object} options - Başlatma seçenekleri
 * @returns {Object} Process bilgisi
 */
function start(options) {
  ensureDirectories();
  
  const {
    name,
    script,
    args = [],
    cwd = process.cwd(),
    env = {},
    interpreter = 'node',
    watch = false,
    maxRestarts = 10,
    restartDelay = 1000,
  } = options;

  const processes = loadProcesses();
  
  // Aynı isimde process var mı kontrol et
  const existingId = Object.keys(processes).find(id => processes[id].name === name);
  if (existingId && isProcessRunning(processes[existingId].pid)) {
    throw new Error(`"${name}" zaten çalışıyor (PID: ${processes[existingId].pid})`);
  }

  const id = existingId || generateId();
  const logFile = path.join(LOGS_DIR, `${name}-out.log`);
  const errorLogFile = path.join(LOGS_DIR, `${name}-error.log`);
  const pidFile = path.join(PIDS_DIR, `${name}.pid`);

  // Log dosyalarını oluştur/aç
  const outStream = fs.openSync(logFile, 'a');
  const errStream = fs.openSync(errorLogFile, 'a');

  // Process'i başlat
  const fullArgs = interpreter === 'node' ? [script, ...args] : args;
  const command = interpreter === 'node' ? process.execPath : interpreter;
  
  const child = spawn(command, fullArgs, {
    cwd,
    env: { ...process.env, ...env },
    detached: true,
    stdio: ['ignore', outStream, errStream],
  });

  child.unref();

  // PID dosyasına yaz
  fs.writeFileSync(pidFile, child.pid.toString());

  // Process bilgisini kaydet
  const processInfo = {
    id,
    name,
    script: path.resolve(cwd, script),
    args,
    cwd,
    interpreter,
    pid: child.pid,
    status: 'online',
    restarts: processes[id]?.restarts || 0,
    maxRestarts,
    restartDelay,
    watch,
    env,
    createdAt: processes[id]?.createdAt || new Date().toISOString(),
    startedAt: new Date().toISOString(),
    logFile,
    errorLogFile,
    pidFile,
  };

  processes[id] = processInfo;
  saveProcesses(processes);

  return processInfo;
}

/**
 * Process'i durdurur
 * @param {string} nameOrId - Process adı veya ID'si
 * @returns {Object} Durdurulan process bilgisi
 */
function stop(nameOrId) {
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  const proc = processes[id];

  if (proc.pid && isProcessRunning(proc.pid)) {
    try {
      process.kill(proc.pid, 'SIGTERM');
      
      // Biraz bekle ve hala çalışıyorsa SIGKILL gönder
      setTimeout(() => {
        if (isProcessRunning(proc.pid)) {
          try {
            process.kill(proc.pid, 'SIGKILL');
          } catch (e) {
            // SIGKILL hatası - ignore
            void e;
          }
        }
      }, 3000);
    } catch (error) {
      // Process zaten durmuş olabilir - ignore
      void error;
    }
  }

  proc.status = 'stopped';
  proc.pid = null;
  proc.stoppedAt = new Date().toISOString();
  
  processes[id] = proc;
  saveProcesses(processes);

  // PID dosyasını sil
  if (fs.existsSync(proc.pidFile)) {
    fs.unlinkSync(proc.pidFile);
  }

  return proc;
}

/**
 * Process'i yeniden başlatır
 * @param {string} nameOrId - Process adı veya ID'si
 * @returns {Object} Yeniden başlatılan process bilgisi
 */
function restart(nameOrId) {
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  const proc = processes[id];
  
  // Önce durdur
  try {
    stop(nameOrId);
  } catch (e) {
    // Process zaten durmuş olabilir - ignore
    void e;
  }

  // Biraz bekle ve yeniden başlat
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProc = start({
        name: proc.name,
        script: proc.script,
        args: proc.args,
        cwd: proc.cwd,
        interpreter: proc.interpreter,
        env: proc.env,
        watch: proc.watch,
        maxRestarts: proc.maxRestarts,
        restartDelay: proc.restartDelay,
      });
      
      newProc.restarts = (proc.restarts || 0) + 1;
      processes[id] = newProc;
      saveProcesses(processes);
      
      resolve(newProc);
    }, 500);
  });
}

/**
 * Tüm process'leri durdurur
 * @returns {Array} Durdurulan process'ler
 */
function stopAll() {
  const processes = loadProcesses();
  const stopped = [];

  Object.keys(processes).forEach(id => {
    try {
      const proc = stop(id);
      stopped.push(proc);
    } catch (e) {
      // Process durdurma hatası - ignore
      void e;
    }
  });

  return stopped;
}

/**
 * Process'i listeden siler
 * @param {string} nameOrId - Process adı veya ID'si
 * @returns {Object} Silinen process bilgisi
 */
function remove(nameOrId) {
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  // Önce durdur
  try {
    stop(nameOrId);
  } catch (e) {
    // Process zaten durmuş olabilir - ignore
    void e;
  }

  const proc = processes[id];
  delete processes[id];
  saveProcesses(processes);

  // Log dosyalarını sil (opsiyonel)
  // fs.unlinkSync(proc.logFile);
  // fs.unlinkSync(proc.errorLogFile);

  return proc;
}

/**
 * Tüm process'leri listeler
 * @returns {Array} Process listesi
 */
function list() {
  const processes = loadProcesses();
  
  return Object.values(processes).map(proc => {
    // Gerçek durumu kontrol et
    const running = isProcessRunning(proc.pid);
    
    if (proc.status === 'online' && !running) {
      proc.status = 'stopped';
      proc.pid = null;
    }

    // Uptime hesapla
    let uptime = null;
    if (running && proc.startedAt) {
      const startTime = new Date(proc.startedAt).getTime();
      uptime = Date.now() - startTime;
    }

    return {
      ...proc,
      uptime,
      running,
    };
  });
}

/**
 * Process bilgisini getirir
 * @param {string} nameOrId - Process adı veya ID'si
 * @returns {Object} Process bilgisi
 */
function describe(nameOrId) {
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  const proc = processes[id];
  const running = isProcessRunning(proc.pid);

  return {
    ...proc,
    running,
    uptime: running && proc.startedAt ? Date.now() - new Date(proc.startedAt).getTime() : null,
  };
}

/**
 * Process loglarını okur
 * @param {string} nameOrId - Process adı veya ID'si
 * @param {Object} options - Log seçenekleri
 * @returns {Object} Log içerikleri
 */
function logs(nameOrId, options = {}) {
  const { lines = 50, type = 'all' } = options;
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  const proc = processes[id];
  const result = { out: '', error: '' };

  // Çıktı logları
  if ((type === 'all' || type === 'out') && fs.existsSync(proc.logFile)) {
    const content = fs.readFileSync(proc.logFile, 'utf-8');
    const logLines = content.split('\n').filter(Boolean);
    result.out = logLines.slice(-lines).join('\n');
  }

  // Hata logları
  if ((type === 'all' || type === 'error') && fs.existsSync(proc.errorLogFile)) {
    const content = fs.readFileSync(proc.errorLogFile, 'utf-8');
    const logLines = content.split('\n').filter(Boolean);
    result.error = logLines.slice(-lines).join('\n');
  }

  return result;
}

/**
 * Process loglarını temizler
 * @param {string} nameOrId - Process adı veya ID'si
 */
function flushLogs(nameOrId) {
  const processes = loadProcesses();
  
  const id = Object.keys(processes).find(
    id => processes[id].name === nameOrId || id === nameOrId
  );

  if (!id) {
    throw new Error(`"${nameOrId}" bulunamadı`);
  }

  const proc = processes[id];

  if (fs.existsSync(proc.logFile)) {
    fs.writeFileSync(proc.logFile, '');
  }
  
  if (fs.existsSync(proc.errorLogFile)) {
    fs.writeFileSync(proc.errorLogFile, '');
  }
}

/**
 * Tüm logları temizler
 */
function flushAllLogs() {
  const processes = loadProcesses();
  
  Object.keys(processes).forEach(id => {
    try {
      flushLogs(id);
    } catch (e) {
      // Log temizleme hatası - ignore
      void e;
    }
  });
}

/**
 * Uptime'ı okunabilir formata çevirir
 * @param {number} ms - Milisaniye
 * @returns {string} Okunabilir format
 */
function formatUptime(ms) {
  if (!ms) return '-';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}g ${hours % 24}s`;
  if (hours > 0) return `${hours}s ${minutes % 60}d`;
  if (minutes > 0) return `${minutes}d ${seconds % 60}sn`;
  return `${seconds}sn`;
}

/**
 * Seyfo home dizinini döndürür
 * @returns {string} Home dizini
 */
function getHome() {
  return SEYFO_HOME;
}

/**
 * Ecosystem dosyasından process'leri başlatır
 * @param {string} configFile - Config dosya yolu
 */
function startFromConfig(configFile) {
  const configPath = path.resolve(process.cwd(), configFile);
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config dosyası bulunamadı: ${configPath}`);
  }

  let config;
  if (configPath.endsWith('.json')) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    config = require(configPath);
  }

  const apps = config.apps || [config];
  const started = [];

  apps.forEach(app => {
    try {
      const proc = start(app);
      started.push(proc);
    } catch (error) {
      console.error(`${app.name} başlatılamadı: ${error.message}`);
    }
  });

  return started;
}

module.exports = {
  start,
  stop,
  restart,
  stopAll,
  remove,
  list,
  describe,
  logs,
  flushLogs,
  flushAllLogs,
  formatUptime,
  getHome,
  startFromConfig,
  isProcessRunning,
  SEYFO_HOME,
  LOGS_DIR,
  PIDS_DIR,
};
