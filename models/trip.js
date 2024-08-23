const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  logEntries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogEntry",
    },
  ],
});

module.exports = mongoose.model("Trip", tripSchema);
