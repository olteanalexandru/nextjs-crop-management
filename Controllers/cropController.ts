const asyncHandler = require('express-async-handler')
const Crop = require('../models/cropModel')
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';


interface Response {
    status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any } }
}

interface CustomRequest extends Request {
    user: {
      id: number;
      rol: string;
    };

    body: {
      cropName: string;
      cropType: string;
      cropVariety: string;
      plantingDate: string;
      harvestingDate: string;
      description: string;
      selectare: boolean;
      imageUrl: string;
      soilType: string;
      climate: string;
      _id: string;
    };
    params: ParamsDictionary & {
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
    imageUrl:JSON.stringify(req.body.imageUrl),
    soilType: req.body.soilType,
    climate: req.body.climate,
})
res.status(200).json(crop)
})


//@route /api/crops/crops/:id
//@acces Private
const SetSelectare = asyncHandler(async (req: CustomRequest, res: Response) => {
     const crop = await Crop.findById(req.params.id)
if (!crop){
       res.status(400)
      throw new Error('Nu a fost gasit documentul')}
    
   if (!req.body.selectare){
         res.status(400)
        throw new Error('Lipsa date selectare') };

         if (!req.user){
           res.status(400)
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

module.exports = {
    getCrop,
    getAllCrops,
    SetCrop,
    PutCrop,
    DeleteCrop,
    GetSpecific,
    SetSelectare

}


