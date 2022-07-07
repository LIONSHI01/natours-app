const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

router
  .route('/create-booking/:tourId')
  .post(authController.protect, bookingController.createBooking);

router
  .route('/:bookingId')
  .delete(authController.protect, bookingController.deleteBooking);

module.exports = router;
