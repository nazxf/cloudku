@echo off
echo ==========================================
echo   FIX PORT CONFLICT (CloudKu)
echo ==========================================
echo.
echo Script ini akan mematikan semua proses Node.js
echo untuk membebaskan port 5173, 5174, dll.
echo.
echo Pastikan Anda siap mematikan terminal 'npm run dev'!
echo.
pause
echo.
echo Mematikan proses node.exe...
taskkill /F /IM node.exe
echo.
echo ==========================================
echo   SELESAI!
echo ==========================================
echo.
echo Sekarang silakan:
echo 1. Buka terminal baru
echo 2. Jalankan: npm run dev
echo 3. Pastikan berjalan di: http://localhost:5173
echo.
pause
