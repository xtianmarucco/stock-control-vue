# 🧠 Project Overview

Sistema de control de stock interno para una heladería con múltiples sucursales.

Objetivos principales:
- Visualizar stock por sucursal y categoría de producto
- Registrar movimientos de stock (traslados, ajustes, internos)
- Alertar sobre productos con stock bajo
- (Futuro) Control de acceso por usuario/sucursal

El sistema debe ser simple, rápido y fácil de usar en un entorno real de negocio.

---

# ⚙️ Tech Stack

Frontend:
- Vue 3 (Composition API)
- Tailwind CSS v4
- Axios (cliente HTTP centralizado)
- Pinia (estado global)
- Chart.js + vue-chartjs (gráficos de stock)

Backend:
- Node.js
- Express 5
- Prisma ORM (PostgreSQL)
- express-session + connect-pg-simple (autenticación)
- bcrypt (hashing de contraseñas)

Base de datos:
- PostgreSQL 15 (Docker local, puerto 5433)

---

# 📐 Core Concepts

## Sucursales (branches)
- Cada sucursal tiene su propio stock independiente
- Todo movimiento tiene al menos una sucursal origen

## Productos (products)
- Tienen nombre y `category_name`
- Categorías existentes: Sabores al Agua, Sabores Comunes, Sabores Especiales, Sabores Premium, Frutas Bañadas, Palitos, Impulsivos, Sin TACC, Tortas y Postres, Familiar, Pote 1 Lts, Insumos

## Stock por sucursal (branch_stock)
- Relación producto ↔ sucursal con cantidad total (`total`)
- `low_stock = true` cuando `total <= 3`

## Movimientos de stock (stock_movements)
- **TRANSFER**: traslado entre dos sucursales distintas
- **ADJUSTMENT**: ajuste de inventario (reduce stock, cantidad negativa)
- **INTERNAL**: movimiento interno con categoría de motivo (`reason_category`)
- Cada movimiento tiene 1..N items (`stock_movement_items`)
- Son atómicos: si un item falla, todo el movimiento hace ROLLBACK

## Categorías de motivo (reason_categories)
- Aplican a movimientos ADJUSTMENT e INTERNAL
- Ejemplo: merma, robo, vencimiento, uso interno

---

# 🧠 AI Behavior Rules

- Siempre seguir las reglas de arquitectura definidas en `docs/`
- No introducir nuevas tecnologías sin pedido explícito
- Priorizar simplicidad sobre complejidad
- Generar código limpio y listo para producción
- Si algo no está claro, preguntar antes de asumir

---

# 🎯 Development Philosophy

- MVP primero, no diseñar para el futuro hipotético
- Simple y directo
- Usabilidad real en negocio por encima de elegancia técnica
- Sin sobre-ingeniería

---

# 📋 Reglas por área

| Área       | Archivo                    |
|------------|----------------------------|
| API        | `docs/api-contract.md`     |
| Backend    | `docs/backend-rules.md`    |
| Frontend   | `docs/frontend-rules.md`   |
| UI         | `docs/ui-rules.md`         |

---

# ✅ Token Efficient Rules

1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.
