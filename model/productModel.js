const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productImage: {
        type: [String],
        requied:true
    },
    productDescription: {
        type: String,
        required: true
    },
    productStock: {
        type:Number,
        require:true
    },

    productPrices: {
        priceBefore: {
            type: Number,
            required: true
        },
        priceAfter: {
            type: Number,
            required: true
        },
        offerRate:{
            type:String
        }
    },
    productTags: {
        type: [String]
    },
    productRating: {
        average: {
            type: Number
        },
        numberOfRatings: {
            type: Number
        }
    },
    productReviews:[{
        userId: {
            type: String,
            require:true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    isBlocked: {
        type: Boolean,
        default:false
    },
    productSales:{
        type:Number,
        default:0
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    }
})



module.exports = mongoose.model('Product', productSchema);
