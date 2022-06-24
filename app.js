const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARE
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`, //originalUrl is property of req
  });
});

module.exports = app;
