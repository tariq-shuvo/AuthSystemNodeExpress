const mongoose = require('mongoose')

const SubCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    ref: 'category'
  },
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = SubCategory = mongoose.model('subcategory', SubCategorySchema)
