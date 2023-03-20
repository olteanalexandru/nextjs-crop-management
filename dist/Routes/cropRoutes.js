"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const { getCrop, SetCrop, PutCrop, DeleteCrop, getAllCrops, GetSpecific, SetSelectare } = require('../controllers/cropController');
const { protect } = require('../Middleware/authMiddleware');
/*
router.get('/',(req,res)=> {
    res.status(200).json({message:'Get crop'})
}) <-- acestea se afla acum in controller */
/*
router.get('/',getCrop)
router.post('/',SetCrop)
router.put('/:id',PutCrop)
router.delete('/:id',DeleteCrop)   */
//creanUp
router.route('/').get(protect, getCrop).post(protect, SetCrop);
router.route('/crops').get(getAllCrops);
router.route('/crops/:id').get(GetSpecific).post(protect, SetSelectare).put(protect, PutCrop).put(protect, SetSelectare);
router.route('/:id').put(protect, PutCrop).delete(protect, DeleteCrop);
module.exports = router;
