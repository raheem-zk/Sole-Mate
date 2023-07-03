const mongoose = require('mongoose')

const orderData = mongoose.Schema({


    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,      
    },
    deliveryAddress: [
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
    date: {
        type: Date
        
    },
    product:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            requiered: true,
        },
        bannerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "banner",
            requiered: true,
        },
        quantity: {
            type: Number,
            required: true
        },
        singleTotal: {
            type: Number,
            requiered: true
        },
        singlePrice:{
            type: Number,
            requiered: true
        }
    }],
    total:{
        type:Number,
    },
    discount:{
        type:Number,
    },
    paymentType:{
        type:String,
        requiered:true
    },
    coupon:{
        type:String
    },
    status:{
        type:String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default:'pending'
    }

})

module.exports= mongoose.model('order',orderData)