const express = require('express')
const userRoute = express()
const userController = require("../controllers/userController")


//session
// const session = require('express-session')
// const config=require('../config/config')
// userRoute.use(session({
//     secret:config,
//     resave:false,
//     saveUninitialized:false,
//     cookie:{maxAge:24*60*60*1000}
// }))
// const nocache = require('nocache')
// userRoute.use(nocache())
// const bodyParser = require('body-parser')
// userRoute.use(express.urlencoded({ extended: true }));
// userRoute.set("view engine", "ejs")
// userRoute.use(bodyParser.json())

userRoute.use(express.static('public'));
userRoute.use(express.json()); 



const userAuth = require('../middleware/userAuth')


userRoute.set('views','./views/user')  



userRoute.get('/',userController.homePage)
userRoute.get('/shop',userController.shopPage)
userRoute.get('/faq',userController.faq)
userRoute.get('/logout',userController.logout)
// userRoute.get('/category',userController.categoryPage)
userRoute.get('/signIn',userAuth.isLogout,userController.loginPage)
userRoute.get('/signUp',userAuth.isLogout,userController.logoutPage)
userRoute.get('/productDetails',userController.productDetails)
userRoute.get('/faq',userController.faqPage)
userRoute.get('/about',userController.aboutPage)
userRoute.get('/contact',userController.contact)
userRoute.get('/error',userController.errorPage)
userRoute.get('/user',userAuth.isLogin,userController.loginedUser)
userRoute.get('/forgotPassword',userController.forgotPassword)
userRoute.get('/otpVerification',userController.otpVerification)
userRoute.get('/blockedUser',userController.blockedLogin)
// userRoute.get('/changePassword',userAuth.isLogout,userController.changePassword)
userRoute.post("/otpSubmit",userController.verifyOtp)
userRoute.post('/userSignup',userAuth.isLogout,userController.insertUser)
userRoute.post('/OTPreSend',userAuth.isLogout,userController.otpResend)
userRoute.post('/',userController.verifyUser)
userRoute.post('/addNewAddress',userController.addNewAddress)
userRoute.get('/address',userAuth.isLogin,userController.address)
userRoute.get('/editAddress',userAuth.isLogin,userController.editAddressPage)
userRoute.post('/editedAddress',userController.editedAddress)
userRoute.get('/removeAddress',userAuth.isLogin,userController.removeAddress)
userRoute.get('/defaultAddress',userAuth.isLogin,userController.defaultAddress)
userRoute.post('/editUser',userController.editUser)
userRoute.post('/changePassword',userController.changePassword)
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtp)
userRoute.post('/changePasswordVerify',userController.changePasswordVerify)
userRoute.post('/forgotOTPreSend',userController.forgotOTPresend)
userRoute.get('/filter',userController.sortFilter)
userRoute.post('/forgotOtpSubmit',userController.forgotOtpSubmit)
//cart
userRoute.get('/cart',userAuth.isLogin,userController.cart)
userRoute.post('/addToCart',userAuth.isLogin,userController.addToCart)
userRoute.post('/cartProductQuantity',userAuth.isLogin,userController.cartProductQuantity)
userRoute.post('/removeFromCart',userAuth.isLogin,userController.removeFromCart)
userRoute.post('/moreProducts',userController.moreProduct)
//checkout
userRoute.post('/checkout',userController.checkout)
userRoute.post('/proceedCheckout',userAuth.isLogin,userController.proceedCheckout)
userRoute.post('/applyCoupon',userController.applyCoupon)
userRoute.get('/getCoupon',userAuth.isLogin,userController.getCoupon)
userRoute.post('/generate-pdf', userController.generatePdf);
userRoute.post('/walletPayed',userAuth.isLogin,userController.walletPayment)
//order
userRoute.get('/orders',userAuth.isLogin,userController.orderPage)
userRoute.post('/cancelOrder',userController.cancelOrder)
userRoute.get('/cartDetails',userAuth.isLogin,userController.cartDetails)
userRoute.post('/cancelProduct',userController.cancelProduct)
userRoute.post('/cancelProductandCoupon',userController.cancelProductandCoupon)
userRoute.get('/orderPlace',userAuth.isLogin,userController.orderPlace)
userRoute.get('/deliveredOrder',userAuth.isLogin,userController.deliveredOrderPage)
userRoute.post('/returnOrder',userAuth.isLogin,userController.returnOrder)
// userRoute.post('/orderPlace',userAuth.isLogin,userController.orderPlace)


//filter
userRoute.get('/categoryFilter',userController.categoryFilter)


//wishlist
userRoute.get('/wishlist',userAuth.isLogin,userController.wishlist)
userRoute.post('/addToWishlist',userController.addToWishlist)
userRoute.post('/removeFromWishlist',userController.removeFromWishlist)

//wallet
userRoute.get('/wallet',userAuth.isLogin,userController.walletPage)



const Coupon = require('../model/couponModel')
userRoute.get('/api/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error });
    }
});


// const Order = require('../model/orderModel')
// let orderData ;
// userRoute.get('/invoice',async (req,res)=>{
//     const userId = "669eb3f634aecf56a2b6e95f"
//     const orderId = "66af7b1e11a7c1a59a5a644f"
//     orderData = await Order.findOne({_id:orderId})
//     res.render('invoice',{orderData})
// })



const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: 'rzp_test_j329lgmyv1688D',
    key_secret: 'moO56wKle8KqnECzrvW4Ws0W'
});

userRoute.post('/create-order', (req, res) => {
    const {grandTotalPrice} = req.body
    var options = {
        amount: grandTotalPrice*100,  
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function(err, order) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(order);
    });
});



module.exports = userRoute