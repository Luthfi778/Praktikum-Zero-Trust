const { evaluateRule } = require('./rules');
const { deviceRegistered } = require('./context');
function evaluate(req) {
  if (req.auth && req.auth.typ === 'user') {
    const id = Number(req.auth.sub);
    if (!deviceRegistered(id, req.get('X-Device-ID'))) return { allow: false, reason: 'Device tidak terdaftar untuk pengguna ini' };
  }
  return evaluateRule({ method: req.method, path: (req.originalUrl || req.path).split('?')[0], auth: req.auth });
}
module.exports = { evaluate };
