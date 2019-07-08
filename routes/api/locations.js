const express = require('express')
const router = express.Router()

// @route GET api/location
// @desc Fetch location Information
// @access Public

router.get('/', (req, res) => {
  res.send('Location Router!')
})

module.exports = router
