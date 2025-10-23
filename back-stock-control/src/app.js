// src/app.js
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


const cors = require('cors')
app.use(cors())
// Middleware
app.use(express.json());

// Rutas base
const routes = require('./routes');
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});