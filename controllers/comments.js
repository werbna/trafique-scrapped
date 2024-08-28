const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Comment = require("../models/comment.js");
const Photo = require("../models/photo.js");
const User = require("../models/user.js");
const router = express.Router();

// ========== Public Routes ===========

router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: 'desc' }).populate('author')
    res.status(200).json(comments)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId).populate("author")
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" })
    }
    res.status(200).json(foundComment)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
})

router.get("/logEntries/:logEntryId/comments", async (req, res) => {
  try {
    const foundLogEntry = await LogEntry.findById(req.params.logEntryId).populate('comments')
    if (!foundLogEntry) {
      return res.status(404).json({ message: "Log entry not found" })
    }
    res.status(200).json(foundLogEntry.comments)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get("/photos/:photoId/comments", async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId).populate('comments')
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" })
    }
    res.status(200).json(foundPhoto.comments)
  } catch (err) {
    res.status(500).json(err)
  }
})

// ========= Protected Routes ===========

router.use(verifyToken)

router.post("/photos/:photoId/comments", async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" })
    }

    const newComment = await Comment.create({
      author: req.user._id,
      content: req.body.content,
      associatedModel: "Photo",
      associatedId: req.params.photoId,
    })

    foundPhoto.comments.push(newComment._id)
    await foundPhoto.save()
    res.status(201).json(newComment)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.post("/logEntries/:logEntryId/comments", async (req, res) => {
  try {
    const foundLogEntry = await LogEntry.findById(req.params.logEntryId)
    if (!foundLogEntry) {
      return res.status(404).json({ message: "Log entry not found" })
    }

    const newComment = await Comment.create({
      author: req.user._id,
      content: req.body.content,
      associatedModel: "LogEntry",
      associatedId: req.params.logEntryId,
    })

    foundLogEntry.comments.push(newComment._id)
    await foundLogEntry.save()
    res.status(201).json(newComment)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId)
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (foundComment.author.equals(req.user._id) || req.user.isAdmin) {
      foundComment.set(req.body)
      await foundComment.save()
      return res.status(200).json(foundComment)
    } else {
      return res.status(403).json({ message: "Access denied" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete("/:commentId", async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId)
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" })
    }
    if (foundComment.author.equals(req.user._id) || req.user.isAdmin) {
      await foundComment.remove()
      res.status(200).json({ message: "Comment deleted successfully" })
    } else {
      return res.status(403).json({ message: "Access denied" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router
