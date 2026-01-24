# 🐧 CloudKu - Production Deployment Guide

Panduan lengkap untuk mendeploy CloudKu ke server produksi (Ubuntu/Debian).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Otomatis (Deploy Script)](#1-cara-deploy-otomatis)
3. [Manual Step-by-Step](#2-cara-deploy-manual)
4. [MySQL Shared Hosting Setup](#3-setup-mysql-shared-hosting-docker)
5. [Security Config](#4-security-configuration)

---

## Prerequisites

- **OS**: Ubuntu 20.04/22.04 LTS or Debian 11/12.
- **Root Access**: SSH access as root or sudo user.
- **Domain**: Sebuah domain yang diarahkan ke IP server Anda.

---

## 1. Cara Deploy Otomatis

Gunakan script `deploy.sh` yang sudah disediakan untuk instalasi cepat.

1.  Upload seluruh folder project ke server Anda (misal ke `~/cloudku`).
2.  Masuk ke folder `deploy`:
    ```bash
    cd cloudku/deploy
    ```
3.  Berikan permission execute dan jalankan:
    ```bash
    chmod +x deploy.sh
    sudo ./deploy.sh
    ```
4.  Ikuti instruksi "NEXT STEPS" yang muncul di akhir script.

---

## 2. Cara Deploy Manual

Jika Anda ingin kontrol penuh, ikuti langkah ini.

### 2.1 Install Dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm golang postgresql nginx git docker.io docker-compose
```

### 2.2 Setup PostgreSQL (Main Database)

```bash
sudo -u postgres psql
# CREATE DATABASE hostmodern;
# ALTER USER postgres WITH PASSWORD 'secure_password';
# \q
```

Import schema:

```bash
psql -U postgres -d hostmodern -f database/schema.sql
```

### 2.3 Build Frontend (React)

```bash
cd cloudku
npm install
npm run build
# Output di folder dist/
```

### 2.4 Build Backend (Go)

```bash
cd go-server
go mod tidy
go build -o cloudku-server
```

### 2.5 Directory Setup

```bash
sudo mkdir -p /var/www/cloudku
sudo cp -r dist /var/www/cloudku/
sudo cp -r go-server /var/www/cloudku/
sudo chmod +x /var/www/cloudku/go-server/cloudku-server
```

### 2.6 Setup Systemd (Backend Service)

Edit `deploy/cloudku-backend.service`:

- Pastikan `User` dan `WorkingDirectory` benar.
  Copy ke systemd:

```bash
sudo cp deploy/cloudku-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cloudku-backend
sudo systemctl start cloudku-backend
```

### 2.7 Setup Nginx (Reverse Proxy)

Edit `deploy/nginx.conf`:

- Ubah `server_name` menjadi domain Anda.
  Copy ke sites-available:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/cloudku
sudo ln -s /etc/nginx/sites-available/cloudku /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 3. Setup MySQL Shared Hosting (Docker)

Ini adalah komponen vital untuk fitur hosting user. Jalankan ini di server yang sama (atau server database terpisah).

1.  **Environment Variables:**
    Copy `.env.mysql` ke server project.

    ```bash
    cp .env.mysql.example .env.mysql
    ```

    Edit `.env.mysql` dan set password `MYSQL_ROOT_PASSWORD` yang SANGAT KUAT.

2.  **Start Containers:**
    Dari root folder project:

    ```bash
    docker-compose -f docker-compose.mysql.yml up -d
    ```

3.  **Verifikasi:**
    ```bash
    docker ps
    # Harus ada cloudku-mysql dan cloudku-phpmyadmin
    ```

---

## 4. Security Configuration

### A. SSL Setup (HTTPS)

Gunakan Certbot untuk mengamankan Nginx dengan SSL gratis Let's Encrypt.

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### B. Firewall (UFW)

Hanya buka port yang diperlukan.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full' # Port 80, 443
# sudo ufw allow 3306     # HANYA jika Anda ingin remote MySQL access (TIDAK DISARANKAN)
# sudo ufw allow 8080     # HANYA jika Anda ingin akses phpMyAdmin langsung via IP
sudo ufw enable
```

### C. Backend Env Secrets

Pastikan `/var/www/cloudku/go-server/.env` di-set dengan benar untuk production:

```env
PORT=3001
FRONTEND_URL=https://your-domain.com
DB_HOST=localhost
DB_PORT=5432
...
```
