import express from 'express'
import cors from 'cors'

const app = express()

// Middleware to handle incoming JSON payloads
app.use(express.json())
// Middleware for url encoding
app.use(express.urlencoded({ extended: true }))
// Middleware for handling CORS policy
app.use(cors())

// Helper endpoints for service check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Service running OK' })
})

app.get('/ping', (req, res) => {
  res.status(200).send('Pong')
})

// Route handlers

// 404 Handler

// Error Handler

// Connect to DB

export default app
