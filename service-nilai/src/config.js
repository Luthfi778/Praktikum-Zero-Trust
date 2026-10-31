const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
module.exports = {
  PORT: Number(process.env.SERVICE_NILAI_PORT || 3001),
  JWT_SECRET: process.env.JWT_SECRET,
  GATEWAY_SECRET: process.env.GATEWAY_SECRET,
  GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:3000',
  SERVICE_CLIENT_ID: process.env.SERVICE_CLIENT_ID || 'service-nilai',
  SERVICE_CLIENT_SECRET: process.env.SERVICE_CLIENT_SECRET,
};
