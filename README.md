# CloudKu - Web Hosting Control Panel

## 🚀 Backend Stack

Project ini menggunakan **Golang** sebagai backend server.

### Struktur Project

```
cloudku/
├── 📁 go-server/        ← Backend Golang (AKTIF)
│   ├── main.go
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   └── ...
│
├── 📁 server/           ← Backend TypeScript (DEPRECATED)
│
├── 📁 components/       ← React Components
├── 📁 pages/            ← React Pages
├── 📁 utils/            ← Frontend API utilities
└── ...
```

## 🛠️ Cara Menjalankan

### 1. Install Dependencies (Frontend)

```bash
npm install
```

### 2. Setup Database

Pastikan PostgreSQL berjalan di port 5433 dengan database `hostmodern`.

### 3. Setup MySQL Shared Hosting (Docker)

CloudKu menggunakan MySQL + phpMyAdmin dalam Docker untuk layanan shared hosting.

```bash
# 1. Setup environment
cp .env.mysql.example .env.mysql
# Edit .env.mysql dan set password root yang kuat

# 2. Start Services
docker-compose -f docker-compose.mysql.yml up -d

# 3. Verify
# MySQL: Port 3306
# phpMyAdmin: Port 8080 (http://localhost:8080)
```

> ℹ️ Lihat file `MYSQL_SETUP.md` untuk panduan lengkap deployment dan keamanan.

### 3. Jalankan Backend Golang

```bash
cd go-server
go run main.go
```

Server akan berjalan di: `http://localhost:3001`

### 4. Jalankan Frontend

```bash
# Di folder root project
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## 🔧 Konfigurasi

Semua konfigurasi ada di file `.env.local`:

```env
# Backend API URL - Golang Server
VITE_API_URL=http://localhost:3001

# Backend Server Configuration (Golang)
PORT=3001
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=hostmodern
DB_USER=postgres
DB_PASSWORD=1234
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register dengan email/password
- `POST /api/auth/login` - Login dengan email/password
- `POST /api/auth/google` - Login dengan Google OAuth
- `POST /api/auth/github` - Login dengan GitHub OAuth
- `GET /api/auth/me` - Get current user

### File Manager

- `GET /api/files/list` - List files
- `POST /api/files/upload` - Upload file
- `GET /api/files/download` - Download file
- `DELETE /api/files/delete` - Delete file/folder
- `POST /api/files/folder` - Create folder
- `GET /api/files/read` - Read file content
- `PUT /api/files/update` - Update file content
- `PUT /api/files/rename` - Rename file/folder
- `POST /api/files/copy` - Copy files
- `POST /api/files/move` - Move files
- `POST /api/files/extract` - Extract ZIP
- `POST /api/files/compress` - Compress to ZIP
- `POST /api/files/git-clone` - Clone Git repository

### Domains

- `GET /api/domains` - List domains
- `POST /api/domains` - Create domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain
- `POST /api/domains/:id/verify` - Verify domain DNS

### DNS

- `GET /api/domains/:id/dns` - Get DNS records
- `POST /api/domains/:id/dns` - Create DNS record
- `DELETE /api/domains/:id/dns/:recordId` - Delete DNS record

### SSL

- `POST /api/ssl/:domainId/enable` - Enable SSL
- `POST /api/ssl/:domainId/disable` - Disable SSL
- `POST /api/ssl/:domainId/renew` - Renew SSL

### Databases

- `GET /api/databases` - List databases
- `POST /api/databases` - Create database
- `DELETE /api/databases/:id` - Delete database

## 📦 Tech Stack

### Backend (Golang)

- Gin Framework
- PostgreSQL (pgx)
- JWT Authentication
- bcrypt Password Hashing

### Frontend (React)

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

## 📝 License

MIT License

---

## 🔒 Security Audit Report (2026-01-10)

Laporan ini berisi tinjauan keamanan kode aplikasi CloudKu. **Dilarang keras menyebarkan file `.env` atau backup database yang berisi data asli.**

### 🛑 RISIKO KRITIKAL (Segera Perbaiki)

1.  **Eksposur Data Sensitif di Git**:
    - **Temuan**: File `.env`, `.env.local`, dan `start.bat` berisi password database dan Client Secret (Google/GitHub) tetapi **TIDAK** ada di dalam `.gitignore`.
    - **Risiko**: Jika project di-push ke GitHub, siapapun bisa mengakses database dan mengambil alih OAuth aplikasi Anda.
    - **Saran**: Segera tambahkan `.env`, `.env.local`, `.env.example`, dan `*.bat` ke `.gitignore`. Ganti (rotate) semua secret yang sudah terlanjur tertulis.

2.  **Command Injection pada Fitur Git Clone**:
    - **Temuan**: Fungsi `GitClone` di `go-server/controllers/file_controller.go` menjalankan perintah shell `git clone` langsung menggunakan input dari user.
    - **Risiko**: Hacker bisa menyisipkan command tambahan (flag git) untuk menghapus file atau menjalankan aplikasi berbahaya di server.
    - **Saran**: Lakukan validasi ketat pada URL (pastikan mulai dengan `https://`) dan bersihkan karakter berbahaya sebelum dijalankan.

### ⚠️ RISIKO TINGGI

3.  **Data User Asli di Backup Database**:
    - **Temuan**: File `database/backup_full.sql` berisi email asli dan hash password user.
    - **Risiko**: Kebocoran data privasi user jika file ini tersebar.
    - **Saran**: Gunakan data dummy untuk keperluan testing/backup yang masuk ke repository.

### 📝 TEMUAN LAINNYA

4.  **JWT Secret Default**:
    - **Temuan**: `go-server/config/config.go` memiliki default secret key yang lemah jika `.env` tidak terbaca.
    - **Saran**: Paksa aplikasi untuk _crash_ jika `JWT_SECRET` tidak diatur di environment produksi.

5.  **Path Traversal**:
    - **Catatan**: Proteksi pada `FileController` sudah cukup baik dengan menggunakan `filepath.Clean` dan pengecekan prefix, namun tetap harus diawasi pada fitur `extract` ZIP.

### ✅ HAL POSITIF

- Password sudah di-hash dengan `bcrypt`.
- Query database mayoritas sudah menggunakan _parameterized queries_ (aman dari SQL Injection).
- Verifikasi Google OAuth menggunakan library resmi.

---

## 🛠️ Rencana Perbaikan Teknis (Untuk Tim Developer)

Berikut adalah langkah konkrit untuk memperbaiki celah **Command Injection** pada fitur Git Clone di `go-server/controllers/file_controller.go`:

### Masalah:

Kode saat ini: `exec.Command("git", "clone", req.URL, destPath)`
Jika `req.URL` berisi flag seperti `--upload-pack`, hacker bisa menjalankan script berbahaya.

### Solusi yang Direkomendasikan:

1.  **Gunakan Pemisah Argumen `--`**:
    Tambahkan `--` sebelum variabel URL untuk memastikan Git menganggap input tersebut sebagai alamat, bukan perintah.

    ```go
    // Ubah dari:
    cmd := exec.Command("git", "clone", req.URL, destPath)
    // Menjadi:
    cmd := exec.Command("git", "clone", "--", req.URL, destPath)
    ```

2.  **Validasi Protokol URL**:
    Pastikan URL selalu diawali dengan `https://` atau `http://` untuk mencegah penggunaan protokol `file://` atau `ssh://` yang berbahaya.

    ```go
    if !strings.HasPrefix(req.URL, "https://") && !strings.HasPrefix(req.URL, "http://") {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Hanya diizinkan protokol HTTP/HTTPS"})
        return
    }
    ```

3.  **Sanitasi Input**:
    Gunakan library `url.Parse` untuk memvalidasi struktur URL sebelum diproses.
