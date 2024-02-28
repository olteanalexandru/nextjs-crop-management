const asyncHandler = require('express-async-handler');

import Post from '../Models/postModel';
import User from '../Models/userModel';
interface Response {
    status: any;
    json: (arg0: any) => void;
    send: (arg0: string) => void;
}
interface Request {
    user: { id: number },
    body: {
        title: string;
        brief: string;
        description: string;
        image: string;
        id: string;
    }
    params: { id: number; }
}


class PostController {

    //constructor
    constructor() {
        this.getPost = this.getPost.bind(this);
        this.getAllPosts = this.getAllPosts.bind(this);
        this.GetSpecific = this.GetSpecific.bind(this);
        this.SetPost = this.SetPost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.updatePost = this.updatePost.bind(this);
    }

    router = require('express').Router();

    // //@route GET /api/posts
    // //@acces Private

    getPost = asyncHandler(async (req: Request, res: Response) => {
        const posts = await Post.findById(req.params.id);
       res.status(200).json({ posts });

       
    });

    // //@route GET /api/posts/posts
    // //@acces Public

    getAllPosts = asyncHandler(async (req: Request, res: Response) => {

        
        const posts = await Post.find({});
        res.status(200).json(posts);


    });

    // //@route GET /api/posts/posts/:id
    // //@acces Public

    GetSpecific = asyncHandler(async (req: Request, res: Response) => {
        const posts = await Post.findById(req.params.id);
        res.status(200).json(posts);
        //res.status(200).json({message:'Get Posts'})
    }
    );


    // //@route SET /api/posts
    // //@acces Private

    SetPost = asyncHandler(async (req: Request, res: Response) => {
        if (!req.body.title) {
            res.status(400);
            throw new Error('Lipsa titlu');

        };
        if (!req.body.brief) {
            res.status(400);
            throw new Error('Lipsa brief');

        };
        if (!req.body.description) {
            res.status(400);
            throw new Error('Lipsa descriere');

        };

        const post = new Post({
            user: req.user.id,
            title: req.body.title,
            brief: req.body.brief,
            description: req.body.description,
            image: req.body.image,
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);
    }
    );

    // //@route DELETE /api/posts/:id
    // //@acces Private

    deletePost = asyncHandler(async (req: Request, res: Response) => {
        const post = await Post.findById(req.params.id);
        if (post.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (post) {
            await post.remove();
            res.status(200).json({ message: 'Post removed' });
        } else {
            res.status(404);
            throw new Error('Post not found');
        }
    }
    );

    // //@route UPDATE /api/posts/:id
    // //@acces Private

    updatePost = asyncHandler(async (req: Request, res: Response) => {
        const { title, brief, description, image } = req.body;

        const post = await Post.findById(req.params.id);

        if (post) {
            post.title = title;
            post.brief = brief;
            post.description = description;
            post.image = image;

            const updatedPost = await post.save();
            res.status(200).json(updatedPost);
        } else {
            res.status(404);
            throw new Error('Post not found');
        }
    }
    );
}
export default PostController;