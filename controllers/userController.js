const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Address = require('../model/addressModel')
const Review = require('../model/reviewModel')
const Cart = require('../model/cartModel')
const Order = require('../model/orderModel')
const Wishlist = require('../model/wishlistModel')

let userdata = {}
const faq = async (req, res) => {
    try {
        res.render('faq')
    } catch (error) {
        console.error(error.mesesage);
    }
}
const shopPage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            const data = await Product.find({}).limit(8)
            const category = await Category.find({})
            const count = 8
            res.render('shop', { userId, data, carts,count,category });
        } else {
            const count = 8
            const category = await Category.find({})
            const data = await Product.find({}).limit(8)
            res.render('shop', { data,count,category });
        }
    } catch (err) {
        console.log(err);
    }
}
const categoryPage = async (req, res) => {
    try {
        res.render('shop')
    } catch (err) {
        console.log(err);
    }
}
const wishlist = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            res.render('wishlist', { userId })
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log(err);
    }
}

const contact = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            res.render('contact', { userId });
        } else {
            res.render('contact');
        }
    } catch (err) {
        console.log(err);
    }
}
const aboutPage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            res.render('about', { userId });
        } else {
            res.render('about');
        }
    } catch (err) {
        console.log(err);
    }
}
const loginPage = async (req, res) => {
    try {
        res.render('signIn')
    } catch (err) {
        console.log(err);
    }
}
const logoutPage = async (req, res) => {
    try {
        res.render('signUp')
    } catch (err) {
        console.log(err);
    }
}
const productDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);
        console.log(product)
        if (!product) {

            return res.status(404).send("Product not found");
        } else {
            console.log(product);
        }
        const data = await Product.find({})
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            res.render('productDetails', { product, data, userId ,carts});
        } else {
            res.render('productDetails', { product, data });
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};
const faqPage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            res.render('faq', { userId })
        } else {
            res.render('faq')
        }

    } catch (err) {
        console.log(err);
    }
}

const errorPage = async (req, res) => {
    try {
        res.render('error')
    } catch (err) {
        console.log(err);
    }
}

const otpVerification = async (req, res) => {
    try {
        res.render('otpVerificationSignup')
    } catch (err) {
        console.log(err);
    }
}




const checkUsernameExists = async (email) => {
    try {
        const existingUser = await userModel.findOne({ userEmail: email });
        return !!existingUser;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};
const hashPassword = async (password) => {
    try {
        const pass = await bcrypt.hash(password, 10)
        return pass
    } catch (error) {
        console.error("Error while hashing in securePassword:", error);
    }
}
const mailSender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mailermail66@gmail.com',
        pass: 'ksjc cbtx rsef bdtv'
    }
})
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
const sendOTP = async (email, otp) => {
    try {
        let info = await mailSender.sendMail({
            from: 'mailermail66@gmail.com',
            to: email,
            subject: 'Your otp for verification : ',
            text: `your otp is ${otp}`
        })
        console.log(`OTP : ${info.messageId}`);
        return true
    } catch (error) {
        console.log(error.message);
        return false
    }
}


const insertUser = async (req, res) => {
    try {
        userdata.username = req.body.username
        userdata.userEmail = req.body.userEmail
        userdata.userMobile = req.body.userMobile

        const { username, userEmail, userMobile, userPassword } = req.body
        email = userEmail
        const usernameExists = await checkUsernameExists(userEmail);
        if (usernameExists) {
            return res.render('signUp', { message: 'User already exists. Please choose another.' });
        } else {
            otp = generateOTP()
            userdata.otp = otp
            console.log("OTP = ", otp);
            const otpSent = await sendOTP(userEmail, otp)

            if (!otpSent) {
                throw new Error('Failed to send OTP');
            } else {
                res.redirect('/otpVerification')
            }
            const hashedPassword = await hashPassword(userPassword)
            user = new userModel({
                username,
                userEmail,
                userMobile,
                userPassword: hashedPassword,
                isBlocked: 0
            })
        }


    } catch (error) {
        console.error(error.message);
    }
}
const verifyOtp = async (req, res) => {
    try {
        console.log(userdata.email);
        const userOtp = req.body.otpCode
        console.log(userdata.otp + " system otp");
        console.log(userOtp + " user otp");
        if (userOtp == userdata.otp) {
            const userData = await user.save()
            console.log(userData);
            res.redirect('signIn')
        } else {

            res.render('otpVerificationSignup', { message: "wrong OTP, please try again" });

        }
    } catch (error) {
        console.error(error.message)
    }
}
const otpResend = async (req, res) => {
    const otp = generateOTP()
    userdata.otp = otp
    console.log(userdata);
    const otpSent = await sendOTP(userdata.userEmail, otp)
    if (!otpSent) {
        throw new Error('Failed to send OTP');
    } else {
        res.redirect('/otpVerification')
    }

}

const forgotOTPresend = async (req, res) => {
    const userEmail = userdata.email
    const otp = generateOTP()
    userdata.otp = otp
    console.log(userdata)
    const otpSent = await sendOTP(userEmail, otp)
    if (!otpSent) {
        throw new Error('Failed to send OTP');
    } 

}
const changePasswordVerify = async (req,res)=>{
    try{
        const {newPassword,confirmPassword} = req.body
        console.log(userdata)
        const userEmail = userdata.email
        if(newPassword === confirmPassword){
            const hashedPassword = await hashPassword(confirmPassword)
            const user = await userModel.updateOne({userEmail:userEmail},{userPassword:hashedPassword})
            if(req.session.user_id){
            //     const userData = await userModel.findById(userId)
            // res.render('user', { userData, userId })
            res.redirect('/user')
            }else{
                res.redirect('/')
            // const data = await Product.find({})
            // const category = await Category.find({})
            // res.render('home', { data, category });
            }
            
        }else{
            res.render('changePassword',{message:'Confirm password does not match'})
        }
    }catch(error){
        console.error(error.message);
    }
}
const homePage = async (req, res) => {
    try {

        if (req.session.user_id) {
            const userId = req.session.user_id
            const data = await Product.find({})
            const category = await Category.find({})
            res.render('home', { userId, data, category });
        } else {

            const data = await Product.find({})
            const category = await Category.find({})
            res.render('home', { data, category });
        }
    } catch (err) {
        console.log(err)
    }
}
const verifyUser = async (req, res) => {
    const { userLogAddress, userLogPassword } = req.body
    const userData = await userModel.findOne({ userEmail: userLogAddress })
    console.log(userData);
    if (userData.isBlocked === false) {
        if (userData) {
            const password = await bcrypt.compare(userLogPassword, userData.userPassword)
            if (password) {
                req.session.user_id = userData._id
                const userId = req.session.user_id
                const data = await Product.find({})
                const category = await Category.find({})
                res.render('home', { userId, data, category });
            } else {
                res.render('signIn', { message: "email or password is wrong" })
            }
        } else {
            res.render('signIn', { message: 'email or password is wrong' })
        }
    } else {
        res.render('signIn', { message: 'user is blocked' })
    }

}

const forgotPassword = async (req, res) => {
    try {
        console.log(req.body)
        res.render('forgotPassword')
    } catch (err) {
        console.log(err);
    }
}
const forgotOtpSubmit = async(req,res)=>{
    try{
        console.log(userdata.email);
        const userOtp = req.body.otpCode
        if (userOtp == userdata.otp) {
            
            res.render('changePassword')
        } else {

            res.render('otpVerificationPassword', {  message: "wrong OTP, please try again" });

        }
    }catch(error){
        console.error(error.message);
    }
}











const loginedUser = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userData = await userModel.findById(userId)
            res.render('user', { userData, userId })
        } else {
            res.redirect('/')
        }

    } catch (err) {
        console.log(err);
    }
}


//dashboard
const address = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userAddress = await Address.find({ user_id: userId })
            res.render('address', { userAddress, userId })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.error(error.message);
    }
}
const addNewAddress = async (req, res) => {
    try {
        const { id, firstName, lastName, country, state, pinCode, district, city, place, address, mobile, mobile2, landMark } = req.body
        console.log(req.body);
        const newAddress = new Address({
            user_id: id,
            firstName,
            lastName,
            country,
            state,
            pinCode,
            district,
            place,
            city,
            address,
            mobile,
            mobile2: mobile2 || null,
            landMark: landMark || null
        })
        await newAddress.save()


        const userAddress = await Address.find({ user_id: id })

        res.redirect('/address')

    } catch (error) {
        console.error(error.message);
    }
}
const editAddressPage = async (req, res) => {
    try {
        const id = req.query.id
        const userAddress = await Address.findById(id)
        res.render('editAddress', { userAddress })
    } catch (error) {
        console.error(error.message);
    }
}
const editedAddress = async (req, res) => {
    try {
        console.log('req.body')
        const { id, firstName, lastName, country, state, pinCode, district, city, place, address, mobile, mobile2, landMark } = req.body
        const editedData = await Address.updateOne({ _id: id }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                country: country,
                state: state,
                picCode: pinCode,
                district: district,
                place: place,
                city: city,
                address: address,
                mobile: mobile,
                mobile2: mobile2 || null,
                landMark: landMark || null
            }
        })
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userAddress = await Address.find({ user_id: userId })
            console.log(userAddress);
            res.redirect('/address')
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.error(error.message);
    }
}
const removeAddress = async (req, res) => {
    try {
        const id = req.query.id
        const removeaddress = await Address.deleteOne({ _id: id })
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userAddress = await Address.find({ user_id: userId })
            console.log(userAddress);
            res.render('address', { userAddress, userId })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.error(error.message);
    }
}
const defaultAddress = async (req, res) => {
    try {
        const userId = req.query.userId
        const id = req.query.id
        const makeTrue = await Address.updateOne({ _id: id }, { $set: { shippingAddress: true } })
        const makeFalse = await Address.updateMany({ _id: { $ne: id }, user_id: userId }, { $set: { shippingAddress: false } })
        res.redirect('/address')
    } catch (error) {
        console.error(error.message);
    }
}
const editUser = async (req, res) => {
    try {
        const { id, username, userMobile } = req.body
        const updateUser = await userModel.updateOne({ _id: id }, { username: username, userMobile: userMobile })
        res.redirect('/user')
    } catch (error) {
        console.error(error.message);
    }
}
const changePassword = async (req, res) => {
    try {

        const userId = req.session.user_id
        const userData = await userModel.findById(userId)

        const { id, oldPassword, currentPassword, confirmPassword } = req.body
        const userdata = await userModel.findById(id)
        const password = await bcrypt.compare(oldPassword, userdata.userPassword)
        if (password) {
            if (currentPassword === confirmPassword) {
                const pass = await bcrypt.hash(confirmPassword, 10)
                const data = await userModel.updateOne({ _id: id }, { userPassword: pass })
                res.redirect('/user')
            } else {
                res.render('user', { message: 'confirm password does not match', userData, userId })
            }
        } else {
            res.render('user', { message: 'old password is incorrect', userData, userId })
        }

    } catch (error) {
        console.error(error.message);
    }
}
const forgotPasswordOtp = async (req, res) => {
    try {
        const userEmail = req.body.userEmail
        userdata.email = req.body.userEmail
        const usernameExists = await userModel.find({ userEmail: userEmail })
        if (usernameExists.length > 0) {
            otp = generateOTP()
            userdata.otp = otp
            console.log("OTP = ", otp);
            const otpSent = await sendOTP(userEmail, otp)
            if (!otpSent) {
                throw new Error('Failed to send OTP');
            } else {
                res.render('otpVerificationPassword', { userEmail })
            }

        } else {
            res.render('forgotPassword', { message: 'Counld not find this email' });
        }

    } catch (error) {
        console.error(error.message);
    }
}

//sort
const sortFilter = async (req, res) => {
    try {
        const sortValue = req.query.id
        let products = await Product.find({})
        const count = products.length
        console.log(sortFilter);
        
        if (req.session.user_id) {
            const carts = await Cart.find({ userId: userId })
            if (sortValue == 'All') {
                // const userId = req.session.user_id
                // const data = await Product.find({})
                // const sort = "All"
                // res.render('shop', { data, userId, sort,count,carts })
                res.redirect('/shop')
            } else if (sortValue == 'high_low') {
                const userId = req.session.user_id
                const data = await Product.find({}).sort({ "productPrices.priceAfter": -1 })
                const sort = "high_low"
                res.render('shop', { userId, data, sort,count,carts });
            } else if (sortValue == 'low_high') {
                const userId = req.session.user_id
                const data = await Product.find({}).sort({ "productPrices.priceAfter": 1 })
                const sort = "low_high"
                res.render('shop', { userId, data, sort ,count,carts});
            } else if (sortValue == 'ascending') {
                const userId = req.session.user_id
                const data = await Product.find().sort({ productName: 1 }).collation({ locale: 'en', strength: 2 })
                const sort = 'ascending'
                console.log(data);
                res.render('shop', { data, sort, userId ,count,carts})
            }  else if (sortValue == 'popularity') {
                const userId = req.session.user_id
                const data = await Product.find({}).sort({ productSales: -1 })
                const sort = 'popularity'
                res.render('shop', { data, sort ,count,userId,carts})
            } else if (sortValue == 'descending') {
                const userId = req.session.user_id
                const data = await Product.find().sort({ productName: -1 }).collation({ locale: 'en', strength: 2 })
                const sort = 'descending'
                console.log(data);
                res.render('shop', { data, sort, userId ,count,carts})
            }
        } else {
            if (sortValue == 'All') {
                // const data = await Product.find({})
                // const sort = "All"
                // res.render('shop', { data, sort,count })
                res.redirect('/shop')
            } else if (sortValue == 'high_low') {
                const data = await Product.find({}).sort({ "productPrices.priceAfter": -1 })
                const sort = "high_low"
                res.render('shop', { data, sort ,count});
            } else if (sortValue == 'low_high') {
                const data = await Product.find({}).sort({ "productPrices.priceAfter": 1 })
                const sort = "low_high"
                res.render('shop', { data, sort ,count});
            } else if (sortValue == 'ascending') {
                const data = await Product.find().sort({ productName: 1 }).collation({ locale: 'en', strength: 2 })
                const sort = 'ascending'
                console.log(data);
                res.render('shop', { data, sort ,count})
            } else if (sortValue == 'descending') {
                const data = await Product.find().sort({ productName: -1 }).collation({ locale: 'en', strength: 2 })
                const sort = 'descending'
                console.log(data);
                res.render('shop', { data, sort ,count})
            } else if (sortValue == 'rating') {

                // const data = await Product.aggregate([{$lookup:{
                //     'from':'reviews',
                //     'localField':_id,
                //     'foreignField':productId,
                //     'as':'productReview'
                // }}])
                const sort = "rating"
                res.render('shop', { sort });
            } else if (sortValue == 'popularity') {
                const data = await Product.find({}).sort({ productSales: -1 })
                const sort = 'popularity'
                res.render('shop', { data, sort ,count})
            } else if (sortValue == 'new_arrivals') {
                const data = await Product.find({}).sort({ createdAt: -1 })
                const sort = 'new_arrivals'
                res.render('shop', { data, sort,count })
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

//cart
const cart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id;
            
            const carts = await Cart.aggregate([
                { $match: { userId: userId } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: "$productDetails" },
                { $sort: { createdAt: -1 } }
            ])
            console.log(carts)
        
            for (const product of carts) {
                if(product.quantity==0){
                    const productId = product.productId

                    await Cart.deleteOne(
                        { productId: productId },
                    );
                }
            }
            const findTotal = await Cart.aggregate([
                { $match: { userId: userId } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: "$productDetails" },
                { $group: { _id: userId, total: { $sum: { $multiply: ["$quantity", "$productDetails.productPrices.priceAfter"] } } } }
            ])
            if (carts.length > 0) {
                const grandTotalPrice = findTotal[0].total
                console.log(grandTotalPrice)
                res.render('cart', { userId, carts, grandTotalPrice });
            } else {
                res.render('cart', { carts, userId })
            }
        }
        else {
            res.redirect('/');
        }

    } catch (err) {
        console.log(err);
    }
}
const addToCart = async (req, res) => {
    try {
        const { userId, productId } = req.body
        const productToAdd = await Product.find({ _id: productId })
        const productStock = productToAdd[0].productStock
        if (productStock > 0) {
            console.log('stock is left');
            const cartProduct = new Cart({
                userId,
                productId,

            })
            await cartProduct.save()
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    } catch (error) {
        console.error(error.message);
    }
}
const cartProductQuantity = async (req, res) => {
    try {
        console.log(req.body)
        const { cartId, productId, quantity } = req.body
        const userCart = await Cart.find({ _id: cartId })
        const product = await Product.findById(productId)
        const ObjectId = userCart[0].userId
        const userId = ObjectId.toString()
        const cartProduct = await Product.find({ _id: productId })
        if(product.productStock>=quantity){
            const updateQuantity = await Cart.updateOne({ _id: cartId }, { quantity: quantity })

        }
        const carts = await Cart.aggregate([
            { $match: { userId: userId } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" },
            { $group: { _id: userId, total: { $sum: { $multiply: ["$quantity", "$productDetails.productPrices.priceAfter"] } } } }
        ])
        const grandTotalPrice = carts[0].total
        res.json({ grandTotalPrice })
    } catch (error) {
        console.error(error.message);
    }
}
const removeFromCart = async (req, res) => {
    try {
        console.log(req.body)
        const productId = req.body.cartProductId
        const removeProduct = await Cart.deleteOne({ _id: productId })
        res.json({ route: 'cart' })
    } catch (error) {
        console.error(error.message);
    }
}




const checkout = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.aggregate([
                { $match: { userId: userId } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: "$productDetails" }
            ])
            const billingAddress = await Address.find({ user_id: userId, shippingAddress: true })
            const userAddress = billingAddress[0]
            const TotalPrice = await Cart.aggregate([
                { $match: { userId: userId } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: "$productDetails" },
                { $group: { _id: userId, total: { $sum: { $multiply: ["$quantity", "$productDetails.productPrices.priceAfter"] } } } }
            ])
            const totalPrice = TotalPrice[0].total
            res.render('checkout', { carts, userAddress, totalPrice, userId })
        }
    } catch (err) {
        console.log(err);
    }
}
const proceedCheckout = async (req, res) => {
    try {

        const { id, firstName, lastName,email, country, state, pinCode, district, city, place, address, mobile, mobile2, landMark,paymentMethod ,grandTotalPrice} = req.body

        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.aggregate([ { $match: { userId: userId } }, 
                { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'productDetails' } },
                 { $unwind:"$productDetails"},{$project:{productDetails:1,quantity:1}} ] )
                 carts.forEach(cart =>{
                    cart.productDetails.status = 'order placed'
                 })
            const orderData = new Order({
                userId: userId,
                shippingAddress: {
                    firstName,
                    lastName,
                    country,
                    state,
                    pinCode,
                    district,
                    place,
                    city,
                    address,
                    mobile,
                    mobile2: mobile2 || null,
                    landMark: landMark || null,
                },
                product:carts,
                grandTotalPrice,
                paymentMethod:paymentMethod,
                email:email
            })
            await orderData.save()
            for (const product of orderData.product) {
                const orderQuantity = product.quantity;
                const productId = product.productDetails._id;

                await Product.updateOne(
                    { _id: productId },
                    { $inc: { productStock: -orderQuantity } }
                );
            }
            const orderId = orderData._id
            const clearCart = await Cart.deleteMany({});

            res.render('orderPlace', { userId,orderId })
        }

    } catch (error) {
        console.error(error.message);
    }
}
const orderPage = async (req,res)=>{
    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const orders = await Order.find({
                userId: userId,
                status: { $nin: ['cancelled', 'delivered'] }
            }).sort({ createdAt: -1 });
            const cancelledOrders = await Order.find({
                userId: userId,
                status: { $in: ['cancelled', 'delivered'] }
            }).sort({ createdAt: -1 });
            
            res.render('orders',{orders,userId,cancelledOrders})
        }
    }catch(error){
        console.error(error.message);
    }
}


const cancelOrder = async (req, res) => {
   try{
    const {newStatus,orderId}=req.body
    const orderCartStatus = await Order.updateOne({_id:orderId},{status:newStatus})
    const orderProductStatus = await Order.updateMany(
        { _id: orderId, "product.productDetails.status": { $ne: newStatus } },
        { $set: { "product.$[].productDetails.status": newStatus } })
        console.log(orderCartStatus , orderProductStatus)
        if(orderCartStatus && orderProductStatus){
            const orders = await Order.find({_id:orderId})
            for (const product of orders[0].product) {
                const orderQuantity = product.quantity;
                const productId = product.productDetails._id;

                await Product.updateOne(
                    { _id: productId },
                    { $inc: { productStock: orderQuantity } }
                );
            }
            res.json({status:true})
        }
        console.log('done');
   }catch(error){
    console.error(error.mesesage);
   }
};
  
const moreProduct = async(req,res)=>{
    try{

        let count = req.body.count
        count = ((count/8)+1)*8
        const data = await Product.find({}).limit(count)
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            res.render('shop', { userId, data, carts,count });
        } else {
            res.render('shop', { data ,count});
        }
    }catch(error){
        console.error(error.mesesage);
    }
}

const categoryFilter = async (req,res)=>{
    try {
        const categoryname = req.query.id
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            const data = await Product.find({productCategory:categoryname}).limit(8)
            const thisCategory = await Category.findOne({categoryName:categoryname})
            const category = await Category.find({})
            const count = 8
            res.render('category', { userId, data, carts,count,category,thisCategory });
        } else {
            const count = 8
            const category = await Category.find({})
            const data = await Product.find({productCategory:categoryname}).limit(8)
            const thisCategory = await Category.findOne({categoryName:categoryname})
            console.log(thisCategory)
            res.render('category', { data,count,category,thisCategory });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    homePage, faq, shopPage, categoryPage, wishlist, cart, contact, aboutPage, loginPage, logoutPage, productDetails, faqPage, loginedUser, errorPage, checkout, errorPage,
    forgotPassword, otpVerification, changePassword, insertUser, verifyOtp, otpResend, verifyUser, addNewAddress, address, editAddressPage, editedAddress,
    removeAddress, defaultAddress, editUser, forgotPasswordOtp, forgotOTPresend, sortFilter, addToCart, cartProductQuantity, removeFromCart, proceedCheckout,
    orderPage,forgotOtpSubmit,changePasswordVerify,cancelOrder,moreProduct,categoryFilter
}