import express from 'express';
const router = express.Router();

import { protect } from '../Middleware/authMiddleware';

import postController from '../Controllers/postController';
const postControllerClass = new postController();

router.route('/').get(protect, postControllerClass.getPost).post(protect, postControllerClass.SetPost);
router.route('/posts').get(postControllerClass.getAllPosts);
router.route('/posts/:id').get(postControllerClass.GetSpecific);
router.route('/:id').delete(protect, postControllerClass.deletePost).put(protect, postControllerClass.updatePost);
router.route('/testingConsoleLog').get(
    (req, res) => {
        console.log('Testing Console Log');
        res.status(200).json({ message: 'Testing Console Log' });
    }
);
export default router;
