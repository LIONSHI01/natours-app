const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// NOTE: specify v1 for later update to v2, client could still use v1
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// Respond to URL Parameters
router
  .route('/:id')
  .get(tourController.getTour) //let authenticated user access this route
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
