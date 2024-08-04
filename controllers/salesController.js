const Order = require('../model/orderModel')



const salesPage = async(req,res)=>{
    try{
        const sales = await Order.aggregate([
            {$unwind:'$product'},
            {$match:{"product.productDetails.status":'delivered'}}])
            const orders = await Order.find({status:'delivered'})

        res.render('sales',{sales,orders})
    }catch(error){
        console.error(error.message);
    }
}

module.exports={
    salesPage
}