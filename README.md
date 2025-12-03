# 🗡️ Seyfo

Cross-platform kurulum kolaylaştırma ve process yönetimi CLI aracı.

[![npm version](https://badge.fury.io/js/seyfo.svg)](https://www.npmjs.com/package/seyfo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Özellikler

- 🚀 **Yazılım Kurulumu** - MongoDB, Docker, Nginx ve daha fazlasını tek komutla kurun (Linux)
- 📦 **Process Manager** - PM2 benzeri uygulama yönetimi (Tüm platformlar)
- 🖥️ **Cross-Platform** - Windows, Linux ve macOS desteği
- 🔧 **Platform Algılama** - Otomatik paket yöneticisi ve sistem algılama
- 📊 **Sistem Bilgisi** - Hızlı sistem durumu görüntüleme

## 🖥️ Platform Desteği

| Özellik | Windows | Linux | macOS |
|---------|:-------:|:-----:|:-----:|
| Process Manager | ✅ | ✅ | ✅ |
| Sistem Bilgisi | ✅ | ✅ | ✅ |
| Platform Algılama | ✅ | ✅ | ✅ |
| Yazılım Kurulumu | ✅ (winget) | ✅ (apt) | ❌ |

## 📥 Kurulum

```bash
npm install -g seyfo
```

## 🚀 Hızlı Başlangıç

### Process Manager (Tüm Platformlar)

```bash
# Uygulama başlat
seyfo start app.js --name my-app

# Durumu kontrol et
seyfo ps

# Log'ları izle
seyfo logs my-app -f

# Durdur
seyfo stop my-app
```

### Sistem ve Platform Bilgisi

```bash
# Sistem bilgisi
seyfo system

# Detaylı platform bilgisi
seyfo platform
```

### Yazılım Kurulumu (Linux & Windows)

```bash
# Mevcut yazılımları listele
seyfo list

# Yazılım kur (Linux: apt, Windows: winget)
seyfo install mongodb -y
seyfo install docker -y
seyfo install nginx -y

# İnteraktif kurulum
seyfo setup
```

## 📦 Desteklenen Yazılımlar

| Yazılım | Windows (winget) | Linux (apt) |
|---------|:----------------:|:-----------:|
| MongoDB | ✅ MongoDB.Server | ✅ mongodb-org |
| Docker | ✅ Docker.DockerDesktop | ✅ docker-ce |
| Nginx | ✅ Nginx.Nginx | ✅ nginx |
| PostgreSQL | ✅ PostgreSQL.PostgreSQL | ✅ postgresql |
| Redis | ✅ Memurai | ✅ redis |
| Cloudron | ❌ | ✅ |
| Certbot | ❌ | ✅ |

## 🛠️ Process Manager Komutları

| Komut | Açıklama |
|-------|----------|
| `seyfo start <script>` | Uygulama başlat |
| `seyfo stop <name>` | Durdur |
| `seyfo restart <name>` | Yeniden başlat |
| `seyfo ps` | Process listesi |
| `seyfo logs <name>` | Log görüntüle |
| `seyfo delete <name>` | Kaldır |
| `seyfo stop-all` | Tüm process'leri durdur |
| `seyfo flush` | Log'ları temizle |
| `seyfo startfile <config>` | Ecosystem dosyasından başlat |

## 🖥️ Platform Komutları

| Komut | Açıklama |
|-------|----------|
| `seyfo system` | Sistem bilgileri |
| `seyfo platform` | Detaylı platform bilgisi |
| `seyfo pm-info` | Process Manager bilgisi |
| `seyfo info` | Genel seyfo bilgisi |

## 🔄 Güncelleme Komutları

| Komut | Açıklama |
|-------|----------|
| `seyfo update-check` | Güncelleme kontrolü yap |
| `seyfo update` | Seyfo'yu güncelle |
| `seyfo usage-stats` | Kullanım istatistiklerini göster |

> **Not:** Seyfo, günde en az bir kez kullanıldığında otomatik olarak güncelleme kontrolü yapar ve yeni sürüm varsa kullanıcıyı bilgilendirir. Major versiyon güncellemeleri zorunludur.

## 📚 Dokümantasyon

Detaylı kullanım için `docs/` klasörüne bakın:

- [📥 Kurulum Rehberi](docs/installation.md)
- [🛠️ Yazılım Kurulumları](docs/software-installers.md)
- [🚀 Process Manager](docs/process-manager.md)
- [📖 CLI Referansı](docs/cli-reference.md)
- [🔌 API Referansı](docs/api-reference.md)

## 💻 Modül Olarak Kullanım

```javascript
const seyfo = require('seyfo');

// Platform bilgisi
const { platform } = seyfo;
const sysInfo = platform.getSystemInfo();
console.log(sysInfo.distro); // 'Windows 11' veya 'Ubuntu 22.04'

// Paket yöneticisi
const pkgMgr = platform.getPackageManager();
console.log(pkgMgr.primary); // 'winget', 'apt', 'brew' vs.

// Process Manager
const { pm } = seyfo;
await pm.start({ script: './app.js', name: 'api' });
await pm.list();
await pm.stop('api');

// Yazılım yüklü mü kontrol
const hasDocker = platform.isInstalled('docker');
```

## 📋 Gereksinimler

- Node.js 14+
- Windows 10+, Linux veya macOS
- sudo yetkisi (Linux yazılım kurulumları için)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📄 Lisans

MIT
