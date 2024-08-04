const mongoose = require('mongoose')
const productDetails = require('../controllers/userController')
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    shippingAddress: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },

        country: {
            type: String,
            required: true
        },
        pinCode: {
            type: Number,
            required: true
        },
        place: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        mobile2: {
            type: Number
        },
        landMark: {
            type: String
        }
    },
    product: {
        type: Array,
        required: true
    },
    shippingCharge: {
        shippingType: {
            type: String,
            requied: true
        },
        shippingCharge: {
            type: Number,
            requied: true
        }
    },
    appliedCoupon: {
        couponCode: {
            type: String,
        },
        couponDiscount: {
            type: Number,
            default: 0
        },
        minimumAmount: {
            type: Number,
        }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    grandTotalPrice: {
        type: Number,
        required: true
    },
    payment: {
        paymentMethod: {
            type: String,
            required: true
        },
        paymentId:{
            type:String,
        },
        paymentAmount:{
            type:Number
           
        }
    },
    status: {
        type: String,
        enum: ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled'],
        default: 'order placed'
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expectedDelivery: {
        type: Date,
        default: function () {
            const currentDate = new Date();
            const deliveryDate = new Date(currentDate);
            deliveryDate.setDate(currentDate.getDate() + 7);
            return deliveryDate;
        }
    }
})
orderSchema.pre('save', function(next) {
    if (this.payment.paymentMethod !== 'cashOnDelivery' && !this.payment.paymentAmount) {
        this.payment.paymentAmount = this.grandTotalPrice;
    }
    next();
});

module.exports = mongoose.model('order', orderSchema)