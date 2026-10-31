const express=require('express');
const c=require('../controllers/nilai.controller');
const router=express.Router();
router.get('/',c.list);
router.put('/:id',c.update);
module.exports=router;
