const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    comment: {
        type: String
    }
});

const logEntrySchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    photos: [photoSchema]
});

module.exports = mongoose.model('LogEntry', logEntrySchema);
