const nodemailer = require('nodemailer')

// Sin SMTP_HOST (desarrollo) los mails se imprimen en consola en lugar de enviarse.
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (Number(process.env.SMTP_PORT) || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log(`[mailer] SMTP no configurado — mail para ${to}\nAsunto: ${subject}\n${text}`)
    return
  }
  await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, text, html })
}

module.exports = { sendMail }
