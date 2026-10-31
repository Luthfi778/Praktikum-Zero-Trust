const express=require('express');
const c=require('../controllers/kelas.controller');
const router=express.Router();
router.post('/:id/finalisasi',c.finalize);
module.exports=router;
