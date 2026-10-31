const { db } = require('../../../db/connection');
const { isWithinAccessHours } = require('../utils/time');
function deviceRegistered(userId, deviceId) {
  return !!db.prepare('SELECT 1 FROM devices WHERE user_id=? AND device_id=?').get(userId, deviceId);
}
function classOwnedBy(classId, userId) {
  return !!db.prepare('SELECT 1 FROM kelas WHERE id=? AND dosen_id=?').get(classId, userId);
}
function gradeInfo(gradeId) {
  return db.prepare(`SELECT n.id,n.is_final,n.kelas_id,k.dosen_id FROM nilai n JOIN kelas k ON k.id=n.kelas_id WHERE n.id=?`).get(gradeId);
}
module.exports = { deviceRegistered, classOwnedBy, gradeInfo, isWithinAccessHours };
