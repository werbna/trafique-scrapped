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
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Comment' 
    }],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Photo", photoSchema);
