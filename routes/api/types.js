const express = require('express')
const router = express.Router()

// @route GET api/type
// @desc Fetch Types Information
// @access Public

router.get('/', (req, res) => {
  res.send('Types Router!')
})

module.exports = router
