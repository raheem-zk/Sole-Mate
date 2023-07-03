const mongoose = require('mongoose')
const userData = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },

})

module.exports = mongoose.model('admin', userData) 