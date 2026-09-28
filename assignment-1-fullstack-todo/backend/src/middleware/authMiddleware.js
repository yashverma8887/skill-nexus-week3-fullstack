const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized (No token provided)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_week3_todo');
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {}

    const memUser = (global.memoryUsers || []).find(u => u._id === decoded.id);
    if (memUser) {
      req.user = memUser;
      return next();
    }

    req.user = { _id: decoded.id, name: decoded.name || 'User', email: decoded.email || 'user@example.com' };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

module.exports = { protect };
