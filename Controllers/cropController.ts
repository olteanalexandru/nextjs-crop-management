const asyncHandler = require('express-async-handler')
const Crop = require('../models/cropModel')
const Rotation = require('../models/rotationModel')
import { CustomRequest, Crop, Response, CropRotationInput , CropRotationItem } from './interfaces/CropInterfaces';


//@route GET /api/crops
//@acces Private
const getCrop= asyncHandler(async (req: CustomRequest ,res: Response) => {
    const crops = await Crop.find({user: req.user.id})
    res.status(200).json(crops)
    //res.status(200).json({message:'Get Crops'})
})


//@route GET /api/crops/crops
//@acces Public

const getAllCrops = asyncHandler(async (req: CustomRequest ,res: Response) => {
    const crops = await Crop.find({title:req.body.cropName})
    res.status(200).json(crops)
    
})

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
    user: req.user.id,
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
     const crop = await Crop.findById(req.params.id)
if (!crop){
       res.status(403)
      throw new Error('Nu a fost gasit documentul')}
    
   if (!req.body.selectare){
         res.status(400)
        throw new Error('Lipsa date selectare') };

         if (!req.user){
           res.status(401)
            throw new Error('Trebuie sa fi logat') };

  const selectareCrop = 
await Crop.findByIdAndUpdate(req.params.id ,  {
    selectare:req.body.selectare,
    selectareBy:req.body._id
 }
)

     res.status(200).json(selectareCrop)
});



//@route PUT /api/crops
//@acces Private
const PutCrop = asyncHandler( async (req: CustomRequest, res: Response) => {

    const crop = await Crop.findById(req.params.id)

    if (!crop) {
        res.status(400)
        throw new Error('Crop nu a fost gasit')
    }

    //check for user
    if (!req.user) {
        res.status(401)
        throw new Error('Userul nu a fost gasit')
    }
    //must match logged user with crop user
    if (crop.user.toString() === req.user.id || req.user.rol === 'Administrator') {

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
    if (crop.user.toString() == req.user.id || req.user.rol == 'Administrator'){
     
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
      cropName,
      nitrogenSupply,
      nitrogenDemand,
      pests,
      diseases
    });
  } else {
    // If crop exists, update it with the new recommendations
    crop.nitrogenSupply = nitrogenSupply;
    crop.nitrogenDemand = nitrogenDemand;
    crop.pests = pests;
    crop.diseases = diseases;
  }

  // Save the new or updated crop
  const updatedCrop = await crop.save();

  // Return the new or updated crop
  res.status(200).json(updatedCrop);
});

function calculateNitrogenBalance(crop, nitrogenPerDivision, prevCropResidualNitrogen) {
  // Calculate nitrogen balance
  const nitrogenBalance = crop.nitrogenSupply - crop.nitrogenDemand + nitrogenPerDivision - prevCropResidualNitrogen;

  // Return nitrogen balance
  return nitrogenBalance;
}


function sortCropsByNitrogenBalance(
  crops: Crop[],
  nitrogenPerDivision: number,
  prevCropResidualNitrogen: number
): Crop[] {
  return crops
    .map((crop) => ({
      ...crop,
      nitrogenBalance: calculateNitrogenBalance(crop, nitrogenPerDivision, prevCropResidualNitrogen),
    }))
    .sort((a, b) => b.nitrogenBalance - a.nitrogenBalance);
}

function getCropRotation(input: CropRotationInput): Record<number, CropRotationItem[]> {
  const {
    crops,
    fieldSize,
    numberOfDivisions,
    maxYears = 6,
    nitrogenSupply = 0,
    nitrogenDemand = 0,
    soilResidualNitrogen = 0,
  } = input;

  if (!crops || crops.length === 0) {
    throw new Error('Nu a fost furnizată nicio cultură');
  }

  const totalNitrogen = nitrogenSupply + soilResidualNitrogen;
  const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
  const divisionSize = fieldSize / numberOfDivisions; // Calculate divisionSize here
  const rotationPlan: Record<number, CropRotationItem[]> = {};

  // Helper function to check if two crops share pests
  function hasSharedPests(crop1: Crop, crop2: Crop): boolean {
    return crop1.pests.some((pest) => crop2.pests.includes(pest));
  }

  for (let year = 1; year <= maxYears; year++) {
    rotationPlan[year] = [];

    for (let division = 1; division <= numberOfDivisions; division++) {
      const prevCrop = rotationPlan[year - 1] && rotationPlan[year - 1].find((item) => item.division === division)?.crop;

      if (prevCrop) {
        const sortedCrops = sortCropsByNitrogenBalance(crops, nitrogenPerDivision, prevCrop.soilResidualNitrogen);
        const crop = sortedCrops.find((c) => !hasSharedPests(c, prevCrop)) || sortedCrops[0];

        if (year > crop.ItShouldNotBeRepeatedForXYears) {
          const plantingDate = new Date(crop.plantingDate);
          plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);

          const harvestingDate = new Date(crop.harvestingDate);
          harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);

          const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, prevCrop.soilResidualNitrogen);

          rotationPlan[year].push({
            division,
            crop,
            plantingDate: plantingDate.toISOString().substring(0, 10),
            harvestingDate: harvestingDate.toISOString().substring(0, 10),
            divisionSize,
            nitrogenBalance,
          });
        }
      } else {
        const cropIndex = (division + year - 2) % crops.length;
        const crop = crops[cropIndex];

        if (year > crop.ItShouldNotBeRepeatedForXYears) {
          const plantingDate = new Date(crop.plantingDate);
          plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);
          const harvestingDate = new Date(crop.harvestingDate);
          harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);

          const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, 0);

          rotationPlan[year].push({
            division,
            crop,
            plantingDate: plantingDate.toISOString().substring(0, 10),
            harvestingDate: harvestingDate.toISOString().substring(0, 10),
            divisionSize,
            nitrogenBalance,
          });
        }
      }
    }
  }

  return rotationPlan;
}

const generateRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    const { fieldSize, numberOfDivisions, rotationName, nitrogenSupply, nitrogenDemand, soilResidualNitrogen } = req.body;

    const user = req.user.id;

    const crops = await Crop.find({ user });

    if (!crops || crops.length === 0) {
      return res.status(404).json({ message: 'Nici o cultura gasita' });
    }
    if (!rotationName) {
      return res.status(400).json({ message: 'Lipsa nume rotatie' });
    }

    const rotationPlan = getCropRotation({
      crops,
      fieldSize,
      numberOfDivisions,
      maxYears: 6,
      nitrogenSupply,
      nitrogenDemand,
      soilResidualNitrogen,
    });

    const newRotation = new Rotation({
      user,
      fieldSize,
      rotationName,
      numberOfDivisions,
      crops: crops.map((crop) => crop._id),
    });

    await newRotation.save();

    res.status(201).json(rotationPlan);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la generarea rotatiei' });
  }
});

// Existing functions

module.exports = {
  getCrop,
  getAllCrops,
  SetCrop,
  PutCrop,
  DeleteCrop,
  GetSpecific,
  SetSelectare,
  generateRotation,
  addCropRecommendation,

};


