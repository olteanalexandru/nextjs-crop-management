"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
const cropSchema = mongoose.Schema({
    //linking to user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    titlu: {
        type: String,
        required: [true, 'Lipseste titlu'],
    },
    descriere: {
        type: String,
        required: [true, 'Lipseste descrierea'],
    },
    text: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    selectare: {
        type: Boolean,
        required: false,
    },
    selectareBy: {
        type: String,
        required: false,
        ref: 'User',
    }
}, {
    timestamps: true,
});
module.exports = mongoose.model('Crop', cropSchema);
