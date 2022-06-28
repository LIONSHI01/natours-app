const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, // NOT validator
      trim: true, // remove space from begin and end
      maxlength: [40, 'A tour name mush have less or equal than 40 characters'],
      minlength: [10, 'A tour name mush have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // Use Validator Library , check if the input is Character
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // NOTE: set up availible input STRING
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // NOTE: this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // remove white space in beginning and the end
      required: [true, 'A tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //NOTE: a array of string!!
    createdAt: {
      type: Date,
      default: Date.now(), // NOTE: give Timestamp
    },
    startDates: [Date], // NOTE: mongoDB will parse the date
    secretTour: {
      // set a secrete property
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Show virtual property in JSON
    toObject: { virtuals: true }, // Show virtual property in Object
  }
);

// KEYNOTE: Create VIRTUAL PROPERTY (Not part of the data, Can't be used for query )
// NOTE:the funcion in get() can't be arrow function ()=>{}, as we need [this.xx] keyword in the function
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE:  run before .save() and .create(), but not .update()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// Purpose: exclude Secret tour from query
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
