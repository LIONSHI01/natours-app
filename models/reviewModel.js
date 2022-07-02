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
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

// Call the Aggregation Pipeline after new reviews saved
// Use .post but not .pre, coz we calculate after saving the review data
reviewSchema.post('save', function () {
  // this points to current review
  // NOTE: this.constructor = Review , coz 'this' point to the current review instance, its constructor is Review
  this.constructor.calcAverageRatings(this.tour); // put in current review's tourId
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
