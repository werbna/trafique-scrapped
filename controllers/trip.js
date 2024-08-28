const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Trip = require('../models/trip.js');
const User = require('../models/user.js');
const isAdmin = require('../middleware/isAdmin.js');
const isAuthor = require('../middleware/isAuthor.js');
const router = express.Router();

// ========== Public Routes ===========

router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({}).sort({ createdAt: 'desc' })
    res.status(200).json(trips)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/:tripId/logEntries', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    res.status(200).json(trip.logEntries)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/:tripId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    res.status(200).json(trip)
  } catch (err) {
    res.status(500).json(err)
  }
})

// ========= Protected Routes ===========

router.use(verifyToken)

router.post('/', isAdmin, async (req, res) => {
  try {
    const newTrip = await Trip.create(req.body)
    res.status(201).json(newTrip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.post('/:tripId/logEntries', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    const logEntry = {
      author: req.user._id,
      ...req.body,
    }
    trip.logEntries.push(logEntry)
    await trip.save()
    res.status(201).json(trip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/:tripId/logEntries/:logEntryId', [isAdmin, isAuthor], async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const foundLogEntry = trip.logEntries.id(req.params.logEntryId);
    if (!foundLogEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    foundLogEntry.set(req.body);
    await trip.save();
    return res.status(200).json(trip);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.delete('/:tripId/logEntries/:logEntryId', [isAdmin, isAuthor], async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId)
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' })
    }
    trip.logEntries.pull(req.params.logEntryId);
    await trip.save()
    return res.status(200).json(trip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/:tripId', isAdmin, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true })
    if (!updatedTrip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    res.status(200).json(updatedTrip)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.delete('/:tripId', [isAdmin, isAuthor] , async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.tripId)
    res.status(200).json(deletedTrip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router
