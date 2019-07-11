const express = require('express')
const router = express.Router()

// Load unique id generator
const uuid = require('uuid/v1')

// Load config variables
const config = require('config')

// Express validator load
const {check, validationResult} = require('express-validator')
// Load Admin Model
const Admin = require('../../models/Admin')
// Load Bcryptjs for password encryption
const bcrypt = require('bcryptjs')
// Load gravatar for auto get image from email address
const gravatar = require('gravatar')
// Load jsonwebtoken for generate token
const jwt = require('jsonwebtoken')

// Load custom email sender
const sendEmail = require('../../email/nodemailer-email')

// Load auth middleware
const auth = require('../../middleware/auth/user')

// @route GET api/admin
// @desc  Fetch admin information
// @access Public

router.get('/', auth, async (req, res) => {
  try {
    const adminid = req.user.id

    if (req.user.type !== 'admin') {
      return res.status(401).send({
        errors: [
          {
            msg: 'Faild user authorization'
          }
        ]
      })
    }

    let admin = await Admin.findOne({_id: adminid})
      .select([
        '-password',
        '-isEmailVerified',
        '-passwordResetCode',
        '-emailVerificationCode'
      ])
      .populate('contactinfo', [
        'phone',
        'address',
        'division',
        'district',
        'thana'
      ])
    return res.status(200).json(admin)
  } catch (err) {
    console.error(err.message)

    return res.send('Server error')
  }
})

// @route POST api/admin
// @desc Register Admin Information
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

    // Get POST input from admin
    const {firstname, lastname, email, password} = req.body

    // Generate unique email verification code
    const verificationCode = uuid()

    try {
      // Check registration email exsist or not
      let admin = await Admin.findOne({
        email
      })

      // Generate error is email already exist
      if (admin) {
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

      // Create admin instance for database save
      admin = new Admin({
        firstname,
        lastname,
        email,
        avatar,
        password,
        emailVerificationCode: verificationCode
      })

      // Password encryption process using bcryptjs
      const salt = await bcrypt.genSalt(10)

      admin.password = await bcrypt.hash(password, salt)

      // General information for email verification link
      const mailData = {
        email,
        verificationLink: `${config.get(
          'baseURL'
        )}/api/admin/email/verify/${verificationCode}`,
        subject: 'Email verification link'
      }

      // Sending email verification link
      let sendingStatus = new Promise((resolve, reject) => {
        sendEmail(mailData, resolve, reject)
      })

      // If email sending done then save the admin data show success message else error message will be displayed
      sendingStatus.then(
        async resolve => {
          await admin.save()
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

// @route  GET api/admin/verify/email/:verificationCode
// @desc   Email verification code check and vefification
// @access Public

router.get('/verify/email/:verificationCode', async (req, res) => {
  // GET code from url
  const emailVerificationCode = req.params.verificationCode

  try {
    // Check verification link
    let verificationCodeExistance = await Admin.findOne({
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

    // Get admin id accoring to emailVerificationCode
    const admin_id = verificationCodeExistance.id

    // Make email verification
    let admin = await Admin.updateOne(
      {emailVerificationCode},
      {isEmailVerified: true, emailVerificationCode: null}
    )

    let payload = {
      admin: {
        id: admin_id,
        type: 'admin'
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
              msg: 'Your email verification is completed successfully'
            }
          ],
          token
        })
      }
    )
  } catch (err) {
    console.log(err.message)

    // If server have error
    return res.status(500).send('Server error')
  }
})

// @route  POST api/admin/password/forgot
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
      let admin = await Admin.findOne({
        email
      })

      //Show error email used admin not found
      if (!admin) {
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
        )}/api/admin/password/reset/${verificationCode}`,
        subject: 'Password reset link'
      }

      // Sending email verification link
      let sendingStatus = new Promise((resolve, reject) => {
        sendEmail(mailData, resolve, reject)
      })

      // If email sending done then save the user data show success message else error message will be displayed
      sendingStatus.then(
        async resolve => {
          await Admin.updateOne({email}, {passwordResetCode: verificationCode})
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

// @route  GET api/admin/password/reset/:verificationCode
// @desc   Password reset link check and define password reset user
// @access Public

router.get('/password/reset/:verificationCode', async (req, res) => {
  const passwordResetCode = req.params.verificationCode

  try {
    let verificationCodeExistance = await Admin.findOne({
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

    let admin = await Admin.findOne({passwordResetCode}, [
      'id',
      'passwordResetCode'
    ])

    return res.json(admin)
  } catch (err) {
    console.log(err.message)

    // If server have error
    return res.status(500).send('Server error')
  }
})

// @route  POST api/admin/password/reset
// @desc   Password reset code, admin id check and set new password
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
      //Check reset code and admin id valid or not
      const admin = await Admin.findOne().and([
        {_id: user_code},
        {passwordResetCode: reset_code}
      ])

      if (!admin) {
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

      // Update new password of admin in the database
      await Admin.updateOne(
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
