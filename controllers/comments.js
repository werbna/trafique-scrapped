const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Comment = require("../models/comment.js");
const LogEntry = require("../models/logEntry.js");
const User = require("../models/user.js");
const router = express.Router();

// ========= Public Routes =========

router.get("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId).populate("author");
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(foundComment);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// ========= Protected Routes =========

router.use(verifyToken);


router.post("/:logEntryId", async (req, res) => {
  try {
    const foundLogEntry = await LogEntry.findById(req.params.logEntryId);
    if (!foundLogEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }

    const newComment = await Comment.create({
      ...req.body,
      author: req.user.id,
      associatedModel: "LogEntry",
      associatedId: req.params.logEntryId,
    });

    foundLogEntry.comments.push(newComment._id);
    await foundLogEntry.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/:logEntryId/photos/:photoId", async (req, res) => {
  try {
    const foundLogEntry = await LogEntry.findById(req.params.logEntryId);
    if (!foundLogEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }

    const foundPhoto = foundLogEntry.photo.id(req.params.photoId);
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const newComment = await Comment.create({
      ...req.body,
      author: req.user.id,
      associatedModel: "Photo",
      associatedId: req.params.photoId,
    });

    foundPhoto.comments.push(newComment._id);
    await foundLogEntry.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId);
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const user = await User.findById(req.user._id);
    if (!foundComment.author.equals(req.user._id) && !user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    foundComment.set(req.body);
    await foundComment.save();
    res.status(200).json(foundComment);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.delete("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId);
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const user = await User.findById(req.user._id);
    if (!foundComment.author.equals(req.user._id) && !user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
