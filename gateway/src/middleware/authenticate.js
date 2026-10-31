const tokens = require('../services/tokenService');
module.exports = function authenticate(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Bearer token wajib disertakan' });
  try {
    req.auth = tokens.verifyToken(match[1]);
    req.authToken = match[1];
    if (req.auth.typ === 'service' && req.auth.role !== 'service') return res.status(401).json({ error: 'Token service tidak valid' });
    if (req.auth.typ !== 'service' && req.auth.typ !== 'user') return res.status(401).json({ error: 'Jenis token tidak dikenal' });
    next();
  } catch (e) { return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' }); }
};
