const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

global.mpUsers = global.mpUsers || [];

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, name: user.name, avatar: user.avatar }, process.env.JWT_SECRET || 'super_secret_jwt_key_task_manager', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be >= 6 characters' });

    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
      const user = await User.create({ name, email, password });
      const token = generateToken(user);
      return res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (e) {
      const exists = global.mpUsers.find(u => u.email === email);
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { _id: 'usr_' + Date.now(), name, email, password: hashedPassword, avatar: '', createdAt: new Date() };
      global.mpUsers.push(newUser);
      const token = generateToken(newUser);
      return res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: newUser._id, name: newUser.name, email: newUser.email, avatar: newUser.avatar } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please enter email and password' });

    try {
      const user = await User.findOne({ email }).select('+password');
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user);
        return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
      }
    } catch (e) {}

    const memUser = global.mpUsers.find(u => u.email === email);
    if (memUser && (await bcrypt.compare(password, memUser.password))) {
      const token = generateToken(memUser);
      return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: memUser._id, name: memUser.name, email: memUser.email, avatar: memUser.avatar } });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatar || '' } });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let avatarUrl = req.user.avatar;

    if (req.file) {
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    try {
      const user = await User.findByIdAndUpdate(req.user._id, { name: name || req.user.name, avatar: avatarUrl }, { new: true });
      return res.status(200).json({ success: true, message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (e) {
      const memUser = global.mpUsers.find(u => u._id === req.user._id.toString());
      if (memUser) {
        if (name) memUser.name = name;
        memUser.avatar = avatarUrl;
        return res.status(200).json({ success: true, message: 'Profile updated', user: { id: memUser._id, name: memUser.name, email: memUser.email, avatar: memUser.avatar } });
      }
      return res.status(200).json({ success: true, message: 'Profile updated', user: { id: req.user._id, name: name || req.user.name, email: req.user.email, avatar: avatarUrl } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
