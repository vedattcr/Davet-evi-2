# Davet Evi Takip — PWA (Production-Ready)

Bu klasör, "Davet Evi Takip" uygulamasının tam işlevsel, deploy edilebilir
bir PWA (Progressive Web App) sürümüdür. Tasarım ve tüm özellikler
(rezervasyon listesi, takvim, paket yönetimi, giderler, aylık rapor,
yedekle/içe aktar) birebir korunmuştur.

## Klasör içeriği

```
index.html          → Uygulamanın ana HTML dosyası
style.css           → Tüm görsel tasarım (marka renkleri, tipografi)
app.js              → Uygulamanın tüm mantığı (rezervasyon/paket/rapor)
firebase-init.js    → Firebase bağlantı ve yetkilendirme modülü
manifest.json        → PWA kimliği: ad, ikonlar, renkler, standalone mod
sw.js                → Service Worker: offline çalışma ve önbellekleme
```

## 1) Yerelde test etme

Tarayıcılar `file://` üzerinden service worker'a izin vermez, bu yüzden
basit bir yerel sunucu ile açman gerekir:

```bash
python3 -m http.server 8080
```

Sonra tarayıcıda `http://localhost:8080` adresini aç.

## 2) Gerçek bir adrese deploy etme (HTTPS şart)

- **Vercel**, **Netlify** veya **GitHub Pages** üzerinden kolayca yayınlayabilirsin.
