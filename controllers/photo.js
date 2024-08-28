const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Photo = require("../models/photo.js");
const User = require("../models/user.js");
const router = express.Router();

// ========== Public Routes ===========

router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find({}).sort({ createdAt: 'desc' }).populate('author')
    res.status(200).json(photos)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get("/:photoId", async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId).populate("author").populate("comments")
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" })
    }
    res.status(200).json(foundPhoto)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
})

// ========= Protected Routes ===========

router.use(verifyToken)

router.post("/logEntries/:logEntryId/photos", async (req, res) => {
  try {
    const foundLogEntry = await LogEntry.findById(req.params.logEntryId)
    if (!foundLogEntry) {
      return res.status(404).json({ message: "Log entry not found" })
    }

    const newPhoto = await Photo.create({
      author: req.user._id,
      ...req.body,
    })

    foundLogEntry.photos.push(newPhoto._id)
    await foundLogEntry.save()
    res.status(201).json(newPhoto)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put("/:photoId", async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" })
    }

    if (foundPhoto.author.equals(req.user._id) || req.user.isAdmin) {
      foundPhoto.set(req.body)
      await foundPhoto.save()
      return res.status(200).json(foundPhoto)
    } else {
      return res.status(403).json({ message: "Access denied" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete("/:photoId", async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: "Photo not found" })
    }

    if (foundPhoto.author.equals(req.user._id) || req.user.isAdmin) {
      await foundPhoto.remove()
      res.status(200).json({ message: "Photo deleted successfully" })
    } else {
      return res.status(403).json({ message: "Access denied" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router
