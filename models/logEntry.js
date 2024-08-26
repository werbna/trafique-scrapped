const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'Comment' 
    }],
  },
  { timestamps: true }
);

const logEntrySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
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
      type: mongoose.Schema.Types.ObjectId, ref: 'Comment' 
    }],
    photo: [photoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LogEntry", logEntrySchema);
