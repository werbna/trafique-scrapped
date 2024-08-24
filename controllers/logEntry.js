const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const logEntry = require('../models/logEntry.js')
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);

router.post('/', async (req,res) => {
  try {
    req.body.author = req.user._id
    const log = await logEntry.create(req.body)
    log._doc.author = req.user;
    res.status(201).json(log)
  } catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router