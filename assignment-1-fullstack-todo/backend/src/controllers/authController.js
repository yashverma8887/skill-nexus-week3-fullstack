const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

global.memoryUsers = global.memoryUsers || [];

const generateToken = (id, email, name) => {
  return jwt.sign({ id, email, name }, process.env.JWT_SECRET || 'super_secret_jwt_key_week3_todo', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, message: 'Email is already registered' });
      const user = await User.create({ name, email, password });
      const token = generateToken(user._id, user.email, user.name);
      return res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (e) {
      const exists = global.memoryUsers.find(u => u.email === email);
      if (exists) return res.status(400).json({ success: false, message: 'Email is already registered' });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { _id: 'usr_' + Date.now(), name, email, password: hashedPassword, createdAt: new Date() };
      global.memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.email, newUser.name);
      return res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    try {
      const user = await User.findOne({ email }).select('+password');
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id, user.email, user.name);
        return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
      }
    } catch (e) {}

    const memUser = global.memoryUsers.find(u => u.email === email);
    if (memUser && (await bcrypt.compare(password, memUser.password))) {
      const token = generateToken(memUser._id, memUser.email, memUser.name);
      return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: memUser._id, name: memUser.name, email: memUser.email } });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email } });
};
