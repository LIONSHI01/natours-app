const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDouplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

// ERROR TYPE 1: FOR DEVELOPMENT USE
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err, // send full ERROR message to developer to solve
    stack: err.stack,
  });
};

// ERROR TYPE 2: FOR PRODUCTION USE
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: dont't leak error details to client
    // 1) Log error
    console.error('ERROR 🥶', err);

    // 2) Send general message
    res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!',
    });
  }
};

// ERROR handling Middleware
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // if there is no err.statusCode then default as 500
  err.status = err.status || 'error';

  // For DEVELOPMENT: send ALL Error details
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);

    // For PRODUCTION: send Readable Error message to Clients
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // Create copy of err, prevent mutate it
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDouplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
