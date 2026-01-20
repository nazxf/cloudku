# 🐳 CloudKu MySQL Shared Hosting - Deployment Guide

Panduan lengkap untuk setup platform shared MySQL hosting menggunakan Docker.

---

## 📋 Table of Contents

- [Arsitektur](#arsitektur)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Konfigurasi Detail](#konfigurasi-detail)
- [Keamanan](#keamanan)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    cloudku-mysql-network                     │
│                                                              │
│   ┌──────────────────┐          ┌───────────────────────┐   │
│   │  cloudku-mysql   │◄────────►│ cloudku-phpmyadmin    │   │
│   │  (MySQL 8.0)     │          │ (Web Interface)       │   │
│   │                  │          │                       │   │
│   │  Port: 3306      │          │  Port: 8080           │   │
│   │  Volume: Data    │          │  Config: Security     │   │
│   └──────────────────┘          └───────────────────────┘   │
│          ▲                                                   │
└──────────┼───────────────────────────────────────────────────┘
           │
    ┌──────┴───────┐
    │ CloudKu Go   │
    │   Backend    │
    │   (API)      │
    └──────────────┘
```

**Konsep Utama:**

- **1 Container MySQL** untuk semua user
- **1 Container phpMyAdmin** untuk management
- **Isolasi** melalui MySQL privileges (bukan container terpisah)
- **Shared resources** untuk efisiensi

---

## 📦 Prerequisites

### Software Requirements

- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Git**: untuk clone repository
- **Go**: v1.21+ (untuk backend)

### Cek Installation

```bash
docker --version
docker-compose --version
go version
```

---

## 🚀 Quick Start

### Step 1: Setup Environment Variables

```bash
# Copy environment template
cp .env.mysql.example .env.mysql

# Generate secure password (Linux/Mac)
openssl rand -base64 32

# Generate secure password (Windows PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
```

Edit `.env.mysql`:

```env
MYSQL_ROOT_PASSWORD=<password_yang_di_generate>
MYSQL_ADMIN_PASSWORD=<password_yang_sama>
```

> ⚠️ **PENTING**: `MYSQL_ROOT_PASSWORD` dan `MYSQL_ADMIN_PASSWORD` HARUS identik!

### Step 2: Start Docker Containers

```bash
# Start dalam detached mode
docker-compose -f docker-compose.mysql.yml up -d

# Check status
docker-compose -f docker-compose.mysql.yml ps

# View logs
docker-compose -f docker-compose.mysql.yml logs -f
```

**Expected Output:**

```
✅ cloudku-mysql        - running (healthy)
✅ cloudku-phpmyadmin   - running (healthy)
```

### Step 3: Verify Installation

**Test MySQL Connection:**

```bash
docker exec -it cloudku-mysql mysql -u root -p
# Masukkan password dari .env.mysql
```

**Test phpMyAdmin:**

1. Buka browser: http://localhost:8080
2. **JANGAN** login dengan root (harus error)
3. Tunggu user dibuat via API

### Step 4: Setup Go Backend

Edit `go-server/.env`:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_ADMIN_USER=root
MYSQL_ADMIN_PASSWORD=<password_dari_.env.mysql>
```

Start Go server:

```bash
cd go-server
go run main.go
```

---

## ⚙️ Konfigurasi Detail

### Docker Compose Configuration

**File**: `docker-compose.mysql.yml`

Key settings:

- **Network**: `cloudku-mysql-network` (bridge mode)
- **MySQL Port**: 3306 (exposed ke host)
- **phpMyAdmin Port**: 8080 (exposed ke host)
- **Volumes**: `cloudku-mysql-data` (persistent storage)

### MySQL Security Initialization

**File**: `mysql-init/01-secure-root.sql`

Script ini berjalan otomatis saat pertama kali startup:

- ❌ Remove anonymous users
- ❌ Remove remote root access
- ❌ Remove test database
- ✅ Set optimal connection limits

### phpMyAdmin Security

**File**: `phpmyadmin-config/config.user.inc.php`

Security features:

- 🔒 Root login **DISABLED**
- 🔒 No password **DISABLED**
- 🔒 System databases **HIDDEN**
- ⏱️ Session timeout: 30 menit
- 🛡️ Arbitrary server **DISABLED**

---

## 🔐 Keamanan

### Best Practices

#### 1. Password Security

```bash
# Generate strong password (minimum 16 karakter)
openssl rand -base64 24

# Jangan gunakan password default
# Jangan commit .env.mysql ke Git
```

#### 2. Firewall Configuration

```bash
# Hanya allow localhost untuk MySQL (production)
# Edit docker-compose.mysql.yml:
ports:
  - "127.0.0.1:3306:3306"  # Hanya localhost

# Allow dari network tertentu
# Gunakan Docker networks atau UFW
```

#### 3. User Isolation Flow

**Saat User Register:**

```sql
-- 1. Backend membuat database khusus
CREATE DATABASE cloudku_user123;

-- 2. Backend membuat MySQL user
CREATE USER 'user_123'@'%' IDENTIFIED BY 'secure_password';

-- 3. Grant HANYA ke database miliknya
GRANT ALL PRIVILEGES ON cloudku_user123.* TO 'user_123'@'%';

-- 4. User TIDAK bisa akses database lain
REVOKE ALL PRIVILEGES ON *.* FROM 'user_123'@'%';
```

**Verifikasi Isolasi:**

```bash
# Login sebagai user_123
mysql -u user_123 -p

# Coba akses database user lain
USE cloudku_user456;  # ❌ ERROR: Access denied
```

#### 4. Rate Limiting (Optional)

Tambahkan resource limits per user:

```sql
CREATE USER 'user_123'@'%'
IDENTIFIED BY 'password'
WITH
  MAX_QUERIES_PER_HOUR 10000
  MAX_UPDATES_PER_HOUR 5000
  MAX_CONNECTIONS_PER_HOUR 500
  MAX_USER_CONNECTIONS 10;
```

---

## 🛠️ Troubleshooting

### Issue 1: Container tidak start

**Symptom:**

```
ERROR: failed to start container cloudku-mysql
```

**Solution:**

```bash
# Check logs
docker-compose -f docker-compose.mysql.yml logs cloudku-mysql

# Common issues:
# - Port 3306 already in use
# - Invalid MYSQL_ROOT_PASSWORD
# - Insufficient disk space

# Check port
netstat -an | findstr :3306  # Windows
lsof -i :3306                 # Linux/Mac

# Stop other MySQL services
net stop MySQL80              # Windows
sudo systemctl stop mysql     # Linux
```

### Issue 2: phpMyAdmin "Connection refused"

**Solution:**

```bash
# Tunggu MySQL healthcheck pass
docker-compose -f docker-compose.mysql.yml ps

# Manual check
docker exec -it cloudku-mysql mysqladmin ping -h localhost -u root -p
```

### Issue 3: User tidak bisa login phpMyAdmin

**Checklist:**

- ✅ Database sudah dibuat via API?
- ✅ User MySQL sudah dibuat?
- ✅ Password benar?
- ✅ Privileges sudah di-grant?

**Debug:**

```bash
# Check user exists
docker exec -it cloudku-mysql mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='user_123';"

# Check privileges
docker exec -it cloudku-mysql mysql -u root -p -e "SHOW GRANTS FOR 'user_123'@'%';"

# Check database exists
docker exec -it cloudku-mysql mysql -u root -p -e "SHOW DATABASES LIKE 'cloudku_user123';"
```

### Issue 4: Go Backend tidak connect ke MySQL

**Solution:**

```bash
# Verify environment variables
cd go-server
cat .env | grep MYSQL

# Test connection manually
docker exec -it cloudku-mysql mysql -h localhost -u root -p

# Check network
docker network inspect cloudku-mysql-network
```

---

## 📚 FAQ

### Q: Apakah aman untuk expose port 3306?

**A**: Untuk development, OK. Untuk production:

1. Bind hanya ke localhost: `127.0.0.1:3306:3306`
2. Gunakan firewall (UFW/iptables)
3. Atau jangan expose sama sekali jika backend di Docker network yang sama

### Q: Berapa banyak user yang bisa di-handle?

**A**: Tergantung resources:

- **MySQL max_connections**: Default 200
- **Per user limit**: 10 concurrent connections (via service)
- **Theoretical max**: 20 users dengan concurrent load
- **Recommendation**: Monitor dengan `SHOW PROCESSLIST;`

### Q: Bagaimana cara backup database user?

**A**: Gunakan `mysqldump`:

```bash
# Backup single database
docker exec cloudku-mysql mysqldump -u root -p cloudku_user123 > backup_user123.sql

# Restore
docker exec -i cloudku-mysql mysql -u root -p cloudku_user123 < backup_user123.sql
```

### Q: Apakah bisa upgrade MySQL 8.0 ke versi terbaru?

**A**: Ya, tapi perhatikan compatibility:

```bash
# Backup semua data dulu
docker exec cloudku-mysql mysqldump -u root -p --all-databases > full_backup.sql

# Edit docker-compose.mysql.yml
image: mysql:8.4  # Ganti versi

# Recreate container
docker-compose -f docker-compose.mysql.yml up -d --force-recreate
```

### Q: Bagaimana cara monitoring resource usage?

**A**: Gunakan Docker stats:

```bash
# Real-time monitoring
docker stats cloudku-mysql cloudku-phpmyadmin

# MySQL specific
docker exec -it cloudku-mysql mysql -u root -p -e "SHOW GLOBAL STATUS LIKE '%connection%';"
docker exec -it cloudku-mysql mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🔄 Maintenance Commands

### Stop Containers

```bash
docker-compose -f docker-compose.mysql.yml stop
```

### Restart Containers

```bash
docker-compose -f docker-compose.mysql.yml restart
```

### Remove Containers (Data tetap ada)

```bash
docker-compose -f docker-compose.mysql.yml down
```

### Remove Containers + Data (DESTRUCTIVE!)

```bash
docker-compose -f docker-compose.mysql.yml down -v
```

### Update Images

```bash
docker-compose -f docker-compose.mysql.yml pull
docker-compose -f docker-compose.mysql.yml up -d
```

---

## 📞 Support

Jika menemui masalah, check:

1. Logs: `docker-compose -f docker-compose.mysql.yml logs`
2. Health status: `docker-compose -f docker-compose.mysql.yml ps`
3. MySQL error log: `docker exec -it cloudku-mysql tail -f /var/log/mysql/error.log`

---

**Last Updated**: 2026-01-20  
**Version**: 1.0.0
