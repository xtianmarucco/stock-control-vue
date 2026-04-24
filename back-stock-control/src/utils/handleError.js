const { PrismaClientKnownRequestError } = require('@prisma/client')

const handleError = (res, err) => {
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { message: 'Ya existe un registro con ese valor único', code: 'CONFLICT' }
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Registro no encontrado', code: 'NOT_FOUND' }
      })
    }
    console.error('[Prisma error]', err.code, err.meta)
    return res.status(500).json({
      success: false,
      error: { message: 'Database error', code: 'INTERNAL_ERROR' }
    })
  }

  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = status < 500 ? err.message : 'Internal server error'

  res.status(status).json({
    success: false,
    error: { message, code }
  })
}

const createError = (message, code, status) => {
  const err = new Error(message)
  err.code = code
  err.status = status
  return err
}

module.exports = { handleError, createError }
