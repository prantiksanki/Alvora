const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    college: user.college,
    location: user.location,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
    token: generateToken(user._id),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    college: user.college,
    location: user.location,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
    token: generateToken(user._id),
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, college, location, avatarColor } = req.body;
  const allowed = {};
  if (name !== undefined) allowed.name = name.trim();
  if (bio !== undefined) allowed.bio = bio.trim();
  if (college !== undefined) allowed.college = college.trim();
  if (location !== undefined) allowed.location = location.trim();
  if (avatarColor !== undefined) allowed.avatarColor = avatarColor;

  const user = await User.findByIdAndUpdate(req.user._id, allowed, { new: true });
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    college: user.college,
    location: user.location,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
  });
});

module.exports = { signup, login, updateMe };
