const asyncHandler = require('express-async-handler')
const Crop = require('../Models/cropModel')
const  Rotation  = require('../Models/rotationModel');
const User = require('../models/userModel');
import { CustomRequest, Crop, Response, CropRotationInput , CropRotationItem } from './interfaces/CropInterfaces';



//@route POST /api/crops/recommendations
//@acces Admin
const usedCropsInYear: Map<number, Set<string>> = new Map();
async function cropIsAvailable(crop: Crop, year: number, lastUsedYear: Map<number, Map<Crop, number>>, division: number, userId: string, maxRepetitions: number): Promise<boolean> {
  const divisionLastUsedYear = lastUsedYear.get(division) || new Map<Crop, number>();
  
  const lastUsed = divisionLastUsedYear.get(crop) || 0;

  // Fetch user
  const user = await User.findById(userId);

  // Check selectareCounts for crop selection count
  if (year - lastUsed <= crop.ItShouldNotBeRepeatedForXYears && ((user.selectareCounts[crop._id] || 0) <= maxRepetitions || maxRepetitions < 1)) {
    return false;
  }

  // Check if crop was used in the same year
  if (usedCropsInYear.get(year)?.has(crop._id) ) {
    return false;
  }

  return true;
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
  
    function hasSharedDiseases(crop1: Crop, crop2: Crop): boolean {
      return crop1.diseases.some((disease) => crop2.diseases.includes(disease));
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
          let crop;
          for (const c of sortedCrops) {
            const isAvailable = await cropIsAvailable(c, year, lastUsedYear, division, req.user.id, req.user.numSelections);
            if (!hasSharedPests(c, prevCrop) && !hasSharedDiseases(c, prevCrop) && isAvailable) {
              crop = c;
              break;
            }
          }
    
          if (!crop) {
            continue; // Skip to next division if no crop is available
          }
  
          if (crop) {
            lastUsedYear.get(division)?.set(crop, year);
  usedCropsInYear.get(year)?.add(crop._id) || usedCropsInYear.set(year, new Set([crop._id]));
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
  
          if (cropIsAvailable(crop, year, lastUsedYear, division, req.user.id, req.user.numSelections)) {
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
    
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Increment the count of each crop in the user's selectareCounts
    input.crops.forEach(crop => {
      user.selectareCounts[crop._id] = (user.selectareCounts[crop._id] || 0) + 1;
    });
    await user.save();
  
    const updatePromises = cropsToUpdate.map((crop) => {
      const totalNitrogen = crop.nitrogenSupply + (crop.soilResidualNitrogen || 0);
      const nitrogenPerDivision = totalNitrogen / numberOfDivisions;
      const nitrogenBalance = calculateNitrogenBalance(crop, nitrogenPerDivision, crop.soilResidualNitrogen || 0);
      crop.soilResidualNitrogen = nitrogenBalance;
      return crop.save();
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
    return nitrogenPerDivision - crop.nitrogenDemand + ( soilResidualNitrogen || 0);
  } 
  
  // @route PUT /api/crops/rotation/
  // @access Admin
  // @route PUT /api/crops/rotation/
  // @access Admin
  const updateNitrogenBalanceAndRegenerateRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { year, rotationName, division, nitrogenBalance } = req.body;
    
    // Find the rotation for the given id
    const rotation = await Rotation.findOne({ rotationName }).populate('crops');
  
    if (!rotation) {
      res.status(404);
      throw new Error('Rotation not found');
    }
  
    // Get the rotation plans for the specific year and the following years
    const relevantYearPlans = rotation.rotationPlan.filter(item => item.year >= year);
  
    if (!relevantYearPlans.length) {
      res.status(404);
      throw new Error('Year plan not found');
    }
  
    // Update the nitrogen balance for the division in each relevant year
    for (const yearPlan of relevantYearPlans) {
      // Find the division in the current year plan
      const relevantDivision = yearPlan.rotationItems.find(item => item.division === division);
  
      if (relevantDivision) {
        relevantDivision.nitrogenBalance += nitrogenBalance;
      }
    }
  
    // Find the division in the last year plan
    const lastYearPlan = relevantYearPlans[relevantYearPlans.length - 1];
    const lastYearDivision = lastYearPlan.rotationItems.find(item => item.division === division);
  
    if (lastYearDivision && lastYearDivision.crop) {
      // Find the crop and update its soilResidualNitrogen
      const crop = rotation.crops.find(crop => crop._id.toString() === lastYearDivision.crop.toString());
      if (crop) {
        crop.soilResidualNitrogen = lastYearDivision.nitrogenBalance;
        await crop.save();
      }
    }
  
    // save the updated rotation
    await rotation.save();
  
    res.status(200).json({
      status: 'success',
      data: {
        rotation
      }
    });
  });
  
  
  
  // @desc    Get crop rotation by user 
  // @route   GET /api/crops/rotation
  // @access  Private
  const getCropRotation = asyncHandler(async (req: CustomRequest, res: Response) => {
    const cropRotation = await Rotation.find({ user: req.user._id }).sort({ createdAt: -1 });
    if (cropRotation && cropRotation.length > 0) {
      res.json(cropRotation);
    } else {
      res.status(204);
      res.json('Nu s-a gasit nici o rotatie de culturi pentru acest utilizator');
    } 
  
  
  
  
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
    generateCropRotation,
    getCropRotation,
    deleteCropRotation,
    updateNitrogenBalanceAndRegenerateRotation,
  };