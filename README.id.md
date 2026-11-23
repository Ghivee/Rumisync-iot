# Rumisync

Dashboard pemantauan kesehatan dan nutrisi sapi perah. ESP32 membaca suhu tubuh, suara mengunyah, dan tag BLE; layanan Node kecil menerima datanya lewat MQTT dan menyimpannya di Supabase; aplikasi React menampilkannya.

[English](README.md)

## Fungsi

- **Dashboard** dengan pembacaan langsung per ekor.
- **Pemantauan medis** dengan skor kesehatan (GHSI) yang dihitung dari kode kesehatan di `Panduan/kode kesehatan.txt`.
- **Eco nutrition:** formulasi pakan berdasarkan `Panduan/panduan skema input pakan.md`, baseline metana (CH4) per ras, pemilihan banyak pakan, dan pengoptimal pakan AI.
- **Kontrol sistem:** posisi kamera dan scanner pada rel aktif, konfigurasi rel (kapasitas sapi per rel), kekuatan sinyal (RSSI), dan log sistem langsung dengan notifikasi anomali.

## Teknologi

React, Vite, Tailwind CSS, Radix UI, Supabase, MQTT, Node.js (`mqtt-backend/`), Capacitor (`capacitor.config.json`). Dideploy dengan GitHub Actions dan Vercel; layanan MQTT punya `railway.toml`.

## Menjalankan

```bash
npm install
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Layanan MQTT:

```bash
cd mqtt-backend
npm install
npm start                # butuh MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

Service role key hanya untuk server. Buat tabel dengan `Panduan/supabase_schema.sql`.

## Struktur

```
src/app/        rute: dashboard, medical, eco-nutrition, system-control
mqtt-backend/   pelanggan MQTT yang menulis ke Supabase
Panduan/        panduan integrasi, skema SQL, firmware ESP32, kode kesehatan, aturan pakan
```

Arsitektur: sensor, ESP32, MQTT (atau HTTP), backend, Supabase, aplikasi web. Lihat `Panduan/PANDUAN_INTEGRASI.md` dan `Panduan/MQTT_Testing_Guide.md`.
