const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({

  photos: [
    {
      path: String,
    },
  ],
  caption: String,
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const Logo = mongoose.model('Logo', LogoSchema);
module.exports = Logo;
