const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const moment = require('moment');

const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Address = require('../model/addressModel')
const Review = require('../model/reviewModel')
const Cart = require('../model/cartModel')
const Order = require('../model/orderModel')
const Wishlist = require('../model/wishlistModel')
const Coupon = require('../model/couponModel')
const Wallet = require('../model/wallletModel')
const Return = require('../model/returnOrderModel')
const PDFDocument = require('pdfkit');
const { ObjectId } = require('mongodb');
const { categoryRestrict } = require('./categoryController');


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
            const data = await Product.find({}).limit(4)
            const category = await Category.find({})
            const user_id = new ObjectId(userId)
            const wishlist = await Wishlist.aggregate([
                { $match: { userId: user_id } },
                { $project: { _id: 0, wishlistProducts: 1 } },
                { $unwind: "$wishlistProducts" }
            ]);
            console.log(wishlist);

            res.render('shop', { userId, data, carts,  category, wishlist });
        } else {

            const category = await Category.find({})
            const data = await Product.find({}).limit(4)
            res.render('shop', { data,  category });
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
            res.render('productDetails', { product, data, userId, carts });
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

const blockedLogin = async(req,res) => {
    try{
        res.render('signIn',{message:'user is blocked !'})
    }catch(error){
        console.error('Error checking username:', error);
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
        if(username.length < 3){
            return res.render('signUp',{message:'Username should contain a minimum of three characters'})
        }else if(userEmail.split('@')[1] !== 'gmail.com'){
            return res.render('signUp',{message:'Enter a valid email'})
        }else if(userMobile.toString().length != 10){
            return res.render('signUp',{message:'Mobile number is not valid'})
        }else if(userPassword.length < 8){
            return res.render('signUp',{message:'User password is not strong !'})
        }else if (usernameExists) {
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
                isBlocked: 0,
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
            const referCode = generateCouponCode(10);
            const referralCode = userData._id + referCode
            const wallet = new Wallet({
                userId: userData._id,
                referralCode
            })
            await wallet.save()
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
const changePasswordVerify = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body
        console.log(userdata)
        const userEmail = userdata.email
        if(newPassword.toString().length < 8){
            res.render('changePassword', { message: 'Password is not strong !' })

        }else if (newPassword === confirmPassword) {
            const hashedPassword = await hashPassword(confirmPassword)
            const user = await userModel.updateOne({ userEmail: userEmail }, { userPassword: hashedPassword })
            if (req.session.user_id) {
                res.redirect('/user')
            } else {
                res.redirect('/signIn')
            }

        } else {
            res.render('changePassword', { message: 'Confirm password does not match' })
        }
    } catch (error) {
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
const generateCouponCode = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let couponCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters[randomIndex];
    }
    return couponCode;
};
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
        res.render('signIn', { message: 'user is blocked !' })
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
const forgotOtpSubmit = async (req, res) => {
    try {
        console.log(userdata.email);
        const userOtp = req.body.otpCode
        if (userOtp == userdata.otp) {

            res.render('changePassword')
        } else {

            res.render('otpVerificationPassword', { message: "wrong OTP, please try again" });

        }
    } catch (error) {
        console.error(error.message);
    }
}











const loginedUser = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userData = await userModel.findById(userId)
            const referralCode = await Wallet.aggregate([
                { $match: { userId: new ObjectId(userId) } },
                { $project: { referralCode: 1 } }
            ])
            res.render('user', { userData, userId, referralCode })
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
        const { id, firstName, lastName, country, state, pinCode, district, city, place, address, mobile, mobile2, landmark } = req.body
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
            landMark: landmark || null
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
        let password = false;
        if(oldPassword){
            password = await bcrypt.compare(oldPassword, userdata.userPassword)
        }else{
            password = true
        }
        if (password) {
            if(currentPassword.toString().length < 8){
                res.status(200).json({status:false, message: 'password is not strong !'})
            }else if (currentPassword === confirmPassword) {
                const pass = await bcrypt.hash(confirmPassword, 10)
                const data = await userModel.updateOne({ _id: id }, { userPassword: pass })
                res.status(200).json({status:true, message: 'password changed successfully'})
            } else {
                res.status(200).json({status:false, message: 'confirm password does not match !'})
            }
        } else {
            res.status(200).json({status:false, message: 'old password is incorrect !'})
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
        const pageCount = req.query.page
        let products = await Product.find({})
        const category = await Category.find({})

        console.log(sortFilter);

        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            const user_id = new ObjectId(userId)
            const wishlist = await Wishlist.aggregate([
                { $match: { userId: user_id } },
                { $project: { _id: 0, wishlistProducts: 1 } },
                { $unwind: "$wishlistProducts" }
            ]);
            if (sortValue == 'All') {
                res.redirect('/shop')
            } else if (sortValue == 'high_low') {
                const userId = req.session.user_id
                const data = await Product.find({}).sort({ "productPrices.priceAfter": -1 }).limit(pageCount)
                const sort = "high_low"
                res.render('shop', { userId, data, sort, carts, category, wishlist });
            } else if (sortValue == 'low_high') {
                const userId = req.session.user_id
                const data = await Product.find({}).sort({ "productPrices.priceAfter": 1 }).limit(pageCount)
                const sort = "low_high"
                res.render('shop', { userId, data, sort, carts, category, wishlist });
            } else if (sortValue == 'ascending') {
                const userId = req.session.user_id
                const data = await Product.find().sort({ productName: 1 }).collation({ locale: 'en', strength: 2 }).limit(pageCount)
                const sort = 'ascending'
                console.log(data);
                res.render('shop', { data, sort, userId, carts, category, wishlist })
            } else if (sortValue == 'descending') {
                const userId = req.session.user_id
                const data = await Product.find().sort({ productName: -1 }).collation({ locale: 'en', strength: 2 }).limit(pageCount)
                const sort = 'descending'
                console.log(data);
                res.render('shop', { data, sort, userId, carts, category, wishlist })
            }
        } else {
            if (sortValue == 'All') {
                // const data = await Product.find({})
                // const sort = "All"
                // res.render('shop', { data, sort,count })
                res.redirect('/shop')
            } else if (sortValue == 'high_low') {
                console.log('hightolow',pageCount);
                const data = await Product.find({}).sort({ "productPrices.priceAfter": -1 }).limit(pageCount)
                const sort = "high_low"
                res.render('shop', { data, sort, category });
            } else if (sortValue == 'low_high') {
                const data = await Product.find({}).sort({ "productPrices.priceAfter": 1 }).limit(pageCount)
                const sort = "low_high"
                res.render('shop', { data, sort, category });
            } else if (sortValue == 'ascending') {
                const data = await Product.find().sort({ productName: 1 }).collation({ locale: 'en', strength: 2 }).limit(pageCount)
                const sort = 'ascending'
                console.log(data);
                res.render('shop', { data, sort, category })
            } else if (sortValue == 'descending') {
                const data = await Product.find().sort({ productName: -1 }).collation({ locale: 'en', strength: 2 }).limit(pageCount)
                const sort = 'descending'
                console.log(data);
                res.render('shop', { data, sort, category })
            } else if (sortValue == 'rating') {

                // const data = await Product.aggregate([{$lookup:{
                //     'from':'reviews',
                //     'localField':_id,
                //     'foreignField':productId,
                //     'as':'productReview'
                // }}])
                const sort = "rating"
                res.render('shop', { sort });
            } else if (sortValue == 'new_arrivals') {
                const data = await Product.find({}).sort({ createdAt: -1 }).limit(pageCount)
                const sort = 'new_arrivals'
                res.render('shop', { data, sort, category })
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
                if (product.quantity == 0) {
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
        if (product.productStock >= quantity) {
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
            { $unwind: "$productDetails" },
            { $group: { _id: userId, total: { $sum: { $multiply: ["$quantity", "$productDetails.productPrices.priceAfter"] } } } }
        ])
        const grandTotalPrice = carts[0].total
        if (removeProduct.deletedCount > 0) {
            res.status(200).json({ message: 'Product removed from cart', grandTotalPrice });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }

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
            let shippingCharge = 60
            if (totalPrice > 5000) {
                shippingCharge = 0
            }
            res.render('checkout', { carts, userAddress, totalPrice, shippingCharge, userId })
        }
    } catch (err) {
        console.log(err);
    }
}
const proceedCheckout = async (req, res) => {
    try {
        console.log(req.body);
        const { id, firstName, lastName, email, country, state, pinCode, district, city, place, address, mobile, mobile2, landMark, paymentMethod, shippingCharge, couponCode, totalPrice, grandTotalPrice, paymentId, paymentSignature, paymentOrderId } = req.body
        console.log(paymentId, paymentSignature, paymentOrderId)
        if (grandTotalPrice > 1000 && !paymentSignature) {
            res.status(200).json({ status: false })
        } else {
            if (req.session.user_id) {
                const userId = req.session.user_id
                const coupon = await Coupon.findOne({ couponCode: couponCode })
                const userRefer = await Wallet.findOne({ referralCode: couponCode })
                let couponDiscount = 0
                let minimumAmount = 0
                if (coupon) {
                    minimumAmount = coupon.minimumAmount
                    couponDiscount = coupon.couponDiscount
                    if (coupon.couponLimit > 0) {
                        coupon.couponLimit -= 1;
                        await coupon.save();
                    }
                } else if (userRefer) {
                    couponDiscount = (totalPrice * 5) / 100
                }
                const carts = await Cart.aggregate([{ $match: { userId: userId } },
                { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'productDetails' } },
                { $unwind: "$productDetails" }, { $project: { productDetails: 1, quantity: 1 } }])
                carts.forEach(cart => {
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
                    product: carts,
                    shippingCharge: {
                        shippingType: 'free shipping',
                        shippingCharge: shippingCharge || 0
                    },
                    appliedCoupon: {
                        couponCode: couponCode || 'No coupon applied',
                        couponDiscount: couponDiscount,
                        minimumAmount
                    },
                    totalPrice,
                    grandTotalPrice,
                    payment: {
                        paymentMethod,
                        paymentId
                    },
                    email: email
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
                req.session.order_id = orderData._id
                const clearCart = await Cart.deleteMany({});
                res.status(200).json({ status: true, orderId })
            }
        }


    } catch (error) {
        console.error(error.message);
    }
}

const orderPage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            const orders = await Order.find({
                userId: userId,
                status: { $nin: ['cancelled', 'delivered', 'returned'] }
            }).sort({ createdAt: -1 });
            const cancelledOrders = await Order.aggregate([
                { $match: { userId: userId } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        shippingAddress: 1,
                        totalPrice: 1,
                        grandTotalPrice: 1,
                        paymentMethod: 1,
                        status: 1,
                        email: 1,
                        createdAt: 1,
                        expectedDelivery: 1,
                        product: {
                            $filter: {
                                input: "$product",
                                as: "productData",
                                cond: { $or: [{ $eq: ["$$productData.productDetails.status", "cancelled"] }, { $eq: ["$$productData.productDetails.status", "returned"] }, { $eq: ["$$productData.productDetails.status", "delivered"] }] }
                            }
                        }
                    }
                }
            ]).sort({ createdAt: -1 });
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
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: userId,
                        total: {
                            $sum: {
                                $cond: [
                                    { $ifNull: ["$productDetails", false] },
                                    { $multiply: ["$quantity", "$productDetails.productPrices.priceAfter"] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);
            const totalPrice = TotalPrice.length > 0 ? TotalPrice[0].total : 0;
            
            res.render('orders', { orders, userId, cancelledOrders, totalPrice })
        }
    } catch (error) {
        console.error(error.message);
    }
}


const cancelOrder = async (req, res) => {
    try {
        const { newStatus, orderId } = req.body
        const orderCartStatus = await Order.updateOne({ _id: orderId }, { status: newStatus })
        const orderProductStatus = await Order.updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { "product.$[elem].productDetails.status": newStatus, grandTotalPrice: 0, totalPrice: 0 } },
            { arrayFilters: [{ "elem.productDetails.status": { $ne: newStatus } }] }
        );
        const order = await Order.findById(orderId)
        console.log(order + 'fdsojk')
        let refund = 0
        let userId = req.session.user_id
        console.log('ohaofo');
        console.log(order.payment.paymentMethod + 'kjfsbal');
        if (order.payment.paymentMethod != 'cashOnDelivery') {
            refund = order.payment.paymentAmount
            console.log(refund + "kyf5");
            const wallet = await Wallet.updateOne({ userId: userId }, { $inc: { pendingBalance: refund } })
            console.log(wallet + 'sf;bn');
            order.payment.paymentAmount = 0
            await order.save();

        }
        console.log(orderCartStatus, orderProductStatus)
        if (orderCartStatus && orderProductStatus) {
            const orders = await Order.find({ _id: orderId })
            for (const product of orders[0].product) {
                const orderQuantity = product.quantity;
                const productId = product.productDetails._id;

                await Product.updateOne(
                    { _id: productId },
                    { $inc: { productStock: orderQuantity } }
                );
            }
            res.json({ status: true, refund })
        }
        console.log('done');
    } catch (error) {
        console.error(error.mesesage);
    }
};

const moreProduct = async (req, res) => {
    try {
        console.log(req.body);

        let pageCount = parseInt(req.body.pageCount)
        console.log(pageCount);
        pageCount = ((pageCount / 4) + 1) * 4
        const data = await Product.find({}).limit(pageCount)
        const category = await Category.find({})
        console.log(data,category);
        if (req.session.user_id) {
            const userId = req.session.user_id
            console.log(userId);
            const carts = await Cart.find({ userId: userId })
            console.log(carts,'caerts');
            const wishlist = await Wishlist.aggregate([
                { $match: { userId: userId } },
                { $project: { _id: 0, wishlistProducts: 1 } },
                { $unwind: "$wishlistProducts" }
            ]);
            console.log('wishlist',wishlist)
            res.render('shop', { userId, data, carts ,wishlist,category});
        } else {
            res.render('shop', { data ,category});
        }
    } catch (error) {
        console.error(error.mesesage);
    }
}

const categoryFilter = async (req, res) => {
    try {
        const categoryname = req.query.id
        if (req.session.user_id) {
            const userId = req.session.user_id
            const carts = await Cart.find({ userId: userId })
            const data = await Product.find({ productCategory: categoryname }).limit(8)
            const thisCategory = await Category.findOne({ categoryName: categoryname })
            const category = await Category.find({})
            const count = 8
            res.render('category', { userId, data, carts, count, category, thisCategory });
        } else {
            const count = 8
            const category = await Category.find({})
            const data = await Product.find({ productCategory: categoryname }).limit(8)
            const thisCategory = await Category.findOne({ categoryName: categoryname })
            console.log(thisCategory)
            res.render('category', { data, count, category, thisCategory });
        }
    } catch (err) {
        console.log(err);
    }
}
const wishlist = async (req, res) => {
    try {
        if (req.session.user_id) {
            const user_id = req.session.user_id
            const userId = new ObjectId(user_id)
            const wishlist = await Wishlist.aggregate([{ $unwind: "$wishlistProducts" }, { $lookup: { from: "products", localField: 'wishlistProducts', foreignField: '_id', as: 'wishlist' } }])
            const carts = await Cart.find({ userId: userId })
            const data = await Product.find({})
            res.render('wishlist', { userId, wishlist, carts, data })
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log(err);
    }
}
const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.body.productId;
        const objectId = new ObjectId(productId)
        const userWishlist = await Wishlist.findOne({ userId });

        if (userWishlist) {
            const exist = userWishlist.wishlistProducts.some(product => product._id.toString() === productId);
            if (exist) {
                console.log('exists');
                console.log(typeof productId)
                await Wishlist.updateOne(
                    { userId },
                    { $pull: { wishlistProducts: objectId } }
                );
                res.status(200).json({ message: 'Product removed from wishlist' });
            } else {
                console.log('not exists');
                const product = await Product.findById(objectId);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                userWishlist.wishlistProducts.push(objectId);
                await userWishlist.save();
                res.status(200).json({ message: 'Product added to wishlist' });
            }
        } else {
            const wishlist = new Wishlist({
                userId,
                wishlistProducts: [objectId]
            });
            await wishlist.save();
            res.status(200).json({ message: 'Wishlist created and product added to wishlist' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
const removeFromWishlist = async (req, res) => {
    try {
        console.log(req.body);

        const productid = req.body.wishlistProductId
        const userId = req.session.user_id
        const productId = new ObjectId(productid)
        const removed = await Wishlist.updateOne(
            { userId: new ObjectId(userId) },
            { $pull: { wishlistProducts: productId } }
        )
        console.log(removed);
        if (removed.modifiedCount > 0) {
            res.status(200).json({ message: 'Product removed from wishlist successfully' });
        } else {
            res.status(404).json({ message: 'Product not found in wishlist' });
        }

    } catch (error) {
        console.error(error.message);
    }
}




const applyCoupon = async (req, res) => {
    try {
        console.log(req.body);
        const { coupon: couponCode, totalPrice, id } = req.body;

        if (couponCode.length > 30) {
            console.log(`Referral code: ${couponCode}`);
            const userData = await Wallet.findOne({ referralCode: couponCode });
            if (userData) {
                const id = req.body.id
                console.log(id)
                let sameUser = true
                for (let i = 0; i < id.length; i++) {
                    if (id[i] != couponCode[i]) {
                        sameUser = false
                        break;
                    }
                }
                console.log(sameUser);
                if (!sameUser) {

                } else {
                    return res.status(400).json({ success: false, message: "You can't apply your referral code.." });
                }
                const firstOrder = await Order.findOne({ userId: id });
                console.log(`First order: ${firstOrder}`);

                if (!firstOrder) {
                    let couponDiscount = (totalPrice * 5) / 100;
                    couponDiscount = Math.round(couponDiscount);
                    console.log(`Coupon discount: ${couponDiscount}`);
                    return res.status(200).json({
                        success: true,
                        message: 'Referral code applied successfully!',
                        couponDiscount,
                        couponCode
                    });
                } else {
                    return res.status(400).json({ success: false, message: 'Referral code can be applied only for the first purchase.' });
                }
            } else {
                return res.status(400).json({ success: false, message: "Can't find any coupon code or referral code with this code." });
            }
        }

        console.log(`Coupon code: ${couponCode}, Total price: ${totalPrice}`);
        const coupon = await Coupon.findOne({ couponCode });
        console.log(`Coupon: ${coupon}`);

        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid coupon code.' });
        }

        const minAmount = coupon.minimumAmount;
        const startDate = moment(coupon.couponStart, 'DD/MM/YYYY');
        const endDate = moment(coupon.couponExpire, 'DD/MM/YYYY');
        const currentDate = moment();

        console.log(`Min amount: ${minAmount}, Start date: ${startDate}, End date: ${endDate}, Current date: ${currentDate}`);

        if (coupon.couponLimit <= 0) {
            return res.status(400).json({ success: false, message: 'Coupon limit has been reached.' });
        }

        if (currentDate.isBefore(startDate)) {
            return res.status(400).json({ success: false, message: 'Coupon is not yet valid.' });
        }

        if (currentDate.isAfter(endDate)) {
            return res.status(400).json({ success: false, message: 'Coupon has expired.' });
        }

        if (totalPrice < minAmount) {
            return res.status(400).json({ success: false, message: 'Total price does not meet the minimum amount required.' });
        }

        const couponDiscount = coupon.couponDiscount;
        console.log(`Coupon discount: ${couponDiscount}`);

        return res.status(200).json({ success: true, message: 'Coupon applied successfully!', couponDiscount, couponCode });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'An error occurred while applying the coupon.' });
    }
};


const cartDetails = async (req, res) => {
    try {
        const orderId = req.query.id
        if (req.session.user_id) {
            const userId = req.session.user_id
            const orders = await Order.aggregate([
                { $match: { _id: new ObjectId(orderId) } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        shippingAddress: 1,
                        totalPrice: 1,
                        grandTotalPrice: 1,
                        payment: 1,
                        appliedCoupon: 1,
                        shippingCharge: 1,
                        status: 1,
                        email: 1,
                        createdAt: 1,
                        expectedDelivery: 1,
                        product: {
                            $filter: {
                                input: "$product",
                                as: "productData",
                                cond: { $ne: ["$$productData.productDetails.status", "cancelled"] }
                            }
                        }
                    }
                }
            ]);

            console.log(orders);
            const cancelledOrders = await Order.find({
                userId: userId,
                status: { $in: ['cancelled', 'delivered'] }
            }).sort({ createdAt: -1 });

            res.render('cartDetails', { orders, userId, cancelledOrders, })
        }
    } catch (error) {
        console.error(error.mesesage);
    }
}
const cancelProduct = async (req, res) => {
    try {
        console.log(req.body);
        const { orderId, productId, productPrice } = req.body;
        const order = await Order.findOne({ _id: new ObjectId(orderId) });
        const userId = new ObjectId(req.session.user_id)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let productFound = false;
        let qty = 0;
        order.product.forEach(productData => {
            console.log(productData + 'gogogo');
            if (productData.productDetails._id.toString() === productId) {
                productData.productDetails.status = 'cancelled';
                qty = productData.quantity
                productFound = true;
            }
        });


        if (productFound) {
            order.markModified('product');
            order.totalPrice -= parseInt(productPrice);
            order.grandTotalPrice -= parseInt(productPrice);
            let refund = 0;
            if (order.payment.paymentMethod != 'cashOnDelivery') {
                order.payment.paymentAmount -= parseInt(productPrice);
                refund = productPrice
                const wallet = await Wallet.updateOne(
                    { userId: userId },
                    {
                        $inc: { walletBalance: refund },
                        $push: {
                            paymentHistory: {
                                amount: refund,
                                createdAt: new Date(),
                                status: 'recieved',
                                description: 'Your canceled order payment has been added to the wallet balance.'
                            }
                        }
                    })
            }
            await order.save();
            console.log(refund + ":reffund")
            const product = await Product.updateOne({ _id: productId }, { $inc: { productStock: qty } })
            console.log(product);


            return res.status(200).json({ success: true, status: true, refund });
        } else {
            return res.status(404).json({ success: false, message: 'Product not found in order' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, message: 'An error occurred while cancelling the product.' });
    }
};
const cancelProductandCoupon = async (req, res) => {
    try {
        const { productId, orderId, productPrice } = req.body
        const order = await Order.findOne({ _id: new ObjectId(orderId) });
        const userId = new ObjectId(req.session.user_id)

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const couponCode = order.appliedCoupon.couponCode;
        const couponDiscount = order.appliedCoupon.couponDiscount
        const addlimit = await Coupon.updateOne({ couponCode: couponCode }, { $inc: { couponLimit: 1 } })
        const removeCoupon = await Order.updateOne({ _id: orderId }, { $set: { 'appliedCoupon.couponCode': 'No coupon applied', 'appliedCoupon.couponDiscount': 0, 'appliedCoupon.minimumAmount': 0 } })

        let productFound = false;
        let qty = 0;
        order.product.forEach(productData => {
            console.log(productData + 'gogogo');
            if (productData.productDetails._id.toString() === productId) {
                productData.productDetails.status = 'cancelled';
                qty = productData.quantity
                productFound = true;
            }
        });


        if (productFound) {
            order.markModified('product');
            order.totalPrice -= parseInt(productPrice);
            order.grandTotalPrice -= parseInt(productPrice);
            order.grandTotalPrice += parseInt(couponDiscount)
            let refund = 0;
            if (order.payment.paymentMethod != 'cashOnDelivery') {
                order.payment.paymentAmount -= (parseInt(productPrice) - parseInt(couponDiscount))
                refund = productPrice - couponDiscount
                const wallet = await Wallet.updateOne(
                    { userId: userId },
                    {
                        $inc: { walletBalance: refund },
                        $push: {
                            paymentHistory: {
                                amount: refund,
                                createdAt: new Date(),
                                status: 'recieved',
                                description: 'Your canceled order payment has been added to the wallet balance.'
                            }
                        }
                    })
            }
            console.log(refund + ':refund')
            await order.save();

            const product = await Product.updateOne({ _id: productId }, { $inc: { productStock: qty } })
            console.log(product);
            return res.status(200).json({ success: true, status: true, refund });
        } else {
            return res.status(404).json({ success: false, message: 'Product not found in order' });
        }
    } catch (error) {
        console.error(error.message);
    }
}

const walletPage = async (req, res) => {
    try {
        const userId = req.session.user_id
        const wallet = await Wallet.findOne({ userId: userId })
        res.render('wallet', { userId, wallet })
    } catch (error) {
        console.error(error.message);
    }
}

const deliveredOrderPage = async (req, res) => {
    try {
        const userId = req.session.user_id
        console.log(req.query);
        const { orderId, productId } = req.query
        const product = await Product.findById(new ObjectId(productId))
        const order = await Order.aggregate([{ $match: { _id: new ObjectId(orderId) } }, { $unwind: "$product" }, { $match: { 'product.productDetails._id': new ObjectId(productId) } }])
        console.log(order);
        let deliveredDate = order[0].expectedDelivery
        let today = new Date()
        let expireDate = new Date();
        expireDate.setDate(deliveredDate.getDate() + 7);
        const returnDate = { deliveredDate, today, expireDate }
        res.render('deliveredOrder', { userId, product, order, returnDate })
    } catch (error) {
        console.error(error.mesesage);
    }
}
const returnOrder = async (req, res) => {
    try {
        const userId = new ObjectId(req.session.user_id)
        console.log(req.body.jsonObject);
        const { fullName, mobile, reason, quantity, orderId, productId } = req.body.jsonObject
        const returnOrders = await Return.find({})
        let orderFound = false;

        for (const returned of returnOrders) {
            if (returned.orderId.toString() === orderId && returned.productId.toString() === productId) {
                orderFound = true;
                break;
            }
        }

        if (orderFound) {
            res.status(200).json({ status: false });
        }
        const order = await Order.aggregate([{ $match: { _id: new ObjectId(orderId) } }, { $unwind: "$product" }, { $match: { 'product.productDetails._id': new ObjectId(productId) } }])
        const productActualPrice = order[0].product.productDetails.productPrices.priceBefore
        const productOfferredPrice = order[0].product.productDetails.productPrices.priceAfter
        const refundAmount = productOfferredPrice * quantity
        const returnData = new Return({
            orderId: new ObjectId(orderId),
            productId: new ObjectId(productId),
            fullName,
            mobile,
            reason,
            productActualPrice,
            productOfferredPrice,
            quantity,
            refundAmount,
        })
        const wallet = await Wallet.updateOne(
            { userId: userId },
            {
                $inc: { pendingBalance: refundAmount },
                $push: {
                    paymentHistory: {
                        amount: refundAmount,
                        createdAt: new Date(),
                        status: 'pending',
                        description: 'Your returned order payment is pending and will be added to your wallet balance shortly.'
                    }
                }
            })
        await returnData.save()
        res.status(200).json({ status: true })
    } catch (error) {
        console.error(error.message);
    }
}
const getCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({ couponHide: false });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error });
    }
}
let orderData;
const orderPlace = async (req, res) => {
    try {
        console.log(req.session);
        const orderId = req.session.order_id
        const userId = req.session.user_id
        console.log(orderId, userId)
        orderData = await Order.findOne({ _id: new ObjectId(orderId) })
        console.log(orderData)
        res.render('invoice', { userId, orderId, orderData })


    } catch (error) {
        console.error(error.mesesage);
    }
}


const generatePdf = async (req, res) => {
    try {
       
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.fontSize(12).text(`Invoice ID: ${orderData._id}`, { align: 'center' });
        doc.moveDown();


        doc.text('Shipping Address:', 50, 130);
        doc.text(`${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`, 50, 145);
        doc.text(`${orderData.shippingAddress.country}, ${orderData.shippingAddress.state}`, 50, 160);
        doc.text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.district}`, 50, 175);
        doc.text(`${orderData.shippingAddress.address}`, 50, 190);
        doc.text(`${orderData.shippingAddress.landMark}`, 50, 225);
        doc.text(`${orderData.shippingAddress.pinCode}`, 50, 240);
        doc.text(`${orderData.shippingAddress.mobile} ${orderData.shippingAddress.mobile2}`, 50, 255);

        doc.moveDown();
        doc.text('Payment Method:', 50, 270);
        doc.text(`${orderData.payment.paymentMethod}`, 50, 285);
        doc.text(`Payment ID: ${orderData.payment.paymentId}`, 50, 300);
        doc.text(`Amount: ${orderData.payment.paymentAmount} rs`, 50, 315);

        doc.text('Order Date:', 50, 345);
        doc.text(new Date(orderData.createdAt).toLocaleDateString(), 160, 345);


        doc.moveTo(50, 400).lineTo(550, 400).stroke();


        doc.text('#', 50, 420);
        doc.text('Item', 70, 420);
        doc.text('Price', 400, 420);
        doc.text('Quantity', 440, 420);
        doc.text('Total', 500, 420);

        doc.moveTo(50, 450).lineTo(550, 450).stroke();


        orderData.product.forEach((item, index) => {
            const total = item.productDetails.productPrices.priceAfter * item.quantity;
            doc.text(index + 1, 50, 460 + index * 20);
            doc.text(item.productDetails.productName.split('').slice(0, 55).join(''), 70, 460 + index * 20);
            doc.text(item.productDetails.productPrices.priceAfter.toString(), 400, 460 + index * 20);
            doc.text(item.quantity.toString(), 450, 460 + index * 20);
            doc.text(total.toString(), 500, 460 + index * 20);
        });

        doc.moveDown();
        doc.text('Subtotal:', 400, 500 + orderData.product.length * 20);
        doc.text(`${orderData.totalPrice}`, 500, 500 + orderData.product.length * 20);

        if (orderData.appliedCoupon.couponDiscount != 0) {
            doc.text('Discount Code:', 400, 515 + orderData.product.length * 20);
            doc.text(`- ${orderData.appliedCoupon.couponDiscount}`, 500, 515 + orderData.product.length * 20);
        }

        doc.text('Shipping:', 400, 530 + orderData.product.length * 20);
        doc.text(`${orderData.shippingCharge.shippingCharge}`, 500, 530 + orderData.product.length * 20);



        doc.moveTo(390, 545 + orderData.product.length * 20).lineTo(550, 545 + orderData.product.length * 20).stroke();
        doc.moveDown();
        doc.text('Total:', 400, 565 + orderData.product.length * 20);
        doc.fontSize(14).text(`${orderData.grandTotalPrice+orderData.shippingCharge.shippingCharge}`, 500, 565 + orderData.product.length * 20);
        doc.moveTo(390, 585 + orderData.product.length * 20).lineTo(550, 585 + orderData.product.length * 20).stroke();


        doc.end();
    } catch (error) {
        res.status(500).json({ error: `Error occured while generating pdf : '${error}` })
    }
}
module.exports = {
    homePage, faq, shopPage, categoryPage, wishlist, cart, contact, aboutPage, loginPage, logoutPage, productDetails, faqPage, loginedUser, errorPage, checkout, errorPage,
    forgotPassword, otpVerification, changePassword, insertUser, verifyOtp, otpResend, verifyUser, addNewAddress, address, editAddressPage, editedAddress,
    removeAddress, defaultAddress, editUser, forgotPasswordOtp, forgotOTPresend, sortFilter, addToCart, cartProductQuantity, removeFromCart, proceedCheckout,
    orderPage, forgotOtpSubmit, changePasswordVerify, cancelOrder, moreProduct, categoryFilter, addToWishlist, removeFromWishlist, applyCoupon, cartDetails, cancelProduct, cancelProductandCoupon,
    orderPlace, walletPage, deliveredOrderPage, returnOrder, getCoupon, generatePdf,blockedLogin
}