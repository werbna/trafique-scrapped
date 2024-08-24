const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Trip = require('../models/trip.js')
const User = require('../models/user.js')
const router = express.Router();

// ========== Public Routes ===========
router.get('/', async (req,res) => {
  try {
    const trips = await Trip.find({})
      .populate({ path: 'logEntry' })
      .sort({ createdAt: 'desc' })
      res.status(200).json(trips)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/:tripId', async (req,res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    .populate('logEntry')
    res.status(200).json(trip)
  } catch (err) {
    res.status(500).json(err)
  }
})

// ========= Protected Routes =========
// some are isAdmin rights as well as token verification

router.use(verifyToken);

router.post('/', async (req,res) => {
  try{
    const newTrip = await Trip.create(req.body)
    res.status(201).json(newTrip)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/:tripId', async (req,res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin Only'})
    }
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body, { new:true })
    if (!updatedTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(updatedTrip)
  } catch(err) {
    res.status(500).json(err)
  }
})

router.delete('/:tripId', async (req,res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin Only'})
    }
    const deletedTrip = await Trip.findByIdAndDelete(req.params.tripId)
    if (!deletedTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(deletedTrip)    
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router;              