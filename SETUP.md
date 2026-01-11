# 🚀 CloudKu - Setup Guide

> **CloudKu** adalah panel hosting modern dengan React + Golang backend. Panduan ini akan membantu Anda menjalankan project dari awal hingga siap digunakan.

---

## 📑 Daftar Isi

1. [Quick Start (TL;DR)](#-quick-start-tldr)
2. [Persyaratan Sistem](#-persyaratan-sistem)
3. [Instalasi Software](#-instalasi-software)
4. [Setup Database PostgreSQL](#️-setup-database-postgresql)
5. [Konfigurasi Environment](#️-konfigurasi-environment)
6. [Menjalankan Project](#-menjalankan-project)
7. [API Endpoints](#-api-endpoints)
8. [Troubleshooting](#-troubleshooting)
9. [Build untuk Production](#-build-untuk-production)
10. [Keamanan](#-keamanan)

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Clone repository
git clone <repository-url>
cd cloudku

# 2. Install frontend dependencies
npm install

# 3. Setup database (buat database hostmodern di PostgreSQL)
psql -U postgres -c "CREATE DATABASE hostmodern;"
psql -U postgres -d hostmodern -f database/backup_full.sql

# 4. Copy dan edit environment file
cp .env.example .env.local
# Edit .env.local sesuai konfigurasi database Anda

# 5. Jalankan backend (Terminal 1)
cd go-server
go mod tidy
go run main.go

# 6. Jalankan frontend (Terminal 2, di folder root)
npm run dev

# 7. Buka browser: http://localhost:5173
```

---

## 📋 Persyaratan Sistem

### Software yang Diperlukan

| Software        | Versi Minimum | Download                                                        |
| --------------- | ------------- | --------------------------------------------------------------- |
| **Node.js**     | v18.0+        | [nodejs.org](https://nodejs.org/)                               |
| **Go (Golang)** | v1.21+        | [go.dev/dl](https://go.dev/dl/)                                 |
| **PostgreSQL**  | v14+          | [postgresql.org/download](https://www.postgresql.org/download/) |
| **Git**         | v2.30+        | [git-scm.com](https://git-scm.com/)                             |

### Cek Instalasi

Jalankan perintah berikut untuk memastikan semua software terinstall:

**Windows (PowerShell):**

```powershell
node --version     # Output: v18.x.x atau lebih tinggi
go version         # Output: go version go1.21.x atau lebih tinggi
psql --version     # Output: psql (PostgreSQL) 14.x atau lebih tinggi
git --version      # Output: git version 2.x.x
```

**Linux/MacOS (Terminal):**

```bash
node --version && go version && psql --version && git --version
```

---

## 🔧 Instalasi Software

### Windows

<details>
<summary><b>📥 Klik untuk melihat panduan instalasi Windows</b></summary>

#### 1. Node.js

1. Download dari [nodejs.org](https://nodejs.org/)
2. Pilih versi **LTS** (20.x atau lebih tinggi)
3. Jalankan installer dan ikuti wizard
4. Restart terminal setelah instalasi

#### 2. Go (Golang)

1. Download dari [go.dev/dl](https://go.dev/dl/)
2. Pilih file `.msi` untuk Windows
3. Jalankan installer
4. Restart terminal dan verifikasi dengan `go version`

#### 3. PostgreSQL

1. Download dari [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Pilih versi **14** atau lebih tinggi
3. Saat instalasi, **ingat password** yang Anda set untuk user `postgres`
4. Centang opsi untuk menambahkan ke PATH
5. Port default: `5432`

#### 4. Git

1. Download dari [git-scm.com](https://git-scm.com/)
2. Jalankan installer dengan opsi default

</details>

### Linux (Ubuntu/Debian)

<details>
<summary><b>📥 Klik untuk melihat panduan instalasi Linux</b></summary>

```bash
# Update package list
sudo apt update

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Go
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Git
sudo apt install -y git
```

</details>

### MacOS

<details>
<summary><b>📥 Klik untuk melihat panduan instalasi MacOS</b></summary>

```bash
# Install Homebrew (jika belum)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install semua dependencies
brew install node go postgresql@14 git

# Start PostgreSQL
brew services start postgresql@14
```

</details>

---

## 🗄️ Setup Database PostgreSQL

### Step 1: Start PostgreSQL Service

**Windows:**

```powershell
# Buka Services (services.msc) dan start "postgresql-x64-14"
# Atau via PowerShell (sebagai Administrator):
net start postgresql-x64-14
```

**Linux:**

```bash
sudo systemctl start postgresql
sudo systemctl status postgresql  # Cek status
```

**MacOS:**

```bash
brew services start postgresql@14
```

### Step 2: Buat Database

**Opsi A - Menggunakan psql:**

```bash
# Masuk ke PostgreSQL
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE hostmodern;
\l  -- Lihat daftar database
\q  -- Keluar
```

**Opsi B - Menggunakan pgAdmin:**

1. Buka pgAdmin
2. Klik kanan pada "Databases"
3. Pilih "Create" > "Database"
4. Nama: `hostmodern`
5. Klik "Save"

### Step 3: Import Schema

Ada 2 opsi file SQL yang bisa digunakan:

**Opsi 1 - Full backup (termasuk sample data):**

```bash
psql -U postgres -d hostmodern -f database/backup_full.sql
```

**Opsi 2 - Schema saja (database kosong):**

```bash
psql -U postgres -d hostmodern -f database/schema.sql
```

### Step 4: Verifikasi Database

```bash
psql -U postgres -d hostmodern

# Di dalam psql:
\dt  -- Lihat semua tabel
SELECT COUNT(*) FROM users;  -- Cek tabel users
\q
```

---

## ⚙️ Konfigurasi Environment

### Step 1: Copy File Environment

```bash
cp .env.example .env.local
```

### Step 2: Edit `.env.local`

Buka file `.env.local` dan sesuaikan konfigurasi berikut:

```env
# ===============================================
# FRONTEND CONFIGURATION
# ===============================================

# Mode simulasi (true = offline demo, false = real API)
VITE_USE_SIMULATION=false

# Backend API URL
VITE_API_URL=http://localhost:3001

# OAuth Configuration (opsional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id

# ===============================================
# DATABASE CONFIGURATION
# ===============================================

DB_HOST=localhost
DB_PORT=5432           # Default PostgreSQL port
DB_NAME=hostmodern
DB_USER=postgres
DB_PASSWORD=your-password-here   # ⚠️ WAJIB DIUBAH
DB_POOL_MAX=20

# ===============================================
# BACKEND SERVER CONFIGURATION
# ===============================================

PORT=3001
FRONTEND_URL=http://localhost:5173
SERVER_IP=127.0.0.1

# ===============================================
# JWT CONFIGURATION
# ===============================================

# Generate secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-here   # ⚠️ WAJIB DIUBAH
JWT_EXPIRES_IN=7d

# ===============================================
# GITHUB OAUTH (opsional)
# ===============================================

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### ⚠️ Catatan Penting

1. **DB_PASSWORD** - Sesuaikan dengan password PostgreSQL Anda
2. **DB_PORT** - Default `5432`, ubah jika menggunakan port berbeda
3. **JWT_SECRET** - Generate secret baru untuk production

---

## 🚀 Menjalankan Project

### Metode 1: Dua Terminal (Recommended)

#### Terminal 1 - Golang Backend

```bash
cd go-server

# Install Go dependencies (pertama kali saja)
go mod tidy

# Jalankan server
go run main.go
```

**Output yang diharapkan:**

```
=================================================================
🚀 CloudKu API Server (Golang) - 100% Complete
=================================================================
📡 Server running on: http://localhost:3001
🗄️  Database: Connected to PostgreSQL
🌍 Environment: development
🔗 CORS enabled for: http://localhost:5173
=================================================================

📋 Available API Endpoints:
...
```

#### Terminal 2 - React Frontend

```bash
# Di folder root project (cloudku)
npm run dev
```

**Output yang diharapkan:**

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://xxx.xxx.xxx.xxx:5173/
```

### Metode 2: NPM Script

```bash
# Jalankan Go backend dengan npm
npm run dev:go

# Di terminal lain, jalankan frontend
npm run dev
```

### ✅ Verifikasi

| URL                               | Deskripsi              | Expected Result         |
| --------------------------------- | ---------------------- | ----------------------- |
| http://localhost:5173             | Frontend React         | Halaman login/landing   |
| http://localhost:3001/health      | Backend Health Check   | `{"status": "ok"}`      |
| http://localhost:3001/api/auth/me | Test API (perlu token) | `{"error": "..."}` (ok) |

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint             | Deskripsi                   | Auth Required |
| ------ | -------------------- | --------------------------- | ------------- |
| POST   | `/api/auth/register` | Register user baru          | ❌            |
| POST   | `/api/auth/login`    | Login dengan email/password | ❌            |
| POST   | `/api/auth/google`   | Login dengan Google OAuth   | ❌            |
| POST   | `/api/auth/github`   | Login dengan GitHub OAuth   | ❌            |
| GET    | `/api/auth/me`       | Get current user profile    | ✅            |

### 📁 File Manager

| Method | Endpoint                 | Deskripsi           | Auth Required |
| ------ | ------------------------ | ------------------- | ------------- |
| GET    | `/api/files/list`        | List files          | ✅            |
| GET    | `/api/files/stats`       | Get storage stats   | ✅            |
| POST   | `/api/files/upload`      | Upload file         | ✅            |
| GET    | `/api/files/download`    | Download file       | ✅            |
| DELETE | `/api/files/delete`      | Delete file/folder  | ✅            |
| POST   | `/api/files/folder`      | Create folder       | ✅            |
| GET    | `/api/files/read`        | Read file content   | ✅            |
| PUT    | `/api/files/update`      | Update file content | ✅            |
| PUT    | `/api/files/rename`      | Rename file/folder  | ✅            |
| POST   | `/api/files/copy`        | Copy files          | ✅            |
| POST   | `/api/files/move`        | Move files          | ✅            |
| POST   | `/api/files/extract`     | Extract ZIP archive | ✅            |
| POST   | `/api/files/compress`    | Compress to ZIP     | ✅            |
| POST   | `/api/files/git-clone`   | Clone Git repo      | ✅            |
| PUT    | `/api/files/permissions` | Change permissions  | ✅            |

### 🌐 Domains

| Method | Endpoint                  | Deskripsi         | Auth Required |
| ------ | ------------------------- | ----------------- | ------------- |
| GET    | `/api/domains`            | Get all domains   | ✅            |
| GET    | `/api/domains/:id`        | Get domain detail | ✅            |
| POST   | `/api/domains`            | Create domain     | ✅            |
| PUT    | `/api/domains/:id`        | Update domain     | ✅            |
| DELETE | `/api/domains/:id`        | Delete domain     | ✅            |
| POST   | `/api/domains/:id/verify` | Verify domain DNS | ✅            |

### 📝 DNS Records

| Method | Endpoint                         | Deskripsi         | Auth Required |
| ------ | -------------------------------- | ----------------- | ------------- |
| GET    | `/api/domains/:id/dns`           | Get DNS records   | ✅            |
| POST   | `/api/domains/:id/dns`           | Create DNS record | ✅            |
| DELETE | `/api/domains/:id/dns/:recordId` | Delete DNS record | ✅            |
| GET    | `/api/dns/stats`                 | DNS statistics    | ✅            |
| GET    | `/api/dns/:domainId/export`      | Export zone file  | ✅            |

### 🔒 SSL Certificates

| Method | Endpoint                     | Deskripsi             | Auth Required |
| ------ | ---------------------------- | --------------------- | ------------- |
| GET    | `/api/ssl/stats`             | SSL statistics        | ✅            |
| GET    | `/api/ssl/expiring`          | Expiring certificates | ✅            |
| POST   | `/api/ssl/:domainId/enable`  | Enable SSL            | ✅            |
| POST   | `/api/ssl/:domainId/disable` | Disable SSL           | ✅            |
| POST   | `/api/ssl/:domainId/renew`   | Renew SSL certificate | ✅            |
| GET    | `/api/ssl/:domainId/info`    | Get SSL info          | ✅            |

### 🗄️ Databases

| Method | Endpoint                      | Deskripsi         | Auth Required |
| ------ | ----------------------------- | ----------------- | ------------- |
| GET    | `/api/databases`              | Get all databases | ✅            |
| GET    | `/api/databases/stats`        | Database stats    | ✅            |
| POST   | `/api/databases`              | Create database   | ✅            |
| DELETE | `/api/databases/:id`          | Delete database   | ✅            |
| PUT    | `/api/databases/:id/password` | Change password   | ✅            |

---

## 🐛 Troubleshooting

### ❌ Error: Database connection failed

**Penyebab:** PostgreSQL tidak berjalan atau konfigurasi salah.

**Solusi:**

<details>
<summary><b>Windows</b></summary>

```powershell
# Pastikan service running
net start postgresql-x64-14

# Atau restart service
net stop postgresql-x64-14
net start postgresql-x64-14

# Cek apakah port 5432 aktif
netstat -an | findstr 5432
```

</details>

<details>
<summary><b>Linux</b></summary>

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Cek status
sudo systemctl status postgresql

# Lihat logs
sudo journalctl -u postgresql
```

</details>

<details>
<summary><b>MacOS</b></summary>

```bash
brew services start postgresql@14
brew services list
```

</details>

### ❌ Error: Port already in use

**Port 3001 (Backend):**

```powershell
# Windows - Cari process yang menggunakan port
netstat -ano | findstr :3001

# Kill process (ganti <PID> dengan ID process)
taskkill /PID <PID> /F
```

```bash
# Linux/MacOS
lsof -i :3001
kill -9 <PID>
```

**Port 5173 (Frontend):**

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### ❌ Error: Module not found (Go)

```bash
cd go-server

# Clean dan re-download dependencies
go clean -modcache
go mod tidy

# Verifikasi
go mod verify
```

### ❌ Error: npm packages not found

```bash
# Di folder root project
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: .env file not loaded / No .env file found

**Penyebab:** File `.env` memiliki BOM (Byte Order Mark) dari encoding Windows, atau path tidak benar.

**Solusi untuk Windows:**

```powershell
# Buat file .env baru tanpa BOM di folder go-server
cd go-server

$content = @"
DB_HOST=localhost
DB_PORT=5433
DB_NAME=hostmodern
DB_USER=postgres
DB_PASSWORD=your-password
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
"@

[System.IO.File]::WriteAllText("$PWD\.env", $content, [System.Text.UTF8Encoding]::new($false))
```

**Alternatif: Gunakan start.bat:**

```batch
# go-server/start.bat sudah tersedia
cd go-server
start.bat
```

### ❌ Error: CORS blocked

**Penyebab:** Frontend URL tidak sesuai di backend.

**Solusi:** Pastikan `FRONTEND_URL` di `.env.local` sesuai:

```env
FRONTEND_URL=http://localhost:5173
```

### ❌ Error: Invalid JWT token

**Penyebab:** JWT_SECRET berbeda atau expired.

**Solusi:**

1. Clear browser cookies/localStorage
2. Re-login ke aplikasi
3. Pastikan `JWT_SECRET` sama di semua environment

### ❌ Error: psql command not found

**Windows:** Tambahkan PostgreSQL ke PATH:

1. Buka System Properties > Advanced > Environment Variables
2. Edit `Path` di System Variables
3. Tambahkan: `C:\Program Files\PostgreSQL\14\bin`
4. Restart terminal

**Linux/MacOS:**

```bash
echo 'export PATH=$PATH:/usr/lib/postgresql/14/bin' >> ~/.bashrc
source ~/.bashrc
```

---

## 📦 Build untuk Production

### Frontend Build

```bash
# Di folder root
npm run build

# Output ada di folder 'dist/'
# Bisa di-serve dengan nginx atau static server lainnya
```

### Backend Build

```bash
cd go-server

# Windows
go build -o cloudku-server.exe

# Linux/MacOS
go build -o cloudku-server

# Jalankan binary
./cloudku-server  # atau cloudku-server.exe di Windows
```

### Docker (Opsional)

```dockerfile
# Dockerfile untuk backend
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go-server/ .
RUN go mod tidy && go build -o cloudku-server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/cloudku-server .
EXPOSE 3001
CMD ["./cloudku-server"]
```

---

## 🔐 Keamanan

### Checklist sebelum Production

- [ ] **JWT_SECRET** - Generate secret baru yang kuat (min. 64 karakter)
- [ ] **DB_PASSWORD** - Gunakan password yang kuat
- [ ] **CORS** - Batasi origin hanya ke domain production
- [ ] **HTTPS** - Setup SSL certificate
- [ ] **Firewall** - Blok akses langsung ke database port
- [ ] **Backup** - Setup automated database backup
- [ ] **Logging** - Setup centralized logging
- [ ] **Rate Limiting** - Implementasi di production

### Generate Strong Secrets

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Database Password
openssl rand -base64 32
```

---

## 📁 Struktur Project

```
cloudku/
├── 📁 go-server/            # Golang Backend
│   ├── main.go              # Entry point
│   ├── go.mod               # Go modules
│   ├── config/              # Configuration
│   ├── controllers/         # API handlers
│   │   ├── auth_controller.go
│   │   ├── file_controller.go
│   │   ├── domain_controller.go
│   │   ├── dns_controller.go
│   │   ├── ssl_controller.go
│   │   └── database_controller.go
│   ├── database/            # Database connection
│   ├── middleware/          # Auth, CORS, Logger
│   ├── models/              # Data models
│   ├── routes/              # API routing
│   └── utils/               # Helper functions
│
├── 📁 components/           # React Components
├── 📁 pages/                # React Pages
├── 📁 utils/                # Frontend utilities
├── 📁 database/             # SQL schema files
│   ├── schema.sql           # Clean schema
│   └── backup_full.sql      # Full backup with data
│
├── App.tsx                  # Main React component
├── index.tsx                # React entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── package.json             # NPM dependencies
├── .env.local               # Environment config
└── .env.example             # Example env file
```

---

## ❓ FAQ

<details>
<summary><b>Q: Bagaimana mengubah port backend/frontend?</b></summary>

**Backend:** Edit `PORT` di `.env.local`

```env
PORT=3002
VITE_API_URL=http://localhost:3002
```

**Frontend:** Edit `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

</details>

<details>
<summary><b>Q: Bagaimana cara menambahkan OAuth Google/GitHub?</b></summary>

1. Google: [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
2. GitHub: [github.com/settings/developers](https://github.com/settings/developers)
3. Copy Client ID dan Secret ke `.env.local`
</details>

<details>
<summary><b>Q: Database tidak terkoneksi, apa yang harus dicek?</b></summary>

1. PostgreSQL service berjalan?
2. Port di `.env.local` sesuai? (default: 5432)
3. Password benar?
4. Database `hostmodern` sudah dibuat?
5. Firewall tidak memblok port?
</details>

<details>
<summary><b>Q: Bagaimana reset semua data?</b></summary>

```bash
# Drop dan recreate database
psql -U postgres -c "DROP DATABASE hostmodern;"
psql -U postgres -c "CREATE DATABASE hostmodern;"
psql -U postgres -d hostmodern -f database/schema.sql
```

</details>

---

## 📞 Support

Jika ada masalah:

1. 📋 Cek log di terminal backend
2. 🔍 Buka Console browser (F12)
3. 🌐 Cek Network tab untuk API errors
4. 📖 Baca error message dengan teliti

---

## 📜 Changelog

| Versi | Tanggal    | Perubahan                             |
| ----- | ---------- | ------------------------------------- |
| 1.0   | 2026-01-07 | Initial release dengan Golang backend |

---

<div align="center">

**🎉 Happy Coding!**

Made with ❤️ by CloudKu Team

</div>
