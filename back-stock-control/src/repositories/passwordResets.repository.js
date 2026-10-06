const prisma = require('../lib/prisma')

// Los tiempos se calculan con NOW() de Postgres para no depender de la zona horaria de Node.

const hasRecentRequest = async (userId, seconds) => {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM password_reset_tokens
      WHERE user_id = ${userId} AND created_at > NOW() - make_interval(secs => ${seconds})
    ) AS recent`
  return rows[0].recent
}

// Un token nuevo invalida los anteriores del mismo usuario.
const replaceForUser = ({ userId, tokenHash, ttlMinutes }) =>
  prisma.$transaction([
    prisma.$executeRaw`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`,
    prisma.$executeRaw`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, NOW() + make_interval(mins => ${ttlMinutes}))`,
  ])

// Consume el token y cambia la contraseña en una sola transacción.
// El UPDATE ... RETURNING garantiza que un mismo token no pueda usarse dos veces.
// Retorna el user_id, o null si el token no existe, ya se usó o venció.
const resetPassword = ({ tokenHash, passwordHash }) =>
  prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      UPDATE password_reset_tokens SET used_at = NOW()
      WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > NOW()
      RETURNING user_id`
    if (!rows.length) return null

    const userId = rows[0].user_id
    await tx.$executeRaw`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`
    await tx.$executeRaw`DELETE FROM password_reset_tokens WHERE user_id = ${userId} AND used_at IS NULL`
    // Cierra todas las sesiones abiertas del usuario (connect-pg-simple guarda sess como JSON)
    await tx.$executeRaw`DELETE FROM session WHERE sess->>'userId' = ${String(userId)}`
    return userId
  })

module.exports = { hasRecentRequest, replaceForUser, resetPassword }
