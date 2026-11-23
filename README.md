# Rumisync

Rumisync is a dashboard for monitoring the health and nutrition of dairy cattle, built around the idea that a sick or stressed animal shows signs (body temperature, chewing behavior, movement) well before a farmer would normally notice by eye, especially across a herd too large to check on individually every hour. An ESP32 device on or near each animal reads body temperature, a chewing-sound sensor and a BLE proximity tag; a small Node.js service subscribes to that stream over MQTT and writes it into Supabase; a React dashboard turns it into something a farmer or vet can act on.

[Baca dalam Bahasa Indonesia di bawah](#bahasa-indonesia)

## What it does

- **Dashboard**: live, per-animal readings, so a specific cow can be checked rather than only a herd-wide average.
- **Medical monitoring**: a composite health score (GHSI) computed from the rules in `Panduan/kode kesehatan.txt`, turning raw sensor numbers into a single number a non-specialist can act on.
- **Eco nutrition**: feed formulation based on `Panduan/panduan skema input pakan.md`, with a breed-specific methane (CH4) baseline (different breeds digest differently, so a one-size-fits-all baseline would be misleading), the ability to select and mix multiple feed types at once, and an AI feed optimizer that suggests a mix given the animal's current state.
- **System control**: the position of the camera and scanner on the active rail (the hardware sweeps a physical rail rather than sitting fixed), rail configuration (how many cattle each rail segment is responsible for), signal strength (RSSI) to spot a weak BLE connection before it drops entirely, and a live system log that surfaces anomalies as they happen instead of only in a nightly report.

## Tech stack

React, Vite, Tailwind CSS, Radix UI for accessible UI primitives, Supabase (Postgres plus row-level security), MQTT for the device-to-backend link, Node.js for the MQTT subscriber service (`mqtt-backend/`), Capacitor (`capacitor.config.json`) so the same codebase can also be packaged as a mobile app. The frontend deploys through GitHub Actions and Vercel; the MQTT service has its own `railway.toml` for deployment on Railway, since it needs to run continuously rather than on demand the way a web request handler does.

## Getting started

```bash
npm install
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

MQTT service, which needs to be running for any live data to reach Supabase at all:

```bash
cd mqtt-backend
npm install
npm start                # needs MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

The service role key belongs on this backend service only; it must never be set as an environment variable for the frontend, since that would ship it to every visitor's browser. Create the database tables first with `Panduan/supabase_schema.sql`.

## Project structure

```
src/app/        routes: dashboard, medical, eco-nutrition, system-control
mqtt-backend/   the MQTT subscriber service that writes incoming sensor data to Supabase
Panduan/        integration guides, the SQL schema, ESP32 firmware, the health scoring rules and feed formulation rules
```

The full hardware-to-dashboard path, and how to test each hop of it independently, is written out in `Panduan/PANDUAN_INTEGRASI.md` and `Panduan/MQTT_Testing_Guide.md`.

---

## Bahasa Indonesia

Rumisync adalah dashboard pemantauan kesehatan dan nutrisi sapi perah, dibangun di atas gagasan bahwa hewan yang sakit atau stres menunjukkan tanda (suhu tubuh, perilaku mengunyah, gerakan) jauh sebelum peternak biasanya menyadarinya dengan mata, terutama pada kawanan yang terlalu besar untuk diperiksa satu per satu setiap jam. Perangkat ESP32 di atau di dekat setiap hewan membaca suhu tubuh, sensor suara mengunyah, dan tag kedekatan BLE; layanan Node.js kecil berlangganan aliran itu lewat MQTT dan menuliskannya ke Supabase; dashboard React mengubahnya jadi sesuatu yang bisa ditindaklanjuti peternak atau dokter hewan.

### Fungsi

- **Dashboard**: pembacaan langsung per ekor, sehingga sapi tertentu bisa diperiksa, bukan hanya rata-rata seluruh kawanan.
- **Pemantauan medis**: skor kesehatan gabungan (GHSI) yang dihitung dari aturan di `Panduan/kode kesehatan.txt`, mengubah angka sensor mentah menjadi satu angka yang bisa ditindaklanjuti orang non-spesialis.
- **Eco nutrition**: formulasi pakan berdasarkan `Panduan/panduan skema input pakan.md`, dengan baseline metana (CH4) khusus per ras (ras berbeda mencerna secara berbeda, sehingga baseline satu-untuk-semua akan menyesatkan), kemampuan memilih dan mencampur beberapa jenis pakan sekaligus, dan pengoptimal pakan AI yang menyarankan campuran sesuai kondisi hewan saat itu.
- **Kontrol sistem**: posisi kamera dan scanner pada rel aktif (perangkat kerasnya menyapu rel fisik, bukan diam di satu titik), konfigurasi rel (berapa ekor sapi yang menjadi tanggung jawab setiap segmen rel), kekuatan sinyal (RSSI) untuk mengenali koneksi BLE yang melemah sebelum benar-benar putus, dan log sistem langsung yang memunculkan anomali saat terjadi, bukan hanya dalam laporan malam.

### Teknologi

React, Vite, Tailwind CSS, Radix UI untuk komponen UI yang aksesibel, Supabase (Postgres plus row-level security), MQTT untuk jalur perangkat-ke-backend, Node.js untuk layanan pelanggan MQTT (`mqtt-backend/`), Capacitor (`capacitor.config.json`) sehingga basis kode yang sama bisa juga dikemas sebagai aplikasi mobile. Frontend dideploy lewat GitHub Actions dan Vercel; layanan MQTT punya `railway.toml` sendiri untuk deployment di Railway, karena ia perlu berjalan terus-menerus, bukan sesuai permintaan seperti penangan permintaan web biasa.

### Menjalankan

```bash
npm install
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Layanan MQTT, yang harus berjalan agar data langsung bisa sampai ke Supabase sama sekali:

```bash
cd mqtt-backend
npm install
npm start                # butuh MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

Service role key hanya untuk layanan backend ini; jangan pernah diatur sebagai variabel lingkungan untuk frontend, karena itu akan mengirimkannya ke peramban setiap pengunjung. Buat tabel database dulu dengan `Panduan/supabase_schema.sql`.

### Struktur

```
src/app/        rute: dashboard, medical, eco-nutrition, system-control
mqtt-backend/   layanan pelanggan MQTT yang menuliskan data sensor yang masuk ke Supabase
Panduan/        panduan integrasi, skema SQL, firmware ESP32, aturan skor kesehatan, dan aturan formulasi pakan
```

Jalur lengkap dari perangkat keras sampai dashboard, dan cara menguji setiap tahapnya secara terpisah, dituliskan di `Panduan/PANDUAN_INTEGRASI.md` dan `Panduan/MQTT_Testing_Guide.md`.
