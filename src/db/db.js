import mongoose from 'mongoose'

import log from '../utils/log.js'

const db = {
  connect: async () => {
    try {
      await mongoose.connect(process.env.DB_CONNECTION)
      log.info('MongoDB connected')
    } catch (err) {
      log.error({ err }, 'Database connection error:')
    }
  },
  disconnect: async () => {
    try {
      await mongoose.connection.close()
      log.info('MongoDB connection closed')
    } catch (err) {
      log.error({ err }, 'Database disconnection error:')
    }
  },
}

export default db
