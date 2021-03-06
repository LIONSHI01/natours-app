const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
    // maxLength: [20, 'A user name should be less or equal to 20 characters'],
    // minLength: [4, 'A user name should be more or equal to 4 characters'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: [true, 'Please provide your email'],
    required: [true, 'A email is necessary'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false, // NOT return to client
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    minLength: 8,
    validate: {
      // KEYNOTE:This only work on SAVE / CREATE!! (.UPDATE() NOT WORK!)
      validator: function (el) {
        return el === this.password; //return true / false
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, //passwordResetToken will expire in short period
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// KEYNOTE: Encrypt the password (NOTE: .update() NOT work!!)
userSchema.pre('save', async function (next) {
  // NOTE: Only run this function if password was actually modified/newly created
  // if user just update Name or email , no need to run this function
  if (!this.isModified('password')) return next();

  // bcrypt.hash(<data_to_encrypted>, <how_strong_to_encrypt>), with cost of 12 is common
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; //Only need to save this.password,DELETE passwordConfirm field

  next();
});

// NOTE: Middleware to add passwordChangedAt property (NOTE: .update() NOT work!!)
userSchema.pre('save', function (next) {
  // if password is modified or user newly sign-up, pass this Middleware
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Prevent Password encryption takes too long time that later then the passwordChangedAt time
  next();
});

// NOTE:Query Middleware, for all query start with 'find', only return {active:not equal to false}(in case some early user data dont have 'active' property)
userSchema.pre(/^find/, function (next) {
  // this point to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Create Instance method, so can be used everywhere with User.correctPassword
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; //token isssued time early than password change time = Password changed
  }

  // false = password NOT changes
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expires in 10min

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
