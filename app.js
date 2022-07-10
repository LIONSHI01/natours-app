const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// NOTE: For website cookies secure sending in Heroku
app.enable('trust proxy');

// KEYNOTE: Set up Render Engine
app.set('view engine', 'pug');
app.set('veiws', path.join(__dirname, 'views')); // use path Library for better document directory performance on different Operating Systems

// 1) GLOBAL MIDDLEWARE
// Implement CORS
// A) Allow simple request: GET
app.use(cors());
// Allow complex request: POST, PATCH, DELETE etc
app.options('*', cors());
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// KEYNOTE :(!!!ORDER matters) Create Middleware function to response request,Without specify Routing, it response to every request

// Set Security HTTP headers
// Adding variables in helmet for preventing mapbox error
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", 'https:', 'http:', 'unsafe-inline'],
    },
  })
);

// Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Create middleware to limit request from same IP
const limiter = rateLimit({
  max: 100, // Number of request from a IP
  windowMs: 60 * 60 * 1000, // Counting Period(Window-Milisecond)
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // apply limiter to URL start with '/api'

// KEYNOTE: For Stripe Checkout session
// 1) Stripe POST a raw format data
// 2) Place in app.js and before app.use(express.json()): Prevent app.use(express.json()) convert the req.body from Stripe to JSON
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
// KEYNOTE: use Middleware to read POST JSON data from Clients
app.use(express.json({ limit: '10kb' })); //Limit to parse 10kb data from body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// KEYNOTE: Parse data from cookies of Client side
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //Romove $ sign
// Data sanitization against XSS
app.use(xss()); // Remove malicious HTML code
// Prevent Parameters Polution: remove duplicate fields
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
// These are Middlewares
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

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
