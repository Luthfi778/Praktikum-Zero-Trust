const { db } = require('../../../db/connection');
module.exports = function deviceCheck(req, res, next) {
  if (req.auth && req.auth.typ === 'service') return next();
  const deviceId = req.get('X-Device-ID');
  if (!deviceId) return res.status(403).json({ error: 'Header X-Device-ID wajib disertakan' });
  const ok = db.prepare('SELECT 1 FROM devices WHERE user_id=? AND device_id=?').get(Number(req.auth.sub), deviceId);
  if (!ok) return res.status(403).json({ error: 'Device tidak terdaftar untuk pengguna ini' });
  next();
};
