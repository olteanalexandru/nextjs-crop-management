export {};
const express = require('express');
const router = express.Router()
const {protect} = require('../middleware/authMiddleware')
const {registerUser, loginUser, getMe, PutUser} = require('../Controllers/userController')


router.post('/login', loginUser)
router.get('/me',protect, getMe)
router.route('/').put(PutUser).post( registerUser)


module.exports = router