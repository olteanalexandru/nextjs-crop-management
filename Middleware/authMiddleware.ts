const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req: { headers: { authorization: string }; user: any }, res: { status: (arg0: number) => void }, next: () => void) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

const checkRole = (role) => asyncHandler(async (req, res, next) => {
  if (req.user && req.user.rol === role) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized, insufficient permissions');
  }
});


export { protect, checkRole } 
