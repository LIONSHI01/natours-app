const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Check if the User is logged in
router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.route('/tour/:slug').get(viewController.getTour);
router.get('/login', viewController.getLoginForm);

module.exports = router;
