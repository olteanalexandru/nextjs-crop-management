export {};
const express = require('express')
const router = express.Router()
const { getCrop,SetCrop,PutCrop,DeleteCrop , getAllCrops , GetSpecific ,SetSelectare, addCropRecommendation, getCropRecommendations} = require ('../Controllers/cropController') 
const {updateNitrogenBalanceAndRegenerateRotation, generateCropRotation, getCropRotation, updateDivisionSizeAndRedistribute} = require('../Controllers/rotationController')
const { protect } = require('../Middleware/authMiddleware')




router.route('/').get(protect,getCrop).post(protect,SetCrop).put(protect,SetCrop)
router.route('/crops').get(getAllCrops)
router.route('/cropSelect/:id').post(protect,SetSelectare).put(protect,SetSelectare)
router.route('/cropRecommendations').get(protect,getCropRecommendations).put(protect,addCropRecommendation)
router.route('/cropRotation').post(protect,generateCropRotation).get(protect,getCropRotation).put(protect,updateNitrogenBalanceAndRegenerateRotation)
router.route('/cropRotation/fields').put(protect,updateDivisionSizeAndRedistribute)
router.route('/cropRotation/:id').get(protect,getCropRotation)
router.route('/crops/:id').put(protect,PutCrop)
router.route('/:id').delete(protect,DeleteCrop).get(GetSpecific)

module.exports = router ; 