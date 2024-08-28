const Trip = require('../models/trip.js');

const isAuthor = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const logEntry = trip.logEntries.id(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    if (!logEntry.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = isAuthor;