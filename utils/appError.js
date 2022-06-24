class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // no need assign this.message as we pass incoming message into Parent class

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // if statusCode start with '4' , this.status = 'fail', else, = 'error'
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
