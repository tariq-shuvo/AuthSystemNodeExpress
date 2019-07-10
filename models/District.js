const mongoose = require('mongoose')
const DistrictSchema = new mongoose.Schema({
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'division'
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

module.exports = District = mongoose.model('district', DistrictSchema)
