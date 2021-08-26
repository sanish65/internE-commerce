const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  ordernum: Number,
  userdetails: {
    firstname: String,
    lastname: String,
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    instagram: String,
    dob: String,
  },

  address: {
    location: String,
    nearby: String,
    city: String,
  },

  delivery: {
    date: Date,
    person: String,
    status: String,
    cost: { type: Number },
    notes: { type: String },
  },

  products: [
    {
      productid: String,
      name: String,
      description: String,
      price: Number,
      photos: String,
      caption: String,
      count: { type: Number },
      discount: { type: Number },
      status: String,
    },
  ],
  createdAt: Date,
  updatedAt: Date,
  updatedstatus: String,
  paymentmethod: String,
}, { timestamps: true });
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
