const config = require('../config');
module.exports = function verifyGatewaySecret(req,res,next) {
  if (!config.GATEWAY_SECRET || req.get('X-Gateway-Secret') !== config.GATEWAY_SECRET) return res.status(403).json({ error:'Gateway secret tidak valid' });
  next();
};
