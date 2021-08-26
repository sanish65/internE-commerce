const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  shortdesc: String,
  description: String,
  caption: String,
  parents: [],
  caption1: String,

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
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
