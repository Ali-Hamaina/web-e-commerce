const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String // Base64 or image URL
});

module.exports = mongoose.model('Product', productSchema);
