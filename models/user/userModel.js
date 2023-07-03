
const mongoose = require('mongoose');
const userData = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  referral_code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
    unique:true,
  },
  email: {
    type: String,
    required: true,
    unique:true,
  },
  password: {
    type: String,
    required: true,
  },
  address: [
    {
      name: {
        type: String,
        required: true,
      },
      housename: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  wishlist: [
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
    },
  ],
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
  discount :  [
    {
      amount: {
        type: Number,
        default:0,
      },
      couponCode: {
        type: String,
        required: true,
      },
    },
  ],
  wallet: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('users', userData);