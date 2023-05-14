export {};
const express = require('express')
const router = express.Router()
const { getCrop,SetCrop,PutCrop,DeleteCrop , getAllCrops , GetSpecific ,SetSelectare, generateCropRotation, addCropRecommendation, getCropRecommendations,getCropRotation} = require ('../Controllers/cropController') 
const { protect } = require('../Middleware/authMiddleware')




router.route('/').get(protect,getCrop).post(protect,SetCrop).put(protect,SetCrop)
router.route('/crops').get(getAllCrops)
router.route('/cropRecommendations').get(protect,getCropRecommendations)
router.route('/cropRotation').post(protect,generateCropRotation).put(protect,addCropRecommendation).get(protect,getCropRotation)
router.route('/cropSelect/:id').post(protect,SetSelectare).put(protect,SetSelectare)
router.route('/crops/:id').put(protect,PutCrop)
router.route('/:id').delete(protect,DeleteCrop).get(GetSpecific)

module.exports = router ; 