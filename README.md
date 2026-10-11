# EcoConsume AI 🌿

> **Pencatat Konsumsi & Sampah Rumah Tangga Berbasis Data Empiris**
> *Belanja lebih cerdas, hidup lebih hijau — tanpa angka karangan.*

EcoConsume AI membantu rumah tangga memantau konsumsi, mengukur timbulan sampah, memilah dengan
benar, dan mengenali produk secara transparan. **Setiap angka berasal dari catatan pengguna sendiri
atau faktor referensi ter-sitasi** — bukan prediksi yang dikarang.

---

## 🌟 Fitur

- **Dashboard** — stok per ruangan, alert kedaluwarsa, dan sisa hari **hanya bila data konsumsi cukup**.
- **Scan & Deteksi**
  - **Scan Barcode (kamera)** via `html5-qrcode` → data produk & Eco-Score **nyata dari Open Food Facts**.
  - **Deteksi Foto AI** — Gemini hanya **membaca jenis barang/kemasan**; skor dihitung dari input terukur.
- **Konsumsi** — catat pembelian & sampah; sistem menghitung laju konsumsi dari histori Anda.
- **Sampah** — kalkulator timbulan, benchmark nasional (SIPSN), panduan pemilahan, dan catatan bank sampah.
- **Edukasi** — kamus sertifikasi hijau & checklist anti-greenwashing.
- **Belanja** — daftar belanja otomatis dari stok yang datanya cukup.
- **Dampak** — ringkasan CO₂e & sampah dari catatan Anda.
- **Mode gelap + PWA/offline**.

---

## 📐 Prinsip Empiris

1. **Tidak ada prediksi karangan.** Laju konsumsi = total kuantitas dibeli ÷ rentang hari observasi
   dari catatan pengguna. Syarat: ≥ 2 pembelian dan rentang ≥ 14 hari. Jika belum, aplikasi menandai
   **"data belum cukup"**.
2. **Data produk nyata.** Barcode diambil dari Open Food Facts (basis data terbuka). Bila Eco-Score OFF
   tidak ada, ditampilkan **"skor belum tersedia"** — bukan angka buatan.
3. **Faktor ter-sitasi.** CO₂e memakai Poore & Nemecek (2018); benchmark timbulan memakai SIPSN KLHK ÷ BPS.

### Rumus
- Laju: `rate = Σ kuantitas ÷ rentang hari`
- Sisa hari: `daysRemaining = ⌊stok ÷ rate⌋`
- Timbulan: `kg = Σ (kuantitas × faktor satuan)`, `CO₂e = Σ (kg × faktor emisi)`
- Per kapita: `kg ÷ anggota ÷ hari`, dibandingkan rata-rata nasional.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (Emerald `#10B981`, Cream `#FEF3C7`, Slate) · Font Plus Jakarta Sans
- **Ikon:** Lucide React
- **Barcode:** html5-qrcode
- **Data produk:** Open Food Facts (REST) — tanpa API key
- **AI Vision:** Google Gemini (opsional, untuk baca kemasan)
- **State/Data:** React Context + LocalStorage · PWA/service worker
- **Tanpa database.**

---

## 🚀 Menjalankan

```bash
npm install
npm run dev            # http://localhost:3000
```
Opsional `.env.local` untuk fitur foto AI:
```env
GEMINI_API_KEY=isi_api_key_gemini
# GEMINI_MODEL=gemini-2.5-flash
```
Tanpa key, scan barcode, konsumsi, sampah, dan edukasi tetap berfungsi.

Perintah lain: `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck`.

---

## 🗺️ Routing

| Rute | Deskripsi |
|---|---|
| `/` | Landing |
| `/dashboard` | Stok, alert, estimasi (jika data cukup) |
| `/scan` | Scan barcode (Open Food Facts) + Deteksi Foto AI |
| `/konsumsi` | Catat pembelian & sampah; laju konsumsi |
| `/sampah` | Kalkulator timbulan, pemilahan, bank sampah |
| `/edukasi` | Sertifikasi hijau & anti-greenwashing |
| `/shopping-list` | Daftar belanja |
| `/products` | Cari produk (OFF) + katalog contoh |
| `/products/[id]` | Detail produk katalog |
| `/impact` | Ringkasan dampak dari catatan Anda |
| `/profile` | Profil rumah tangga |

---

## 📡 API

| Method & Path | Deskripsi |
|---|---|
| `GET` `/api/products?q=&source=off` | Pencarian Open Food Facts |
| `GET/POST` `/api/eco-score?barcode=` | Data produk & skor dari OFF |
| `POST` `/api/predict-consumption` | Laju konsumsi dari histori pembelian |
| `POST` `/api/ai-detect` | Estimasi SIH rule-based (input manual) |
| `POST` `/api/gemini-detect` | Baca jenis barang dari foto |
| `GET` `/api/recommendations` | Ranking produk katalog contoh |

---

## 📁 Struktur

```
src/
  app/            # Halaman & API routes
  components/     # Navbar, BottomNav, EcoBadge, BarcodeScanner, ThemeToggle, SourcePanel, ServiceWorkerRegister
  context/        # AppContext (state + localStorage)
  data/           # seedData.ts (produk contoh + log awal), reference.ts (faktor & sitasi)
  lib/            # tracking.ts, openfoodfacts.ts, algorithms.ts, sih.ts, gemini.ts
public/
  manifest.json · icon.svg · sw.js · offline.html
```
