const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const PurchaseSchema = new mongoose.Schema({
  date: Date,
  type: String,
  product: [
    {
      name: String,
      wtype: String,
      wmain: Number,
      wsub: Number,
      costprice: Number,
      totalcost: Number,
      sellprice: Number,
      count: Number,
      // location: String,
    },
  ],
  trackers: [
    {
      name: String,
      productId: ObjectId,
      count: Number,
      dispatched_us: String,
      shipping: String,
      delivered_nepal: String,
      // sample4: String
    },
  ],
  report: [
    {
      issue: String,
      description: String,
      date: Date,
      // modifier:String
    }
  ],

  tax: Number,
  totalamt: Number,
  person: String,
  source: String,
  email: String,
  billid: String,
  paymentmethod: String,
  notes: String,
  location: String,

},
{ timestamps: true });

const Purchase = mongoose.model('Purchase', PurchaseSchema);
module.exports = Purchase;
