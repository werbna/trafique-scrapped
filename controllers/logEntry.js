const express = require('express')
const verifyToken = require('../middleware/verify-token.js')
const logEntry = require('../models/logEntry.js')
const User = require('../models/user.js')
const Comment = require('../models/comment.js')
const router = express.Router()

// ========== Public Routes ===========

router.get('/', async (req, res) => {
  try {
    const logEntries = await logEntry.find({})
    .populate('author')
    .sort({ createdAt: 'desc' })
    .populate('comments')
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
    .populate('comments')
    if (!foundLogEntry) {
      res.status(404).json({ message: 'Log Entry not found' })
    }
    res.status(200).json(foundLogEntry)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.get('/:logEntryId/photos', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    .populate('comments')
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    const photos = foundLogEntry.photo;
    res.json(photos);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:logEntryId/photos/:photoId', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    .populate('comments')
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    const foundPhoto = foundLogEntry.photo.id(req.params.photoId);
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json(foundPhoto);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ========= Protected Routes =========

router.use(verifyToken);

router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id
    const log = await logEntry.create(req.body)
    log._doc.author = req.user
    res.status(201).json(log)
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
})

router.post('/:logEntryId/comments', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId);
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    const newComment = await Comment.create({
      ...req.body,
      author: req.user.id,
      associatedModel: 'LogEntry',
      associatedId: req.params.logEntryId
    });

    foundLogEntry.comments.push(newComment._id);
    await foundLogEntry.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//! Remember to add a cloudify function eventually.
router.post('/:logEntryId/photos', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    console.log(foundLogEntry)

    const photo = {
      ...req.body,
      author: req.user._id
    }

    foundLogEntry.photo.push(photo)
    await foundLogEntry.save()
    res.status(201).json(foundLogEntry)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.post('/:logEntryId/photos/:photoId/comments', async (req, res) => {
  try {
    const foundLogEntry = await logEntry.findById(req.params.logEntryId);
    console.log(foundLogEntry)
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' })
    }

    const foundPhoto = await foundLogEntry.photo.id(req.params.photoId);
    console.log(foundPhoto)
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const newComment = await Comment.create({
      text: req.body.text,
      author: req.user.id,
      associatedModel: 'Photo',
      associatedId: req.params.photoId
    });

    foundPhoto.comments.push(newComment._id);
    await foundLogEntry.save();

    res.status(201).json(newComment)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

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

router.put('/:logEntryId/photos/:photoId', async (req,res) => {
  try{
    const foundLogEntry = await logEntry.findById(req.params.logEntryId).populate('author')
    const user = await User.findById(req.user._id)
    if (!foundLogEntry.author.equals(req.user._id) || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied'})
    }
    const updatedPhoto = foundLogEntry.photo.id(req.params.photoId)
    updatedPhoto.imageUrl = req.body.imageUrl
    updatedPhoto.description = req.body.description
    await foundLogEntry.save();
    res.status(200).json(updatedPhoto);
  } catch (err) {
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

router.delete('/:logEntryId/photos/:photoId', async (req,res) => {
  try {
    const user = await User.findById(req.user._id)
    const foundLogEntry = await logEntry.findById(req.params.logEntryId)
    if (!foundLogEntry.author.equals(req.user._id) || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied'})
    }
    foundLogEntry.photo.pull(req.params.photoId)
    await foundLogEntry.save()
    res.status(200).json({ message: 'Photo deleted successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})




module.exports = router;