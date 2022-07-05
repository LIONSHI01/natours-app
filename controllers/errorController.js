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
  // Convert Object err into array for .map()
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// ERROR TYPE 1: FOR DEVELOPMENT USE
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message, // send full ERROR message to developer to solve
      stack: err.stack,
    });
  }
  // B) NOTE:RENDERED WEBSITE

  console.error('ERROR 🥶', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// ERROR TYPE 2: FOR PRODUCTION USE
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: dont't leak error details to client
    // 1) Log error
    console.error('ERROR 🥶', err);

    // 2) Send general message
    return res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.error('ERROR 🥶', err);
  // Return simple error msg for UNKNOWN error
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// globalErrorHandler Middleware
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // if there is no err.statusCode then default as 500
  err.status = err.status || 'error';

  // For DEVELOPMENT: send ALL Error details
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    console.log(err);

    // For PRODUCTION: send Readable Error message to Clients
  } else if (process.env.NODE_ENV === 'production') {
    // KEYNOTE: Extract Error msg Object including its prototype constructors
    // Use Object.assign to copy all enumerable own properties from err
    let error = Object.assign(err); // Create copy of err, prevent mutate it

    // Error caused by Invalid url(endpoint)
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Error coused by MongoDB : code = 11000
    if (error.code === 11000) error = handleDouplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
