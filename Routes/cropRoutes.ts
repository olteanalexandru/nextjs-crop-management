export {};
const express = require('express')
const router = express.Router()
const { getCrop,SetCrop,PutCrop,DeleteCrop , getAllCrops , GetSpecific ,SetSelectare} = require ('../Controllers/cropController') 
const { protect } = require('../Middleware/authMiddleware')




router.route('/').get(protect,getCrop).post(protect,SetCrop) 
router.route('/crops').get(getAllCrops)
router.route('/crops/:id').get(GetSpecific).post(protect,SetSelectare).put(protect,PutCrop).put(protect,SetSelectare)
router.route('/:id').put(protect,PutCrop).delete(protect,DeleteCrop)

module.exports = router ; 