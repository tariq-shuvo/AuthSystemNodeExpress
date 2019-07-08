const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async () => {
  try {
    await mongoose.connect(db, {useNewUrlParser: true})
    console.log('Database connected!')
  } catch (err) {
    console.error(err.message)
    // Dismiss the code execusion or process here
    process.exit(1)
  }
}

module.exports = connectDB
