const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generate signin Token (with use of User._id and Config.SECRET as encrypting PAYLOAD and SECRET)
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  // KEYNOTE: Prevent user register to be an Admin as we select info we need instead of let user input their role in the req.body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token, //JWT token
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //extract email,password from req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // select 'password' which is hidden by default so need add '+'
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or pasord', 401));
  }

  // 3) If everthing ok , send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// NOTE: Function to check if the user is authenticated
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401) // status 401 = unauthorized
    );
  }

  // 2) Verification token: Decode token sent from Client into user id and verify with database
  // KEYNOTE: Promisify the jwt.verify() function so make it asynchronouns
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // console.log(decoded);
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
  next();
});

exports.restrictTo = (...roles) => {
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
