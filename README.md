# 🎯 JobTracker — Lacak Lamaranmu

Aplikasi web untuk melacak lamaran kerja, mendapatkan rekomendasi lowongan berbasis AI, dan mencari pekerjaan di berbagai platform sekaligus — semua berjalan langsung di browser tanpa backend.

![Preview](https://img.shields.io/badge/version-2.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![HTML](https://img.shields.io/badge/HTML-CSS-JS-orange)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard** | Statistik lamaran real-time dengan chart interaktif dan success rate |
| 📋 **Job Tracker** | Kelola semua lamaran dengan filter status, sumber, dan pencarian |
| 🌐 **Sumber Lowongan** | Direktori 12 platform kerja terbaik dengan tips & rating |
| 🔍 **Cari Lowongan** | Cari di semua platform sekaligus dengan satu kata kunci |
| 👤 **Profil Saya** | Atur skill, preferensi kerja, gaji, dan lokasi |
| 📎 **Upload CV** | Auto-extract profil dari file PDF, DOCX, atau TXT |
| 🤖 **Rekomendasi AI** | Skor kecocokan lowongan berdasarkan profil & skill kamu |
| 📊 **Export Excel** | Export semua data lamaran ke file `.xls` |

---

## 🚀 Cara Penggunaan

### 1. Jalankan Aplikasi

Tidak perlu instalasi apapun. Cukup buka file `index.html` di browser:

```
Klik dua kali → index.html
```

Atau gunakan Live Server (VS Code extension) untuk pengalaman terbaik.

---

### 2. Dashboard

Halaman utama yang menampilkan ringkasan aktivitas lamaran kamu.

- **Stat Cards** — Klik kartu Total, Interview, Offer, atau Ditolak untuk melihat detail daftar lamaran per kategori
- **Chart Batang** — Visualisasi distribusi status lamaran; klik bar untuk filter
- **Sumber Terbanyak** — Platform mana yang paling banyak kamu gunakan
- **Lamaran Terbaru** — 5 lamaran terakhir; klik baris untuk melihat detail lengkap

---

### 3. Tambah & Kelola Lamaran

Klik tombol **+ Tambah Lamaran** di pojok kanan atas.

**Field yang tersedia:**

| Field | Keterangan |
|---|---|
| Nama Perusahaan | Wajib diisi |
| Posisi | Wajib diisi |
| Sumber Lowongan | LinkedIn, Jobstreet, Glints, dll |
| Status | Applied / Test / Interview / Offer / Rejected / Ghosted |
| Tanggal Apply | Default hari ini |
| Prioritas | High / Medium / Low |
| Range Gaji | Contoh: `10-15jt` |
| Lokasi | Contoh: `Jakarta` |
| Link Lowongan | URL lamaran asli |
| Catatan | Jadwal interview, progress rekrutmen, dll |

Untuk **edit** atau **hapus**, buka halaman Job Tracker lalu klik ikon ✏️ atau 🗑️ pada baris yang diinginkan.

---

### 4. Job Tracker

Halaman daftar semua lamaran dengan fitur filter:

- **Cari** — Filter berdasarkan nama perusahaan atau posisi
- **Filter Status** — Applied, Test, Interview, Offer, Rejected, Ghosted
- **Filter Sumber** — Filter berdasarkan platform asal lowongan

---

### 5. Profil Saya

Isi profil agar sistem rekomendasi AI bekerja secara akurat.

**Data yang perlu diisi:**

```
Nama Lengkap       → Nama kamu
Posisi / Title     → Contoh: Frontend Developer
Pengalaman Kerja   → Jumlah tahun (angka)
Level yang Dicari  → Fresh Graduate / Junior / Mid / Senior
Tipe Kerja         → Remote / Hybrid / Onsite
Gaji Min & Max     → Dalam satuan juta (contoh: 10 dan 20)
Lokasi Preferensi  → Pisahkan dengan koma (contoh: Jakarta, Bandung)
Skill              → Pisahkan dengan koma (contoh: javascript, react, nodejs)
```

Klik tombol skill populer di bawah textarea untuk menambah skill dengan cepat.

Setelah selesai, klik **💾 Simpan Profil & Update Rekomendasi**.

---

### 6. Upload CV (Auto Extract)

Fitur ini secara otomatis mengisi form profil dari file CV kamu.

**Format yang didukung:** PDF · DOCX · TXT

**Cara pakai:**
1. Buka halaman **Profil Saya**
2. Drag & drop file CV ke area upload, atau klik untuk pilih file
3. Sistem akan mengekstrak: nama, posisi, pengalaman, skill, dan lokasi
4. Profil otomatis tersimpan dan hasil pencarian di semua platform langsung ditampilkan

**Yang dideteksi otomatis:**
- 100+ skill teknis (Frontend, Backend, Mobile, Data, DevOps, Design, dll)
- Pengalaman kerja dari teks atau rentang tahun (contoh: `2020 - 2023`)
- Level karir (Fresh / Junior / Mid / Senior)
- Kota domisili

---

### 7. Rekomendasi AI

Sistem menghitung **Match Score (0–100%)** untuk setiap lowongan berdasarkan:

| Faktor | Bobot |
|---|---|
| Skill Match | 40% |
| Level Match | 25% |
| Work Type Match | 15% |
| Salary Match | 15% |
| Location Match | 5% |

**Label kandidat:**

| Score | Label |
|---|---|
| ≥ 85% | 🏆 Kandidat Kuat |
| ≥ 70% | ✅ Cocok |
| ≥ 50% | 🔶 Cukup Cocok |
| < 50% | 📌 Perlu Persiapan |

Halaman ini juga menampilkan **analisis profil** berisi kekuatan dan saran peningkatan skill.

---

### 8. Cari Lowongan

Masukkan kata kunci (contoh: `React Developer`) lalu klik **🔍 Cari di Semua Platform** — sistem akan membuka link pencarian di 12 platform sekaligus.

Tersedia juga tombol kata kunci populer: Frontend Developer, Backend Developer, Data Analyst, UI/UX Designer, Product Manager, DevOps Engineer.

---

### 9. Sumber Lowongan

Direktori 12 platform kerja yang direkomendasikan:

| Platform | Keunggulan |
|---|---|
| LinkedIn | Networking & MNC |
| Jobstreet | Terbesar di ASEAN |
| Glints | Startup & Young Professional |
| Talentics | AI-Matched, Tech Indonesia |
| Kalibrr | Skill-based Matching |
| Indeed | Aggregator Global |
| Tech in Asia | Startup Tech Asia |
| Karir.com | Lokal Indonesia |
| Jobplanet | Review Perusahaan |
| Urbanhire | ATS-Friendly |
| Remote.co | Khusus Remote/WFH |
| Freelancer.com | Proyek Freelance |

Klik **Buka Platform** untuk langsung mengunjungi, atau klik **🔍 Cari** untuk mencari posisi tertentu di platform tersebut.

---

### 10. Export Excel

Klik tombol **📊 Export Excel** di pojok kanan atas untuk mengunduh semua data lamaran dalam format `.xls` yang bisa dibuka di Microsoft Excel atau Google Sheets.

File yang dihasilkan mencakup: No, Perusahaan, Posisi, Sumber, Status, Tanggal Apply, Gaji, Lokasi, Prioritas, Catatan, dan Link.

---

## 🗂️ Struktur Project

```
JOBSEEKER/
├── index.html          # Halaman utama & semua UI
├── css/
│   └── style.css       # Styling lengkap aplikasi
└── js/
    ├── jobs.js         # Data platform & sample aplikasi
    ├── profile.js      # Profil user & job database rekomendasi
    ├── recommend.js    # Engine rekomendasi & scoring AI
    ├── cv-parser.js    # Parser CV (PDF/DOCX/TXT)
    └── app.js          # Logic utama, navigasi, CRUD, export
```

---

## 💾 Penyimpanan Data

Semua data disimpan di **localStorage** browser — tidak ada server, tidak ada database eksternal.

| Key | Isi |
|---|---|
| `jobApplications` | Daftar semua lamaran |
| `userProfile` | Profil & preferensi pengguna |

> Data akan tetap ada selama tidak menghapus cache/data browser.

---

## 🛠️ Teknologi

- **HTML5 / CSS3 / Vanilla JavaScript** — tanpa framework
- **PDF.js** (CDN) — membaca file PDF saat upload CV
- **Mammoth.js** (CDN) — membaca file DOCX saat upload CV
- **Google Fonts** — font Inter
- **localStorage** — penyimpanan data lokal

---

## 📋 Persyaratan

- Browser modern (Chrome, Firefox, Edge, Safari)
- Koneksi internet hanya diperlukan untuk: Google Fonts, PDF.js, Mammoth.js (dimuat otomatis saat dibutuhkan)

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
