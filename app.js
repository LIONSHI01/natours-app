const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARE
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Create middleware to limit request from client
const limiter = rateLimit({
  max: 100, // Number of request from a IP
  windowMs: 60 * 60 * 1000, // Counting Period(Window-Milisecond)
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // apply limiter to URL start with '/api'

// KEYNOTE: use Middleware to read POST JSON data from Clients
app.use(express.json());

// KEYNOTE :(!!!ORDER matters) Create Middleware function to response request,Without specify Routing, it response to every request

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
// These are Middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling Unhandled routes
// NOTE: Middleware follow orders, so this middleware place after tourRouter and userRouter, if any request reach here = not caught by tourRouter or userRouter, so is invalid request

// '*' = all requests
// Placed after app.use('/api/v1/tours', tourRouter)& app.use('/api/v1/users', userRouter), so any route request not handled by these two ,handled by app.all(*)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // anything in next() is error
});

// ERROR handling Middleware
app.use(globalErrorHandler);

module.exports = app;
