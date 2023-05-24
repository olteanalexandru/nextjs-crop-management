const asyncHandler = require('express-async-handler')
const Crop = require('../Models/cropModel')
const  Rotation  = require('../Models/rotationModel');
const User = require('../models/userModel');
import { CustomRequest, Crop, Response } from './interfaces/CropInterfaces';


//@route GET /api/crops
//@acces Private
const getCrop= asyncHandler(async (req: CustomRequest ,res: Response) => {
    const crops = await Crop.find({user: req.user._id})
    res.status(200).json(crops)
    //res.status(200).json({message:'Get Crops'})
})


//@route GET /api/crops/crops
//@acces Public

 const getAllCrops =  asyncHandler(async (req: CustomRequest ,res: Response) => {
 
  const crops = await Crop.find({});

  if (!crops) {
      res.status(404);
      throw new Error('Crop not found');
  }

  const filteredCrops = crops.filter((crop) =>
    crop.cropType && crop.cropVariety && crop.plantingDate && crop.harvestingDate && crop.soilType
  );

  res.status(200).json(filteredCrops);

});

//@route GET /api/crops/crops/:id
//@acces Public
const GetSpecific = asyncHandler(async (req: CustomRequest, res: Response) => {
    const crops = await Crop.findById( req.params.id );
    res.status(200).json(crops);
    //res.status(200).json({message:'Get Crops'})
});

//@route SET /api/crops
//@acces Private
const SetCrop = asyncHandler(async (req: CustomRequest, res: Response) => {
  if (!req.body.cropName) {
    res.status(400);
    throw new Error('Lipsa nume cultură');
  }

  
  const crop = await Crop.create({
    user: req.user._id,
    cropName: req.body.cropName,
    cropType: req.body.cropType,
    cropVariety: req.body.cropVariety,
    plantingDate: req.body.plantingDate,
    harvestingDate: req.body.harvestingDate,
    description: req.body.description ? req.body.description : undefined,
    imageUrl: req.body.imageUrl ? JSON.stringify(req.body.imageUrl) : undefined,
    soilType: req.body.soilType ? req.body.soilType : undefined,
    climate: req.body.climate ? req.body.climate : undefined,
    ItShouldNotBeRepeatedForXYears: req.body.ItShouldNotBeRepeatedForXYears,
    fertilizers: req.body.fertilizers ? req.body.fertilizers : undefined,
    pests: req.body.pests ? req.body.pests : undefined,
    diseases: req.body.diseases ? req.body.diseases : undefined,
    nitrogenSupply: req.body.nitrogenSupply,
    nitrogenDemand: req.body.nitrogenDemand,
    soilResidualNitrogen: req.body.soilResidualNitrogen,

  });
  res.status(200).json(crop);
});



//@route /api/crops/crops/:id
//@acces Private
const SetSelectare = asyncHandler(async (req: CustomRequest, res: Response) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) {
    res.status(403);
    throw new Error('Nu a fost gasit documentul');
  }

  if (req.body.selectare === undefined || req.body.numSelections === undefined) {
    res.status(400);
    throw new Error('Lipsa date selectare');
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Trebuie sa fi logat');
  }

  let selectare = req.body.selectare;
  let selectareBy = req.body._id;
  let numSelections = req.body.numSelections;

  // Fetch user
  const user = await User.findById(selectareBy);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!selectare) {
    // Deselecting
    selectare = false;
    selectareBy = null;
    // Remove crop id from user's selectedCrops
    user.selectedCrops = user.selectedCrops.filter(c => c.toString() !== req.params.id);
    user.selectareCount = (user.selectareCount || numSelections) - numSelections;
  } else {
    // Selecting
    // Increment selection count for the user
    user.selectareCount = (user.selectareCount || 0) + numSelections;
    // Add crop id to user's selectedCrops
    for (let i = 0; i < numSelections; i++) {
      if (!user.selectedCrops.includes(req.params.id)) {
        user.selectedCrops.push(req.params.id);
      }
    }
  }

  await user.save();

  const selectareCrop = await Crop.findByIdAndUpdate(req.params.id, {
    selectare: selectare,
    selectareBy: selectareBy
  });

  res.status(200).json(selectareCrop);
});


//@route PUT /api/crops
//@acces Private
const PutCrop = asyncHandler( async (req: CustomRequest, res: Response) => {

    const crop = await Crop.findById(req.params.id)

    if (!crop) {
        res.status(400)
        throw new Error('Cultura nu exista')
    }

    //check for user
    if (!req.user) {
        res.status(401)
        throw new Error('Userul nu a fost gasit')
    }
    //must match logged user with crop user
    if (crop.user.toString() === req.user._id || req.user.rol === 'Administrator' || crop.user.rol === 'Administrator' ) {

        await Crop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })

    } else {
        res.status(401)
        throw new Error('Userul nu este autorizatf')
    }
    const updatedCrop = await Crop.findById(req.params.id)

    res.status(200).json(updatedCrop)
})


//@route DELETE /api/crops
//@acces Private

const DeleteCrop =asyncHandler( async (req: CustomRequest ,res: Response) =>{

    const crop = await Crop.findById(req.params.id)

    if(!crop){
        res.status(400)
        throw new Error('Crop not Found')
    }
    //check for user
    if(!req.user) {
        res.status(401)
        throw new Error('User not found')
    }
    //must match logged user with crop user or be Administrator
    if (crop.user.toString() == req.user._id || req.user.rol == 'Administrator'){
     
     await crop.remove()
     res.status(200).json({message:'Crop removed'})
    } else {
        res.status(401)
        throw new Error('User not authorized')
    }
 
})

//@route PUT /api/crops/recommendations
//@acces Admin
const addCropRecommendation = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { cropName, nitrogenSupply, nitrogenDemand, pests, diseases } = req.body;

    // Try to find the crop with the given name
    let crop = await Crop.findOne({ cropName });
  
  
    // If crop doesn't exist, create a new one
    if (!crop) {
      crop = new Crop({
        user: req.user._id,
        cropName,
        nitrogenSupply,
        nitrogenDemand,
        pests,
        diseases,
      });
    } else {
      // If crop exists, update it with the new recommendations
      crop.nitrogenSupply = nitrogenSupply;
      crop.nitrogenDemand = nitrogenDemand;
      crop.pests = pests;
      crop.diseases = diseases;
    }

    if (!crop) {
      res.status(400);
      throw new Error('cv no mers');
    }

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (req.user.rol !== 'Administrator') {
      res.status(401);
      throw new Error('User not authorized');
    }
    // Save the new or updated crop
    const updatedCrop = await crop.save();
    // Return the new or updated crop
    res.status(200).json(updatedCrop);
  }
  );

//@route GET http://localhost:5000/api/crops/recommendations/

const getCropRecommendations = asyncHandler(async (req: CustomRequest, res: Response) => {
  const cropName = req.query.cropName;

  // Use regex for pattern match, case insensitive 
  const crop = await Crop.find({cropName:{ $regex: new RegExp(String(cropName)), $options: 'i' } });

  // If no crop is found, return an empty array
  if (!crop) {
    return res.status(200).json([]);
  }

  // Map over the results to return an array of crops with required fields
  const crops = crop.map(c => ({
    cropName: c.cropName,
    diseases: c.diseases,
    pests: c.pests,
    nitrogenSupply: c.nitrogenSupply,
    nitrogenDemand: c.nitrogenDemand
  }));
  res.status(200).json(crops);
});







module.exports = {
  getCrop,
  getAllCrops,
  SetCrop,
  PutCrop,
  DeleteCrop,
  GetSpecific,
  SetSelectare,
  addCropRecommendation,
  getCropRecommendations,

};
