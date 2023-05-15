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



//@route PUT /api/crops/recommendations
//@acces Admin
const generateCropRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
  const input: CropRotationInput = req.body;
  
  const {
    rotationName,
    crops,
    fieldSize,
    numberOfDivisions,
    maxYears = 6,
  } = input;

  if (!crops || crops.length === 0) {
    res.status(400);
    throw new Error('No crops provided');
  }

  const rotationPlan: Map<number, CropRotationItem[]> = new Map();
  const lastUsedYear: Map<string, number> = new Map();
  crops.forEach(crop => {
    lastUsedYear.set(crop._id, 0 - crop.ItShouldNotBeRepeatedForXYears);
  });

  function hasSharedPests(crop1: Crop, crop2: Crop): boolean {
    return crop1.pests.some((pest) => crop2.pests.includes(pest));
  }

  for (let year = 1; year <= maxYears; year++) {
    for (let division = 1; division <= numberOfDivisions; division++) {
      const prevCrop = rotationPlan.get(year - 1)?.find((item) => item.division === division)?.crop;

      const cropIsAvailable = (crop: Crop, division: number) => {
        const lastUsed = lastUsedYear.get(crop._id) || 0;
        const notRepeated = year - lastUsed >= crop.ItShouldNotBeRepeatedForXYears;
        
        let notSameDivisionInCurrentYear = true;
        let notUsedInPreviousXYears = true;
        
        for (let y = year; y > year - crop.ItShouldNotBeRepeatedForXYears && y > 0; y--) {
            if (rotationPlan.get(y)?.some(item => item.division === division && item.crop._id === crop._id)) {
                notSameDivisionInCurrentYear = false;
            }
            if (rotationPlan.get(y)?.some(item => item.crop._id === crop._id)) {
                notUsedInPreviousXYears = false;
            }
        }
    
        // console.log('Crop:', crop.cropName);
        // console.log('Not repeated:', notRepeated);
        // console.log('Not same division in current year:', notSameDivisionInCurrentYear);
        // console.log('Not used in previous X years:', notUsedInPreviousXYears);
      
        return notRepeated && notSameDivisionInCurrentYear && notUsedInPreviousXYears;
    };

      let crop = null;
      if (prevCrop) {
        const totalNitrogen = prevCrop.nitrogenSupply + ( prevCrop.soilResidualNitrogen || 0) ;
        const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
        const divisionSize = fieldSize / numberOfDivisions; 
        const sortedCrops = sortCropsByNitrogenBalance(crops, nitrogenPerDivision, ( prevCrop.soilResidualNitrogen || 0));
        crop = sortedCrops.find((c) => !hasSharedPests(c, prevCrop) && cropIsAvailable(c, division)) || sortedCrops.find(c => cropIsAvailable(c, division)) || sortedCrops[0];
      } else {
        let cropIndex = (division + year - 2) % crops.length;
        crop = crops[cropIndex];
        let counter = 0;
        while (!cropIsAvailable(crop, division) && counter < crops.length) {
          cropIndex = (cropIndex + 1) % crops.length;
          crop = crops[cropIndex];
          counter++;
        }
        if (counter === crops.length) {
          // All crops have been checked and none are available.
          crop = null;
        }
      }

      if (crop) {
        lastUsedYear.set(crop._id, year);
        const plantingDate = new Date(crop.plantingDate);
        plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);
      
        const harvestingDate = new Date(crop.harvestingDate);
        harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);
      
        const totalNitrogen = crop.nitrogenSupply + (crop.soilResidualNitrogen || 0);
        const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
        const divisionSize = fieldSize / numberOfDivisions;
        const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, (crop.soilResidualNitrogen || 0));
        if(cropIsAvailable(crop, division)) {
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
        rotationPlan.set(year, [...(rotationPlan.get(year) || []), {
          division,
          crop ,
          plantingDate: "n/a",
          harvestingDate: "n/a",
          divisionSize: 0,
          nitrogenBalance: 0,
        }]);
      }
    }
  }

  // Save rotation plan to the database
  const rotation = new Rotation({
    user: req.user.id,
    fieldSize,
    numberOfDivisions,
    rotationName : input.rotationName,
    crops: input.crops,
    rotationPlan: Array.from(rotationPlan.entries()).map(([year, rotationItems]) => ({ year, rotationItems })),
  });

  let createdRotation ;
  console.log("Before saving the rotation");
   try {
    
    createdRotation = await rotation.save();
    console.log("After saving the rotation");
  } catch (error) {
    console.error("Error while saving the rotation", error);
    res.status(500);
    throw new Error('Failed to save rotation');
  }
  console.log("Before updating crops");
  let cropsToUpdate ;
  try {
    cropsToUpdate = await Crop.find({ _id: { $in: input.crops } });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch crops');
  }

  // Update the soilResidualNitrogen for each crop
  const updatePromises = cropsToUpdate.map(async (crop) => {
    // Calculate the actual residual nitrogen value for the crop
    const totalNitrogen = crop.nitrogenSupply + (crop.soilResidualNitrogen || 0);
    const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
    const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, crop.soilResidualNitrogen || 0);
    crop.soilResidualNitrogen = nitrogenBalance;

    // Save the updated crop
    console.log("Before saving the crop");
    try {
      await crop.save();
      console.log("After saving the crop");
    } catch (error) {
      throw new Error('Failed to update crop');
    }
  });

  // Wait for all the update operations to complete
  await Promise.all(updatePromises);

  if (createdRotation) {
    res.status(201).json(createdRotation);
  } else {
    res.status(500);
    throw new Error('Failed to generate crop rotation');
  }
});

// Helper function to sort crops by nitrogen balance
function sortCropsByNitrogenBalance(crops: Crop[], nitrogenPerDivision: number, soilResidualNitrogen: number) {
  return crops.sort((a, b) => {
    const balanceA = calculateNitrogenBalance(a, nitrogenPerDivision, (soilResidualNitrogen || 0));
    const balanceB = calculateNitrogenBalance(b, nitrogenPerDivision, (soilResidualNitrogen || 0));
    return balanceA - balanceB;
  });
}

// Helper function to calculate nitrogen balance
function calculateNitrogenBalance(crop: Crop, nitrogenPerDivision: number, soilResidualNitrogen: number) {
  return crop.nitrogenDemand - nitrogenPerDivision - (soilResidualNitrogen || 0);
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

