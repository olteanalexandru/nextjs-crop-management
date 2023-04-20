const asyncHandler = require('express-async-handler')
const Crop = require('../models/cropModel')
const Rotation = require('../models/rotationModel')
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';


interface Response {
    status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any } }
}

interface Crop {
  cropName: string;
  cropType: string;
  cropVariety: string;
  plantingDate: string;
  harvestingDate: string;
  description: string;
  selectare?: boolean;
  imageUrl?: string;
  soilType: string;
  climate: string;
  ItShouldNotBeRepeatedForXYears: number;
  _id: string;
  pests?: string[];
  diseases?: string[];
  doNotRepeatForXYears: number;
  fertilizers?: string[];
}

  
  interface CropRotationItem {
    division: number;
    crop: Crop;
    plantingDate: string;
    harvestingDate: string;
    divisionSize: number;
  }
  
  interface CustomRequest extends Request {
    user: {
      id: number;
      rol: string;
    };
    body: Crop;
    params: {
      id: string;
    };
  }
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
const SetCrop =  asyncHandler( async  (req: CustomRequest, res: Response) => {
    if (!req.body.cropName){
    res.status(400)
    throw new Error('Lipsa nume cultură')
    
};

const crop = await Crop.create({ 
  user: req.user.id,
  cropName: req.body.cropName,
  cropType: req.body.cropType,
  cropVariety: req.body.cropVariety,
  plantingDate: req.body.plantingDate,
  harvestingDate: req.body.harvestingDate,
  description: req.body.description,
  imageUrl: JSON.stringify(req.body.imageUrl),
  soilType: req.body.soilType,
  climate: req.body.climate,
  ItShouldNotBeRepeatedForXYears: req.body.ItShouldNotBeRepeatedForXYears,
  fertilizers: req.body.fertilizers,
  pests: req.body.pests,
  diseases: req.body.diseases
});
res.status(200).json(crop);
})


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


function getCropRotation(
  crops: Crop[],
  fieldSize: number,
  numberOfDivisions: number,
  maxYears = 6
): Record<number, CropRotationItem[]> {
// Ensure the crops array is not empty
if (!crops || crops.length === 0) {
  throw new Error('No crops provided');
}

const divisionSize = fieldSize / numberOfDivisions;

const rotationPlan: Record<number, CropRotationItem[]> = {};

for (let year = 1; year <= maxYears; year++) {
  rotationPlan[year] = [];

  // Calculate crop rotation for each division
  for (let division = 1; division <= numberOfDivisions; division++) {
    const cropIndex = (division + year - 2) % crops.length;
    const crop = crops[cropIndex];

    // Check if the crop should not be repeated for X years
    if (year > crop.ItShouldNotBeRepeatedForXYears) {
      const plantingDate = new Date(crop.plantingDate);
      plantingDate.setFullYear(plantingDate.getFullYear() + year - 1);

      const harvestingDate = new Date(crop.harvestingDate);
      harvestingDate.setFullYear(harvestingDate.getFullYear() + year - 1);

      rotationPlan[year].push({
        division,
        crop,
        plantingDate: plantingDate.toISOString().substring(0, 10),
        harvestingDate: harvestingDate.toISOString().substring(0, 10),
        divisionSize,
      });
    }
  }
}

return rotationPlan;
}
const generateRotation = async (req, res) => {
  try {
    const { fieldSize, numberOfDivisions } = req.body;

    const user = req.user._id;

    // Fetch all crops for the current user
    const crops = await Crop.find({ user });

    if (!crops || crops.length === 0) {
      return res.status(404).json({ message: 'Nici o cultura gasita' });
    }

    const rotationPlan = getCropRotation(crops, fieldSize, numberOfDivisions);

    // Save the rotation plan to the database
    const newRotation = new Rotation({
      user,
      fieldSize,
      numberOfDivisions,
      crops: crops.map((crop) => crop._id),
    });

    await newRotation.save();

    res.status(201).json(rotationPlan);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la generarea rotatiei' });
  }
};

module.exports = {
  generateRotation,
    getCrop,
    getAllCrops,
    SetCrop,
    PutCrop,
    DeleteCrop,
    GetSpecific,
    SetSelectare,
    getCropRotation

}


