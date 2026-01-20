# 🔑 Dokumentasi Google Client ID - Alur Penggunaan

## 📋 Ringkasan

Google Client ID digunakan untuk autentikasi Google Sign-In. Berikut adalah alur lengkap dari konfigurasi hingga penggunaan.

---

## 🗺️ Alur Penggunaan Google Client ID

```
┌─────────────────────────────────────────────────────────────────┐
│  1. KONFIGURASI (Environment Variable)                          │
│  📁 File: .env.local                                            │
│  ─────────────────────────────────────────────────────────────  │
│  VITE_GOOGLE_CLIENT_ID=964004422246-xxx.apps.googleusercontent.com │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. DIBACA OLEH KOMPONEN                                        │
│  📁 File: components/AuthModal.tsx (Line 73)                    │
│  ─────────────────────────────────────────────────────────────  │
│  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. DIKIRIM KE FUNGSI INISIALISASI                              │
│  📁 File: utils/googleAuth.ts                                   │
│  ─────────────────────────────────────────────────────────────  │
│  initializeGoogleSignIn(clientId, handleGoogleSuccess);        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. DIGUNAKAN UNTUK INISIALISASI GOOGLE SDK                     │
│  📁 File: utils/googleAuth.ts (Line 112-127)                    │
│  ─────────────────────────────────────────────────────────────  │
│  window.google.accounts.id.initialize({                        │
│    client_id: clientId,                                         │
│    callback: (response) => { ... }                              │
│  });                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 File-File yang Terlibat

### 1. **`.env.local`** (Konfigurasi)

**Lokasi:** Root project  
**Baris:** 10  
**Fungsi:** Menyimpan Google Client ID

```env
VITE_GOOGLE_CLIENT_ID=964004422246-atl1s8v8pm1m5g8c2hjla68e14ufg6jh.apps.googleusercontent.com
```

**⚠️ PENTING:**

- Prefix `VITE_` diperlukan agar Vite bisa membaca variable ini
- File ini TIDAK boleh di-commit ke Git (sudah ada di `.gitignore`)

---

### 2. **`components/AuthModal.tsx`** (Pembaca Client ID)

**Lokasi:** `components/AuthModal.tsx`  
**Baris:** 73  
**Fungsi:** Membaca Client ID dari environment variable

```typescript
// Line 68-88
useEffect(() => {
  const setupGoogle = async () => {
    try {
      await loadGoogleScript();

      // 👇 MEMBACA CLIENT ID DARI .env.local
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      // Validasi Client ID
      if (
        !clientId ||
        clientId === "your-google-client-id-here.apps.googleusercontent.com"
      ) {
        console.error("Google Client ID not configured");
        return;
      }

      // 👇 MENGIRIM CLIENT ID KE FUNGSI INISIALISASI
      initializeGoogleSignIn(clientId, handleGoogleSuccess);
      setGoogleLoaded(true);
    } catch (err) {
      console.error("Failed to load Google Sign-In:", err);
    }
  };

  setupGoogle();
}, [handleGoogleSuccess]);
```

---

### 3. **`utils/googleAuth.ts`** (Inisialisasi Google SDK)

**Lokasi:** `utils/googleAuth.ts`  
**Baris:** 96-130  
**Fungsi:** Menginisialisasi Google Sign-In dengan Client ID

```typescript
// Line 96-130
export const initializeGoogleSignIn = (
  clientId: string, // 👈 CLIENT ID DITERIMA DI SINI
  onSuccess: (user: GoogleUser) => void
): void => {
  if (!window.google?.accounts?.id) {
    return;
  }

  // Prevent multiple initializations
  if (isGoogleInitialized) {
    currentCallback = onSuccess;
    return;
  }

  currentCallback = onSuccess;

  // 👇 CLIENT ID DIGUNAKAN DI SINI
  window.google.accounts.id.initialize({
    client_id: clientId, // 👈 DIKIRIM KE GOOGLE SDK
    callback: (response) => {
      try {
        const userData = parseJwt(response.credential);
        (userData as any).credential = response.credential;

        if (currentCallback) {
          currentCallback(userData as GoogleUser & { credential: string });
        }
      } catch (error) {
        // Silent error handling
      }
    },
  });

  isGoogleInitialized = true;
};
```

---

## 🔄 Cara Mengubah Google Client ID

### Opsi 1: Edit File `.env.local` (RECOMMENDED)

1. Buka file `.env.local`
2. Cari baris:
   ```env
   VITE_GOOGLE_CLIENT_ID=964004422246-xxx.apps.googleusercontent.com
   ```
3. Ganti dengan Client ID baru Anda
4. **RESTART dev server**:
   ```bash
   # Tekan Ctrl + C untuk stop
   npm run dev
   ```

### Opsi 2: Buat Client ID Baru di Google Cloud Console

1. Buka: https://console.cloud.google.com/apis/credentials
2. Klik **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Pilih **"Web application"**
4. Isi:
   - **Name:** CloudKu Development
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:3000`
   - **Authorized redirect URIs:**
     - `http://localhost:5173`
5. Klik **"CREATE"**
6. Copy Client ID yang baru
7. Paste ke `.env.local`

---

## 🧪 Cara Testing Setelah Mengubah Client ID

1. **Restart dev server:**

   ```bash
   # Stop dengan Ctrl + C
   npm run dev
   ```

2. **Clear browser cache:**

   - Chrome: `Ctrl + Shift + Delete`
   - Pilih "Cached images and files"
   - Clear

3. **Buka aplikasi:**

   ```
   http://localhost:5173
   ```

4. **Test login:**
   - Klik tombol "Login"
   - Klik tombol "Google"
   - Seharusnya popup Google Sign-In muncul

---

## 🔍 Troubleshooting

### Error: "Google Client ID not configured"

**Penyebab:** Client ID tidak ditemukan atau masih default value

**Solusi:**

1. Pastikan `.env.local` ada di root project
2. Pastikan ada baris `VITE_GOOGLE_CLIENT_ID=...`
3. Pastikan TIDAK ada typo di nama variable
4. Restart dev server

### Error: "The given origin is not allowed"

**Penyebab:** Origin tidak terdaftar di Google Cloud Console

**Solusi:**

1. Buka Google Cloud Console
2. Edit OAuth Client ID
3. Tambahkan `http://localhost:5173` di **Authorized JavaScript origins**
4. Save dan tunggu 5-10 menit

### Client ID tidak berubah setelah edit `.env.local`

**Penyebab:** Dev server belum di-restart

**Solusi:**

```bash
# Stop dev server
Ctrl + C

# Start lagi
npm run dev
```

---

## 📊 Checklist Konfigurasi

- [ ] File `.env.local` sudah ada
- [ ] `VITE_GOOGLE_CLIENT_ID` sudah diisi dengan Client ID yang benar
- [ ] Client ID format: `xxx-xxx.apps.googleusercontent.com`
- [ ] Origin `http://localhost:5173` sudah ditambahkan di Google Cloud Console
- [ ] Dev server sudah di-restart setelah edit `.env.local`
- [ ] Browser cache sudah di-clear

---

## 🎯 Summary

**Untuk mengubah Google Client ID:**

1. Edit file **`.env.local`** (baris 10)
2. Ganti value `VITE_GOOGLE_CLIENT_ID`
3. **Restart** dev server (`Ctrl + C` → `npm run dev`)
4. **Clear** browser cache
5. Test login

**Lokasi kode yang menggunakan Client ID:**

- **Dibaca:** `components/AuthModal.tsx` (line 73)
- **Digunakan:** `utils/googleAuth.ts` (line 112)
