const express = require('express')
const router = express.Router()

// @route GET api/category
// @desc Fetch Category Information
// @access Public

router.get('/', (req, res) => {
  res.send('Category Router!')
})

module.exports = router
