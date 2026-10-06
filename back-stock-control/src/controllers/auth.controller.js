const authService = require('../services/auth.service')
const { handleError } = require('../utils/handleError')

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body.email, req.body.password)
    req.session.userId = user.id
    req.session.email = user.email
    req.session.fullName = user.full_name
    req.session.role = user.role
    res.json({ success: true, data: user })
  } catch (err) {
    handleError(res, err)
  }
}

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, error: { message: 'Logout failed', code: 'INTERNAL_ERROR' } })
    res.clearCookie('connect.sid')
    res.json({ success: true, data: null })
  })
}

const me = (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.session.userId,
      email: req.session.email,
      full_name: req.session.fullName,
      role: req.session.role
    }
  })
}

// Responde siempre lo mismo, exista o no el email
const forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset(req.body.email)
    res.json({ success: true, data: null })
  } catch (err) {
    handleError(res, err)
  }
}

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.json({ success: true, data: null })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { login, logout, me, forgotPassword, resetPassword }
