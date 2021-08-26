const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
  name: String,
  subname: String,
  banners: [
    {
      path: String,
    },
  ],
  logos: [
    {
      path: String,
    },
  ],
  caption: String,
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const Cache = mongoose.model('Cache', CacheSchema);
module.exports = Cache;
