const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  bio: { type: String, default: '', trim: true, maxlength: 300 },
  college: { type: String, default: '', trim: true },
  location: { type: String, default: 'India', trim: true },
  avatarColor: { type: String, default: '#2563eb' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving if it was modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
