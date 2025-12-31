# GitHub Login - Panduan & Troubleshooting

## ✅ STATUS: BERHASIL DIPERBAIKI

GitHub login sudah berfungsi dengan baik! Masalah yang diperbaiki:
1. ✅ Authorization callback URL dikonfigurasi dengan benar
2. ✅ GitHub OAuth flow berjalan sempurna
3. ✅ Token disimpan dan user masuk ke dashboard

## Cara Login dengan GitHub

### 1. Pertama Kali Login
1. Klik tombol **"Masuk"** di navigation bar
2. Klik tombol **"GitHub"** di modal authentication
3. Anda akan diarahkan ke halaman GitHub untuk authorize aplikasi
4. Setelah authorize, GitHub akan redirect kembali ke aplikasi
5. Aplikasi akan memproses login dan redirect ke dashboard

### 2. Login Ulang (Setelah Tutup Browser)
- Proses yang sama dengan pertama kali login
- Token lama akan otomatis diganti dengan token baru
- Tidak perlu logout manual sebelum login lagi

## Konfigurasi GitHub OAuth App

### PENTING: Authorization Callback URL
Pastikan di GitHub OAuth App settings:

**Homepage URL:**
```
http://localhost:5173
```

**Authorization callback URL:**
```
http://localhost:5173
```

❌ **JANGAN gunakan path tambahan seperti:**
- `http://localhost:5173/auth/callback/github`
- `http://localhost:5173/callback`
- `http://localhost:5173/github`

Aplikasi ini menggunakan root URL (`/`) untuk menerima callback dari GitHub.


## Masalah yang Mungkin Terjadi

### 1. **Error: "bad_verification_code"**
**Penyebab**: Code GitHub sudah pernah dipakai (code hanya bisa digunakan 1x)

**Solusi**: 
- Tutup semua tab browser aplikasi
- Buka aplikasi di tab baru: http://localhost:5173
- Coba login GitHub lagi dari awal

### 2. **Error: "GitHub Client ID/Secret tidak dikonfigurasi"**
**Penyebab**: Environment variable belum diset

**Solusi**:
- Pastikan file `.env.local` ada dan berisi:
  ```
  GITHUB_CLIENT_ID=your_client_id
  GITHUB_CLIENT_SECRET=your_client_secret
  ```
- Restart server: `Ctrl+C` lalu `npm run dev:all`

### 3. **Stuck di Landing Page (Tidak Redirect ke Dashboard)**
**Penyebab**: Bisa jadi error saat processing callback

**Solusi**:
1. Buka Console (F12)
2. Lihat log error berwarna merah
3. Jika ada error "bad_verification_code":
   - Tutup semua tab
   - Buka tab baru dan login ulang
4. Jika ada error lain:
   - Screenshot error dan cek backend server log
   - Restart server jika perlu

### 4. **Loading Screen Muncul Terus (Tidak Hilang)**
**Penyebab**: Request ke backend gagal atau timeout

**Solusi**:
1. Cek console untuk error message
2. Pastikan backend server berjalan (cek terminal `npm run dev:all`)
3. Refresh halaman (F5) untuk reset state
4. Coba login ulang

## Fitur Baru yang Ditambahkan

### 1. **Detailed Logging**
- Setiap step login GitHub sekarang di-log ke console
- Memudahkan debugging dan trace masalah

### 2. **Loading Screen**
- Visual feedback saat processing GitHub callback
- Menampilkan pesan "Memproses Login GitHub..."

### 3. **Better Error Handling**
- Alert dengan pesan error yang jelas
- URL otomatis dibersihkan setelah error

### 4. **Auto Token Replacement**
- Saat login ulang, token lama otomatis diganti
- Tidak perlu logout manual dulu

## Tips

1. **Selalu cek console saat testing** untuk melihat flow login
2. **Jangan refresh halaman** saat sedang loading GitHub callback
3. **Gunakan 1 tab saja** untuk testing login GitHub
4. **GitHub code hanya valid 10 menit** - jangan tunggu terlalu lama setelah authorize

## Fitur Logout yang Sudah Ditambahkan

### Cara Logout
1. Klik **profile picture/avatar** di kanan atas navbar
2. Dropdown menu akan muncul
3. Klik tombol **"Logout"** (berwarna merah) di bagian bawah menu
4. Anda akan diarahkan kembali ke landing page

### Menu Dropdown User
- **Settings**: Navigasi ke halaman settings (belum diimplementasi)
- **Profile**: Navigasi ke halaman profile (belum diimplementasi)
- **Logout**: Keluar dari akun dan kembali ke landing page
