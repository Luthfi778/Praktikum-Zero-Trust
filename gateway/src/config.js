const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
module.exports = {
  PORT: Number(process.env.GATEWAY_PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET,
  GATEWAY_SECRET: process.env.GATEWAY_SECRET,
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '10m',
  REFRESH_TOKEN_TTL_DAYS: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 1),
  SERVICE_TOKEN_TTL: process.env.SERVICE_TOKEN_TTL || '5m',
  ACCESS_HOUR_START: Number(process.env.ACCESS_HOUR_START ?? 7),
  ACCESS_HOUR_END: Number(process.env.ACCESS_HOUR_END ?? 21),
  SERVICE_NILAI_URL: process.env.SERVICE_NILAI_URL || 'http://localhost:3001',
  SERVICE_TRANSKRIP_URL: process.env.SERVICE_TRANSKRIP_URL || 'http://localhost:3002',
  SERVICE_CLIENT_ID: process.env.SERVICE_CLIENT_ID || 'service-nilai',
};
