const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Create a unique route to signup, since no need to get data from user info
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout); //get dummy cookie
router.post('/forgotPassword', authController.forgotPassword);
// use router.patch for reset password as we update the password in database
router.patch('/resetPassword/:token', authController.resetPassword);

//NOTE:As MIDDLEWARE run in sequence, so place authController.protect ALL routes after this MIDDLEWARE
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// NOTE: ONLY admin could access below routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
