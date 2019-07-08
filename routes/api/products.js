const express = require('express')
const router = express.Router()

// @route GET api/product
// @desc Fetch Product Information
// @access Public

router.get('/', (req, res) => {
  res.send('Product Router!')
})

module.exports = router
