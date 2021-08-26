const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
	link: String,
	name: String,
	address: String,
	phone: String,
  insta: String,
	email: String,
  date :  Date,
  status :  String,
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const Link = mongoose.model('Link', LinkSchema);
module.exports = Link;