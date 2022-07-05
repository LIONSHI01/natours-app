const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router
  .route('/tour/:slug')
  .get(authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

// ACCOUNT PAGE
router.get('/me', authController.protect, viewController.getAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
