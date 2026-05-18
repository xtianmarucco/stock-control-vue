# 🧱 Backend Architecture Rules

Usamos arquitectura en capas:

- controllers  → manejan HTTP requests/responses
- services     → contienen la lógica de negocio
- repositories → interactúan con la base de datos via Prisma

---

# ⚠️ Reglas Críticas

- NUNCA poner lógica de negocio dentro de los controllers
- Los controllers deben ser delgados (thin controllers)
- Los services contienen toda la lógica de negocio
- Los repositories solo manejan queries a la base de datos

---

# 🗄️ Base de datos — Prisma es el único ORM

- **TODO** acceso a datos va a través de Prisma (`src/lib/prisma.js`)
- Nunca usar `pg` directamente para queries de la aplicación
- `pg` solo se usa para `connect-pg-simple` (session store)
- La única variable de conexión es `DATABASE_URL`
- El schema vive en `backend/prisma/schema.prisma` — ese archivo es la fuente de verdad
- Después de cualquier cambio de schema: `prisma migrate dev` (dev) o `prisma migrate deploy` (prod)

---

# 📁 Estructura de Carpetas

src/
  controllers/
  services/
  repositories/
  routes/
  middlewares/
  lib/          → prisma.js vive aquí
  utils/

---

# 🔐 Autenticación

- Usar express-session para autenticación
- Las sesiones se almacenan en PostgreSQL via `connect-pg-simple` (tabla: `session`)
- `SESSION_SECRET` debe ser variable de entorno; la app debe fallar al iniciar si no está en producción
- Guardar `userId` en la sesión
- Usar middleware para proteger rutas

---

# 🔄 Lógica de Movimientos de Stock

Los movimientos son la operación más crítica del sistema:

- Siempre ejecutar dentro de una transacción Prisma (`$transaction`)
- Si cualquier item falla → ROLLBACK completo
- TRANSFER: descontar de sucursal origen, sumar en sucursal destino
- ADJUSTMENT: descontar de sucursal origen (cantidad ya viene negativa)
- INTERNAL: aplicar cantidad positiva o negativa según el caso
- Validar stock disponible antes de procesar outflow

---

# 📦 Convenciones de Capas

## Controller (delgado)

```js
const createMovement = async (req, res) => {
  try {
    const data = await stockMovementsService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}
```

## Service (lógica de negocio)

```js
const create = async (payload) => {
  validateMovementPayload(payload)
  return stockMovementsRepository.createWithItems(payload)
}
```

## Repository (solo DB)

```js
const createWithItems = async (payload) => {
  return prisma.$transaction(async (tx) => {
    // insert movement + items + update branch_stock
  })
}
```

---

# 🛡️ Validación

- Siempre validar el input en el service (no en el controller)
- Lanzar errores con código semántico:

```js
const err = new Error('Stock insuficiente')
err.code = 'INSUFFICIENT_STOCK'
err.status = 400
throw err
```

- Usar un `handleError` centralizado en utils para formatear la respuesta

---

# 🌐 Variables de Entorno

Requeridas:

DATABASE_URL=postgresql://user:pass@localhost:5433/heladeria
SESSION_SECRET=secret_muy_largo_y_seguro
PORT=3000

Nunca usar las variables individuales DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
con Prisma — solo DATABASE_URL.

---

# 🚫 Qué Evitar

- NO poner lógica de negocio en controllers
- NO hacer queries directas en controllers o services (solo en repositories)
- NO exponer mensajes de error internos de Prisma al cliente
- NO saltear validaciones "porque el frontend ya valida"
