Berikut adalah Product Requirements Document (PRD) yang komprehensif dan profesional untuk Aplikasi Manajemen Keuangan berbasis Web.

# Product Requirements Document (PRD): Aplikasi Manajemen Keuangan (Web App)

---

## 1. Ringkasan Produk

### Latar Belakang

Individu dan pekerja lepas (freelancer) sering kali kesulitan dalam mengelola dan melacak arus kas mereka. Pencampuran antara dana pribadi dan usaha kecil, pengeluaran yang tidak terkontrol, serta kurangnya wawasan keuangan menyebabkan instabilitas finansial.

### Problem Statement

Alat manajemen keuangan yang ada di pasaran saat ini terbagi menjadi dua ekstrem: aplikasi *enterprise* yang terlalu kompleks dan mahal, atau *spreadsheet* manual yang memakan waktu dan rawan kesalahan *human-error*. Pengguna membutuhkan alat yang otomatis, mudah diakses, namun cukup kuat untuk memberikan analitik keuangan yang bermakna.

### Solusi yang Ditawarkan

Sebuah Web App Manajemen Keuangan yang intuitif, dirancang khusus untuk mempermudah pencatatan transaksi harian, pengaturan anggaran (budgeting), pengelolaan multi-rekening/dompet, dan pembuatan laporan keuangan secara instan.

### Value Proposition

*"Satu platform cerdas untuk memegang kendali penuh atas keuangan pribadi dan bisnis freelance Anda, tanpa kerumitan akuntansi."*

---

## 2. Tujuan Bisnis

### Business Goals

* **User Acquisition:** Mencapai 10.000 pengguna aktif dalam 6 bulan pertama pasca-peluncuran.
* **Engagement:** Menjadikan aplikasi ini sebagai *daily habit* pengguna (pengisian transaksi harian).
* **Monetization (Future):** Mengonversi 5% pengguna gratis menjadi pengguna premium (langganan berbayar) di tahun pertama.

### KPI Utama

* **MAU (Monthly Active Users):** Jumlah pengguna unik yang login dan melakukan setidaknya 1 aksi per bulan.
* **Retention Rate (Day-1, Day-7, Day-30):** Persentase pengguna yang kembali menggunakan aplikasi.
* **CAC (Customer Acquisition Cost):** Biaya untuk mendapatkan satu pengguna baru.

### Success Metrics

* > 60% pengguna baru berhasil menyelesaikan *onboarding* dan membuat dompet pertama mereka.


* > 40% pengguna mengaktifkan dan mengatur fitur *Budgeting* di minggu pertama.


* Rata-rata pengguna mencatat minimal 10 transaksi per bulan.

---

## 3. User Persona

### Persona 1: Raka, Sang Freelancer (28 Tahun)

* **Pekerjaan:** Freelance Graphic Designer.
* **Pain Points:** Sering mencampur uang pribadi dan proyek klien. Sulit melacak klien mana yang belum membayar (piutang). Tidak tahu pasti berapa profit bersih setiap bulan.
* **Kebutuhan Utama:** Fitur multi-wallet (pemisahan uang pribadi dan bisnis), laporan arus kas yang rapi untuk evaluasi proyek, export invoice/laporan.

### Persona 2: Sarah, Pekerja Kantoran (25 Tahun)

* **Pekerjaan:** Digital Marketer.
* **Pain Points:** Sering "bocor halus" atau overbudget untuk gaya hidup dan jajan kopi. Tabungan tidak pernah bertambah.
* **Kebutuhan Utama:** Fitur budgeting yang ketat, notifikasi/reminder jika pengeluaran hampir menyentuh limit, kategori transaksi yang detail.

---

## 4. Scope Produk

### In Scope (MVP)

* Autentikasi standar (Email/Password & Google OAuth).
* Dashboard interaktif dengan grafik sederhana.
* CRUD (Create, Read, Update, Delete) pemasukan dan pengeluaran.
* Pembuatan kategori kustom dan multi-wallet.
* Sistem budgeting bulanan.
* Laporan bulanan/tahunan (PDF/CSV).
* Notifikasi in-app untuk limit budget.

### Out of Scope (Tidak Masuk MVP)

* Integrasi otomatis dengan rekening bank (Open Banking API).
* Aplikasi *native* Mobile (iOS/Android).
* Pemindai (OCR) struk otomatis menggunakan AI.
* Modul investasi dan saham.

---

## 5. Fitur Utama

### 5.1 Authentication & User Management

* **Deskripsi:** Sistem registrasi, login, dan manajemen profil pengguna.
* **User Story:** Sebagai pengguna, saya ingin bisa mendaftar menggunakan akun Google agar proses login lebih cepat dan aman.
* **Acceptance Criteria (AC):** Pengguna bisa daftar via Google atau Email. Jika email, wajib verifikasi OTP/Link. Password minimal 8 karakter dengan kombinasi angka dan huruf.
* **Edge Cases:** Pengguna salah memasukkan password 5 kali (akun terkunci sementara). Email sudah terdaftar sebelumnya.

### 5.2 Dashboard Keuangan

* **Deskripsi:** Halaman utama yang merangkum total saldo, arus kas, dan pengeluaran terbesar bulan ini.
* **User Story:** Sebagai pengguna, saya ingin melihat ringkasan uang saya saat membuka aplikasi agar tahu kondisi keuangan terkini.
* **AC:** Menampilkan Total Saldo, Pemasukan (Bulan ini), Pengeluaran (Bulan ini), dan Grafik Donut (Top 3 Kategori Pengeluaran).
* **Edge Cases:** Jika belum ada transaksi, tampilkan *empty state* yang mengarahkan pengguna untuk menambah transaksi.

### 5.3 CRUD Transaksi

* **Deskripsi:** Form pencatatan uang masuk, uang keluar, atau transfer antar dompet.
* **User Story:** Sebagai pengguna, saya ingin mencatat pengeluaran makan siang hari ini dengan mudah.
* **AC:** Form memiliki field: Jenis (In/Out/Transfer), Nominal, Kategori, Dompet, Tanggal, dan Catatan. Transaksi langsung memotong/menambah saldo dompet.
* **Edge Cases:** Menginput nominal negatif atau nol. Mengedit transaksi yang mengubah saldo dompet menjadi minus.

### 5.4 Kategori Transaksi

* **Deskripsi:** Pengelompokan jenis transaksi (Makanan, Transportasi, Gaji, dll).
* **User Story:** Sebagai freelancer, saya ingin membuat kategori "Project Design" agar pemasukan freelance terpisah dari gaji tetap.
* **AC:** Sistem menyediakan 10 kategori *default*. Pengguna bisa menambah, mengedit, dan menghapus kategori *custom*.
* **Edge Cases:** Menghapus kategori yang sudah terikat pada 100 transaksi (Solusi: Munculkan opsi alihkan ke kategori "Lain-lain").

### 5.5 Budgeting

* **Deskripsi:** Fitur pengaturan batas pengeluaran per kategori setiap bulannya.
* **User Story:** Sebagai pengguna, saya ingin membatasi pengeluaran ngopi maksimal Rp500.000 per bulan.
* **AC:** Pengguna bisa set nominal budget per kategori. Sistem menampilkan progress bar (hijau, kuning jika >75%, merah jika >100%).
* **Edge Cases:** Pengguna mengubah nominal budget di pertengahan bulan setelah pengeluaran melebihi budget baru.

### 5.6 Multi Wallet / Rekening

* **Deskripsi:** Dukungan untuk banyak tempat penyimpanan uang (Tunai, BCA, OVO, dll).
* **User Story:** Saya ingin memisahkan pencatatan antara saldo Bank dan saldo e-Wallet.
* **AC:** Pengguna bisa membuat dompet baru, set saldo awal, dan melihat mutasi per dompet.
* **Edge Cases:** Transfer antar dompet beda mata uang (MVP: Hanya dukung IDR, mata uang asing *out of scope*).

### 5.7 Laporan Keuangan

* **Deskripsi:** Analitik detail cashflow harian, mingguan, bulanan, dan tahunan.
* **User Story:** Sebagai pekerja lepas, saya ingin melihat laporan laba-rugi bulan ini.
* **AC:** Filter laporan berdasarkan *Date Range*, Dompet, dan Jenis Transaksi. Visualisasi menggunakan *Bar/Line Chart*.
* **Edge Cases:** Filter tanggal terbalik (End Date lebih kecil dari Start Date).

### 5.8 Reminder / Notifikasi

* **Deskripsi:** Peringatan untuk tagihan atau overbudget.
* **User Story:** Saya ingin diingatkan saat pengeluaran kategori Transportasi sudah mencapai 90%.
* **AC:** Trigger notifikasi *in-app* ketika pengeluaran menyentuh 80%, 90%, dan 100% dari budget.
* **Edge Cases:** Pengguna melakukan banyak transaksi kecil dalam semenit yang melewati batas (Notifikasi di-batch agar tidak *spam*).

### 5.9 Export PDF & Excel

* **Deskripsi:** Mengunduh data transaksi dan laporan untuk keperluan eksternal.
* **User Story:** Saya ingin mencetak mutasi bulan ini ke Excel untuk direkap ulang.
* **AC:** Tombol export men-generate file dalam waktu < 5 detik. Data sesuai dengan filter yang sedang aktif di UI.
* **Edge Cases:** Export data dengan rentang 5 tahun (terlalu besar, batasi maksimal export per 1 tahun).

---

## 6. User Flow

### Registrasi & Onboarding

1. Landing Page -> Klik "Daftar Gratis".
2. Input Email & Password (atau Google Auth).
3. Verifikasi OTP (jika via email).
4. *Onboarding*: Sistem meminta pengguna membuat 1 Dompet pertama (misal: "Dompet Tunai") dan Saldo Awal.
5. Masuk ke Dashboard Utama.

### Tambah Transaksi

1. Dashboard -> Klik tombol "+" (Floating Action Button).
2. Pilih Tab: Pengeluaran / Pemasukan / Transfer.
3. Input Nominal, pilih Kategori, pilih Dompet, isi Catatan.
4. Klik "Simpan".
5. Saldo di Dashboard otomatis ter-update dan muncul *toast success message*.

### Generate Laporan

1. Sidebar -> Klik menu "Laporan".
2. Pilih rentang waktu (misal: "Bulan Ini").
3. Lihat visualisasi data di layar.
4. Klik icon "Download" -> Pilih format "PDF" atau "Excel".
5. File otomatis terunduh ke perangkat pengguna.

---

## 7. Non-Functional Requirements

* **Security:** Enkripsi *password* menggunakan Bcrypt. Autentikasi API menggunakan JWT (JSON Web Tokens). Koneksi wajib HTTPS (SSL/TLS). Pencegahan SQL Injection & XSS.
* **Performance:** Waktu *load* halaman pertama < 2 detik. Query laporan 1 tahun maksimum dieksekusi dalam 3 detik.
* **Scalability:** Arsitektur *stateless* pada backend agar mudah di-scale horizontal. Menggunakan *connection pooling* untuk database.
* **Availability:** Uptime target 99.9%. Backup database otomatis dilakukan setiap hari (Daily Snapshot).
* **Responsiveness:** Menggunakan pendekatan *Mobile-First Design*. UI harus berfungsi sempurna di ukuran layar *smartphone*, tablet, maupun desktop.

---

## 8. Struktur Database (High-Level Schema)

*Relational Database (PostgreSQL/MySQL) digunakan untuk memastikan konsistensi (ACID).*

| Table | Columns | Deskripsi |
| --- | --- | --- |
| **Users** | `id` (PK), `name`, `email`, `password_hash`, `created_at` | Data pengguna aplikasi |
| **Wallets** | `id` (PK), `user_id` (FK), `name`, `type`, `balance` | Dompet/Rekening (Tunai, Bank, e-Wallet) |
| **Categories** | `id` (PK), `user_id` (FK), `name`, `type` (In/Out), `icon` | Kategori transaksi |
| **Transactions** | `id` (PK), `user_id` (FK), `wallet_id` (FK), `category_id` (FK), `type`, `amount`, `date`, `notes` | Tabel utama mutasi keuangan |
| **Budgets** | `id` (PK), `user_id` (FK), `category_id` (FK), `amount`, `month`, `year` | Target pengeluaran per kategori |

---

## 9. API Design (Contoh REST Endpoints)

**Standard Response Format (JSON):** `{ "status": "success", "data": {...}, "message": "..." }`

### Auth Endpoints

* `POST /api/v1/auth/register` - Membuat akun baru.
* `POST /api/v1/auth/login` - Menghasilkan JWT token.

### Transaction Endpoints

* `GET /api/v1/transactions` - Mengambil list transaksi (Mendukung query `?start_date=` & `?end_date=`).
* `POST /api/v1/transactions` - Menambah transaksi baru.
* `DELETE /api/v1/transactions/{id}` - Menghapus transaksi.

### Budgeting Endpoints

* `GET /api/v1/budgets` - Mengambil list budget beserta total *spent* bulan ini.
* `POST /api/v1/budgets` - Mengatur budget baru untuk suatu kategori.

### Reports Endpoints

* `GET /api/v1/reports/summary` - Mengambil total pemasukan, pengeluaran, dan selisih (untuk dashboard).
* `GET /api/v1/reports/export` - Endpoint untuk men-generate dan mengunduh file Excel/PDF.

---

## 10. UI/UX Requirements

* **Design Principles:** *Clean, Minimalist, Trustworthy*. Menggunakan warna yang identik dengan keamanan dan uang (Dominan Putih, Abu-abu, dengan aksen Biru/Hijau).
* **Halaman Utama (Dashboard):**
* Fokus pada *glanceability* (mudah dibaca sekilas).
* Menempatkan tombol aksi (Tambah Transaksi) pada posisi yang sangat terjangkau (kanan bawah atau tengah bawah di versi mobile).


* **Responsive Behavior:**
* Di Mobile: Menggunakan *Bottom Navigation Bar*.
* Di Desktop: Menggunakan *Left Sidebar Navigation*.


* **Dashboard Widgets:**
* *Balance Card:* Saldo total dengan opsi disembunyikan (ikon mata).
* *Expense Breakdown:* *Pie/Donut chart* menampilkan distribusi pengeluaran.
* *Recent Transactions:* List 5 transaksi terakhir.



---

## 11. Tech Stack Recommendation

Mengingat kebutuhan ini difokuskan pada produk startup yang cepat *(Agile)* namun *scalable*:

* **Frontend:** React.js atau Next.js (Memberikan performa tinggi dan SEO jika kedepannya butuh public page). Styling menggunakan TailwindCSS.
* **Backend:** Node.js dengan framework Express.js atau NestJS. (Alternatif: Go jika memprioritaskan konurensi dan kecepatan tinggi).
* **Database:** PostgreSQL (Solid untuk data transaksional dan relational).
* **Authentication:** Supabase Auth, Firebase Auth, atau NextAuth (Mempercepat development JWT & OAuth).
* **Deployment:**
* Frontend: Vercel (CI/CD otomatis, gratis untuk awal).
* Backend & Database: Render, Railway, atau AWS (EC2/RDS jika budget tersedia).
* File Storage (untuk export): AWS S3 atau Cloudinary.



---

## 12. Roadmap Development

### Phase 1: MVP (Bulan 1 - 3)

* Setup infrastruktur & Database.
* Pengembangan UI/UX Frontend (Dashboard & Formulir).
* Integrasi Auth, CRUD Transaksi & Dompet.
* Rilis Beta Tertutup (Internal Testing & Early Adopters).
* Perbaikan Bug & Optimalisasi Performa.

### Phase 2: Growth & Retention (Bulan 4 - 6)

* Fitur Budgeting & Progress Tracking.
* Notifikasi *In-App* dan Email *Reminder*.
* Laporan Visual tingkat lanjut & Export PDF/Excel.
* *Referral System* (Program ajak teman).

### Phase 3: Future Development (Bulan 7+)

* Pindah dari Web App ke *Progressive Web App* (PWA) / *Native Mobile*.
* Membangun AI / Automasi.

---

## 13. Risiko & Mitigasi

### Risiko Teknis

* **Risiko:** Kebocoran data transaksi finansial pengguna.
* **Mitigasi:** Menerapkan regulasi perlindungan data yang ketat (seperti UU PDP), tidak menyimpan data bank secara *raw*, enkripsi field sensitif di database.


* **Risiko:** *Downtime* server saat akhir bulan (traffic tinggi karena gajian/rekap bulanan).
* **Mitigasi:** Auto-scaling pada server backend, implementasi Redis *caching* untuk load dashboard harian.



### Risiko Bisnis

* **Risiko:** Retensi pengguna rendah (pengguna malas mencatat setelah 2 minggu).
* **Mitigasi:** Gamifikasi UI (misal: *streak* harian), reminder yang personal (bukan sekadar bot spam), dan mempercepat proses input (< 3 klik per transaksi).



---

## 14. Future Enhancements (Vision)

* **AI Financial Insights:** Asisten AI cerdas yang memberikan saran (*"Bulan ini pengeluaran makanmu naik 20%, kurangi jajan minggu depan"*).
* **OCR Struk Otomatis:** Pengguna cukup memfoto struk kasir, AI akan mendeteksi nominal, toko, dan tanggal untuk langsung dimasukkan sebagai transaksi.
* **Integrasi Open Banking:** Bekerja sama dengan API Bank lokal atau *payment gateway* (seperti Brick atau Flip) agar transaksi bank otomatis tercatat tanpa input manual.
* **Aplikasi Mobile (iOS/Android):** Dibangun menggunakan React Native / Flutter untuk fitur native seperti *Push Notifications*, widget layar depan (Homescreen), dan pembacaan SMS notifikasi bank.