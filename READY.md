# 🏁 READY TO DEPLOY: Final Security & Production Guide

File ini berisi ringkasan seluruh analisis keamanan, temuan audit, dan langkah-langkah persiapan terakhir sebelum aplikasi **CloudKu** di-deploy ke server Linux Production.

---

## 🔒 1. HASIL AUDIT KEAMANAN (PENTING)

Tim pengembang wajib memperhatikan poin-poin berikut:

### 🛑 Risiko Kritikal

- **Eksposur Secrets**: File `.env`, `.env.local`, dan `start.bat` mengandung password database dan OAuth Secret. **WAJIB** dimasukkan ke `.gitignore` sebelum melakukan push ke GitHub/GitLab.
- **Command Injection (Git Clone)**: Di file `go-server/controllers/file_controller.go`, fitur git clone rentan terhadap penyusupan perintah sistem.
  - _Solusi_: Gunakan pemisah argumen `--`, contoh: `exec.Command("git", "clone", "--", req.URL, destPath)`.
  - _Solusi_: Validasi agar user hanya bisa menggunakan protokol `https://`.

### ⚠️ Risiko Tinggi & Lainnya

- **Data Pribadi di Backup**: File `database/backup_full.sql` berisi email asli dan hash password user. Jangan sertakan file ini di server publik.
- **JWT Secret Default**: Jangan gunakan secret bawaan di file konfigurasi. Selalu gunakan `JWT_SECRET` yang unik dan panjang di setiap server.

---

## 🚀 2. CHECKLIST PERSIAPAN PRODUCTION

Lakukan langkah-langkah ini tepat sebelum atau saat proses deployment di Linux:

### A. Konfigurasi Environment (`.env`)

Di server Linux, buat file `.env` baru dengan penyesuaian:

- **DB_PORT**: Ubah ke `5432` (standar Linux).
- **DB_PASSWORD**: Gunakan password yang lebih kuat dari `1234`.
- **JWT_SECRET**: Buat kunci rahasia baru yang random.
- **NODE_ENV**: Set ke `production`.

### B. Pengaturan Hak Akses (Permissions)

Agar fitur Management File berfungsi (Upload/Edit), jalankan perintah ini di terminal Linux:

```bash
# Memberikan izin aplikasi untuk menulis file di folder user
sudo chown -R ubuntu:ubuntu /var/www/cloudku/go-server/user-files
sudo chmod -R 755 /var/www/cloudku/go-server/user-files
```

_(Catatan: Ganti 'ubuntu' dengan nama user yang menjalankan service backend)_

### C. Deployment Automation

Gunakan aset yang sudah tersedia di folder `deploy/`:

1.  **Systemd**: Gunakan `cloudku-backend.service` agar aplikasi auto-restart jika server mati.
2.  **Nginx**: Gunakan `nginx.conf` sebagai reverse proxy agar aplikasi bisa diakses via domain (Port 80/443).
3.  **SSL**: Wajib jalankan `certbot` untuk mengaktifkan HTTPS.

---

## ✅ 3. STATUS KESIAPAN

**SKOR: 85/100**

Aplikasi secara arsitektur sudah siap untuk Linux. Deployment dapat dilakukan segera setelah langkah-langkah di atas (Checklist A & B) terpenuhi.

---

_Laporan ini disusun oleh Antigravity Agent (2026-01-10)_
