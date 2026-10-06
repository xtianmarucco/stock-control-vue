const crypto = require('crypto')
const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/users.repository')
const resetsRepo = require('../repositories/passwordResets.repository')
const mailer = require('../lib/mailer')
const { isValidEmail } = require('./users.service')
const { createError } = require('../utils/handleError')

const RESET_TTL_MINUTES = 30
const RESET_COOLDOWN_SECONDS = 60
const MIN_PASSWORD_LENGTH = 8

const login = async (email, password) => {
  if (!email || !password)
    throw createError('Email and password are required', 'VALIDATION_ERROR', 400)

  const user = await usersRepo.findByEmail(email)
  if (!user) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  return { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
}

// Solo se guarda el hash del token: con un dump de la base no se puede resetear nada.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const frontendUrl = () =>
  (process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173')
    .trim()
    .replace(/\/$/, '')

// No revela si el email existe: el caller responde siempre lo mismo.
const requestPasswordReset = async (email) => {
  if (!email?.trim() || !isValidEmail(email.trim()))
    throw createError('Valid email is required', 'VALIDATION_ERROR', 400)

  const user = await usersRepo.findByEmail(email.trim())
  if (!user) return

  if (await resetsRepo.hasRecentRequest(user.id, RESET_COOLDOWN_SECONDS)) return

  const token = crypto.randomBytes(32).toString('hex')
  await resetsRepo.replaceForUser({ userId: user.id, tokenHash: hashToken(token), ttlMinutes: RESET_TTL_MINUTES })

  const link = `${frontendUrl()}/reset-password?token=${token}`
  try {
    await mailer.sendMail({
      to: user.email,
      subject: 'Restablecé tu contraseña — Stock Control',
      text:
        `Hola ${user.full_name},\n\n` +
        `Recibimos un pedido para restablecer tu contraseña. Entrá a este link para elegir una nueva:\n\n${link}\n\n` +
        `El link vence en ${RESET_TTL_MINUTES} minutos y se puede usar una sola vez.\n` +
        'Si no lo pediste vos, ignorá este mail: tu contraseña no cambia.',
      html:
        `<p>Hola ${escapeHtml(user.full_name)},</p>` +
        '<p>Recibimos un pedido para restablecer tu contraseña. Hacé click en el botón para elegir una nueva:</p>' +
        `<p><a href="${link}" style="display:inline-block;background:#1479FF;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Restablecer contraseña</a></p>` +
        `<p style="color:#64748b;font-size:13px">El link vence en ${RESET_TTL_MINUTES} minutos y se puede usar una sola vez. ` +
        'Si no lo pediste vos, ignorá este mail: tu contraseña no cambia.</p>',
    })
  } catch (err) {
    // No se propaga al cliente para no revelar qué emails existen
    console.error(`[auth] No se pudo enviar el mail de recuperación a ${user.email}: ${err.message}`)
  }
}

const resetPassword = async (token, password) => {
  if (!token) throw createError('Token is required', 'VALIDATION_ERROR', 400)
  if (!password || password.length < MIN_PASSWORD_LENGTH)
    throw createError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 'VALIDATION_ERROR', 400)

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = await resetsRepo.resetPassword({ tokenHash: hashToken(token), passwordHash })
  if (!userId) throw createError('Invalid or expired token', 'VALIDATION_ERROR', 400)
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

module.exports = { login, requestPasswordReset, resetPassword }
