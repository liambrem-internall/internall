/*
* This file defines the User model for MongoDB
*/


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  sectionOrder: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);