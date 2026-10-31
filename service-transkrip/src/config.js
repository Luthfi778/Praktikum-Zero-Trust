const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env')});
module.exports={PORT:Number(process.env.SERVICE_TRANSKRIP_PORT||3002),JWT_SECRET:process.env.JWT_SECRET,GATEWAY_SECRET:process.env.GATEWAY_SECRET};
