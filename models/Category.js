const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  icon:{
    type: String,
    default: false
  }
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Category = mongoose.model('category', CategorySchema)
