const Order = require('../model/orderModel')
const User = require('../model/userModel')

const ordersPage = async (req,res)=>{
    try{
        const orders = await Order.find({
            status: { $nin: ['cancelled', 'delivered'] }})
            const recentOrders = await Order.find({
                status: { $in: ['cancelled', 'delivered'] }
            }).sort({ createdAt: -1 });
        console.log(orders)
        res.render('orders',{orders,recentOrders})
    }catch(error){
        console.error(error.message);
    }
}
const orderDetailsPage = async(req,res)=>{
    try{
        const orderId = req.query.id
        const orderData = await Order.findById(orderId)
        
        console.log("orderdata : "+orderData)
        const orders = await Order.find({}).sort({createdAt:-1})
        res.render('orderDetails',{orderData,orders})
    }catch(error){
        console.error(error.message);
    }
}
const updateOrderStatus = async (req,res)=>{
    try{
        const {newStatus,orderId}=req.body
        const orderCartStatus = await Order.updateOne({_id:orderId},{status:newStatus})
        const orderProductStatus = await Order.updateMany(
            { _id: orderId, "product.productDetails.status": { $ne: newStatus } },
            { $set: { "product.$[].productDetails.status": newStatus } })
            if(orderCartStatus && orderProductStatus){
                res.json({status:true})
            }
            console.log('done');
    }catch(error){
        console.error(error.message);
    }
}

module.exports ={
    ordersPage,orderDetailsPage,updateOrderStatus
}