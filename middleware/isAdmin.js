const User = require('../models/user.js');

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      return next(); 
    }
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin Only" });
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = isAdmin;
