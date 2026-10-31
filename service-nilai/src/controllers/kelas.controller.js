const { db } = require('../../../db/connection');
const transkripClient = require('../clients/transkripClient');
async function finalize(req,res) {
  const classId=Number(req.params.id);
  const kelas=db.prepare('SELECT * FROM kelas WHERE id=?').get(classId);
  if(!kelas) return res.status(404).json({error:'Kelas tidak ditemukan'});
  const rows=db.prepare(`SELECT n.id,u.nim,n.nilai_angka FROM nilai n JOIN users u ON u.id=n.mahasiswa_id WHERE n.kelas_id=?`).all(classId);
  if(rows.some(r=>r.nilai_angka===null)) return res.status(400).json({error:'Semua nilai harus diisi sebelum finalisasi'});
  const tx=db.transaction(()=>{
    db.prepare('UPDATE nilai SET is_final=1 WHERE kelas_id=?').run(classId);
  });
  tx();
  try {
    const sync=await transkripClient.sync(rows.map(r=>({nim:r.nim,kelas_id:classId,nilai_angka:r.nilai_angka})));
    res.json({message:'Nilai berhasil difinalisasi dan disinkronkan ke transkrip',kelas:kelas.kode,jumlah:rows.length,sinkronisasi:sync});
  } catch(err) {
    console.error('Sinkron transkrip gagal:',err.message);
    res.status(502).json({error:'Nilai sudah difinalisasi, tetapi sinkronisasi transkrip gagal. Coba finalisasi ulang setelah memperbaiki koneksi.',detail:err.message});
  }
}
module.exports={finalize};
