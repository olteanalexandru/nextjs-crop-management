export {};
const express = require('express');
const router = express.Router()
const {protect, checkRole} = require('../middleware/authMiddleware')
const {registerUser, loginUser, getMe, PutUser , getFermierUsers, deleteUser} = require('../Controllers/userController')


router.post('/login', loginUser)
router.get('/me',protect, getMe)
router.route('/').put(PutUser).post(registerUser)
router.route('/').get(protect, checkRole('Administrator'), registerUser)
router.route('/fermier').get(protect, getFermierUsers);
router.route('/:id').delete(protect, deleteUser);

module.exports = router