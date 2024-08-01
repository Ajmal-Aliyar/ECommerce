const express = require('express')
const userRoute = express()
const userController = require("../controllers/userController")


//session
const session = require('express-session')
const config=require('../config/config')
userRoute.use(session({
    secret:config,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:24*60*60*1000}
}))

//nocache
const nocache = require('nocache')
userRoute.use(nocache())

const userAuth = require('../middleware/userAuth')
const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())

userRoute.use(express.urlencoded({ extended: true }));
userRoute.set('views','./views/user')  
userRoute.set("view engine", "ejs")
userRoute.use(express.static('public'));


userRoute.get('/',userController.homePage)
userRoute.get('/shop',userController.shopPage)
userRoute.get('/faq',userController.faq)
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
userRoute.post('/moreProducts',userAuth.isLogin,userController.moreProduct)
//checkout
userRoute.post('/checkout',userController.checkout)
userRoute.post('/proceedCheckout',userAuth.isLogin,userController.proceedCheckout)
userRoute.post('/applyCoupon',userController.applyCoupon)



//order
userRoute.get('/orders',userAuth.isLogin,userController.orderPage)
userRoute.post('/cancelOrder',userController.cancelOrder)
userRoute.get('/cartDetails',userAuth.isLogin,userController.cartDetails)
userRoute.post('/cancelProduct',userController.cancelProduct)
userRoute.post('/cancelProductandCoupon',userController.cancelProductandCoupon)

//filter
userRoute.get('/categoryFilter',userController.categoryFilter)


//wishlist
userRoute.get('/wishlist',userAuth.isLogin,userController.wishlist)
userRoute.post('/addToWishlist',userController.addToWishlist)
userRoute.post('/removeFromWishlist',userController.removeFromWishlist)

module.exports = userRoute