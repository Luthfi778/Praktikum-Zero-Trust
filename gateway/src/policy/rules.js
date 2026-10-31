const { db } = require('../../../db/connection');
const ctx = require('./context');
function evaluateRule(req) {
  const { method, path } = req;
  const auth = req.auth || {};
  const userId = Number(auth.sub);
  if (auth.typ === 'service') {
    if (method === 'POST' && path === '/transkrip/sinkron') return { allow: true, reason: 'Token service valid untuk sinkronisasi transkrip' };
    return { allow: false, reason: 'Token service hanya boleh mengakses sinkronisasi transkrip' };
  }
  if (auth.typ !== 'user') return { allow: false, reason: 'Token pengguna diperlukan' };
  if (method === 'GET' && path === '/nilai') {
    if (['mahasiswa', 'dosen'].includes(auth.role)) return { allow: true, reason: 'Role diizinkan membaca nilai; data dibatasi di Service Nilai' };
    return { allow: false, reason: 'Role tidak diizinkan membaca nilai' };
  }
  let m = path.match(/^\/nilai\/(\d+)$/);
  if (method === 'PUT' && m) {
    if (auth.role !== 'dosen') return { allow: false, reason: 'Hanya dosen boleh mengubah nilai' };
    const grade = ctx.gradeInfo(Number(m[1]));
    if (!grade) return { allow: false, reason: 'Data nilai tidak ditemukan' };
    if (grade.dosen_id !== userId) return { allow: false, reason: 'Dosen bukan pengampu kelas ini' };
    if (grade.is_final) return { allow: false, reason: 'Nilai sudah difinalisasi dan tidak dapat diubah' };
    if (!ctx.isWithinAccessHours()) return { allow: false, reason: 'Perubahan nilai hanya diizinkan pukul 07.00–21.00' };
    return { allow: true, reason: 'Dosen pengampu, nilai belum final, dan masih dalam jam akses' };
  }
  m = path.match(/^\/kelas\/(\d+)\/finalisasi$/);
  if (method === 'POST' && m) {
    if (auth.role !== 'dosen') return { allow: false, reason: 'Hanya dosen boleh memfinalisasi nilai' };
    if (!ctx.classOwnedBy(Number(m[1]), userId)) return { allow: false, reason: 'Dosen bukan pengampu kelas ini' };
    if (!ctx.isWithinAccessHours()) return { allow: false, reason: 'Finalisasi hanya diizinkan pukul 07.00–21.00' };
    return { allow: true, reason: 'Dosen pengampu dan masih dalam jam akses' };
  }
  m = path.match(/^\/transkrip\/([^/]+)$/);
  if (method === 'GET' && m) {
    if (auth.role === 'admin') return { allow: true, reason: 'Admin diizinkan melihat seluruh transkrip' };
    if (auth.role === 'mahasiswa') {
      const own = db.prepare('SELECT nim FROM users WHERE id=?').get(userId);
      if (own && own.nim === decodeURIComponent(m[1])) return { allow: true, reason: 'Mahasiswa hanya mengakses transkrip miliknya' };
      return { allow: false, reason: 'Mahasiswa tidak boleh melihat transkrip mahasiswa lain' };
    }
    return { allow: false, reason: 'Role tidak diizinkan melihat transkrip' };
  }
  return { allow: false, reason: 'Endpoint atau metode tidak diizinkan oleh policy' };
}
module.exports = { evaluateRule };
