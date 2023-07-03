const mongoose = require ('mongoose')
const Product = mongoose.Schema({
    productId:{
         type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name:{
        type:String,
        required:true
    },
    images:[{
        type:Array,
        required:true,
    }],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true
    },
    stock:{
        type:Number,
        required:true,
        min:0,
        max:100,
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required: true,
    },
    status:{
        type:Boolean,
        default:true
    },
})

module.exports= mongoose.model('products',Product)