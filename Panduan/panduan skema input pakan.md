# 🐄 RumiSync — Panduan Sistem Estimasi Emisi Metana

> **Versi:** 1.0 | **Konteks:** Sistem IoT Monitoring Kesehatan & Emisi Sapi

---

## Daftar Isi

1. [Gambaran Besar Sistem](#1-gambaran-besar-sistem)
2. [Rumus Utama CH₄](#2-rumus-utama-ch4)
3. [Penjelasan Setiap Variabel](#3-penjelasan-setiap-variabel)
4. [Database Indeks Potensi Metana (IPM)](#4-database-indeks-potensi-metana-ipm)
5. [Cara Membaca & Menggunakan Rumus](#5-cara-membaca--menggunakan-rumus)
6. [Contoh Perhitungan Lengkap](#6-contoh-perhitungan-lengkap)
7. [Integrasi dengan Sensor IoT](#7-integrasi-dengan-sensor-iot)
8. [Catatan Pengembangan](#8-catatan-pengembangan)

---

## 1. Gambaran Besar Sistem

RumiSync menggabungkan **dua sumber data** untuk mengestimasi emisi metana harian seekor sapi:

```
[ Data Pakan (Input Manual) ]     [ Sensor IoT (Real-time) ]
        ↓                                   ↓
   Jenis pakan                     Waktu ruminasi aktual
   Rasio hijauan/konsentrat        (menit/hari dari collar)
   Berat badan sapi
        ↓                                   ↓
        └──────────────┬───────────────────┘
                       ↓
            Rumus Gabungan CH₄
                       ↓
         Estimasi Emisi Metana (gram/hari)
```

**Logika intinya sederhana:**
- Sapi yang makan lebih banyak → menghasilkan lebih banyak metana
- Pakan berserat tinggi (hijauan) → metana lebih besar dari pakan konsentrat
- Sapi yang ruminasi lebih lama → proses fermentasi rumen lebih aktif → metana lebih akurat

---

## 2. Rumus Utama CH₄

$$CH_4 = (BW \times 0.025) \times 21 \times (R_h \cdot IPM_h + R_k \cdot IPM_k) \times \left(\frac{T_r}{500}\right)$$

Atau dalam bentuk yang lebih mudah dibaca bertahap:

```
Langkah 1:  DMI  = BW × 0.025
Langkah 2:  IPM_gabungan = (Rh × IPMh) + (Rk × IPMk)
Langkah 3:  Faktor_ruminasi = Tr / 500
Langkah 4:  CH4 = DMI × 21 × IPM_gabungan × Faktor_ruminasi
```

---

## 3. Penjelasan Setiap Variabel

### `BW` — Body Weight / Berat Badan Sapi (kg)
- Berat badan sapi dalam kilogram
- Digunakan untuk menghitung **DMI (Dry Matter Intake)** = asupan bahan kering per hari
- Rumus: `DMI = BW × 0.025` → sapi mengonsumsi ~2,5% berat badannya per hari dalam bahan kering
- Contoh: sapi 400 kg → DMI = 400 × 0.025 = **10 kg bahan kering/hari**

### `21` — Konstanta Konversi Metana
- Setiap kilogram bahan kering yang dikonsumsi menghasilkan rata-rata **21 gram CH₄**
- Angka ini adalah konstanta dasar dari standar IPCC (Tier-1)
- Berlaku untuk sapi ruminansia tropis

### `Rh` & `Rk` — Rasio Hijauan & Konsentrat
- Persentase komposisi pakan dalam bentuk desimal
- **Wajib:** `Rh + Rk = 1.0` (total harus 100%)
- Contoh: pakan 70% hijauan & 30% konsentrat → `Rh = 0.70`, `Rk = 0.30`
- Di UI: ditampilkan sebagai **slider** yang saling terhubung

### `IPMh` & `IPMk` — Indeks Potensi Metana
- Faktor pengali yang mencerminkan seberapa besar potensi metana dari jenis pakan tertentu
- Nilai > 1.0 = potensi metana di atas rata-rata
- Nilai < 1.0 = potensi metana di bawah rata-rata
- Contoh: Pucuk Tebu (IPM 1.30) menghasilkan 30% lebih banyak metana vs rata-rata

### `Tr` — Time of Rumination / Waktu Ruminasi (menit/hari)
- Data **real-time dari sensor IoT** (collar/bolus)
- Menggambarkan seberapa aktif rumen bekerja hari itu
- **500** = konstanta waktu ruminasi ideal sapi sehat (menit/hari)
- Jika `Tr = 500` → faktor = 1.0 (normal)
- Jika `Tr = 250` → faktor = 0.5 (ruminasi separuh normal, emisi lebih rendah dari estimasi)
- Jika `Tr = 600` → faktor = 1.2 (ruminasi di atas normal)

---

## 4. Database Indeks Potensi Metana (IPM)

### 🌿 Hijauan

| Nama Pakan | IPM | Keterangan |
|---|---|---|
| Pucuk Tebu | **1.30** | Potensi metana tertinggi |
| Rumput Raja | 1.15 | |
| Rumput Gajah | 1.10 | |
| Rumput BD *(Brachiaria decumbens)* | 1.10 | |
| Rumput Setaria | 1.05 | |
| Rumput Gama Umami | 1.00 | Baseline / rata-rata |
| Daun Nangka | 0.95 | |
| Daun Pepaya | 0.90 | |
| Rendeng *(Kacang Tanah)* | 0.85 | |
| Lamtoro | **0.80** | Potensi metana terendah (hijauan legum) |

### 🌾 Konsentrat

| Nama Pakan | IPM | Keterangan |
|---|---|---|
| Dedak Padi | **0.65** | Potensi metana tertinggi (konsentrat) |
| Jagung | 0.60 | |
| Ketan Hitam | 0.55 | |
| Millet & Biji Kenari | 0.55 | |
| Bungkil Kelapa Sawit | 0.50 | |
| Bungkil Kedelai | 0.45 | |
| Bungkil Kacang Tanah | 0.45 | |
| Ampas Tahu | 0.45 | |
| Tepung Ikan | 0.30 | |
| Tepung Daging & Tulang *(MBM)* | **0.30** | Potensi metana terendah (konsentrat) |

> **Pola yang perlu dipahami:** Hijauan berserat tinggi → IPM tinggi (fermentasi rumen lebih panjang). Konsentrat berprotein/lemak tinggi → IPM rendah (dicerna lebih cepat, metana lebih sedikit).

---

## 5. Cara Membaca & Menggunakan Rumus

### Alur Logika Sistem

```
1. User input berat badan sapi (BW)
         ↓
2. Sistem hitung DMI otomatis (BW × 0.025)
         ↓
3. User pilih jenis hijauan + geser slider proporsi (Rh)
   User pilih jenis konsentrat + sisanya otomatis (Rk = 1 - Rh)
         ↓
4. Sistem ambil IPM dari database sesuai pilihan pakan
         ↓
5. Sensor IoT kirim data Tr (menit ruminasi hari ini)
         ↓
6. Semua variabel masuk rumus → output CH₄ (gram/hari)
```

### Interpretasi Hasil

| Hasil CH₄ (gram/hari) | Interpretasi |
|---|---|
| Sesuai estimasi teoritis | Ruminasi normal, pakan sesuai |
| Jauh di bawah estimasi | Ruminasi terganggu — cek kesehatan sapi |
| Jauh di atas estimasi | Kemungkinan pakan berserat sangat tinggi atau Tr tidak akurat |

---

## 6. Contoh Perhitungan Lengkap

**Skenario:** Sapi Limousin 400 kg, diberi 70% Rumput Gajah + 30% Dedak Padi, sensor mencatat Tr = 450 menit hari ini.

```
BW  = 400 kg
DMI = 400 × 0.025 = 10 kg/hari

Rh  = 0.70  →  IPMh = 1.10 (Rumput Gajah)
Rk  = 0.30  →  IPMk = 0.65 (Dedak Padi)

IPM_gabungan = (0.70 × 1.10) + (0.30 × 0.65)
             = 0.77 + 0.195
             = 0.965

Faktor_ruminasi = 450 / 500 = 0.90

CH₄ = 10 × 21 × 0.965 × 0.90
    = 10 × 21 × 0.8685
    = 182.4 gram/hari
```

**Hasil:** Sapi ini diestimasi menghasilkan **182,4 gram metana per hari.**

---

## 7. Integrasi dengan Sensor IoT

### Data yang dibutuhkan dari sensor:
| Parameter | Satuan | Sumber |
|---|---|---|
| `Tr` (waktu ruminasi) | menit/hari | Collar / bolus akselerometer |
| Suhu tubuh sapi | °C | Bolus rumen / ear tag thermal |
| CPM (kunyahan/menit) | kunyahan/menit | Collar akselerometer |

### Hubungan Tr dengan GHSI (Status Kesehatan):
- `Tr < 300 menit/hari` → indikator gangguan kesehatan
- `Tr 400–600 menit/hari` → zona normal
- `Tr > 700 menit/hari` → perlu evaluasi (bisa heat stress atau anomali sensor)

---

## 8. Catatan Pengembangan

### Yang sudah ada:
- [x] Rumus CH₄ gabungan dengan faktor ruminasi IoT
- [x] Database IPM untuk 20 jenis pakan (10 hijauan + 10 konsentrat)
- [x] Slider UI untuk rasio hijauan/konsentrat

### Yang perlu dikembangkan:
- [ ] Multi-pakan (lebih dari 1 jenis hijauan + 1 jenis konsentrat sekaligus)
- [ ] Integrasi GHSI (Global Health Status Index) dengan output CH₄

Modifikasi Logika Sistem: Angka 21 (metana dasar) tidak lagi dibuat statis, melainkan dinamis tergantung ras sapi yang dipilih user:
Sapi Perah (Friesian Holstein) / Sapi Impor: Baseline Metana = 22 gram / kg DMI (Kapasitas makan besar, fermentasi masif).
Sapi Pedaging (Brahman Cross / Limousin): Baseline Metana = 21 gram / kg DMI (Standar rata-rata).
Sapi Lokal Asli (Sapi Bali / Sapi PO / Madura): Baseline Metana = 19 gram / kg DMI (Ukuran rumen lebih kecil, adaptasi pakan tropis lebih efisien).