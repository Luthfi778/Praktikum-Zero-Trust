const { db } = require('../../../db/connection');
function list(req,res) {
  const a=req.auth;
  let rows;
  if (a.role==='mahasiswa') rows=db.prepare(`SELECT n.id,k.kode,k.nama_matkul,n.nilai_angka,n.is_final FROM nilai n JOIN kelas k ON k.id=n.kelas_id WHERE n.mahasiswa_id=?`).all(Number(a.sub));
  else if (a.role==='dosen') rows=db.prepare(`SELECT n.id,k.kode,k.nama_matkul,u.username mahasiswa,n.nilai_angka,n.is_final FROM nilai n JOIN kelas k ON k.id=n.kelas_id JOIN users u ON u.id=n.mahasiswa_id WHERE k.dosen_id=?`).all(Number(a.sub));
  else return res.status(403).json({error:'Role tidak diizinkan'});
  res.json({data:rows});
}
function update(req,res) {
  const grade=db.prepare('SELECT * FROM nilai WHERE id=?').get(Number(req.params.id));
  if(!grade) return res.status(404).json({error:'Nilai tidak ditemukan'});
  if(grade.is_final) return res.status(409).json({error:'Nilai sudah final'});
  const score=Number(req.body.nilai);
  if(!Number.isFinite(score)||score<0||score>100) return res.status(400).json({error:'Nilai harus berupa angka 0 sampai 100'});
  db.prepare('UPDATE nilai SET nilai_angka=? WHERE id=?').run(score,grade.id);
  res.json({message:'Nilai berhasil diperbarui',id:grade.id,nilai:score});
}
module.exports={list,update};
