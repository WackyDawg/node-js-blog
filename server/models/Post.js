const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    insertMedia: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: [] // Default to an empty array if not provided
    },
    images: [{
        type: String,
    }],
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);
