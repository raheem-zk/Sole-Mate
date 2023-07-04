const mongoose = require ('mongoose')
const bannerSchema = mongoose.Schema({
    bannerId:{
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
        max:10,
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
    block:{
        type:Boolean,
        default:false,
        required:true
    }
})

module.exports= mongoose.model('banner',bannerSchema)