const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { db } = require('../../../db/connection');
const config = require('../config');

function signAccessToken(user) {
  return jwt.sign({ role: user.role, username: user.username, nim: user.nim || null, typ: 'user' }, config.JWT_SECRET, {
    subject: String(user.id), expiresIn: config.ACCESS_TOKEN_TTL,
  });
}
function signServiceToken(clientId) {
  return jwt.sign({ role: 'service', client_id: clientId, typ: 'service' }, config.JWT_SECRET, {
    subject: clientId, expiresIn: config.SERVICE_TOKEN_TTL,
  });
}
function verifyToken(token) { return jwt.verify(token, config.JWT_SECRET); }
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function createRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES (?, ?, ?, 0)')
    .run(userId, hashToken(token), expiresAt);
  return token;
}
function rotateRefreshToken(token) {
  const row = db.prepare(`SELECT rt.*, u.username, u.role, u.nim, u.nama
    FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id
    WHERE rt.token_hash=? AND rt.revoked=0 AND rt.expires_at > ?`).get(hashToken(token), new Date().toISOString());
  if (!row) return null;
  // One-time use: revoke old token before issuing a replacement.
  db.prepare('UPDATE refresh_tokens SET revoked=1 WHERE id=?').run(row.id);
  const user = { id: row.user_id, username: row.username, role: row.role, nim: row.nim, nama: row.nama };
  return { user, accessToken: signAccessToken(user), refreshToken: createRefreshToken(user.id) };
}
function revokeRefreshToken(token) {
  return db.prepare('UPDATE refresh_tokens SET revoked=1 WHERE token_hash=? AND revoked=0').run(hashToken(token)).changes > 0;
}
module.exports = { signAccessToken, signServiceToken, verifyToken, hashToken, createRefreshToken, rotateRefreshToken, revokeRefreshToken };
