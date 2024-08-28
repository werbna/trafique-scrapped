const express = require('express');
const mongoose = require('mongoose');
const verifyToken = require('../middleware/verify-token.js');
const Photo = require('../models/photo.js');
const Trip = require('../models/trip.js')
const User = require('../models/user.js');
const isAdmin = require('../middleware/isAdmin.js')
const isAuthor = require('../middleware/isAuthor.js');
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

router.get('/:photoId', async (req, res) => {
  try {
    const foundPhoto = await Photo.findById(req.params.photoId).populate('author').populate('comments')
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    res.status(200).json(foundPhoto)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
})

// ========= Protected Routes ===========

router.use(verifyToken)

//! use cloudify or another imgur to accept uploads to and auto paste imageUrl.
router.post('/trips/:tripId/logEntries/:logEntryId/photos', [isAdmin, isAuthor], async (req, res) => {
  try {
    const foundTrip = await Trip.findById(req.params.tripId);
    if (!foundTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const foundLogEntry = foundTrip.logEntries.id(req.params.logEntryId);
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found in the specified trip' });
    }
    const newPhoto = await Photo.create({
      author: req.user._id,
      ...req.body,
    });
    foundLogEntry.photos.push(newPhoto._id);
    await foundTrip.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.put('/trips/:tripId/logEntries/:logEntryId/photos/:photoId', [isAdmin, isAuthor], async (req, res) => {
  try {
    const foundPhoto = await Photo.findByIdAndUpdate(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    foundPhoto.set(req.body)
    await foundPhoto.save()
    res.status(200).json(foundPhoto)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete('/trips/:tripId/logEntries/:logEntryId/photos/:photoId', [isAdmin, isAuthor] , async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    logEntry.photos = logEntry.photos.filter((photo) => {
      return  photo._id !== req.params.photoId;
    })
    await trip.save()
    console.log(req.params.photoId)
    const foundPhoto = await Photo.findByIdAndDelete(req.params.photoId)
    if (!foundPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    res.status(200).json(foundPhoto)
  } catch (err) {
    console.error(err);
    res.status(500).json(err)
  }
});



module.exports = router