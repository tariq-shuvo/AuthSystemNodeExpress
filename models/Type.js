const mongoose = require('mongoose')
const TypeSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Type = mongoose.model('type', TypeSchema)
