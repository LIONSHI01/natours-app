const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Generate signin Token (with use of User._id and Config.SECRET as encrypting PAYLOAD and SECRET)
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // Specific for Heroku setting
    //secure = true => Only send this cookie via HTTPS(an encrypted connection)
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // Send jwt to browser for auto-save and future request use
  res.cookie('jwt', token, cookieOptions);

  //REMOVE password from OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // KEYNOTE: Prevent user register to be an Admin as we select info we need instead of let user input their role in the req.body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role, // Should not let users assign their role
  });

  // Send Welcome EMAIL
  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //extract email,password from req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password'); // select 'password' which is hidden by default, retrieved user here has no password property,  so need add '+' to select password here
  // Check if password correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everthing ok , send Asscess token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// NOTE: Function to check if the user is authenticated
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // Read Client cookies to check Authentication
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401) // status 401 = unauthorized
    );
  }

  // 2) Verification token: Decode token sent from Client into user id and verify with database
  // KEYNOTE: Promisify the jwt.verify() function so make it asynchronouns
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token dose no longer exist', 401)
    );
  }

  // 4) Check if user changed password after token was issued
  // decoded.iat = token issued at (timestamp)
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  // GRANT ACCESS TO PROTECTED ROUTE
  // req.user travel from middleware to middleware, so assign currentUser to req.user for next middleware function
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// NOTE: Function to check if the user is logged-in, only for Render pages
// NOT use catchAsync: if user loggout out, their jwt token is invalid for jwt.verify which will cause global error in catchAsync, so we use try-catch here
exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1) Check if there is a cookie called jwt
    if (req.cookies.jwt) {
      // Read Client cookies to check Authentication
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after token was issued
      // decoded.iat = token issued at (timestamp)
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      // There is a Logged in user
      // KEYNOTE: Put currentUser to the res.locals, pug template can access to res.locals to find if user property exist => for rendering

      res.locals.user = currentUser;

      return next();
    }
  } catch (err) {
    return next();
  }
  next(); //if there is no Cookies.jwt, pass to next middleware directly
};

// NOTE: Create a function between MIDDLEWARE functions
exports.restrictTo = (...roles) => {
  // NOTE: Return a new MIDDLEWARE function ,so not breaking the middleware chain
  return (req, res, next) => {
    // (...roles) is an array,eg: ['admin','lead-guide']
    // check if the roles array exist in req.user.role
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403) //status 403 = forbidding
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // KEYNOTE: turn off userSchema validator to save resetPasswordToken and passwordResetExpires for later validation
  await user.save({ validateBeforeSave: false });

  // 3) Send it ot user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email.Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, //Check if the taken expired using MongoDB query function
  });

  // 2)If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // Renew password and remove passwordResetToken & passwordResetExpires
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changePasswordAt property for the user (for later validate if JWT expire)

  // 4) Log the user in , and send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Your current password is wrong, please enter again!', 401)
    );
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in , send JWT
  createSendToken(user, 200, req, res);
});
