const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const TrackerSchema = new mongoose.Schema({
  name: String,
  trackID: ObjectId,
  products: [
    {
      productId: ObjectId,
      dispatched_us: String,
      shipping: String,
      delivered_nepal: String,
      count: Number,
    }
  ],
},
{ timestamps: true });

const Tracker = mongoose.model('Tracker', TrackerSchema);
module.exports = Tracker;
