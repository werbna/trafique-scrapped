const mongoose = require('mongoose');

// Define the LogEntry schema
const logEntrySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
  }],
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    unique: true,
    required: true,
  },
  logEntries: [logEntrySchema], 
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
