# 🐧 CloudKu - Linux Production Guide

Panduan ini akan membantu Anda mendeploy CloudKu ke server Linux (Ubuntu/Debian) untuk production.

## 📁 Struktur Folder Deploy

Dalam folder `deploy/` terdapat 3 file penting:

1. `cloudku-backend.service` - Konfigurasi agar Go server jalan otomatis (auto-restart).
2. `nginx.conf` - Konfigurasi Web Server & Reverse Proxy.
3. `deploy.sh` - Script otomatisasi instalasi.

---

## 🛠️ Cara Deploy (Manual Step-by-Step)

### 1. Persiapan Server

Pastikan Anda sudah login ke VPS/Server via SSH.

```bash
# Update repository
sudo apt update

# Install dependencies
sudo apt install -y nodejs npm golang postgresql nginx git
```

### 2. Clone Repository

```bash
git clone <repository_url>
cd cloudku
```

### 3. Build Frontend (React)

Kita perlu mengubah kode React menjadi static file yang ringan.

```bash
# Install dependencies
npm install

# Build production version
npm run build

# Output akan ada di folder "dist/"
```

### 4. Build Backend (Go)

Compile Go menjadi binary file yang bisa jalan sendiri.

```bash
cd go-server

# Build binary
go build -o cloudku-server
```

### 5. Setup Database

```bash
# Login ke postgres
sudo -u postgres psql

# Buat database & user
CREATE DATABASE hostmodern;
ALTER USER postgres WITH PASSWORD 'your-strong-password';
\q

# Import Schema
psql -U postgres -d hostmodern -f ../database/schema.sql
```

### 6. Setup Production Environment

Buat folder untuk aplikasi production.

```bash
sudo mkdir -p /var/www/cloudku
sudo cp -r dist /var/www/cloudku/
sudo cp -r go-server /var/www/cloudku/

# Set permission executable
sudo chmod +x /var/www/cloudku/go-server/cloudku-server
```

**PENTING:** Buat file `.env` di server production:

```bash
nano /var/www/cloudku/go-server/.env
```

Isi dengan konfigurasi production (gunakan password DB yang benar & matikan debug mode).

### 7. Setup Systemd Service (Auto-Start)

Agar backend tetap jalan walau server restart.

```bash
# Copy service file
sudo cp deploy/cloudku-backend.service /etc/systemd/system/

# Reload & Start
sudo systemctl daemon-reload
sudo systemctl enable cloudku-backend
sudo systemctl start cloudku-backend

# Cek status
sudo systemctl status cloudku-backend
```

### 8. Setup Nginx (Web Server)

Agar aplikasi bisa diakses via domain (port 80/443), bukan localhost:3001.

```bash
# Copy config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/cloudku

# Edit domain anda
sudo nano /etc/nginx/sites-available/cloudku

# Enable site
sudo ln -s /etc/nginx/sites-available/cloudku /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## ⚡ Cara Deploy (Otomatis)

Jika Anda malas melakukan langkah manual, gunakan script `deploy.sh`.

1. Upload seluruh project ke server.
2. Berikan permission execute pada script:
   ```bash
   chmod +x deploy/deploy.sh
   ```
3. Edit `deploy.sh` sesuaikan path jika perlu.
4. Jalankan:
   ```bash
   ./deploy/deploy.sh
   ```

---

## 🔒 Security Checklist (Production)

1. **Firewall**: Setup UFW.
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```
2. **SSL/HTTPS**: Gunakan Certbot (Let's Encrypt).
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```
3. **Database**: Jangan expose port 5432 ke public internet.
