const policy = require('../policy/policy');
const audit = require('../services/auditService');
module.exports = function enforce(req, res, next) {
  const decision = policy.evaluate(req);
  const subject = req.auth.typ === 'service' ? `service:${req.auth.sub}` : (req.auth.username || req.auth.sub);
  audit.writeAudit({ subject, method: req.method, endpoint: req.originalUrl, device: req.get('X-Device-ID'), result: decision.allow ? 'allow' : 'deny', reason: decision.reason });
  if (!decision.allow) return res.status(403).json({ error: 'Akses ditolak', reason: decision.reason });
  req.policyReason = decision.reason;
  next();
};
