# Stock Control — Heladería Multi-Sucursal

Sistema de control de stock interno para una heladería con múltiples sucursales. Permite visualizar stock, registrar movimientos, gestionar el catálogo de productos y exportar reportes.

---

## Tech Stack

### Frontend
| Librería | Versión | Uso |
|---|---|---|
| Vue 3 | ^3.5 | Framework UI (Composition API) |
| Vite | ^7.1 | Bundler y dev server |
| Tailwind CSS | v4 | Estilos utilitarios |
| Pinia | ^3.0 | Estado global |
| Vue Router | ^4.6 | Navegación SPA |
| Axios | ^1.12 | Cliente HTTP |
| Chart.js + vue-chartjs | ^4.5 / ^5.3 | Gráficos donut por sucursal |
| jsPDF + jspdf-autotable | ^4.2 / ^5.0 | Exportación a PDF |
| xlsx | ^0.18 | Exportación a Excel |
| lucide-static | ^1.16 | Iconografía (bundleada localmente) |
| Vitest | ^4.1 | Tests unitarios |
| @vue/test-utils | ^2.4 | Tests de componentes |
| happy-dom | ^20.9 | DOM virtual para tests |
| @pinia/testing | ^1.0 | Mocking de stores en tests |

### Backend
| Librería | Versión | Uso |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | ^5.1 | Framework HTTP |
| Prisma | ^7.8 | ORM |
| PostgreSQL | 15 | Base de datos |
| bcrypt | ^6.0 | Hash de contraseñas |
| express-session | ^1.19 | Autenticación por sesión |
| connect-pg-simple | ^10.0 | Almacenamiento de sesiones en PostgreSQL |
| cors | ^2.8 | Control de CORS |
| dotenv | ^17.2 | Variables de entorno |
| pg | ^8.16 | Driver PostgreSQL (solo para session store) |
| Vitest | ^4.1 | Tests unitarios |

---

## Funcionalidades

### Autenticación
- Login/logout con sesión persistente (express-session + PostgreSQL)
- Roles: `admin` y `colaborador`
- Rutas protegidas por middleware según rol
- Sesión con duración de 8 horas

### Dashboard
- KPIs en tiempo real: total de productos, stock bajo, sucursales activas
- Gráficos donut de stock por categoría, uno por sucursal
- Alertas visuales de productos con stock crítico (≤ 3 unidades)

### Catálogo de Productos
- Listado paginado con filtro por categoría y búsqueda por nombre
- Drawer de detalle con desglose de embalaje (bulto → caja → unidad) y ratios de conversión
- Soft delete: dar de baja un producto (oculta sin eliminar)
- Restaurar producto dado de baja
- Eliminación definitiva (solo para productos ya inactivos)
- Toggle "Mostrar inactivos" para ver productos dados de baja
- Al crear un producto se generan automáticamente registros de `branch_stock` para todas las sucursales activas

### Sucursales
- CRUD completo de sucursales
- Stock por sucursal con filtro por categoría
- Resumen de stock por categoría (para gráfico donut)
- Eliminar sucursal elimina en cascada todos sus movimientos y stock asociado

### Movimientos de Stock
- Tres tipos:
  - **TRANSFER**: traslado entre dos sucursales distintas (valida stock disponible)
  - **ADJUSTMENT**: ajuste de inventario con categoría de motivo (reduce stock)
  - **INTERNAL**: movimiento interno con categoría de motivo (aumenta o reduce)
- Formulario en página dedicada con selección de productos multi-item
- Validación de stock disponible antes de confirmar
- Transacciones atómicas: si falla un item, toda la operación hace rollback
- Historial paginado con filtros por sucursal, tipo y rango de fechas
- Vista de detalle de movimiento

### Categorías de Motivo
- CRUD completo
- Asociadas a tipos ADJUSTMENT e INTERNAL
- Ejemplos: vencimiento, robo, rotura, ingreso por proveedor, baja por venta

### Usuarios
- CRUD completo (solo admin)
- Campos: nombre completo, email, DNI, rol, contraseña
- Cambio de contraseña con toggle de visibilidad

### Reportes
- Reporte consolidado de stock por sucursal y categoría
- Exportación a Excel (.xlsx)
- Exportación a PDF (con tabla formateada)

### UX
- Skeleton loaders con animación shimmer en todos los estados de carga
- Notificaciones toast globales para todas las operaciones CRUD
- Diseño responsive (mobile-first)

---

## Arquitectura

### Backend — Capas
```
routes → controllers → services → repositories → Prisma → PostgreSQL
```

- **Routes**: definen los endpoints y aplican middlewares de auth
- **Controllers**: manejan HTTP, delegan al service, formatean respuesta
- **Services**: lógica de negocio, validaciones, orquestación
- **Repositories**: queries a la base de datos via Prisma

### Frontend — Estructura
```
views → (stores) → services → apiClient (Axios) → API
```

```
src/
  views/          → páginas completas
  components/     → componentes reutilizables
  layouts/        → layouts de página (Dashboard, Products)
  stores/         → estado global (Pinia)
  services/       → capa HTTP (uno por recurso)
  router/         → definición de rutas
```

### Modelo de Datos
```
branches ←── branch_stock ───→ products
    │                               │
    └──── stock_movements ──────────┘
               │
               ├── stock_movement_items
               ├── reason_categories
               └── users
```

---

## Variables de Entorno

### Backend (`back-stock-control/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=secreto-largo-y-aleatorio
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (`front-stock-control/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

Para producción, `VITE_API_URL` se inyecta como build argument en el Dockerfile.

---

## Correr localmente

### Requisitos
- Node.js 20
- Docker (para PostgreSQL)

### Base de datos
```bash
cd docker
docker compose up -d
```

### Backend
```bash
cd back-stock-control
npm install
npx prisma migrate dev
node src/app.js         # o: npm run dev (con nodemon)
```

### Frontend
```bash
cd front-stock-control
npm install
npm run dev
```

---

## Tests

### Backend
```bash
cd back-stock-control
npm test
```
Cubre: products, stockMovements, auth, branches, users, reasonCategories (services).

### Frontend
```bash
cd front-stock-control
npm test
```
Cubre: stores (productStore, authStore) y componentes (ProductDrawer, StockMovementModal).

---

## Deployment

El sistema se despliega con Docker en Dokploy. Cada entorno (QA / Producción) tiene sus propios servicios y base de datos independientes.

### Servicios por entorno
| Servicio | Puerto interno |
|---|---|
| Frontend (nginx) | 80 |
| Backend (Node.js) | 3000 |
| PostgreSQL | 5432 |

### Variables de entorno en producción (backend)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db-host:5432/dbname
SESSION_SECRET=<secreto-fuerte-generado-con-openssl-rand-hex-32>
CORS_ORIGIN=https://tu-dominio-frontend.com
```

### Migraciones en producción
```bash
npx prisma migrate deploy
```

---

## Ramas

| Rama | Propósito |
|---|---|
| `develop` | Desarrollo local |
| `qa` | Entorno de staging / QA |
| `master` | Producción |
