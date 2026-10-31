const { db } = require('../../../db/connection');
function writeAudit({ subject, method, endpoint, device, result, reason }) {
  db.prepare(`INSERT INTO audit_log (waktu,subjek,method,endpoint,device,hasil,alasan) VALUES (datetime('now'),?,?,?,?,?,?)`)
    .run(subject || 'anonymous', method, endpoint, device || null, result, reason);
}
module.exports = { writeAudit };
