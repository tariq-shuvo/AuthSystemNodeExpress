const express = require('express')
const router = express.Router()

// @route GET api/user
// @desc Fetch User Information
// @access Public

router.get('/', (req, res) => {
  res.send('User Router!')
})

module.exports = router
