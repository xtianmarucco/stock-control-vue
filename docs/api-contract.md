# 📋 API Design Rules

Este documento define cómo debe diseñarse e implementarse la API del backend.

Todos los endpoints deben seguir estas reglas estrictamente.

---

# 🧱 Principios Generales

- Usar convenciones RESTful
- Usar JSON para todos los requests y responses
- Respuestas consistentes en todos los endpoints

---

# 🌐 Base URL

/api

---

# 📝 Nomenclatura de Recursos

- Usar sustantivos en plural
- Lowercase y hyphen-case:

  /branches
  /products
  /stock-movements
  /reason-categories

---

# 📍 Estructura de Endpoints

## Branches (Sucursales)

GET    /branches               → listar todas las sucursales
GET    /branches/:id           → detalle de una sucursal
POST   /branches               → crear sucursal
PUT    /branches/:id           → actualizar sucursal

## Stock por sucursal

GET    /branches/:id/stock                        → stock detallado (con filtro ?category=)
GET    /branches/:id/stock-summary-by-category    → resumen para gráfico donut

## Products (Productos)

GET    /products               → listar todos los productos
GET    /products/:id           → detalle de un producto
POST   /products               → crear producto
PUT    /products/:id           → actualizar producto

## Stock Movements (Movimientos)

GET    /stock-movements        → listar movimientos (con filtros)
POST   /stock-movements        → crear movimiento (con sus items)
GET    /stock-movements/:id    → detalle de un movimiento

## Reason Categories (Categorías de motivo)

GET    /reason-categories      → listar categorías disponibles

---

# 📥 Filtros con Query Params

Filtros siempre van como query params, nunca en el body:

/stock-movements?branch_id=1&type=TRANSFER&from=2026-01-01&to=2026-01-31
/branches/:id/stock?category=Sabores+al+Agua

---

# 📥 Request Format

Usar JSON body para POST y PUT.

Ejemplo — POST /stock-movements:

{
  "movement_type": "TRANSFER",
  "from_branch_id": 1,
  "to_branch_id": 2,
  "reason_category_id": null,
  "reason": "Reposición semanal",
  "items": [
    { "product_id": 5, "quantity": 10 },
    { "product_id": 8, "quantity": 4 }
  ]
}

---

# ✅ Response Format — SUCCESS

Todas las respuestas exitosas deben seguir esta estructura:

{
  "success": true,
  "data": ...
}

## Recurso único:

{
  "success": true,
  "data": {
    "id": 1,
    "name": "Castelli"
  }
}

## Lista:

{
  "success": true,
  "data": [
    { "id": 1, "name": "Castelli" },
    { "id": 2, "name": "Diagonal" }
  ]
}

## Creación exitosa (201):

{
  "success": true,
  "data": {
    "id": 12
  }
}

---

# ❌ Error Response Format

Todos los errores deben seguir esta estructura:

{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE"
  }
}

## Códigos de error comunes

- VALIDATION_ERROR   → input inválido o faltante
- NOT_FOUND          → recurso no encontrado
- INSUFFICIENT_STOCK → stock insuficiente para el movimiento
- UNAUTHORIZED       → usuario no autenticado
- INTERNAL_ERROR     → error interno del servidor

---

# 🔢 Status Codes

- 200 → éxito general
- 201 → recurso creado
- 400 → error de validación
- 401 → no autenticado
- 404 → recurso no encontrado
- 500 → error interno

---

# 📅 Manejo de Fechas

- Usar formato ISO: YYYY-MM-DD
- El backend debe validar las fechas recibidas
- Las fechas almacenadas en DB se devuelven en ISO 8601

---

# 🔐 Autenticación

- Usar autenticación basada en sesión (express-session)
- Las rutas protegidas deben requerir sesión válida
- Devolver 401 si el usuario no está autenticado

---

# 🧠 Reglas de comportamiento del backend

- Siempre validar el input antes de procesar
- Nunca exponer errores internos (stack traces, mensajes de Prisma)
- Siempre devolver respuestas consistentes
- Los movimientos de stock son atómicos (transacciones en DB)

---

# 🚫 Qué Evitar

- NO devolver la respuesta cruda de Prisma/DB sin transformar
- NO mezclar formatos de respuesta entre endpoints
- NO usar el body para filtros (solo query params)
- NO exponer IDs o datos internos sensibles innecesariamente

---

# 🎯 Objetivo

Crear una API predecible y consistente
que sea fácil de consumir desde el frontend.
