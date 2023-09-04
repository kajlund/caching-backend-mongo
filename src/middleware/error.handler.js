import log from '../utils/log.js'
import { statusCodes } from '../utils/statuscodes.js'
import { AppError } from '../utils/errors.js'

export default (err, req, res, _next) => {
  if (!err.isAppError) {
    log.error(err)
  }

  const error = {
    statusCode: err.status || err.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
  }

  if (err instanceof AppError) {
    error.message = err.message
    error.detail = err.detail
    if (err.errors) error.errors = err.errors
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    detail: error.detail || '',
    errors: error.errors || {},
  })
}
