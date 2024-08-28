const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Comment = require('../models/comment.js');
const Photo = require('../models/photo.js');
const Trip = require('../models/trip.js')
const User = require('../models/user.js');
const isAdmin = require('../middleware/isAdmin.js')
const isAuthor = require('../middleware/isAuthor.js');
const trip = require('../models/trip.js');
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

router.get('/:commentId', async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId).populate('author')
    if (!foundComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    res.status(200).json(foundComment)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
})

router.get('/logEntries/:logEntryId/comments', async (req, res) => {
  try {
    const trip = await Trip.findOne({ 'logEntries._id': req.params.logEntryId }).populate('logEntries.comments');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    res.status(200).json(logEntry.comments);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.get('/photos/:photoId/comments', async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId).populate('comments')
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    res.status(200).json(foundPhoto.comments)
  } catch (err) {
    res.status(500).json(err)
  }
})

// ========= Protected Routes ===========

router.use(verifyToken)

router.post('/photos/:photoId/comments', async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    const newComment = await Comment.create({
      author: req.user._id,
      content: req.body.content,
      associatedModel: 'Photo',
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

router.post('/logEntries/:logEntryId/comments', async (req, res) => {
  try {
    const trip = await Trip.findOne({ 'logEntries._id': req.params.logEntryId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    const newComment = await Comment.create({
      author: req.user._id,
      content: req.body.content,
      associatedModel: 'LogEntry',
      associatedId: req.params.logEntryId,
    });
    logEntry.comments.push(newComment._id);
    await trip.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:commentId', async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId)
    if (!foundComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin Only" });
    }
    if (!foundComment.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    foundComment.set(req.body)
    await foundComment.save()
    res.status(200).json(foundComment)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete('/:commentId', async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId)
    if (!foundComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin Only" });
    }
    if (!foundComment.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await foundComment.deleteOne()
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router