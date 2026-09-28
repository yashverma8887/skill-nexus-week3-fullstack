const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized (No authentication token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_task_manager');
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {}

    const memUser = (global.mpUsers || []).find(u => u._id === decoded.id);
    if (memUser) {
      req.user = memUser;
      return next();
    }

    req.user = { _id: decoded.id, name: decoded.name || 'User', email: decoded.email || 'user@example.com', avatar: decoded.avatar || '' };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

module.exports = { protect };
