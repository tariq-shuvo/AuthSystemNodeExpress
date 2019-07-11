const express = require('express')
const router = express.Router()

const {check, validationResult} = require('express-validator')

// Load password encryption
const bcrypt = require('bcryptjs')
// Load json web token
const jwt = require('jsonwebtoken')
// Load config
const config = require('config')

// Load user model
const User = require('../../../models/User')

// @route GET api/auth
// @desc Fetch Auth Information
// @access Public

router.get('/', (req, res) => {
  res.send('Auth Router!')
})

// @route POST api/auth/login
// @desc  Login with email and password, generate token
// @access Public

router.post(
  '/login',
  [
    check('email', 'Email should be in email format and not empty').isEmail(),
    check('password', 'Password should be empty')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    // Form validation email and password
    const error = validationResult(req)

    if (!error.isEmpty()) {
      return res.status(400).send({
        errors: error.array()
      })
    }

    const {email, password} = req.body

    let user = await User.findOne({email})

    // Email validation
    if (!user) {
      return res.status(400).send({
        errors: [
          {
            msg: 'Invalid credentials'
          }
        ]
      })
    }

    // Password validation
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).send({
        errors: [
          {
            msg: 'Invalid credentials'
          }
        ]
      })
    }

    // Email confirmation validation
    if (user.isEmailVerified !== true) {
      return res.status(400).send({
        errors: [
          {
            msg: 'Please verify your email to login'
          }
        ]
      })
    }

    // Generate json web token
    let payload = {
      user: {
        id: user.id,
        type: 'user'
      }
    }

    jwt.sign(
      payload,
      config.get('jwt').secrect,
      {expiresIn: config.get('jwt').expire},
      (err, token) => {
        if (err) throw err
        return res.status(200).send({
          success: [
            {
              msg: 'You are loggedin'
            }
          ],
          token
        })
      }
    )
  }
)

module.exports = router
