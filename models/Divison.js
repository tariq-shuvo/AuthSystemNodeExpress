const mongoose = require('mongoose')
const DivisionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Division = mongoose.model('division', DivisionSchema)
