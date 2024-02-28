export {};
const express = require('express')
const router = express.Router()
const { protect } = require('../Middleware/authMiddleware')
import cropController from '../Controllers/cropController';
import rotationController from '../Controllers/rotationController';
const cropControllerClass = new cropController();
const rotationControllerClass = new rotationController();

router.route('/').get(protect, cropControllerClass.getCrop).post(protect, cropControllerClass.setCrop).put(protect, cropControllerClass.setCrop)
router.route('/crops').get(cropControllerClass.getAllCrops)
router.route('/cropSelect/:id').post(protect, cropControllerClass.setSelectare).put(protect, cropControllerClass.setSelectare)
router.route('/cropRecommendations').get(protect, cropControllerClass.getCropRecommendations).put(protect, cropControllerClass.addCropRecommendation)
router.route('/cropRotation').post(protect, rotationControllerClass.generateCropRotation).get(protect, rotationControllerClass.getCropRotation).put(protect, rotationControllerClass.updateNitrogenBalanceAndRegenerateRotation)
router.route('/cropRotation/fields').put(protect, rotationControllerClass.updateDivisionSizeAndRedistribute)
router.route('/cropRotation/:id').get(protect, rotationControllerClass.getCropRotation)
router.route('/crops/:id').put(protect, cropControllerClass.setCrop)
router.route('/:id').delete(protect, cropControllerClass.deleteCrop).get( cropControllerClass.getSpecificCrop)

export default router;