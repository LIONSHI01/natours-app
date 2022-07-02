const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// Merge with reveiwRouter, redirect request to reviewRouter
router.use('/:tourId/reviews', reviewRouter);

// NOTE: specify v1 for later update to v2, client could still use v1
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(
  authController.protect, //Check user login
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// Respond to URL Parameters, can name it as :id, :token,etc
router
  .route('/:id')
  .get(tourController.getTour) //let authenticated user access this route
  .patch(
    authController.protect, //Check user login
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect, //Check user login
    authController.restrictTo('admin', 'lead-guide'), //Check user accessibility
    tourController.deleteTour
  );

module.exports = router;
