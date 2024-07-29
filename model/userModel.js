const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true
    },
    userMobile:{
        type:Number,
    },
    userPassword:{
        type:String,
    },
    isBlocked:{
        type:Boolean,
        defualt:false
    }
})

module.exports= mongoose.model('User',userSchema)