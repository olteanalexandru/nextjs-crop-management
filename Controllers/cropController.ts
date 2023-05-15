const asyncHandler = require('express-async-handler')
const Crop = require('../Models/cropModel')
const  Rotation  = require('../Models/rotationModel');
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
  const crop = await Crop.findById(req.params.id);
  if (!crop) {
    res.status(403);
    throw new Error('Nu a fost gasit documentul');
  }
    
  if (req.body.selectare === undefined) {
    res.status(400);
    throw new Error('Lipsa date selectare');
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Trebuie sa fi logat');
  }

  let selectare = req.body.selectare;
  let selectareBy = req.body._id;

  if (!selectare) {
    // Deselecting
    selectare = false;
    selectareBy = null;
  }

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
    if (crop.user.toString() === req.user.id || req.user.rol === 'Administrator' || crop.user.rol === 'Administrator' ) {

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
        user: req.user.id,
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


function cropIsAvailable(crop: Crop, year: number, lastUsedYear: Map<number, Map<Crop, number>>, division: number): boolean {
  const divisionLastUsedYear = lastUsedYear.get(division) || new Map<Crop, number>();
  const lastUsed = divisionLastUsedYear.get(crop) || 0;
  return year - lastUsed > crop.ItShouldNotBeRepeatedForXYears;
}

//@route PUT /api/crops/recommendations
//@acces Admin
const generateCropRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
  const input: CropRotationInput = req.body;
  
  const {
    rotationName,
    crops,
    fieldSize,
    numberOfDivisions,
    maxYears ,
    ResidualNitrogenSupply = 50,

  } = input;

  if (!crops || crops.length === 0) {
    res.status(400);
    throw new Error('No crops provided');
  }

  const rotationPlan: Map<number, CropRotationItem[]> = new Map();
  const lastUsedYear: Map<number, Map<Crop, number>> = new Map();
  for (let division = 1; division <= numberOfDivisions; division++) {
    const divisionLastUsedYear: Map<Crop, number> = new Map();
    crops.forEach(crop => {
      divisionLastUsedYear.set(crop, 0 - crop.ItShouldNotBeRepeatedForXYears);
    });
    lastUsedYear.set(division, divisionLastUsedYear);
  }

  function hasSharedPests(crop1: Crop, crop2: Crop): boolean {
    return crop1.pests.some((pest) => crop2.pests.includes(pest));
  }

  for (let year = 1; year <= maxYears; year++) {
    let yearlyPlan = [];
    rotationPlan.set(year, yearlyPlan);

    for (let division = 1; division <= numberOfDivisions; division++) {
      const prevCrop = rotationPlan.get(year - 1)?.find((item) => item.division === division)?.crop;

      if (prevCrop) {
        const totalNitrogen = prevCrop.nitrogenSupply + (prevCrop.soilResidualNitrogen || 0);
        const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
        const divisionSize = fieldSize / numberOfDivisions;
        const sortedCrops = sortCropsByNitrogenBalance(crops, nitrogenPerDivision, (prevCrop.soilResidualNitrogen || 0));
        const crop = sortedCrops.find((c) => !hasSharedPests(c, prevCrop) && cropIsAvailable(c, year, lastUsedYear, division));

        if (crop) {
          lastUsedYear.get(division)?.set(crop, year);
          const plantingDate = new Date(crop.plantingDate);
          plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);

          const harvestingDate = new Date(crop.harvestingDate);
          harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);

          const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, (prevCrop.soilResidualNitrogen || ResidualNitrogenSupply));

          rotationPlan.set(year, [...(rotationPlan.get(year) || []), {
            division,
            crop,
            plantingDate: plantingDate.toISOString().substring(0, 10),
            harvestingDate: harvestingDate.toISOString().substring(0, 10),
            divisionSize,
            nitrogenBalance,
          }]);
        }
      } else {
        const cropIndex = (division + year - 2) % crops.length;
        const crop = crops[cropIndex];
        const totalNitrogen = crop.nitrogenSupply + (crop.soilResidualNitrogen || 0)
        const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
        const divisionSize = fieldSize / numberOfDivisions;

        if (cropIsAvailable(crop, year, lastUsedYear, division)) {
          lastUsedYear.get(division)?.set(crop, year);
          const plantingDate = new Date(crop.plantingDate);
          plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);
          const harvestingDate = new Date(crop.harvestingDate);
          harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);

          const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, 0);

          rotationPlan.set(year, [...(rotationPlan.get(year) || []), {
            division,
            crop,
            plantingDate: plantingDate.toISOString().substring(0, 10),
            harvestingDate: harvestingDate.toISOString().substring(0, 10),
            divisionSize,
            nitrogenBalance,
          }]);
        }
      }
    }
  }

  const rotation = new Rotation({
    user: req.user.id,
    fieldSize,
    numberOfDivisions,
    rotationName : input.rotationName,
    crops: input.crops,
    rotationPlan: Array.from(rotationPlan.entries()).map(([year, rotationItems]) => ({ year, rotationItems })),
  });

  const createdRotation = await rotation.save();

  const cropsToUpdate = await Crop.find({ _id: { $in: input.crops } });

  const updatePromises = cropsToUpdate.map(async (crop) => {
    const totalNitrogen = crop.nitrogenSupply + (crop.soilResidualNitrogen || 0);
    const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
    const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, crop.soilResidualNitrogen || 0);
    crop.soilResidualNitrogen = nitrogenBalance;
    await crop.save();
  });

  await Promise.all(updatePromises);

  if (createdRotation) {
    res.status(201).json(createdRotation);
  } else {
    res.status(500);
    throw new Error('Failed to generate crop rotation');
  }
});

function sortCropsByNitrogenBalance(crops: Crop[], nitrogenPerDivision: number, soilResidualNitrogen: number) {
  return crops.sort((a, b) => {
    const balanceA = calculateNitrogenBalance(a, nitrogenPerDivision, ( soilResidualNitrogen || 0));
    const balanceB = calculateNitrogenBalance(b, nitrogenPerDivision, ( soilResidualNitrogen || 0));
    return balanceA - balanceB;
  });
}

function calculateNitrogenBalance(crop: Crop, nitrogenPerDivision: number, soilResidualNitrogen: number) {
  return crop.nitrogenDemand - nitrogenPerDivision - ( soilResidualNitrogen || 0);
}

// @desc    Get crop rotation by user 
// @route   GET /api/crops/rotation
// @access  Private
const getCropRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
  const cropRotation = await Rotation.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(cropRotation);
});

const deleteCropRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
  const cropRotation = await Rotation.findById(req.params.id);

  if (cropRotation) {
    await cropRotation.remove();
    res.json({ message: 'Rotation removed' });
  } else {
    res.status(404);
    throw new Error('Rotation not found');
  }
});





module.exports = {
  getCrop,
  getAllCrops,
  SetCrop,
  PutCrop,
  DeleteCrop,
  GetSpecific,
  SetSelectare,
  generateCropRotation,
  addCropRecommendation,
  getCropRecommendations,
  getCropRotation,
  deleteCropRotation,

};
