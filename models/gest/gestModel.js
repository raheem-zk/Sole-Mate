
const mongoose = require('mongoose');
const gest_userData = mongoose.Schema({
  gestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
      },
      bannerproduct:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'banner',
      },
      quantity: {
        type: Number,
        default: 1,
      },
      productTotalPrice: {
        type: Number,
      },

    },
  ],
  cartTotalPrice: {
    type: Number,
    default: 0,
  },

});

module.exports = mongoose.model('gest', gest_userData);