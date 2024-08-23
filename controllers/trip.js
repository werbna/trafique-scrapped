const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Trip = require('../models/trip.js')
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);

router.post('/', async (req,res) => {
  try{
    req.body.author = req.user._id
    const newTrip = await Trip.create(req.body)
    newTrip._doc.author = req.user
    res.status(201).json(newTrip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.get('/', async (req,res) => {
  try {
    const trips = await Trip.find({})
      .sort({ createdAt: 'desc' })
      res.status(200).json(trips)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/:tripId', async (req,res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    res.status(200).json(trip)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.put('/:tripId', async (req,res) => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body, { new:true })
    if (!updatedTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(updatedTrip)
  } catch(err) {
    res.status(500).json(err)
  }
})

module.exports = router;              