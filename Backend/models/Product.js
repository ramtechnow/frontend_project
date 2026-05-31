const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  sizes: {
    type: [String],
    default: ['S', 'M', 'L', 'XL']
  },
  colors: {
    type: [String],
    default: ['Black', 'White']
  },
  variants: {
    type: [{
      color: { type: String, required: true },
      stock: { type: Number, required: true, default: 0 },
      price: { type: Number }
    }],
    default: []
  },
  stockCount: {
    type: Number,
    default: 100
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
