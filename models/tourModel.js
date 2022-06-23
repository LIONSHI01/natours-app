const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
