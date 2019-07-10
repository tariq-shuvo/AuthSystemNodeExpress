const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type: String
        required: true
    },
    desc:{
        type: String
    },
    price:{
        type: Number,
        required: true
    },
    isNegotiable:{
        type: Boolean,
        required: true,
        default: false
    }, 
    images:[
        {
            src:{
                type: String,
                required: true
            }
        }
    ],
    approval:{
        type: Boolean,
        required: true,
        default: false
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'type'
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    subcategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory'
    },
    thana:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'thana'
    },
    district:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'district'
    },
    division:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'division'
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = Product = mongoose.model('product', ProductSchema)
