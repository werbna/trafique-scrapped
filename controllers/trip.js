const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Trip = require('../models/trip.js')
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);

module.exports = router;