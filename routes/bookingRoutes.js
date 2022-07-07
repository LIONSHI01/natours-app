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
  .route('/:id')
  .get(authController.protect, bookingController.getBooking)
  .patch(authController.protect, bookingController.updateBooking)
  .delete(authController.protect, bookingController.deleteBooking);

module.exports = router;
