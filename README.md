# EcoConsume AI 🌿

> **Asisten Konsumsi Rumah Tangga Bertenaga AI & Database Eco-Score Terintegrasi**  
> *Belanja Lebih Cerdas, Hidup Lebih Hijau.*

EcoConsume AI adalah platform web full-stack modern yang dirancang untuk memprediksi kebutuhan konsumsi rumah tangga, mencegah pemborosan bahan pokok (zero-waste), dan menghadirkan transparansi dampak lingkungan melalui **Eco-Score 5 Kriteria (A-E)**.

---

## 🌟 Fitur Utama

1. **Dashboard Rumah Tangga**:
   - Ringkasan stok aktif per ruangan (Dapur, Pantry, Kamar Mandi).
   - Indikator peringatan "Akan Habis" & countdown "Akan Kedaluwarsa".
   - Metrik Waste Score bulanan (0-100%).
   - Grafik interaktif tren konsumsi harian vs emisi jejak karbon (Recharts).

2. **Smart Shopping List (AI Auto-Generated)**:
   - Dihasilkan otomatis berdasarkan perkiraan habis stok $\le 4$ hari.
   - Pengecekan otomatis rekomendasi produk Grade A yang lebih ramah lingkungan.
   - Kalkulasi estimasi total biaya dan potensi reduksi kg CO₂.
   - Checkbox belanja & tombol penyelesaian berhadiah Poin Hijau.

3. **Barcode Scanner & Eco-Score (Kamera HP / Upload / Preset)**:
   - Integrasi kamera barcode scanner real-time (`html5-qrcode`).
   - Tampilan grading A-E dengan breakdown 5 kriteria:
     - 💨 **Jejak Karbon (25%)**
     - 🌾 **Bahan Baku & Rantai Pasok (20%)**
     - 📦 **Kemasan Berkelanjutan (20%)**
     - 🏅 **Sertifikasi Hijau (20%)**
     - 🔍 **Transparansi Produsen (15%)**
   - Quick Add: *Tambah ke Stok* atau *Daftar Belanja*.
   - Rekomendasi alternatif produk yang lebih hijau jika produk saat ini Grade B/C/D/E.

4. **Eco-Product Finder & Side-by-Side Comparison**:
   - Direktori 30 produk lokal terverifikasi lengkap dengan sertifikasi (*Organik Indonesia*, *FSC*, *Fair Trade*, dll).
   - Filter instan berdasarkan Kategori, Grade Eco-Score (A-E), dan Sertifikasi.
   - Drawer perbandingan 2-3 produk side-by-side untuk evaluasi harga dan jejak karbon.

5. **AI Consumption Predictor**:
   - Algoritma moving average time-series yang menyesuaikan skala jumlah anggota keluarga.
   - Menghitung rata-rata laju konsumsi harian & estimasi tanggal habis pasti.
   - Skor keyakinan model (*AI Confidence Score*).

6. **Gamifikasi & Laporan Dampak Lingkungan**:
   - Poin Hijau dan Badges (*Pahlawan Nol Sampah*, *Eco Master*, *Penyelamat Makanan*).
   - Pengurangan sampah bulanan (kg) dan kg CO₂ yang berhasil dihemat.
   - Pengaturan profil keluarga dan dukungan **Dark Theme**.

---

## 📐 Formula & Algoritma Kunci

### 1. Eco-Score Weighted Formula
$$\text{EcoScore} = (0.25 \times \text{Carbon}) + (0.20 \times \text{Sourcing}) + (0.20 \times \text{Packaging}) + (0.20 \times \text{Cert}) + (0.15 \times \text{Transparency}) \times 100$$
- **Grade A**: 80 – 100
- **Grade B**: 65 – 79
- **Grade C**: 50 – 64
- **Grade D**: 35 – 49
- **Grade E**: $< 35$

### 2. Prediksi Waktu Habis Stok
$$\text{Avg Daily Consumption} = \frac{\text{Quantity}}{\text{Base Lifespan}} \times \left(\frac{\text{Household Size}}{3}\right)$$
$$\text{Days Remaining} = \left\lfloor \frac{\text{Current Stock}}{\text{Avg Daily Consumption}} \right\rfloor$$
$$\text{Predicted Empty Date} = \text{Current Date} + \text{Days Remaining}$$

### 3. Ranking Rekomendasi Alternatif
$$\text{Score} = 0.5 \times \text{EcoScoreNorm} + 0.3 \times \text{PriceScore} + 0.2 \times \text{Availability}$$

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Palet Emerald `#10B981`, Cream `#FEF3C7`, Slate `#1F2937`)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Barcode Engine**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Database & ORM**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **State Management**: React Context dengan fallback persistent LocalStorage

---

## 🚀 Panduan Setup & Menjalankan

### Prasyarat
- Node.js versi 18+ atau 20+
- npm atau pnpm / yarn

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd uiso
npm install
```

### 2. Konfigurasi Environment (Opsional untuk Database Supabase/PostgreSQL)
Buat file `.env` di root direktori jika ingin menghubungkan PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecoconsume?schema=public"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 🗺️ Struktur Routing Halaman

| Rute | Deskripsi |
|---|---|
| `/` | Landing page interaktif & value proposition |
| `/dashboard` | Ringkasan inventaris, alert kedaluwarsa, grafik konsumsi |
| `/shopping-list` | Smart shopping list dengan generator AI |
| `/scan` | Kamera scanner barcode & kartu detail Eco-Score |
| `/products` | Direktori Eco-Product Finder & filter multi-kategori |
| `/products/[id]` | Halaman detail produk, bahan baku & asal daerah |
| `/predictions` | Analisis AI time-series & konfigurasi jumlah anggota keluarga |
| `/impact` | Gamifikasi, perolehan Poin Hijau, dan riwayat Waste Score |
| `/profile` | Pengaturan profil rumah tangga & preferensi tema |

---

## 📡 API Endpoints

- `POST /api/predict-consumption` — Prediksi kehabisan bahan pokok berbasis histori & ukuran keluarga.
- `GET /api/eco-score?barcode={code}` — Kalkulasi 5 kriteria Eco-Score produk dan alternatif hijau.
- `GET /api/recommendations?category={cat}` — Menghasilkan top 3 produk terhijau dan paling terjangkau.
- `GET /api/products` — Pencarian dan filter katalog produk.
