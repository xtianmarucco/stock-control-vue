const authService = require('../services/auth.service')
const { handleError } = require('../utils/handleError')

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body.username, req.body.password)
    req.session.userId = user.id
    req.session.username = user.username
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
  res.json({ success: true, data: { id: req.session.userId, username: req.session.username, role: req.session.role } })
}

module.exports = { login, logout, me }
