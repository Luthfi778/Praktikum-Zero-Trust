const config = require('../config');
async function forward(req, res, next) {
  const path = (req.originalUrl || req.url).split('?')[0];
  let target;
  if (path === '/nilai' || path.startsWith('/nilai/')) target = config.SERVICE_NILAI_URL;
  else if (path === '/kelas' || path.startsWith('/kelas/')) target = config.SERVICE_NILAI_URL;
  else if (path === '/transkrip' || path.startsWith('/transkrip/')) target = config.SERVICE_TRANSKRIP_URL;
  else return next();
  try {
    const url = target + (req.originalUrl || req.url);
    const headers = { 'X-Gateway-Secret': config.GATEWAY_SECRET };
    for (const h of ['authorization', 'x-device-id', 'content-type']) {
      if (req.headers[h]) headers[h] = req.headers[h];
    }
    const options = { method: req.method, headers };
    if (!['GET', 'HEAD'].includes(req.method)) options.body = JSON.stringify(req.body || {});
    const response = await fetch(url, options);
    const text = await response.text();
    res.status(response.status);
    const type = response.headers.get('content-type');
    if (type) res.set('content-type', type);
    res.send(text);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Service tidak dapat dihubungi' });
  }
}
module.exports = forward;
