const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1)Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2)Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // Temperary way to make booking(NOT secure)
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3)Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY , because it's UNSECURE: everyone can make booking without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  // If query specify tour,user, price, then create new booking
  await Booking.create({ tour, user, price });
  // Redirect user to overview page after payment
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const tour = Tour.findById(req.params.tourId);
  if (!tour) {
    return next(
      new AppError('There is no tour with this ID! Please try again.', 404)
    );
  }
  const booking = Booking.create({
    tour: tour.id,
    user: req.user.id,
    price: tour.price,
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});