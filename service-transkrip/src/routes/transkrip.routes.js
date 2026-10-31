const express=require('express');
const c=require('../controllers/transkrip.controller');
const router=express.Router();
router.get('/:nim',c.getByNim);
router.post('/sinkron',c.sync);
module.exports=router;
