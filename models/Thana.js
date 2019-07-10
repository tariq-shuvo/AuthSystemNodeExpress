const mongoose = require('mongoose')
const ThanaSchema = new mongoose.Schema({
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'division'
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'district'
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Thana = mongoose.model('thana', ThanaSchema)
