# PRD — InvenTrack

## Sistem Inventaris & Pelabelan Aset Berbasis QR Code

---

## 1. Overview

**InvenTrack** adalah sistem manajemen inventaris aset berbasis web yang memungkinkan organisasi/instansi untuk mengelola, melabeli, dan memverifikasi aset fisik menggunakan QR Code. Sistem ini dirancang untuk menggantikan pencatatan aset manual dengan arsip digital yang terpusat, mudah diakses, dan bisa diverifikasi oleh siapa pun melalui scan QR.

### 1.1 Problem Statement

Client saat ini mengelola data aset (laptop, printer, TV, kursi, meja, scanner, dokumen kontrak) secara manual atau semi-manual. Ketika atasan ingin mengecek kepemilikan, spesifikasi, atau tahun pengadaan suatu barang, prosesnya lambat dan tidak efisien. Data aset yang ada masih dalam bentuk dokumen fisik atau foto yang tidak terstruktur.

### 1.2 Solution

Web application fullstack yang menyediakan:

- CRUD manajemen data aset dengan form input manual dan AI-powered image extraction
- Auto-generate QR Code per aset
- Cetak label QR dalam format PDF
- Halaman publik verifikasi aset (hasil scan QR) — tanpa login
- Dashboard statistik aset
- Import/export data Excel untuk bulk operations

### 1.3 Target Users

- **Admin** (1-3 orang): Staff arsiparis/admin kantor yang menginput dan mengelola data aset
- **Viewer** (atasan/bos): Scan QR Code untuk melihat detail aset — tidak perlu login
- **Publik**: Siapa pun yang scan QR bisa melihat halaman verifikasi aset

### 1.4 Success Metrics

- Admin bisa input aset baru dalam < 2 menit (manual) atau < 30 detik (via AI extraction)
- QR scan ke halaman detail aset load dalam < 2 detik di mobile
- Zero data loss — semua perubahan tercatat di audit log

---

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma |
| Database | PostgreSQL (Supabase untuk MVP, migrasi ke self-hosted nanti) |
| Auth | Auth.js (credential-based) |
| AI Extraction | Google Gemini Flash API (vision + structured output) |
| QR Generation | `qrcode` package |
| QR Scanning | `html5-qrcode` |
| PDF Label | `@react-pdf/renderer` |
| Excel I/O | `xlsx` package (SheetJS) |
| File Storage | Supabase Storage (MVP), migrasi ke S3-compatible nanti |
| Deployment | VPS + Docker Compose + Nginx (production) |

---

## 3. User Stories & Features

### 3.1 Authentication

**US-01**: Sebagai admin, saya bisa login dengan username dan password agar hanya orang berwenang yang bisa mengelola data aset.

Acceptance Criteria:

- Login page dengan form username + password
- Session-based auth menggunakan Auth.js
- Redirect ke dashboard setelah login
- Middleware proteksi untuk semua route `/dashboard/*`
- Logout functionality
- Default admin account di-seed saat setup awal

**US-02**: Sebagai admin, saya bisa mengelola akun user lain (CRUD user) dengan role Admin atau Viewer.

Acceptance Criteria:

- Halaman manajemen user (hanya accessible oleh Admin)
- Create user baru dengan role assignment
- Edit user (username, password, role)
- Delete user (soft delete)
- Role: `ADMIN` (full access), `VIEWER` (read-only dashboard)

---

### 3.2 Master Data Management

**US-03**: Sebagai admin, saya bisa mengelola data master (kategori, lokasi, sumber dana, kondisi) agar data aset konsisten dan terstandarisasi.

Acceptance Criteria:

- CRUD untuk masing-masing master data:
  - **Kategori**: nama, kode prefix (contoh: Elektronik → `ELK`, Furniture → `FRN`, Dokumen → `DOK`)
  - **Lokasi**: nama lokasi, gedung, lantai
  - **Sumber Dana**: nama sumber dana (contoh: BOP, PLN, APBN, dll)
  - **Kondisi**: nama kondisi, severity level (contoh: Baik → 1, Rusak Ringan → 2, Rusak Berat → 3, Hilang → 4)
- Validasi: nama unik per tabel master, kode prefix unik untuk kategori
- Data master digunakan sebagai dropdown/select di form aset
- Seed data default saat setup awal

---

### 3.3 Asset Management (Core)

**US-04**: Sebagai admin, saya bisa menambahkan data aset baru secara manual melalui form input.

Acceptance Criteria:

- Form input dengan field berikut:
  - Nama Barang (text, required)
  - Kategori (select dari master, required)
  - Merk (text, optional)
  - Type/Model (text, optional)
  - Serial Number (text, optional)
  - Tahun Barang (number/select, optional)
  - Tahun Pembelian/Sewa (number/select, optional)
  - Sumber Dana (select dari master, optional)
  - Vendor/Penyedia (text, optional)
  - Pengguna (text, optional)
  - Jabatan (text, optional)
  - Lokasi (select dari master, optional)
  - Kondisi (select dari master, required, default: "Baik")
  - Keterangan (textarea, optional)
  - Foto Dokumentasi (file upload, multiple, optional, max 5 foto, max 5MB per foto)
- Kode aset di-generate otomatis: `{KATEGORI_PREFIX}-{TAHUN}-{SEQUENCE_3_DIGIT}` (contoh: `LPT-2025-001`)
- QR token (UUID) di-generate otomatis saat create
- Setelah simpan, tampilkan preview QR Code
- Validasi: serial number unik jika diisi

**US-05**: Sebagai admin, saya bisa menambahkan data aset dengan cara upload foto/gambar dokumen aset, lalu sistem otomatis mengekstrak informasi dan mengisi form.

Acceptance Criteria:

- Tombol "Upload & Extract" di halaman tambah aset
- Accept image (JPG, PNG, WEBP) dan PDF
- Setelah upload, tampilkan loading state "Mengekstrak data..."
- Kirim ke Gemini Flash API via Server Action
- Hasil extraction di-map ke form fields
- Field yang berhasil di-extract terisi otomatis dengan visual indicator (border hijau)
- Field yang null/tidak ditemukan dikosongkan dengan visual indicator (border kuning)
- Admin bisa edit semua field sebelum menyimpan
- Tombol "Simpan" baru aktif setelah review
- Error handling: jika API gagal, tampilkan pesan error dan fallback ke input manual

Gemini Prompt Structure:

```
Ekstrak informasi aset/barang inventaris dari gambar ini ke format JSON.
Jika field tidak ditemukan atau tidak terbaca, isi dengan null.
Respond ONLY with valid JSON, no markdown, no explanation.

{
  "nama_barang": string | null,
  "kategori": string | null,
  "merk": string | null,
  "type_model": string | null,
  "serial_number": string | null,
  "tahun_barang": number | null,
  "tahun_pembelian": number | null,
  "sumber_dana": string | null,
  "vendor": string | null,
  "pengguna": string | null,
  "jabatan": string | null,
  "kondisi": string | null,
  "keterangan": string | null
}
```

**US-06**: Sebagai admin, saya bisa melihat daftar semua aset dengan fitur search, filter, dan pagination.

Acceptance Criteria:

- Tabel daftar aset dengan kolom: No, Kode Aset, Nama, Kategori, Merk, Tahun, Pengguna, Kondisi, Aksi
- Search by: nama barang, kode aset, serial number, pengguna
- Filter by: kategori, kondisi, sumber dana, tahun, lokasi
- Pagination: 10/25/50 per halaman
- Sort by: kode aset, nama, tahun, tanggal input
- Quick action: view detail, edit, delete, download QR

**US-07**: Sebagai admin, saya bisa mengedit data aset yang sudah ada.

Acceptance Criteria:

- Form edit dengan data pre-filled
- Semua field bisa diedit kecuali kode aset
- Update foto: tambah foto baru, hapus foto existing
- Perubahan tercatat di audit log (field apa yang berubah, nilai lama → baru)
- Timestamp `updated_at` otomatis update

**US-08**: Sebagai admin, saya bisa menghapus data aset.

Acceptance Criteria:

- Soft delete (set `deleted_at` timestamp)
- Konfirmasi dialog sebelum hapus
- Aset yang dihapus tidak muncul di daftar default
- QR Code aset yang dihapus menampilkan "Aset tidak ditemukan" saat di-scan
- Admin bisa melihat dan restore aset yang dihapus (trash view)

---

### 3.4 QR Code & Label

**US-09**: Sebagai admin, saya bisa melihat dan mengunduh QR Code untuk setiap aset.

Acceptance Criteria:

- QR Code di-generate on-the-fly (tidak disimpan sebagai file)
- QR berisi URL: `{BASE_URL}/verify/{qr_token}`
- QR bisa diunduh sebagai PNG
- QR ditampilkan di halaman detail aset

**US-10**: Sebagai admin, saya bisa mencetak label QR untuk satu atau beberapa aset sekaligus.

Acceptance Criteria:

- Checkbox di daftar aset untuk select multiple
- Tombol "Cetak Label" setelah select
- Generate PDF dengan layout label:
  - Ukuran label: 6cm x 4cm (landscape)
  - Isi: QR Code, Kode Aset, Nama Barang, Nama Instansi
  - Grid layout: 3 kolom x 4 baris per halaman A4
- Preview PDF sebelum print/download
- Single print juga tersedia dari halaman detail aset

---

### 3.5 Public Verification Page

**US-11**: Sebagai siapa pun (publik), saya bisa scan QR Code pada barang dan langsung melihat detail aset di browser HP.

Acceptance Criteria:

- Route: `/verify/[token]` — public, no auth required
- Halaman mobile-first, responsive
- Tampilkan:
  - Badge/header: "Aset Terverifikasi — [Nama Instansi]"
  - Foto aset (carousel jika multiple)
  - Semua detail: kode aset, nama, kategori, merk, model, serial number, tahun, sumber dana, pengguna, jabatan, lokasi, kondisi, keterangan
  - Tanggal terakhir diupdate
- Jika token tidak ditemukan atau aset dihapus: tampilkan halaman "Aset Tidak Ditemukan"
- Catat scan di `scan_logs` (timestamp, IP, user agent)
- Fast load: gunakan SSR, target < 2 detik di 3G

---

### 3.6 QR Scanner (Web-Based)

**US-12**: Sebagai admin, saya bisa scan QR Code aset langsung dari web application menggunakan kamera HP.

Acceptance Criteria:

- Halaman scanner di dashboard: `/dashboard/scan`
- Aktivasi kamera belakang HP
- Decode QR → redirect ke halaman detail aset di dashboard (bukan halaman publik)
- Fallback: input kode aset manual jika kamera tidak tersedia

---

### 3.7 Import/Export

**US-13**: Sebagai admin, saya bisa mengimport data aset dari file Excel/CSV secara bulk.

Acceptance Criteria:

- Download template Excel dengan kolom yang sesuai
- Upload Excel/CSV file
- Preview data sebelum import (tabel preview)
- Validasi:
  - Required fields terisi
  - Kategori, sumber dana, kondisi cocok dengan master data
  - Duplikat serial number detection
- Summary setelah import: berapa berhasil, berapa gagal, detail error
- Generate kode aset dan QR token otomatis untuk setiap row yang berhasil

**US-14**: Sebagai admin, saya bisa mengexport data aset ke file Excel.

Acceptance Criteria:

- Export semua data atau filtered data (sesuai filter aktif)
- Format Excel (.xlsx) dengan header kolom yang jelas
- Include: kode aset, semua field, tanggal input, tanggal update

---

### 3.8 Dashboard & Statistik

**US-15**: Sebagai admin, saya bisa melihat dashboard overview inventaris aset.

Acceptance Criteria:

- Summary cards: Total Aset, Aset Kondisi Baik, Aset Rusak, Aset Hilang
- Chart: Aset per Kategori (bar/pie chart)
- Chart: Aset per Tahun Pengadaan (bar chart)
- Chart: Aset per Kondisi (pie chart)
- Chart: Aset per Sumber Dana (pie chart)
- Tabel: 10 aset terbaru ditambahkan
- Tabel: 10 scan QR terbaru (recent activity)

---

### 3.9 Audit Trail

**US-16**: Sebagai admin, saya bisa melihat riwayat perubahan data aset.

Acceptance Criteria:

- Setiap create, update, delete aset tercatat otomatis
- Log berisi: siapa, kapan, aksi apa, field yang berubah (old value → new value)
- Halaman audit log dengan filter by: aset, user, aksi, tanggal
- Log tidak bisa diedit atau dihapus

---

### 3.10 Asset Mutation/Transfer

**US-17**: Sebagai admin, saya bisa mencatat mutasi/pemindahan aset dari satu pengguna ke pengguna lain.

Acceptance Criteria:

- Form mutasi: pilih aset, from (auto-fill pengguna saat ini), to (input pengguna baru), tanggal mutasi, catatan
- Setelah mutasi, field `pengguna` dan `jabatan` di aset otomatis terupdate
- History mutasi tercatat dan bisa dilihat per aset
- Timeline view di halaman detail aset

---

## 4. Database Schema

### 4.1 Enum Types

```
enum UserRole {
  ADMIN
  VIEWER
}

enum AssetConditionSeverity {
  GOOD        // Baik
  LIGHT_DAMAGE // Rusak Ringan
  HEAVY_DAMAGE // Rusak Berat
  LOST        // Hilang
}
```

### 4.2 Tables

**users**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK, default uuid |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| role | UserRole | NOT NULL, default ADMIN |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |
| deleted_at | TIMESTAMP | nullable (soft delete) |

**categories**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| code_prefix | VARCHAR(5) | UNIQUE, NOT NULL |
| description | TEXT | nullable |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |

Seed data: Elektronik (ELK), Furniture (FRN), Dokumen (DOK), Peralatan Kantor (PRK), Jaringan (JRG)

**locations**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| building | VARCHAR(100) | nullable |
| floor | VARCHAR(20) | nullable |
| description | TEXT | nullable |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |

**fund_sources**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |

Seed data: BOP, PLN, APBN, APBD, Hibah, Lainnya

**conditions**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| severity | AssetConditionSeverity | NOT NULL |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |

Seed data: Baik (GOOD), Rusak Ringan (LIGHT_DAMAGE), Rusak Berat (HEAVY_DAMAGE), Hilang (LOST)

**assets**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| asset_code | VARCHAR(20) | UNIQUE, NOT NULL |
| qr_token | UUID | UNIQUE, NOT NULL, default uuid |
| name | VARCHAR(255) | NOT NULL |
| category_id | UUID | FK → categories.id, NOT NULL |
| brand | VARCHAR(100) | nullable |
| model | VARCHAR(100) | nullable |
| serial_number | VARCHAR(100) | nullable, UNIQUE jika diisi |
| year_acquired | INTEGER | nullable |
| year_purchased | INTEGER | nullable |
| fund_source_id | UUID | FK → fund_sources.id, nullable |
| vendor | VARCHAR(200) | nullable |
| user_name | VARCHAR(100) | nullable |
| user_position | VARCHAR(100) | nullable |
| location_id | UUID | FK → locations.id, nullable |
| condition_id | UUID | FK → conditions.id, NOT NULL |
| description | TEXT | nullable |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto update |
| deleted_at | TIMESTAMP | nullable (soft delete) |

Index: asset_code, qr_token, category_id, condition_id, serial_number, deleted_at

**asset_photos**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| asset_id | UUID | FK → assets.id, ON DELETE CASCADE |
| file_path | VARCHAR(500) | NOT NULL |
| file_name | VARCHAR(255) | NOT NULL |
| file_size | INTEGER | NOT NULL (bytes) |
| is_primary | BOOLEAN | default false |
| uploaded_at | TIMESTAMP | default now() |

**asset_mutations**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| asset_id | UUID | FK → assets.id |
| from_user | VARCHAR(100) | nullable |
| from_position | VARCHAR(100) | nullable |
| to_user | VARCHAR(100) | NOT NULL |
| to_position | VARCHAR(100) | nullable |
| mutation_date | DATE | NOT NULL |
| notes | TEXT | nullable |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | default now() |

**audit_logs**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| entity_type | VARCHAR(50) | NOT NULL (e.g., "asset", "user") |
| entity_id | UUID | NOT NULL |
| action | VARCHAR(20) | NOT NULL (CREATE, UPDATE, DELETE, RESTORE) |
| changed_by | UUID | FK → users.id |
| changes | JSONB | nullable (old/new values) |
| created_at | TIMESTAMP | default now() |

Index: entity_type + entity_id, changed_by, created_at

**scan_logs**

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | PK |
| asset_id | UUID | FK → assets.id |
| scanned_at | TIMESTAMP | default now() |
| ip_address | VARCHAR(45) | nullable |
| user_agent | TEXT | nullable |

Index: asset_id, scanned_at

### 4.3 Auto-Generate Asset Code Logic

```
Fungsi: generateAssetCode(categoryId)
1. Ambil code_prefix dari kategori (contoh: "ELK")
2. Ambil tahun sekarang (contoh: 2025)
3. Hitung jumlah aset dengan prefix dan tahun yang sama
4. Sequence = count + 1, padded 3 digit
5. Return: "{PREFIX}-{TAHUN}-{SEQUENCE}" → "ELK-2025-001"
```

---

## 5. Page Structure

```
/ ................................. Landing/login redirect
/login ........................... Login page
/dashboard ....................... Dashboard overview (US-15)
/dashboard/assets ................ Daftar aset (US-06)
/dashboard/assets/new ............ Tambah aset — manual & AI extract (US-04, US-05)
/dashboard/assets/[id] ........... Detail aset (view)
/dashboard/assets/[id]/edit ...... Edit aset (US-07)
/dashboard/assets/import ......... Import Excel (US-13)
/dashboard/assets/export ......... Export Excel (US-14)
/dashboard/assets/trash .......... Aset terhapus (US-08)
/dashboard/labels ................ Cetak label QR (US-10)
/dashboard/scan .................. QR Scanner web (US-12)
/dashboard/mutations ............. Riwayat mutasi (US-17)
/dashboard/master/categories ..... CRUD kategori (US-03)
/dashboard/master/locations ...... CRUD lokasi (US-03)
/dashboard/master/fund-sources ... CRUD sumber dana (US-03)
/dashboard/master/conditions ..... CRUD kondisi (US-03)
/dashboard/users ................. Manajemen user (US-02)
/dashboard/audit-log ............. Audit trail (US-16)
/dashboard/settings .............. Pengaturan instansi (nama, logo)
/verify/[token] .................. Halaman publik verifikasi aset (US-11)
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Halaman publik `/verify/[token]` harus load < 2 detik di koneksi 3G
- Daftar aset dengan 1000+ record harus tetap responsif (server-side pagination)
- AI extraction response time < 10 detik

### 6.2 Security

- Password di-hash menggunakan bcrypt
- Session management via Auth.js
- Rate limiting pada endpoint publik `/verify/[token]` dan AI extraction
- File upload validation: tipe file, ukuran, sanitasi nama file
- SQL injection prevention via Prisma (parameterized queries)
- XSS prevention via React default escaping

### 6.3 Data Integrity

- Soft delete untuk semua entitas utama (assets, users)
- Audit trail untuk semua operasi mutasi data
- Database backup strategy (di production)
- Unique constraints pada kode aset, serial number, QR token

### 6.4 Accessibility & UX

- Responsive design: desktop (admin dashboard) dan mobile (scan result)
- Bahasa Indonesia untuk semua UI text
- Loading states untuk semua async operations
- Toast notifications untuk success/error feedback
- Konfirmasi dialog untuk destructive actions

### 6.5 Migration Strategy

- Prisma Migrate untuk database versioning
- Seed script untuk data master default dan admin account
- Environment-based config: Supabase (MVP) → Self-hosted PostgreSQL (production)
- Docker Compose setup untuk production deployment

---

## 7. Future Enhancements (Out of MVP Scope)

- Reminder maintenance berkala per aset
- Multi-tenant support (beberapa instansi dalam satu sistem)
- Reporting PDF (laporan inventaris per periode)
- Depreciation/penyusutan aset
- Integration dengan sistem keuangan
- Mobile app native (React Native)
- Barcode support (selain QR Code)
- Notifikasi email untuk mutasi aset
