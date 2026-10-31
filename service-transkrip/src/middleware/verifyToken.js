const jwt=require('jsonwebtoken');
const config=require('../config');
module.exports=function verifyToken(req,res,next){
 const match=(req.get('Authorization')||'').match(/^Bearer\s+(.+)$/i);
 if(!match)return res.status(401).json({error:'Bearer token wajib disertakan'});
 try{req.auth=jwt.verify(match[1],config.JWT_SECRET);next();}catch(e){return res.status(401).json({error:'Token tidak valid atau kedaluwarsa'});}
};
