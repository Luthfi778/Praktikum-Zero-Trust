# Sistem Nilai - Zero Trust Security

Implementasi tugas praktikum Zero Trust menggunakan Node.js, Express, JWT, SQLite, dan tiga proses terpisah: API Gateway (3000), Service Nilai (3001), Service Transkrip (3002).

## 1. Persiapan
- Node.js 18 atau lebih baru (karena memakai `fetch` bawaan Node).
- Jalankan `npm run install:all` dari folder root jika dependency belum terpasang.
- Salin `.env.example` menjadi `.env`, lalu isi secret yang kuat dan unik.
- Pastikan `SERVICE_CLIENT_SECRET` di `.env` sama dengan secret yang dipakai ketika menjalankan seed.

Contoh membuat secret acak di PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Database
Jalankan dari root project:
```powershell
npm run seed
```
PERINGATAN: seed menghapus dan mengisi ulang tabel aplikasi. Jangan jalankan ulang jika sudah memiliki data yang ingin dipertahankan.

## 3. Menjalankan aplikasi
Buka tiga terminal dari folder root project:
```powershell
npm run start:gateway
```
```powershell
npm run start:nilai
```
```powershell
npm run start:transkrip
```
Cek `http://localhost:3000/health`, `http://localhost:3001/health`, dan `http://localhost:3002/health`.
Semua endpoint aplikasi diakses melalui Gateway port 3000. Jangan mengakses service port 3001/3002 secara langsung.

## 4. Akun seed
| Role      | Username | Password | Device ID    |
|-----------|----------|----------|--------------|
| Admin     | admin1   | admin123 | DEV-ADMIN-01 |
| Dosen     | dosen1   | dosen123 | DEV-DOSEN-01 |
| Dosen     | dosen2   | dosen123 | DEV-DOSEN-02 |
| Mahasiswa | mhs1     | mhs123   | DEV-MHS-01   |
| Mahasiswa | mhs2     | mhs123   | DEV-MHS-02   |
| Mahasiswa | mhs3     | mhs123   | DEV-MHS-03   |

Kelas: IF101-A (dosen1) dan IF102-B (dosen2). ID kelas dan ID nilai dapat dilihat melalui database.

## 5. Endpoint
Semua request user ke endpoint selain `/auth/*` membutuhkan `Authorization: Bearer <accessToken>` dan `X-Device-ID`.

| Method | Endpoint | Keterangan |
|------|---------------|----------------------------------------------------------------------------------|
| POST | `/auth/login` | Login; header `X-Device-ID`; body `{ "username": "mhs1", "password": "mhs123" }` |
| POST | `/auth/refresh` | Body `{ "refreshToken": "..." }`; refresh token dirotasi |
| POST | `/auth/logout` | Body `{ "refreshToken": "..." }`; mencabut refresh token |
| POST | `/auth/service` | Body `{ "clientId": "service-nilai", "clientSecret": "..." }` |
| GET | `/nilai` | Mahasiswa melihat nilainya; dosen melihat nilai kelas yang diampu |
| PUT | `/nilai/:id` | Dosen mengubah nilai belum final pada kelasnya; body `{ "nilai": 90 }` |
| POST | `/kelas/:id/finalisasi` | Dosen memfinalisasi kelas; nilai dikirim ke Service Transkrip melalui Gateway dengan token service |
| GET | `/transkrip/:nim` | Mahasiswa hanya transkrip sendiri; admin seluruh mahasiswa |
| POST | `/transkrip/sinkron` | Khusus token service; body `{ "items": [{ "nim":"2210001", "kelas_id":1, "nilai_angka":85 }] }` |

Access token user berlaku sesuai `ACCESS_TOKEN_TTL` (default 10 menit), token service 5 menit, refresh token 1 hari. Service memverifikasi gateway secret dan tanda tangan/masa berlaku JWT secara independen.

## 6. Konteks Zero Trust
- Gateway menjadi PEP dan memutuskan allow/deny.
- Policy memeriksa role, kepemilikan kelas/nilai, kepemilikan transkrip, device terdaftar, dan jam akses.
- Perubahan/finalisasi nilai dibatasi `ACCESS_HOUR_START` sampai sebelum `ACCESS_HOUR_END` (default 07.00–21.00, zona waktu lokal proses Node.js).
- Gateway menambahkan `X-Gateway-Secret`; service menolak secret salah/kosong dan tetap memverifikasi JWT.
- Sinkronisasi transkrip hanya menerima JWT bertipe `service`.
- Keputusan akses gateway dicatat pada tabel `audit_log`.

## 7. Pengujian
Import `tests/postman_collection.json` ke Postman. Collection sudah memakai collection variables dengan `baseUrl=http://localhost:3000`; request login menyimpan access token, refresh token, dan device ID secara otomatis. Jalankan request secara berurutan sesuai role yang sedang diuji.
Lihat juga `docs/skenario-uji.md` dan `tests/curl-scenarios.sh`.

