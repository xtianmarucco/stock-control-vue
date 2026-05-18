require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const sessionStore = require('./lib/sessionStore')
const routes = require('./routes')
const { handleError } = require('./utils/handleError')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
}))

app.use('/api', routes)

app.get('/', (_req, res) => res.json({ success: true, data: 'API running' }))

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found', code: 'NOT_FOUND' } })
})

app.use((err, _req, res, _next) => {
  handleError(res, err)
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
