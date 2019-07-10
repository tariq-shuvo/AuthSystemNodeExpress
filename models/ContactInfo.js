const mongoose = require('mongoose')

const ContactInfoScheme = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  phone: {
    type: Number,
    maxlength: 12,
    required: true,
    default: null
  },
  address: {
    type: String,
    required: true
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'division'
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'district'
  },
  thana: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'thana'
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = ContactInfo = mongoose.model('contactinfo', ContactInfoScheme)
