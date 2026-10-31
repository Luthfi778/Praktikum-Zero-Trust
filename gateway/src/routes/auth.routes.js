const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../../../db/connection');
const config = require('../config');
const tokens = require('../services/tokenService');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const deviceId = req.get('X-Device-ID');
  if (!username || !password || !deviceId) return res.status(400).json({ error: 'username, password, dan X-Device-ID wajib diisi' });
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Kredensial tidak valid' });
  const device = db.prepare('SELECT 1 FROM devices WHERE user_id=? AND device_id=?').get(user.id, deviceId);
  if (!device) return res.status(403).json({ error: 'Device tidak terdaftar untuk pengguna ini' });
  const safeUser = { id: user.id, username: user.username, role: user.role, nim: user.nim, nama: user.nama };
  return res.json({ message: 'Login berhasil', user: safeUser, accessToken: tokens.signAccessToken(safeUser), refreshToken: tokens.createRefreshToken(user.id), expiresIn: config.ACCESS_TOKEN_TTL });
});

router.post('/refresh', (req, res) => {
  const token = req.body && req.body.refreshToken;
  if (!token) return res.status(400).json({ error: 'refreshToken wajib diisi' });
  const result = tokens.rotateRefreshToken(token);
  if (!result) return res.status(401).json({ error: 'Refresh token tidak valid, kedaluwarsa, atau sudah dicabut' });
  res.json({ message: 'Token berhasil diperbarui', accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: config.ACCESS_TOKEN_TTL });
});

router.post('/logout', (req, res) => {
  const token = req.body && req.body.refreshToken;
  if (!token) return res.status(400).json({ error: 'refreshToken wajib diisi' });
  const revoked = tokens.revokeRefreshToken(token);
  res.json({ message: revoked ? 'Logout berhasil; refresh token dicabut' : 'Token tidak ditemukan atau sudah dicabut' });
});

router.post('/service', (req, res) => {
  const { clientId, clientSecret } = req.body || {};
  if (!clientId || !clientSecret) return res.status(400).json({ error: 'clientId dan clientSecret wajib diisi' });
  const client = db.prepare('SELECT * FROM service_clients WHERE client_id=?').get(clientId);
  if (!client || !bcrypt.compareSync(clientSecret, client.client_secret_hash)) return res.status(401).json({ error: 'Kredensial service tidak valid' });
  res.json({ accessToken: tokens.signServiceToken(client.client_id), tokenType: 'Bearer', expiresIn: config.SERVICE_TOKEN_TTL });
});
module.exports = router;
