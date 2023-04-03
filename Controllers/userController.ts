export {};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
//Generate JWT Token
const generateToken = (id : string) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2d' });




interface Response {
     status: (arg0: number) => { (): any; new(): any; json: { (arg0:   { message: string; rol: any; _id: any; name: any; email: any; token: any; }): void; new(): any; }}
     
     json: (arg0: { rol: any; _id: any; name: any; email: any; token: any; }) => void;  }
     
interface Request {
    user: { id: string 
        message: string; 
        rol: string; 
        _id: string;
         name: string;
         email: string;
          token: string;},
    body: { rol: string;
        _id: string;
         name: string;
          email: string; 
          password: string; }
    params: { _id: string; }
}






//@desc register new users
//@route POST /api/users
//@acces Public
const registerUser = asyncHandler(async ( req: Request, res:Response) => {
    const { rol, name, email, password } = req.body;
    if (!rol || !name || !email || !password) {
        res.status(401);
        throw new Error('Toate campurile trebuie completate');
    }
    
    //check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(402);
        throw new Error('Userul exista deja!');
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //Create user
    const user = await User.create({
        rol,
        name,
        email,
        password: hashedPassword
    });
    if (user) {
        res.status(201).json({
            message: 'User Registered',
            rol: user.rol,
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    }
});
//@desc auth users
//@route POST /api/users/login
//@acces Public
const loginUser = asyncHandler(async (req: Request, res: Response)=> {
    const { email, password } = req.body;
    // Check for user email
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            rol: user.rol,
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid data');
    }
});
//@desc get  users data
//@route GET /api/users/me
//@acces Private
const getMe = asyncHandler(async (req: Request, res: Response ) => {
    res.status(200).json(req.user);
});
//@desc modificare date
//@route PUT /api/users
//@acces Private
//@Params _id
//@Body password

const PutUser = asyncHandler(async (req: Request, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {

    
    const {password} = req.body;
    if (!password) {
        res.status(401);
        throw new Error('Lipsa parola');
    }
    const { _id } = req.body;

    const user = await User.findById(_id);
    if (!user) {
        res.status(403);
        throw new Error('User not found');
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);



   await user.update({ 
    password: hashedPassword
})


if (user) {
    res.status(201).json({
        message: 'User Updated'
    });
}



})


module.exports = {
    registerUser,
    loginUser,
    getMe,
    PutUser,
};