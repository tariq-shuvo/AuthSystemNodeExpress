const nodemailer = require('nodemailer')
const config = require('config')

module.exports = (mailData, resolve, reject) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.get('mailAuth').email,
      pass: config.get('mailAuth').password
    }
  })

  const mailOptions = {
    from: 'sender@email.com', // sender address
    to: mailData.email, // list of receivers
    subject: mailData.subject, // Subject line
    html: `<p>Please click this verification link ${
      mailData.verificationLink
    }</p>` // plain text body
  }

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err)
      reject()
    } else {
      resolve()
    }
  })
}
