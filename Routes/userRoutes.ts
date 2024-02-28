export {};
const express = require('express');
const router = express.Router()
const {protect, checkRole} = require('../middleware/authMiddleware')
import userController from '../Controllers/userController';
const userControllerClass = new userController();

router.post('/login', userControllerClass.loginUser)
router.get('/me',protect, userControllerClass.getMe)
router.route('/').put(userControllerClass.PutUser).post(userControllerClass.registerUser)
router.route('/').get(protect, checkRole('Administrator'), userControllerClass.registerUser)
router.route('/fermier').get(protect, userControllerClass.getFermierUsers);
router.route('/:id').delete(protect, userControllerClass.deleteUser);

export default router;