const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      unique: true,
      required: true,
    },
    logEntry: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LogEntry",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
