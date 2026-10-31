# Skenario Pengujian Zero Trust

1. Login dengan username/password benar dan device terdaftar -> 200.
2. Login dengan device tidak terdaftar -> 403.
3. GET `/nilai` dengan token mahasiswa -> hanya nilai mahasiswa tersebut.
4. GET `/transkrip/:nim` mahasiswa dengan NIM sendiri -> 200; NIM orang lain -> 403.
5. GET `/transkrip/:nim` admin -> 200 untuk NIM mana pun.
6. PUT `/nilai/:id` oleh dosen pengampu, nilai belum final, dan dalam jam akses -> 200.
7. PUT nilai kelas dosen lain -> 403.
8. PUT nilai yang sudah final -> 403 dari policy.
9. PUT/finalisasi di luar jam akses -> 403. Untuk demo, atur ACCESS_HOUR_START/END pada `.env` lalu restart gateway.
10. Akses langsung port service tanpa `X-Gateway-Secret` -> 403.
11. POST `/transkrip/sinkron` dengan token user -> 403; token service -> diizinkan.
12. Refresh token valid -> access dan refresh token baru; refresh token lama ditolak. Logout -> refresh token dicabut.
13. Finalisasi kelas oleh dosen pengampu -> nilai difinalisasi dan transkrip tersinkron melalui Gateway.
14. Periksa tabel `audit_log` untuk keputusan allow/deny beserta alasan.

Catatan: untuk pengujian jam di luar rentang, ubah konfigurasi sementara, misalnya ACCESS_HOUR_START=0 dan ACCESS_HOUR_END=1 untuk memaksa kondisi di luar jam pada sebagian besar waktu; restart Gateway setelah perubahan.
