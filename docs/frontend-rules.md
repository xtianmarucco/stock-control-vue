# 🎨 Frontend Architecture Rules

Estamos construyendo una aplicación web interna con Vue 3.

El frontend debe ser:
- simple
- rápido
- limpio
- fácil de mantener

---

# ⚙️ Tech Stack

- Vue 3 (Composition API)
- Tailwind CSS v4
- Pinia (estado global)
- Axios (cliente HTTP centralizado)
- Chart.js + vue-chartjs (gráficos de stock)

---

# 🧱 Estructura del Proyecto

src/
  components/
  views/
  layouts/
  stores/
  services/
  router/

---

# 🧠 State Management (Pinia)

- Usar Pinia para estado global
- NO usar variables reactivas globales fuera de Pinia
- Mantener los stores limpios y enfocados

Stores activos:
- authStore       → usuario autenticado, rol, login/logout
- toastStore      → notificaciones globales (add, remove)
- productStores   → catálogo de productos (listado, filtros)

---

# 🌐 API Layer

- NUNCA llamar a axios directamente dentro de los componentes o views
- Siempre usar la capa de servicios

Estructura:
- services/apiClient.js     → instancia axios centralizada (baseURL, headers, interceptors)
- services/branchService.js
- services/productService.js
- services/stockService.js
- services/movementsService.js

---

# 📦 API Client (apiClient.js)

Crear una instancia centralizada de Axios:

```js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor de errores centralizado
apiClient.interceptors.response.use(
  res => res,
  err => {
    // manejo global de errores aquí
    return Promise.reject(err)
  }
)

export default apiClient
```

Todos los servicios importan `apiClient`, no `axios` directamente.

---

# 🔗 Variables de Entorno

El frontend usa Vite, por lo tanto las vars deben tener el prefijo `VITE_`:

VITE_API_URL=http://localhost:3000/api

Nunca hardcodear URLs en los servicios.

---

# ⚠️ Reglas Críticas

- NUNCA mezclar lógica de negocio dentro de los componentes
- Los componentes deben ser lo más "tontos" posible
- La lógica vive en:
  - stores
  - services

---

# 📊 Gráficos (Chart.js)

- Usar vue-chartjs como wrapper
- Registrar los componentes de Chart.js necesarios (no registrar globalmente lo que no se usa)
- Los datos para el gráfico deben calcularse en el componente o store, no en el template
- Usar colores consistentes con el design system cuando sea posible

---

# 🧩 Componentes

- Deben ser reutilizables
- Pequeños y enfocados en una sola responsabilidad
- Evitar componentes monolíticos grandes

Componentes base esperados:
- AppButton
- AppCard
- AppTable
- AppModal
- AppBadge (para low_stock, tipos de movimiento, etc.)

---

# 🗂️ Views

- Representan páginas completas
- Pueden orquestar componentes y llamar al store
- No deben contener lógica pesada

Vistas actuales:
- LoginView               → autenticación
- DashboardView           → KPIs, gráficos donut, alertas de stock bajo
- ProductsCatalogView     → catálogo maestro con drawer, filtros y paginación
- ProductsTableView       → tabla de stock por sucursal y categoría
- StockMovementsView      → historial de movimientos con filtros
- NewStockMovementView    → formulario de creación de movimiento (página dedicada)
- ReportsView             → reporte consolidado con exportación Excel/PDF
- BranchesView            → CRUD de sucursales
- UsersView               → CRUD de usuarios (solo admin)
- ReasonCategoriesView    → CRUD de categorías de motivo

---

# 🔄 Data Flow

View → llama store
Store → llama service
Service → llama apiClient (Axios)

---

# 🔐 Autenticación

- Guardar estado de sesión en Pinia (authStore)
- Verificar autenticación al cargar la app
- Redirigir usuarios no autenticados al login

---

# 🎯 UX Rules

Esta es una herramienta interna usada en un negocio real.

Prioridades:
- velocidad
- claridad
- mínima cantidad de clicks

Evitar:
- `alert()` del navegador para validaciones — usar mensajes inline o toast
- Mostrar errores técnicos al usuario — mostrar mensajes amigables

---

# 📱 Responsive Design

- Mobile-first
- El sidebar colapsa en mobile
- Las cards se apilan verticalmente en pantallas pequeñas

---

# 🎨 Estilos

- Usar Tailwind CSS v4
- Evitar CSS custom a menos que sea necesario
- Mantener espaciado y layout consistente con el design system en `docs/ui-rules.md`

---

# 🚫 Qué Evitar

- NO usar librerías innecesarias
- NO sobreingeniería en componentes
- NO duplicar lógica entre stores y servicios
- NO hardcodear la URL de la API
- NO llamar axios directamente (siempre via apiClient)

---

# 🧠 Code Style

- Nombres claros y descriptivos
- Preferir Composition API
- Usar async/await (no .then chains)
- Manejar errores correctamente en todos los async calls
