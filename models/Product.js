const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const ProductSchema = new mongoose.Schema({
  sku: String,
  name: String,
  description: String,
  brand: String,
  type: Number,
  wtype: String,
  wmain: Number,
  wsub: Number,
  price: Number,
  producttype: String,
  link: String,
  featuretype: String,
  soldunits: Number,
  sales: [
    {
      year: Number,
      months: {
        jan: Number,
        feb: Number,
        mar: Number,
        apr: Number,
        may: Number,
        jun: Number,
        jul: Number,
        aug: Number,
        sep: Number,
        oct: Number,
        nov: Number,
        dec: Number
      },
    },
  ],
  review: [
    {
      user: String,
      rate: Number,
    },
  ],
  photos: [
    {
      path: String,
    },
  ],
  caption: String,
  inventory: [
    {
      count: Number,
      location: String,
      purchaseId: ObjectId,

    },
  ],
  category: [],
  purchase: [
    {
      count: Number,
      purchaseperson: String,
      location: String,
      purchaseId: ObjectId,
      costprice: Number,
      sellPrice: Number,
      totalcost: Number,
      purchase_date: Date,

    },
  ],
  comments: [
    {
      comment: String,
      name: String,
      date: Date,
    },
  ],
  createdAt: Date,
  updatedAt: Date,
},
{ timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
