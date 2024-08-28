const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }, 
    associatedModel: {
      type: String,
      required: true,
      enum: ['Photo', 'LogEntry']
    },
    associatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'associatedModel'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
