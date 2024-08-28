const isAdmin = require('./isAdmin'); 
const isAuthor = require('./isAuthor'); 

const isAdminOrAuthor = async (req, res, next) => {
  try {
    let authorized = false;

    await isAdmin(req, res, () => {
      authorized = true;
    });

    await isAuthor(req, res, () => {
      authorized = true;
    });

    if (authorized) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = isAdminOrAuthor;
