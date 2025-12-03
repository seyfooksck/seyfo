# 🔄 Otomatik Güncelleme Sistemi

Seyfo CLI, kullanıcıları her zaman güncel tutmak için otomatik güncelleme kontrol sistemi içerir.

## ✨ Özellikler

### 1. Kullanım Takibi
- Her komut çalıştırıldığında otomatik olarak sayaç artar
- Günlük ve toplam kullanım istatistikleri tutulur
- Son 30 günlük geçmiş saklanır
- Veriler `~/.seyfo/usage.json` dosyasında tutulur

### 2. Otomatik Güncelleme Kontrolü
- **Tetikleme:** Günde en az 1 kere kullanıldığında
- **Sıklık:** Günde bir kere (ilk kullanımda)
- **Zaman aşımı:** 3 saniye (ağ hatası durumunda sessizce devam eder)
- NPM registry'den en son versiyon kontrol edilir

### 3. Versiyon Karşılaştırma
- **Major versiyon güncellemesi** (örn: 1.x.x → 2.x.x): **ZORUNLU**
  - Kullanıcı güncellemeden devam edemez
  - Kritik güncelleme mesajı gösterilir
  - `process.exit(1)` ile program durdurulur
  
- **Minor/Patch güncellemesi** (örn: 1.4.0 → 1.5.0): **Uyarı**
  - Kullanıcı bilgilendirilir
  - Program çalışmaya devam eder
  - Güncelleme komutları gösterilir

### 4. Manuel Güncelleme
- `seyfo update`: Otomatik güncelleme yapar
- `seyfo update-check`: Zorla kontrol eder
- `npm install -g seyfo@latest`: Manuel npm güncellemesi

## 📊 Kullanım İstatistikleri

```bash
seyfo usage-stats
```

**Gösterilen bilgiler:**
- Toplam kullanım sayısı
- Bugünkü kullanım sayısı
- Mevcut versiyon
- Son güncelleme kontrol tarihi
- Son 7 günün grafik gösterimi

## 🎯 Kullanım Senaryoları

### Senaryo 1: İlk Kullanım
```bash
$ seyfo list
# Kullanım sayacı: 1
# Güncelleme kontrolü: YOK (henüz 1'den az)
```

### Senaryo 2: Günlük İlk Kullanım (Güncelleme Yok)
```bash
$ seyfo system
# Kullanım sayacı: 2
# Güncelleme kontrolü: YAPILIR
# Sonuç: ✅ Seyfo güncel! (v1.4.0)
```

### Senaryo 3: Minor Güncelleme Mevcut
```bash
$ seyfo list
# Güncelleme kontrolü: YAPILIR
# Sonuç:
════════════════════════════════════════════════════════════
⚠️  YENİ SÜRÜM MEVCUT!
════════════════════════════════════════════════════════════
Mevcut sürüm: 1.4.0
Yeni sürüm:   1.5.0

Güncellemek için:
  npm install -g seyfo@latest

veya
  npm update -g seyfo
════════════════════════════════════════════════════════════

# Program DEVAM EDER
```

### Senaryo 4: Major Güncelleme (Kritik)
```bash
$ seyfo install docker
# Güncelleme kontrolü: YAPILIR
# Sonuç:
════════════════════════════════════════════════════════════
⚠️  YENİ SÜRÜM MEVCUT!
════════════════════════════════════════════════════════════
Mevcut sürüm: 1.4.0
Yeni sürüm:   2.0.0

Güncellemek için:
  npm install -g seyfo@latest

veya
  npm update -g seyfo
════════════════════════════════════════════════════════════

🚨 KRİTİK GÜNCELLEME GEREKLİ!
Bu major versiyon güncellemesidir ve devam etmek için güncelleme zorunludur.

Lütfen önce güncelleyin:
  npm install -g seyfo@latest

# Program DURUR (exit code 1)
```

### Senaryo 5: Ağ Hatası
```bash
$ seyfo ps
# Güncelleme kontrolü: YAPILIR
# Sonuç: ℹ️  Güncelleme kontrolü yapılamadı (ağ hatası)
# Program DEVAM EDER
```

## 🔧 Teknik Detaylar

### Veri Yapısı

**~/.seyfo/usage.json:**
```json
{
  "totalUsage": 42,
  "dailyUsage": {
    "2025-12-01": 8,
    "2025-12-02": 12,
    "2025-12-03": 5
  },
  "lastUpdateCheck": "2025-12-03",
  "currentVersion": "1.4.0",
  "updateNotified": false
}
```

### Güncelleme Kontrolü Akışı

```
1. Komut çalıştırılır
2. incrementUsage() → Sayaç +1
3. checkAndEnforceUpdate() çağrılır
   ├─ Bugün 1+ kullanım var mı? → HAYIR: Atla
   ├─ Bugün kontrol edildi mi? → EVET: Atla
   └─ KONTROL YAP
      ├─ NPM registry'ye istek (3s timeout)
      ├─ Versiyon karşılaştır
      │   ├─ Güncel → ✅ mesaj
      │   ├─ Minor/Patch → ⚠️  uyarı, devam et
      │   └─ Major → 🚨 kritik, exit(1)
      └─ Ağ hatası → Sessizce devam
```

### API Kullanımı

**NPM Registry API:**
```
GET https://registry.npmjs.org/seyfo/latest
→ { "version": "1.5.0", ... }
```

**Zaman Aşımı:** 3000ms
**User-Agent:** seyfo-cli

## 🚀 Komutlar

| Komut | Açıklama |
|-------|----------|
| `seyfo update-check` | Manuel güncelleme kontrolü |
| `seyfo update` | Otomatik güncelleme |
| `seyfo usage-stats` | İstatistikleri görüntüle |

## 📝 Notlar

1. **Gizlilik:** Hiçbir kişisel veri toplanmaz, sadece yerel kullanım sayacı tutulur
2. **Performans:** Güncelleme kontrolü 3 saniye içinde tamamlanır veya atlanır
3. **Ağ:** İnternet bağlantısı gerekir, yoksa sessizce atlanır
4. **Günlük limit:** Günde sadece 1 kere kontrol edilir
5. **Major zorunluluk:** Major versiyon güncellemeleri güvenlik ve uyumluluk için zorunludur

## 🔐 Güvenlik

- HTTPS üzerinden güvenli NPM registry iletişimi
- Timeout ile DoS koruması
- Hata durumlarında graceful fallback
- Local veri saklama (kullanıcı home directory)

## 🎨 Kullanıcı Deneyimi

- **Renkli çıktı:** chalk kullanılarak okunabilir mesajlar
- **Net bilgilendirme:** Hangi sürümde olduğu, ne yapması gerektiği açıkça belirtilir
- **Engellemeyen:** Minor güncellemeler kullanıcıyı engellemez
- **İstatistikler:** Kullanım alışkanlıklarını görebilme

## 📚 İlgili Dosyalar

- `/lib/update-checker.js` - Ana güncelleme kontrol modülü
- `/bin/seyfo.js` - CLI entegrasyonu
- `~/.seyfo/usage.json` - Kullanım verileri
- `/test-update.js` - Test script
- `/docs/cli-reference.md` - Komut referansı
- `/README.md` - Genel dokümantasyon
