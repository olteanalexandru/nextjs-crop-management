export {};

const asyncHandler = require('express-async-handler');

const Post = require('../models/postModel');

// type ModelDataType = {
//     id : string;
//     title: string;
//     brief: string;
//     description: string;
//     image: string;
//     user: string;
// }


interface Response {
    status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any } }
}
interface Request {
    user: { id: number },
    body: { title: string;
        brief: string;
        description: string;
        image: string;
        id: string;

    }
    params: { id: number; }
}

//@route GET /api/posts
//@acces Private
const getPost = asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.findById(req.params.id)
    res.status(200).json(posts);
    //res.status(200).json({message:'Get Posts'})
});

//@route GET /api/posts/posts
//@acces Public

const getAllPosts = asyncHandler(async (req: Request, res: Response) => {

    const posts = await Post.find({});
    res.status(200).json(posts);
    

});

//@route GET /api/posts/posts/:id
//@acces Public
const GetSpecific = asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.findById(req.params.id);
    res.status(200).json(posts);
    //res.status(200).json({message:'Get Posts'})
}
);

//@route SET /api/posts
//@acces Private
const SetPost = asyncHandler(async (req: Request, res: Response) => {
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

//@route DELETE /api/posts/:id
//@acces Private
const deletePost = asyncHandler(async (req: Request, res: Response) => {
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

//@route UPDATE /api/posts/:id
//@acces Private
const updatePost = asyncHandler(async (req: Request, res: Response) => {
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

module.exports = {
    getPost,
    getAllPosts,
    GetSpecific,
    SetPost,
    deletePost,
    updatePost,
};

// Path: Backend\Routes\postRoutes.ts



