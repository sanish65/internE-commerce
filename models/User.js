const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  usertype: String,
  status: String,
  userdetails: {
    firstname: String,
    lastname: String,
    phone: {
      type: Number,
    },
  },
  profile: {
    name: String,
    gender: String,
    picture: String,
    birthdate: Date,
  },
  address: {
    location: String,
    nearby: String,
    city: String,
  },
  ordereditem: [
    {
      productid: String,
      productname: String,
      description: String,
      photos: String,
      caption: String,
      price: {
        costprice: Number,
        quantity: Number,
        discount: Number,
        totalprice: Number,
      },
      paymentmethod: String,
      review: {
        header: String,
        description: String,
        rating: Number,
      }
    }
  ],
  cart: [
    {
      productid: String,
      sku: String,
      productname: String,
      price: Number,
      description: String,
      photos: String,
      caption: String,
      quantity: Number,
      totalprice: Number,
    }
  ],
  buylater: [
    {
      productid: String,
      sku: String,
      productname: String,
      price: Number,
      description: String,
      photos: String,
      caption: String,
      quantity: Number,
      totalprice: Number,
    }
  ]
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
