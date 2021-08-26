const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  name: String,
  subname: String,
  photos: [
    {
      path: String,
    },
  ],
  caption: String,
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const Banner = mongoose.model('Banner', BannerSchema);
module.exports = Banner;
