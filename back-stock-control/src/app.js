// src/app.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 👉 Importar las rutas de branches
const branchesRoutes = require('./routes/branches.routes');

// 👉 Registrar rutas bajo /api/branches
app.use('/api/branches', branchesRoutes);

// Si tenés más rutas generales, podés agregarlas aquí:
// const otherRoutes = require('./routes/other.routes');
// app.use('/api/other', otherRoutes);

// Ruta base opcional para verificar el estado del servidor
app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});