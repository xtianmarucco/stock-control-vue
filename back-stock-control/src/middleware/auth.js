const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
  }
  next()
}

module.exports = { requireAuth }
