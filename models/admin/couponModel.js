const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
    // unique: true, // Add unique index
    uppercase: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  minimumPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Active',
  },
  customerId: [{
    type: mongoose.Types.ObjectId,
    required: true,
  }],
});

couponSchema.pre('save', function(next) {
  const currentDate = new Date();
  if (this.expiryDate <= currentDate) {
    this.status = 'Expired';
  }
  next();
});

// Export the model
module.exports = mongoose.model("Coupon", couponSchema);
