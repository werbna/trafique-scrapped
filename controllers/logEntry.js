const express = require('express')
const verifyToken = require('../middleware/verify-token.js')
const logEntry = require('../models/logEntry.js')
const User = require('../models/user.js')
const router = express.Router()

// ========== Public Routes ===========
router.get('/', async (req, res) => {
  try {
    const logEntries = await logEntry.find({})
    .populate('author')
    .sort({ createdAt: 'desc' })
    .populate('trip')
    // .populate('photo')
    // .populate('comment')
    res.status(200).json(logEntries);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
})

router.get('/:logEntryId', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
      .populate('author')
      .populate('trip')
      // .populate('photo')
      // .populate('comment')
    if (!foundLogEntry) {
      res.status(404).json({ message: 'Log Entry not found' })
    }
    res.status(200).json(foundLogEntry)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

// ========= Protected Routes =========
router.use(verifyToken);

router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id
    const log = await logEntry.create(req.body);
    log._doc.author = req.user
    res.status(201).json(log)
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
})

router.put('/:logEntryId', async (req,res) => {
  try {

    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    const user = await User.findById(req.user._id)
    if (!foundLogEntry.author.equals(req.user._id) || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied'})
    }
    const updatedLogEntry = await logEntry.findByIdAndUpdate(
      req.params.logEntryId,
      req.body,
      { new: true }
    )
    updatedLogEntry._doc.author = req.user
    res.status(200).json(updatedLogEntry)
  } catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete('/:logEntryId', async (req,res) => {
  try {
    const user = await User.findById(req.user._id)
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    if (!foundLogEntry.author.equals(req.user._id) || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied'})
    }
    const deletedLogEntry = await  logEntry.findByIdAndDelete(req.params.logEntryId)
    res.status(200).json(deletedLogEntry)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.post('/:logEntryId/photos', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    if (!Array.isArray(foundLogEntry.photos)) {
      foundLogEntry.photos = [];
    }

    req.body.author = req.user._id
    const newPhoto = { ...req.body }
    foundLogEntry.photos.push(newPhoto)
    await foundLogEntry.save()

    res.status(201).json(newPhoto)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router;