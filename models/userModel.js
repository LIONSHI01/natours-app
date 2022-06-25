const mongoose = require('mongoose');
const validator = require('validator');

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
  photo: String,
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    minLength: 8,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
