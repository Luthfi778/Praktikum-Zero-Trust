const config = require('../config');
function isWithinAccessHours(date = new Date()) {
  const hour = date.getHours();
  return hour >= config.ACCESS_HOUR_START && hour < config.ACCESS_HOUR_END;
}
module.exports = { isWithinAccessHours };
