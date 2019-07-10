const express = require('express')
const router = express.Router()

// Load unique id generator
const uuid = require('uuid/v1')

// Load config variables
const config = require('config')

// Express validator load
const {check, validationResult} = require('express-validator')
// Load User Model
const User = require('../../models/User')
// Load Bcryptjs for password encryption
const bcrypt = require('bcryptjs')
// Load gravatar for auto get image from email address
const gravatar = require('gravatar')
// Load jsonwebtoken for generate token
const jwt = require('jsonwebtoken')

// Load custom email sender
const sendEmail = require('../../email/nodemailer-email')

// @route POST api/user
// @desc Register User Information
// @access Public

router.post(
  '/',
  [
    check('firstname', 'Firstname should not be empty')
      .not()
      .isEmpty(),
    check('lastname', 'Lastname should not be empty')
      .not()
      .isEmpty(),
    check('email', 'Email should be in email format and not empty').isEmail(),
    check('password', 'Password should be 6 or more character').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    // Load validation lib in respect to req
    const error = validationResult(req)

    // If error exist show the error
    if (!error.isEmpty()) {
      return res.status(400).json({
        errors: error.array()
      })
    }

    // Get POST input from user
    const {firstname, lastname, email, password} = req.body

    // Generate unique email verification code
    const verificationCode = uuid()

    try {
      // Check registration email exsist or not
      let user = await User.findOne({
        email
      })

      // Generate error is email already exist
      if (user) {
        return res.status(400).send({
          errors: [
            {
              msg: 'Email already exists'
            }
          ]
        })
      }

      // Get gravatar image from the email address
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        dd: 'mm'
      })

      // Create user instance for database save
      user = new User({
        firstname,
        lastname,
        email,
        avatar,
        password,
        emailVerificationCode: verificationCode
      })

      // Password encryption process using bcryptjs
      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      // General information for email verification link
      const mailData = {
        email,
        verificationLink: `${config.get(
          'baseURL'
        )}/api/user/email/verify/${verificationCode}`,
        subject: 'Email verification link'
      }

      // Sending email verification link
      let sendingStatus = new Promise((resolve, reject) => {
        sendEmail(mailData, resolve, reject)
      })

      // If email sending done then save the user data show success message else error message will be displayed
      sendingStatus.then(
        async resolve => {
          await user.save()
          return res.status(200).send({
            success: [
              {
                msg:
                  'A veryfication link has been sent into your email. Please veryfy the link'
              }
            ]
          })
        },
        error => {
          return res.status(400).send({
            errors: [{msg: 'Email can not be sent. Contact with support team'}]
          })
        }
      )
    } catch (err) {
      console.error(err.message)

      // If server have error
      return res.status(500).send('Server error')
    }
  }
)

// @route  GET api/user/verify/email/:verificationCode
// @desc   Email verification code check and vefification
// @access Public

router.get('/verify/email/:verificationCode', async (req, res) => {
  // GET code from url
  const emailVerificationCode = req.params.verificationCode

  try {
    // Check verification link
    let verificationCodeExistance = await User.findOne({
      emailVerificationCode
    })

    // If verification link not matched
    if (!verificationCodeExistance || emailVerificationCode == null) {
      return res.status(400).send({
        errors: [
          {
            msg: 'Your email verification link is invalid'
          }
        ]
      })
    }

    // Make email verification
    await User.updateOne(
      {emailVerificationCode},
      {isEmailVerified: true, emailVerificationCode: null}
    )

    return res.status(200).send({
      success: [
        {
          msg: 'Your email verification is completed successfully'
        }
      ]
    })
  } catch (err) {
    console.log(err.message)

    // If server have error
    return res.status(500).send('Server error')
  }
})

// @route  POST api/user/password/forgot
// @desc   Password reset email check and verification link sent
// @access Public

router.post(
  '/password/forgot',
  [check('email', 'Email should be in email format and not empty').isEmail()],
  async (req, res) => {
    // Load validation lib in respect to req
    const error = validationResult(req)

    // If error exist show the error
    if (!error.isEmpty()) {
      return res.status(400).json({
        errors: error.array()
      })
    }

    const {email} = req.body

    try {
      //Check forgot email is exist or not
      let user = await User.findOne({
        email
      })

      //Show error email used user not found
      if (!user) {
        return res.status(400).send({
          errors: [
            {
              msg: 'Your email not belongs to any account'
            }
          ]
        })
      }

      // Generate password reset verification code
      const verificationCode = uuid()

      // General information for password reset link
      const mailData = {
        email,
        verificationLink: `${config.get(
          'baseURL'
        )}/api/user/password/reset/${verificationCode}`,
        subject: 'Password reset link'
      }

      // Sending email verification link
      let sendingStatus = new Promise((resolve, reject) => {
        sendEmail(mailData, resolve, reject)
      })

      // If email sending done then save the user data show success message else error message will be displayed
      sendingStatus.then(
        async resolve => {
          await User.updateOne({email}, {passwordResetCode: verificationCode})
          return res.status(200).send({
            success: [
              {
                msg:
                  'A veryfication link has been sent into your email. Please veryfy the link'
              }
            ]
          })
        },
        error => {
          return res.status(400).send({
            errors: [{msg: 'Email can not be sent. Contact with support team'}]
          })
        }
      )
    } catch (err) {
      console.log(err.message)

      // Server error
      res.status(500).send('Server error')
    }
  }
)

// @route  GET api/user/password/reset/:verificationCode
// @desc   Password reset link check and define password reset user
// @access Public

router.get('/password/reset/:verificationCode', async (req, res) => {
  const passwordResetCode = req.params.verificationCode

  try {
    let verificationCodeExistance = await User.findOne({
      passwordResetCode
    })

    if (!verificationCodeExistance) {
      return res.status(400).send({
        errors: [
          {
            msg: 'Your password reset link is invalid'
          }
        ]
      })
    }

    let user = await User.findOne({passwordResetCode}, [
      'id',
      'passwordResetCode'
    ])

    return res.json(user)
  } catch (err) {
    console.log(err.message)

    // If server have error
    return res.status(500).send('Server error')
  }
})

// @route  POST api/user/password/reset
// @desc   Password reset code, user id check and set new password
// @access Public

router.post(
  '/password/reset',
  [
    check('password', 'Password should be 6 or more character').isLength({
      min: 6
    }),
    check('user_code', 'User code should not be empty')
      .not()
      .isEmpty(),
    check('reset_code', 'Reset code should not be empty')
      .not()
      .isEmpty(),
    check(
      'confirmPassword',
      'Password and confirm password not matched'
    ).custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password and confirm password not matched')
      }
      return true
    })
  ],
  async (req, res) => {
    // Load validation lib in respect to req
    const error = validationResult(req)

    // If error exist show the error
    if (!error.isEmpty()) {
      return res.status(400).json({
        errors: error.array()
      })
    }

    let {user_code, reset_code, password, confirmPassword} = req.body

    try {
      //Check reset code and user id valid or not
      const user = await User.findOne().and([
        {_id: user_code},
        {passwordResetCode: reset_code}
      ])

      if (!user) {
        return res.status(400).send({
          errors: [
            {
              msg: 'Your password reset code and user is invalid'
            }
          ]
        })
      }

      // Password encryption process using bcryptjs
      const salt = await bcrypt.genSalt(10)

      password = await bcrypt.hash(password, salt)

      // Update new user password in the database
      await User.updateOne(
        {_id: user_code},
        {
          password: password,
          passwordResetCode: null
        }
      )

      return res.status(200).send({
        success: [
          {
            msg: 'New password has been set successfully'
          }
        ]
      })
    } catch (err) {
      console.log(err.message)

      // If server have error
      return res.status(500).send('Server error')
    }
  }
)

module.exports = router
