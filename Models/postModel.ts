export {};
var mongoose = require('mongoose')

// type ModelDataType = {
//     id : string;
//     title: string;
//     brief: string;
//     description: string;
//     image: string;
//     user: string;
// }

const postSchema = mongoose.Schema ({
    //linking to user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    brief: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Post', postSchema)



