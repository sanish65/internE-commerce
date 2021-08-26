const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: String,
  type: String,
  slug: String,
  shortdesc: String,
  description: String,
  country: String,
  caption: String,
  caption1: String,
  website: String,
  comments: [
    {
      comment: String,
      name: String,
      date: Date,
    },
  ],
  review: [
    {
      user: String,
      rate: Number,
    },
  ],

  banner: [
    {
      path: String,
    },
  ],
  thumbnail: [
    {
      path: String,
    },
  ],
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const Brand = mongoose.model('Brand', BrandSchema);
module.exports = Brand;
