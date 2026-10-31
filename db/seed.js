const fs = require('fs');
const path = require('path');
const { db, dbPath, requireDep } = require('./connection');
const bcrypt = requireDep('bcryptjs');

const HASH_ROUNDS = 10;
const hash = (plain) => bcrypt.hashSync(plain, HASH_ROUNDS);

const USERS = [
  { username: 'admin1',  password: 'admin123',  role: 'admin',     nim: null,      nama: 'Admin Prodi',          device: 'DEV-ADMIN-01' },
  { username: 'dosen1',  password: 'dosen123',  role: 'dosen',     nim: null,      nama: 'Dr. Budi Santoso',     device: 'DEV-DOSEN-01' },
  { username: 'dosen2',  password: 'dosen123',  role: 'dosen',     nim: null,      nama: 'Dr. Siti Rahmawati',   device: 'DEV-DOSEN-02' },
  { username: 'mhs1',    password: 'mhs123',    role: 'mahasiswa', nim: '2210001', nama: 'Andi Pratama',         device: 'DEV-MHS-01' },
  { username: 'mhs2',    password: 'mhs123',    role: 'mahasiswa', nim: '2210002', nama: 'Bunga Lestari',        device: 'DEV-MHS-02' },
  { username: 'mhs3',    password: 'mhs123',    role: 'mahasiswa', nim: '2210003', nama: 'Citra Dewi',           device: 'DEV-MHS-03' },
];

const KELAS = [
  { kode: 'IF101-A', nama_matkul: 'Keamanan Informasi', dosen: 'dosen1' },
  { kode: 'IF102-B', nama_matkul: 'Basis Data',         dosen: 'dosen2' },
];

const NILAI = [

  { kelas: 'IF101-A', mhs: 'mhs1', nilai: 85, final: 1 },
  { kelas: 'IF101-A', mhs: 'mhs2', nilai: 78, final: 0 },
  { kelas: 'IF101-A', mhs: 'mhs3', nilai: 90, final: 0 },

  { kelas: 'IF102-B', mhs: 'mhs1', nilai: 80, final: 0 },
  { kelas: 'IF102-B', mhs: 'mhs2', nilai: 88, final: 1 },
  { kelas: 'IF102-B', mhs: 'mhs3', nilai: 75, final: 0 },
];

const SERVICE_CLIENT = {
  client_id: process.env.SERVICE_CLIENT_ID || 'service-nilai',
  secret: process.env.SERVICE_CLIENT_SECRET || 'ganti-secret-service',
  name: 'Service Nilai',
};

db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const run = db.transaction(() => {
  for (const t of ['audit_log', 'refresh_tokens', 'transkrip', 'nilai', 'kelas', 'devices', 'service_clients', 'users']) {
    db.prepare(`DELETE FROM ${t}`).run();
  }
  db.prepare('DELETE FROM sqlite_sequence').run();

  const insUser = db.prepare('INSERT INTO users (username, password_hash, role, nim, nama) VALUES (?,?,?,?,?)');
  const insDev = db.prepare('INSERT INTO devices (user_id, device_id) VALUES (?,?)');
  const userId = {};
  for (const u of USERS) {
    const { lastInsertRowid } = insUser.run(u.username, hash(u.password), u.role, u.nim, u.nama);
    userId[u.username] = Number(lastInsertRowid);
    insDev.run(userId[u.username], u.device);
  }

  const insKelas = db.prepare('INSERT INTO kelas (kode, nama_matkul, dosen_id) VALUES (?,?,?)');
  const kelasId = {};
  for (const k of KELAS) {
    kelasId[k.kode] = Number(insKelas.run(k.kode, k.nama_matkul, userId[k.dosen]).lastInsertRowid);
  }

  const insNilai = db.prepare('INSERT INTO nilai (kelas_id, mahasiswa_id, nilai_angka, is_final) VALUES (?,?,?,?)');
  const insTrans = db.prepare('INSERT INTO transkrip (nim, kelas_id, nilai_angka) VALUES (?,?,?)');
  const nimOf = Object.fromEntries(USERS.map((u) => [u.username, u.nim]));
  for (const n of NILAI) {
    insNilai.run(kelasId[n.kelas], userId[n.mhs], n.nilai, n.final);
    if (n.final) insTrans.run(nimOf[n.mhs], kelasId[n.kelas], n.nilai);
  }

  db.prepare('INSERT INTO service_clients (client_id, client_secret_hash, name) VALUES (?,?,?)')
    .run(SERVICE_CLIENT.client_id, hash(SERVICE_CLIENT.secret), SERVICE_CLIENT.name);
});

run();

console.log(`Seed selesai -> ${dbPath}\n`);
console.log('Akun (username / password / device ID):');
for (const u of USERS) {
  console.log(`  ${u.role.padEnd(10)} ${u.username.padEnd(8)} ${u.password.padEnd(9)} ${u.device}${u.nim ? '  (NIM ' + u.nim + ')' : ''}`);
}
console.log(`\nService client: ${SERVICE_CLIENT.client_id} / ${SERVICE_CLIENT.secret}`);
console.log('Kelas:', KELAS.map((k) => `${k.kode} (${k.dosen})`).join(', '));
for (const t of ['users', 'devices', 'kelas', 'nilai', 'transkrip', 'service_clients']) {
  console.log(`  ${t}: ${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c} baris`);
}
db.close();