const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  readHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user', 
  },
  socialMedia: {
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
