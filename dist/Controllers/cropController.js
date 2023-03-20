"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto try catch
const asyncHandler = require('express-async-handler');
const Crop = require('../models/cropModel');
const User = require('../models/userModel');
//@route GET /api/crops
//@acces Private
const getCrop = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ user: req.user.id });
    res.status(200).json(crops);
    //res.status(200).json({message:'Get Crops'})
});
//@route GET /api/crops/crops
//@acces Public
const getAllCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ title: req.body.title });
    res.status(200).json(crops);
});
//@route GET /api/crops/crops/:id
//@acces Public
const GetSpecific = asyncHandler(async (req, res) => {
    const crops = await Crop.findById(req.params.id);
    res.status(200).json(crops);
    //res.status(200).json({message:'Get Crops'})
});
//@route SET /api/crops
//@acces Private
const SetCrop = asyncHandler(async (req, res) => {
    if (!req.body.titlu) {
        res.status(400);
        throw new Error('Lipsa titlu');
    }
    ;
    if (!req.body.image) {
        res.status(400);
        throw new Error('Lipsa imagine');
    }
    ;
    //upload.single("articleImage");
    const crop = await Crop.create({
        user: req.user.id,
        titlu: req.body.titlu,
        text: req.body.text,
        descriere: req.body.descriere,
        image: JSON.stringify(req.body.image),
    });
    res.status(200).json(crop);
});
//@route /api/crops/crops/:id
//@acces Private
const SetSelectare = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
        res.status(400);
        throw new Error('Nu a fost gasit documentul');
    }
    if (!req.body.selectare) {
        res.status(400);
        throw new Error('Lipsa date selectare');
    }
    ;
    if (!req.user) {
        res.status(400);
        throw new Error('Trebuie sa fi logat');
    }
    ;
    const selectareCrop = await Crop.findByIdAndUpdate(req.params.id, {
        selectare: req.body.selectare,
        selectareBy: req.body._id
    });
    res.status(200).json(selectareCrop);
});
//@route PUT /api/crops
//@acces Private
const PutCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
        res.status(400);
        throw new Error('Locuinta nu a fost gasita');
    }
    //check for user
    if (!req.user) {
        res.status(401);
        throw new Error('Userul nu a fost gasit');
    }
    //must match logged user with crop user
    if (crop.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User neautorizat');
    }
    const updatedCrop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json(updatedCrop);
});
//@route DELETE /api/crops
//@acces Private
const DeleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
        res.status(400);
        throw new Error('Crop not Found');
    }
    //check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    //must match logged user with crop user
    if (crop.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }
    await crop.remove();
    res.status(200).json({ id: req.params.id });
});
module.exports = {
    getCrop,
    getAllCrops,
    SetCrop,
    PutCrop,
    DeleteCrop,
    GetSpecific,
    SetSelectare
};
