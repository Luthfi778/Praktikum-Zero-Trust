#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:3000}"

login() {
  local user="$1" pass="$2" device="$3"
  curl -fsS -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -H "X-Device-ID: $device" -d "{\"username\":\"$user\",\"password\":\"$pass\"}"
}

echo '1) Login mahasiswa:'
MHS=$(login mhs1 mhs123 DEV-MHS-01)
TOKEN=$(node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).accessToken))" <<< "$MHS")
curl -i "$BASE/nilai" -H "Authorization: Bearer $TOKEN" -H 'X-Device-ID: DEV-MHS-01'

echo '\n2) Mahasiswa mencoba transkrip mahasiswa lain (harus 403):'
curl -i "$BASE/transkrip/2210002" -H "Authorization: Bearer $TOKEN" -H 'X-Device-ID: DEV-MHS-01'

echo '\n3) Device salah (harus 403):'
curl -i "$BASE/nilai" -H "Authorization: Bearer $TOKEN" -H 'X-Device-ID: DEVICE-SALAH'

echo '\n4) Akses langsung service (harus 403):'
curl -i http://localhost:3001/nilai

echo '\n5) Login dosen dan finalisasi kelas IF101-A (kelas id 1):'
DOSEN=$(login dosen1 dosen123 DEV-DOSEN-01)
DTOKEN=$(node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).accessToken))" <<< "$DOSEN")
curl -i -X POST "$BASE/kelas/1/finalisasi" -H "Authorization: Bearer $DTOKEN" -H 'X-Device-ID: DEV-DOSEN-01' -H 'Content-Type: application/json' -d '{}'

echo '\nSelesai. Periksa tabel audit_log untuk catatan allow/deny.'
