class AppError extends Error {
  constructor(message, statusCode) {
    // in parent Class Error, it only accept message so super(message)
    // no need assign this.message as we already have it in Parent class Error
    super(message);

    this.statusCode = statusCode;
    // if statusCode start with '4' , this.status = 'fail', else, = 'error'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // for later filtering, only send operational error to Client
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
