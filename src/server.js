import http from 'http'
import util from 'util'

import dotenv from 'dotenv'

dotenv.config()

import log from './utils/log.js'
import app from './app.js'

process.on('uncaughtException', (err) => {
  log.error(`UNCAUGHT EXCEPTION - ${err.stack || err}`)
  throw err
})

process.on('unhandledRejection', (reason, p) => {
  log.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)} reason: ${reason}`)
})

log.info('Starting server')
http.createServer(app).listen(process.env.PORT, () => {
  log.info(`Server listening on port ${process.env.PORT}`)
})
