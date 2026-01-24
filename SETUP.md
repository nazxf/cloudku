# ☁️ CloudKu - Setup Guide

Panduan lengkap instalasi dan konfigurasi CloudKu (HostModern) dari awal hingga berjalan.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [1. Database Setup (PostgreSQL)](#1-database-setup-postgresql)
- [2. Shared Hosting Setup (MySQL Docker)](#2-shared-hosting-setup-mysql-docker)
- [3. Backend Setup (Go)](#3-backend-setup-go)
- [4. Frontend Setup (React/Vite)](#4-frontend-setup-reactvite)
- [5. Menjalankan Aplikasi](#5-menjalankan-aplikasi)
- [Troubleshooting](#troubleshooting)

---

## 🛠 Prerequisites

Pastikan software berikut sudah terinstall di sistem Anda:

1.  **Node.js** (v18+) atau **Bun** (v1.0+) - _Recommended: Bun_
2.  **Go** (v1.21+)
3.  **PostgreSQL** (v14+) - Database utama aplikasi
4.  **Docker** & **Docker Compose** - Untuk container user database (MySQL)
5.  **Git**

---

## 🏗️ Step-by-Step Installation

### 1. Database Setup (PostgreSQL)

Database ini digunakan untuk menyimpan data user, domain, billing, dan konfigurasi CloudKu.

1.  Pastikan service PostgreSQL berjalan.
2.  Buat database baru bernama `hostmodern`.
3.  Import schema database dari file `database/schema.sql`.

**Command (menggunakan PSQL):**

```bash
# Login ke postgres
psql -U postgres

# Create Database
CREATE DATABASE hostmodern;

# Exit
\q

# Import Schema
psql -U postgres -d hostmodern -f database/schema.sql
```

**Konfigurasi `.env`:**
Pastikan file `.env` di root project sesuai dengan kredensial PostgreSQL Anda.

```env
DB_HOST=localhost
DB_PORT=5433         # Default biasanya 5432, sesuaikan dengan instalasi Anda
DB_NAME=hostmodern
DB_USER=postgres
DB_PASSWORD=your_password
```

---

### 2. Shared Hosting Setup (MySQL Docker)

Bagian ini menyiapkan environment MySQL yang terisolasi untuk database milik user (control panel feature).

1.  **Setup Environment Variables:**
    Copy file `.env.mysql.example` ke `.env.mysql`.

    ```bash
    cp .env.mysql.example .env.mysql
    ```

    Edit `.env.mysql` dan isi password root yang aman.

    > ⚠️ **PENTING:** Password di sini harus SAMA dengan `MYSQL_ADMIN_PASSWORD` di `go-server/.env`.

2.  **Jalankan Container:**

    ```bash
    docker-compose -f docker-compose.mysql.yml up -d
    ```

3.  **Verifikasi:**
    Pastikan container `cloudku-mysql` dan `cloudku-phpmyadmin` berjalan (`running` dan `healthy`).

    ```bash
    docker ps
    ```

---

### 3. Backend Setup (Go)

Backend server menangani API logic, autentikasi, dan manajemen Docker/Database.

1.  Masuk ke direktori `go-server`:

    ```bash
    cd go-server
    ```

2.  **Setup Environment Variables:**
    Copy `.env.example` ke `.env` (jika belum ada) atau edit `.env` yang sudah ada.

    ```bash
    # Isi konfigurasi database dan API keys (Google/Github OAuth jika perlu)
    # Pastikan MYSQL_ADMIN_PASSWORD sama dengan yang di .env.mysql
    ```

3.  **Install Dependencies:**

    ```bash
    go mod tidy
    ```

4.  **Coba Jalankan Server:**
    ```bash
    go run main.go
    ```
    Server akan berjalan di port `3001` (default).

---

### 4. Frontend Setup (React/Vite)

Interface utama untuk user (Landing page & Dashboard).

1.  Kembali ke root directory project.
2.  **Install Dependencies:**

    ```bash
    # Jika menggunakan Bun (Recommended)
    bun install

    # Atau menggunakan NPM
    npm install
    ```

3.  **Setup Environment Variables:**
    Pastikan file `.env` di root memiliki konfigurasi API URL yang benar.
    ```env
    VITE_API_URL=http://localhost:3001
    ```

---

## 🚀 5. Menjalankan Aplikasi

Anda perlu menjalankan **Backend** dan **Frontend** secara bersamaan.

### Opsi 1: Terminal Terpisah (Manual)

**Terminal 1 (Backend):**

```bash
cd go-server
go run main.go
```

**Terminal 2 (Frontend):**

```bash
# Root folder
bun dev
# atau
npm run dev
```

### Opsi 2: Concurrent (Script - jika tersedia)

Jika script `dev:go` sudah dikonfigurasi di `package.json` root:

```bash
bun dev:go   # (Perlu setup concurrently di package.json jika ingin 1 command)
```

_Saat ini disarankan menggunakan Opsi 1._

Buka browser dan akses: **http://localhost:5173**

---

## ❓ Troubleshooting

**Q: Error koneksi database PostgreSQL di Backend?**
A: Cek `go-server/.env`. Pastikan `DB_PORT`, `DB_USER`, dan `DB_PASSWORD` sesuai dengan local PostgreSQL Anda. Di file project ini port diset ke `5433`, jika default Anda `5432`, ubah di `.env`.

**Q: Docker MySQL error / tidak access?**
A: Pastikan Docker Desktop berjalan. Cek `docker ps`. Jika port `3306` bentrok dengan MySQL lokal (XAMPP/Laragon), matikan MySQL lokal dulu atau ubah port mapping di `docker-compose.mysql.yml`.

**Q: Error `go mod tidy` timeout?**
A: Pastikan koneksi internet stabil. Jika di Indonesia, kadang perlu set proxy Go:
`go env -w GOPROXY=https://proxy.golang.org,direct`

**Q: phpMyAdmin tidak bisa login?**
A: phpMyAdmin di setup ini di-disable root login-nya demi keamanan. Login hanya bisa dilakukan dengan user database yang dibuat melalui aplikasi CloudKu (setelah register dan create database).

---

**CloudKu - Advanced Hosting Platform**
