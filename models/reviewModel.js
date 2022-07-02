const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review is required!'],
    },
    rating: {
      type: Number,
      min: [1, 'Minimum score is 1'],
      max: [5, 'Minimum score is 1'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// KEYNOTE: Set Compound index to prevent DUPLICATE reviews from same user on a tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

// Populate fields
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  // Not Populating 'tour' here, to reduce populating chain
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// KEYNOTE:Add Aggregation Pipeline to calculate Average Rating on Tours after user creating reviews
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, //add 1 for each matcing tour
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Update Tour data
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // if no stats, means no reviews found, so return default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Call the Aggregation Pipeline after new reviews saved
// Use .post but not .pre, coz we calculate after saving the review data
reviewSchema.post('save', function () {
  // this points to current review
  // NOTE: this.constructor = Review , coz 'this' point to the current review instance, its constructor is Review
  this.constructor.calcAverageRatings(this.tour); // put in current review's tourId
});

// KEYNOTE: Calculate avgRating after reviews are updated or deleted
// 1) Get the tourID via .pre query (Can't get tourID after query execution)
// NOTE: Regrex find .findOneAndUpdate/ .findOneAndDelete orders
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); //.findOne is a function of Model, here is to retrieve current Document from database
  next();
});

// 2) Save the calculation results after query
reviewSchema.post(/^findOneAnd/, async function (next) {
  // await this.findOne() does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
