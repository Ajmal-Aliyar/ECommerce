const Order = require('../model/orderModel')
const Product = require('../model/productModel')
const User = require('../model/userModel')
const Wallet = require('../model/wallletModel')
const { ObjectId } = require('mongodb')
const Return = require('../model/returnOrderModel')
const ordersPage = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $nin: ['cancelled', 'delivered', 'returned'] }
    }).sort({createdAt:-1})
    const recentOrders = await Order.find({
      status: { $in: ['cancelled', 'delivered', 'returned'] }
    }).sort({ createdAt: -1 });

    const allOrders = await Order.find({}).sort({ createdAt: -1 })
    const allProduct = await Order.aggregate([{$unwind:'$product'},{$sort:{createdAt:-1}}])
    const deliveredOrders = await Order.find({
      status: { $in: ['delivered'] }
    }).sort({ createdAt: -1 })

    const cancelledOrders = await Order.aggregate([
      { $unwind: '$product' },
      { $match: { 'product.productDetails.status': 'cancelled' } },
      { $sort: { expectedDelivery: -1 } }
    ])

    const returnRequests = await Return.find({ approved: false }).sort({createdAt:-1})
    const returnedCarts = await Order.find({status:'returned'}).sort({createdAt:-1})
    const returnedOrders = await Order.aggregate([{$unwind:'$product'},{$match:{'product.productDetails.status':'returned'}},{$sort:{createdAt:-1}}])
    res.render('orders', { orders, recentOrders, allOrders, deliveredOrders, cancelledOrders, returnRequests ,returnedOrders,returnedCarts,allProduct})
  } catch (error) {
    console.error(error.message);
  }
}
const orderDetailsPage = async (req, res) => {
  try {
    const orderId = req.query.id
    const orderData = await Order.findById(orderId)

    console.log("orderdata : " + orderData)
    const orders = await Order.find({}).sort({ createdAt: -1 })
    res.render('orderDetails', { orderData, orders })
  } catch (error) {
    console.error(error.message);
  }
}
const updateOrderStatus = async (req, res) => {
  try {
    const { newStatus, orderId } = req.body
    const orderCartStatus = await Order.updateOne({ _id: orderId }, { status: newStatus })



    const order = await Order.findById(orderId);
    console.log('order:' + order);
    if (order) {
      let updated = false;
      for (let product of order.product) {
        if (product.productDetails.status !== 'cancelled') {
          console.log('jihi' + product);
          product.productDetails.status = newStatus;
          updated = true;
        }
      }
      if (newStatus == 'delivered') {
        order.expectedDelivery = new Date()
        console.log(order, 'delivered');
        const couponCode = order.appliedCoupon.couponCode
        if(couponCode.length > 30){
          const wallet = await Wallet.updateOne(
            { referralCode:couponCode},
            {
              $inc: {
                rewardBalance: 200,
                walletBalance: 200
              },
              $push: { 
                paymentHistory: {
                    amount: 200,
                    createdAt: new Date(),
                    status:'recieved',
                    description:'You have received your referral 200rs amount in your wallet.'
                }
            }
            }
          );
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


    if (newStatus == 'delivered') {
      console.log('new status delivered');
      const orders = await Order.aggregate([{ $match: { _id: new ObjectId(orderId) } }, { $unwind: "$product" }])
      console.log(orders);
      for (let order of orders) {
        let quantity = order.product.quantity
        let productId = order.product.productDetails._id
        console.log(quantity, productId);
        if (order.product.productDetails.status != 'cancelled') {
          const product = await Product.updateOne({ _id: productId }, { $inc: { productSales: quantity } })
        }
      }

    }
    if (orderCartStatus) {
      res.json({ status: true })
    }
    console.log('done');
  } catch (error) {
    console.error(error.message);
  }
}
const returnRequests = async (req, res) => {
  try {
    console.log('dkyr', req.body);
    const id = req.body.id
    const returnData = await Return.findById(new ObjectId(id))
    const orderId = new ObjectId(returnData.orderId)
    const productId = new ObjectId(returnData.productId)

    let orderData = await Order.findById(orderId)
    console.log(orderData, 'jsdbfhg');
    let { productActualPrice, productOfferredPrice, refundAmount, quantity } = returnData
    productActualPrice = productActualPrice * quantity
    productOfferredPrice = productOfferredPrice * quantity
    console.log(productActualPrice, productOfferredPrice, refundAmount);
    orderData.product = orderData.product.filter(product => product.productDetails.status === 'delivered');
    console.log(orderData.product);
    let changed;
    if (orderData.product.length > 1) {
      console.log('greater than 1');
      changed = await Order.updateOne(
        { _id: orderId, "product.productDetails._id": productId },
        {
          $set: { "product.$.productDetails.status": "returned" },
          $inc: { totalPrice: -productActualPrice, grandTotalPrice: -productOfferredPrice }
        }
      );
      const userId = new ObjectId(orderData.userId);
      console.log(refundAmount);
      const wallet = await Wallet.updateOne(
        { userId: userId },
        {
          $inc: {
            pendingBalance: -refundAmount,
            walletBalance: refundAmount
          },
          $push: { 
            paymentHistory: {
                amount: refundAmount,
                createdAt: new Date(),
                status:'recieved',
                description:'Your pending amount for the returned order has been added to your wallet balance.'
            }
        }
        }
      );
      const done = await Return.updateOne({ _id: new ObjectId(id) }, { approved: true })

      console.log(orderData);
      console.log(changed, 'chnged');
    } else {
      console.log('only one');
      changed = await Order.updateOne(
        { _id: orderId, "product.productDetails._id": productId },
        {
          $set: {
            status: 'returned',
            "product.$.productDetails.status": 'returned',
            totalPrice: 0,
            grandTotalPrice: 0
          }
        }
      );
      const userId = new ObjectId(orderData.userId);
      console.log(userId);
      console.log(refundAmount);
      
      const wallet = await Wallet.updateOne(
        { userId: userId },
        {
          $inc: {
            pendingBalance: -refundAmount,
            walletBalance: refundAmount
          },
          $push: { 
            paymentHistory: {
                amount: refundAmount,
                createdAt: new Date(),
                status:'recieved',
                description:'Your pending amount for the returned order has been added to your wallet balance.'
            }
        }
        }
      );
      
      const done = await Return.updateOne({ _id: new ObjectId(id) }, { approved: true })

      console.log(changed, 'chnged');
    }
    console.log(changed, "iuahdfp");

    res.status(200).json({ status: true, id })
  } catch (error) {
    res.status(500).json({ error: 'Error occured in while returnRequests ' })
  }
}
module.exports = {
  ordersPage, orderDetailsPage, updateOrderStatus, returnRequests
}