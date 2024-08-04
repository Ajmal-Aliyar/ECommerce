const Order = require('../model/orderModel')
const Product = require('../model/productModel')
const User = require('../model/userModel')
const {ObjectId}=require('mongodb')
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
        
        
        
const order = await Order.findById(orderId);
console.log('order:'+order);
if (order) {
  let updated = false;
  for (let product of order.product) {
    if (product.productDetails.status !== 'cancelled') {
        console.log('jihi'+product);
      product.productDetails.status = newStatus;
      updated = true;
    }
  }
console.log('update');
  if (updated) {
    order.markModified('product'); 
    await order.save();
    console.log("Order updated successfully");
  } else {
    console.log("No matching products found to update");
  }
} else {
  console.log("Order not found");
}


            if(newStatus=='delivered'){
                console.log('new status delivered');
                const orders = await Order.aggregate([{$match:{_id:new ObjectId(orderId)}},{$unwind:"$product"}])
                console.log(orders);
                for(let order of orders){
                    let quantity = order.product.quantity
                    let productId = order.product.productDetails._id
                    console.log(quantity,productId);
                    if(order.product.productDetails.status!='cancelled'){
                        const product = await Product.updateOne({_id:productId},{$inc:{productSales: quantity}})
                    }
                }
            }
            if(orderCartStatus ){
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