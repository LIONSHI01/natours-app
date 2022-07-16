const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

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
      set: (val) => Math.round(val * 10) / 10, // a setter function to round number
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
      required: [true, 'A tour must have Summary'],
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
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    // For Reference Database
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // From User collection
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // Show virtual property in JSON when we don't save it in database
    toObject: { virtuals: true }, // Show virtual property in Object when we don't save it in database
  }
);

// KEYNOTE: Create Indext for specific fields to optimize query performance
// tourSchema.index({ price: 1 });
// NOTE: Compound Index(Combination of fields)
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// KEYNOTE: Create VIRTUAL PROPERTY (Not part of the data, Can't be used for query )
// NOTE:the funcion in get() can't be arrow function ()=>{}, as we need [this.xx] keyword in the function
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// KEYNOTE:Virtual Populate
// In this case, only call Population in Get one tour not all, coz it return too much info to client if populate in all tours
tourSchema.virtual('reviews', {
  ref: 'Review', //Reference Schema
  foreignField: 'tour', // Tour's corresponding field in 'Review'
  localField: '_id', //Tour's corresponding field in 'Tour'
});

//DOCUMENT MIDDLEWARE:  run before .save() and .create(), but not .update()
// Create URL slug for later URL directory in PUG templete
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Another way to populate Guides(但不能更新即時資料)
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Populate the tourSchema for query start with find
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //Not show these fields in Output
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// Purpose: exclude Secret tour from query
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

// NOTE: PLACE AFTER ALL MIDDLEWARE
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
