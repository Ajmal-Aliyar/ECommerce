const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true 
    },
    walletBalance: {
        type: Number,
        default: 0.00,
        min: 0
    },
    pendingBalance: {
        type: Number,
        default: 0.00,
        min: 0 
    },
    rewardBalance: {
        type: Number,
        default: 0.00,
        min: 0
    },
    paymentHistory: [
        {
            createdAt: {
                type: Date,
                default: Date.now
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ] 
}, { timestamps: true });
module.exports = mongoose.model('wallet',walletSchema)
