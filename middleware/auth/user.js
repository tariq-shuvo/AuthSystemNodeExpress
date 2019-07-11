const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  // Receive token as header
  const token = req.header('x-auth-token')

  // Check exist token or not
  if (!token) {
    return res.status(401).json({
      errors: [{msg: 'No token, authorization denied'}]
    })
  }

  // Check  the authorization
  try {
    const decode = jwt.verify(token, config.get('jwt').secrect)

    req.user = decode.user

    next()
  } catch (err) {
    return res.status(401).json({
      errors: [
        {
          msg: 'Authorization not valid'
        }
      ]
    })
  }
}
