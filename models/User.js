const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true,
    default: null
  },
  password: {
    type: String,
    required: true,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  emailVerificationCode: {
    type: String,
    required: true
  },
  passwordResetCode: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = User = mongoose.model('user', UserSchema)
