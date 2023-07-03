const mongoose = require ('mongoose')
const Category=  mongoose.Schema({

    categoryName:{
        type:String,
        required:true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
      },
    status:{
        type: Boolean,
        default:true,
        required: true,
    }
})

module.exports = mongoose.model('category',Category)