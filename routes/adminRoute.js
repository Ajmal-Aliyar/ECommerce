const express = require('express')
const adminRoute = express()




const adminController = require('../controllers/adminController')
const adminAuth = require('../middleware/adminAuth')


// const nocache = require('nocache')
// adminRoute.use(nocache())
// const parser = require('body-parser')
// adminRoute.use(parser.json())
// const session = require('express-session')
// const config=require('../config/config')
// adminRoute.use(session({
//     secret:config,
//     resave:false,
//     saveUninitialized:false,
//     cookie:{maxAge:24*60*60*1000}
// }))
// adminRoute.use(express.urlencoded({ extended: true }));
// adminRoute.set("view engine",'ejs')

adminRoute.use(express.static('public'));

adminRoute.set('views','./views/admin')

//admin + user management
adminRoute.get('/dashboard',adminAuth.isLogin,adminController.adminDashboard)
adminRoute.get('/',adminAuth.isLogout,adminController.signIn)
adminRoute.post('/',adminController.verifyAdmin)
adminRoute.get('/users',adminAuth.isLogin,adminController.usersPage)
adminRoute.patch('/unblock',adminController.unblockUser)
adminRoute.patch('/block',adminController.blockUser)
adminRoute.get('/logout',adminController.logout)
//category
const categoryController = require('../controllers/categoryController')
adminRoute.get('/categories',adminAuth.isLogin,categoryController.categories)
adminRoute.get('/addCategory',adminAuth.isLogin,categoryController.addCategoryPage)
adminRoute.get('/editCategory',adminAuth.isLogin,categoryController.editCategory)
const upload = require('../middleware/categoryMulter'); 
adminRoute.post('/editCategory',upload,categoryController.updateCategory)
adminRoute.post('/addCategory', upload, categoryController.addCategory)
adminRoute.patch('/categoryRestrict',categoryController.categoryRestrict)
adminRoute.patch('/categoryUnrestrict',categoryController.categoryUnrestrict)
adminRoute.delete('/deleteCategory',categoryController.deleteCategory)

//products
const productController = require('../controllers/productController')
adminRoute.get('/products',adminAuth.isLogin,productController.products)
adminRoute.get('/addProduct',adminAuth.isLogin,productController.addProductsPage)
const uploadProduct = require('../middleware/productMulter'); 
adminRoute.post('/addProduct',uploadProduct,productController.addProduct)
adminRoute.get('/editProduct',productController.editProduct)
adminRoute.post('/editProduct',uploadProduct,productController.updateProduct)
adminRoute.patch('/productRestrict',productController.productRestrict)
adminRoute.patch('/productUnrestrict',productController.productUnrestrict)
adminRoute.delete('/deleteProduct',productController.deleteProduct)
adminRoute.get('/productDetails',productController.productDetails)

//orders
const ordersController = require('../controllers/ordersController')
adminRoute.get('/orders',adminAuth.isLogin,ordersController.ordersPage)
adminRoute.get('/orderDetails',adminAuth.isLogin,ordersController.orderDetailsPage)
adminRoute.post('/updateOrderStatus',ordersController.updateOrderStatus)
adminRoute.post('/returnOrder',adminAuth.isLogin,ordersController.returnRequests)


//coupons
const couponController = require('../controllers/couponController')
adminRoute.get('/coupon',adminAuth.isLogin,couponController.couponPage)
adminRoute.get('/editCoupon',adminAuth.isLogin,couponController.editCoupon)
adminRoute.post('/editCoupon',couponController.updateCoupon)
adminRoute.get('/addCoupon',adminAuth.isLogin,couponController.addCouponPage)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.delete('/deleteCoupon',couponController.deleteCoupon)
adminRoute.post('/hideCoupon',couponController.hideCoupon)

//sales
const salesController = require('../controllers/salesController')
adminRoute.get('/sales',adminAuth.isLogin,salesController.salesPage)
adminRoute.get('/download-excel',adminAuth.isLogin,salesController.excelDownload)
adminRoute.get('/download-pdf',adminAuth.isLogin,salesController.pdfDownload)

//offerModule
const offerController = require('../controllers/offersController')
adminRoute.get('/offerPage',adminAuth.isLogin,offerController.offerPage)
adminRoute.get('/addOffer',adminAuth.isLogin,offerController.addOfferPage)
adminRoute.get('/addProductOffer',adminAuth.isLogin,offerController.addProductOffer)
adminRoute.post('/addOffer',adminAuth.isLogin,offerController.addOffer)
adminRoute.get('/editOffer',adminAuth.isLogin,offerController.editOfferPage)
adminRoute.post('/editOffer',adminAuth.isLogin,offerController.editOffer)
adminRoute.post('/activateOffer',adminAuth.isLogin,offerController.activateOffer)
adminRoute.post('/delOffer',adminAuth.isLogin,offerController.delOffer)

// chart 
adminRoute.post('/sellingChart',adminAuth.isLogin,adminController.lineChartData)
adminRoute.post('/topCategory',adminAuth.isLogin,adminController.topCategory)
adminRoute.post('/topProducts',adminAuth.isLogin,adminController.topProducts)


//check
adminRoute.get('/check',(req,res)=>{
    res.render('check')
})







module.exports= adminRoute





