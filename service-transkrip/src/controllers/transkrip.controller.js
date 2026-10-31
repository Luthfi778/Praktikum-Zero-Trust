const {db}=require('../../../db/connection');
function getByNim(req,res){
 const nim=req.params.nim;
 const rows=db.prepare(`SELECT t.nim,k.kode,k.nama_matkul,t.nilai_angka,t.synced_at FROM transkrip t JOIN kelas k ON k.id=t.kelas_id WHERE t.nim=? ORDER BY k.kode`).all(nim);
 res.json({nim,data:rows});
}
function sync(req,res){
 if(req.auth.role!=='service'||req.auth.typ!=='service')return res.status(403).json({error:'Hanya token service yang boleh sinkronisasi transkrip'});
 const items=req.body.items;
 if(!Array.isArray(items)||items.length===0)return res.status(400).json({error:'items harus berupa array yang tidak kosong'});
 const upsert=db.prepare(`INSERT INTO transkrip (nim,kelas_id,nilai_angka,synced_at) VALUES (?,?,?,datetime('now')) ON CONFLICT(nim,kelas_id) DO UPDATE SET nilai_angka=excluded.nilai_angka,synced_at=datetime('now')`);
 const tx=db.transaction(()=>{for(const item of items){if(!item.nim||!Number.isInteger(Number(item.kelas_id))||!Number.isFinite(Number(item.nilai_angka)))throw new Error('Format item transkrip tidak valid');upsert.run(item.nim,Number(item.kelas_id),Number(item.nilai_angka));}});
 try{tx();res.json({message:'Transkrip berhasil disinkronkan',jumlah:items.length});}catch(e){res.status(400).json({error:e.message});}
}
module.exports={getByNim,sync};
