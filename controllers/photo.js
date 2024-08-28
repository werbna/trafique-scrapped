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
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    const newPhoto = await Photo.create({
      author: req.user._id,
      imageUrl: req.body.imageUrl,
      ...req.body,
    });
    logEntry.photos.push(newPhoto._id);
    await trip.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  url: process.env.CLOUDINARY_URL
});

// router.post('/trips/:tripId/logEntries/:logEntryId/photos', [isAdmin, isAuthor], async (req, res) => {
//   try {
//     const trip = await Trip.findById(req.params.tripId);
//     if (!trip) {
//       return res.status(404).json({ message: 'Trip not found' });
//     }
//     const logEntry = trip.logEntries.id(req.params.logEntryId);
//     if (!logEntry) {
//       return res.status(404).json({ message: 'Log entry not found' });
//     }
// 
//     //req.body.image is the uploaded image file
//     const uploadedImage = req.body.image;
// 
//     //upload the image to Cloudinary
//     cloudinary.uploader.upload(uploadedImage)
//       .then(result => {
//         const imageUrl = result.secure_url;
//         const newPhoto = await Photo.create({
//           author: req.user._id,
//           imageUrl,
//           ...req.body,
//         });
//         logEntry.photos.push(newPhoto._id);
//         await trip.save();
//         res.status(201).json(newPhoto);
//       })
//       .catch(error => {
//         console.error(error);
//         res.status(500).json(error);
//       });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(err);
//   }
// });


router.put('/trips/:tripId/logEntries/:logEntryId/photos/:photoId', [isAdmin, isAuthor], async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    const photo = await Photo.findByIdAndUpdate(req.params.photoId, req.body, { new: true });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.status(200).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});



router.delete('/trips/:tripId/logEntries/:logEntryId/photos/:photoId', [isAdmin, isAuthor], async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    const photo = await Photo.findByIdAndDelete(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    logEntry.photos.pull(photo._id);
    await trip.save();
    res.status(200).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});



module.exports = router