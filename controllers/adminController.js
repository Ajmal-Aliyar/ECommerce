const User = require('../model/userModel')
const Order = require('../model/orderModel')
const adminDashboard = async(req,res)=>{
    try{
        const data = await User.find({})
        const orders = await Order.aggregate([
        { $unwind: "$product" },
        { $match: { $nor: [ { "product.productDetails.status": 'cancelled' }, { "product.productDetails.status": 'delivered' } ] } },
        { $count: "count" }
         ])
         const orderCount = orders.length > 0 ? orders[0].count : 0;
        res.render('dashboard',{data,orderCount})
    }catch(err){
        console.log(err);
    }
}


const signIn = async(req,res)=>{
    try{
        res.render('signIn')
    }catch(err){
        console.log(err);
    }
}
const verifyAdmin =async(req,res)=>{
    try{
        const {adminLogAddress,adminPassword} = req.body
        
        console.log(adminLogAddress,adminPassword);
        if(adminLogAddress == "ajmal.aju.340711@gmail.com"){
            if(adminPassword === '40711'){
                req.session.admin_id = adminLogAddress
                res.redirect('admin/dashboard')
            }else{
                res.render('signIn',{message:'email or password is incorrect'})
            }
        }else{
            res.render('signIn',{message:'email or password is incorrect'})
        }
    }catch(error){
        console.error(error.message);
    }
}
const usersPage = async(req,res)=>{
    try{
        const userData = await User.find({})
        res.render('users',{userData})
    }catch(err){
        console.log(err);
    }
}
const unblockUser = async(req,res)=>{
    try{
        
        const {id} = req.body
        const uid = id.trim()
        console.log("success");
        const userData = await User.updateOne({_id:uid},{$set:{isBlocked:false}})
        res.json({ message: `User with id ${id} unblocked successfully` });
    }catch(err){
        console.log(err);
    }
}
const blockUser = async(req,res)=>{
    try{
        
        const {id} = req.body
        const uid = id.trim()
        console.log("blocked");
        const userData = await User.updateOne({_id:uid},{$set:{isBlocked:true}})
        res.json({ message: `User with id ${id} blocked successfully` });
    }catch(err){
        console.log(err);
    }
}
const orders = async (req,res)=>{
    try{
        
    }catch(error){
        console.error(error.message);
    }
}
module.exports ={
    adminDashboard,signIn,verifyAdmin,usersPage,unblockUser,blockUser
}