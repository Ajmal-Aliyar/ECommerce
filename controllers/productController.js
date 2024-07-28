const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const products = async (req, res) => {
    try {
        const data = await Product.find({}).sort({ createdAt: -1 });
        res.render('products', { data })
    } catch (err) {
        console.log(err);
    }
}

const addProductsPage = async (req, res) => {
    try {
        const data = await Category.find({});
        res.render('addProduct', { data })
    } catch (error) {
        console.error(error.message);
    }
}
const addProduct = async (req, res) => {
    try {
        if (req.files && req.files.length > 0) {
            const croppedImagesSrc = req.files.map(file => '/assets/images/productImage/' + file.filename);
            console.log('Cropped Images Src:', croppedImagesSrc);
        }
        console.log(req.body.productName + 'ijg')
        console.log(req.body.formData)
        console.log(req.body.productName);
        const tags = req.body.productTags;
        const productTags = tags.trim().split(',');
        let productImage = [];

        req.files.forEach(element => {
            productImage.push('/assets/images/productImage/' + element.filename);
        });


        const offerRate = Math.round(100 - (req.body.priceAfter / (req.body.priceBefore / 100)));


        const product = new Product({
            productName: req.body.productName,
            productImage,
            productCategory: req.body.productCategory,
            productDescription: req.body.productDescription,
            productPrices: {
                priceBefore: req.body.priceBefore,
                priceAfter: req.body.priceAfter,
                offerRate
            },
            productStock: req.body.productStock,
            productTags
        });


        await product.save();
        res.redirect('products');
    } catch (error) {

        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}

const editProduct = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findById(id)
        const data = await Category.find({})
        res.render('editProduct', { product, data })
    } catch (error) {
        console.error(error.message);
    }
}
const updateProduct = async (req, res) => {
    try {
        const {
            productName, productCategory, productDescription, productStock, priceBefore,
            priceAfter, isBlocked
        } = req.body
        const tags = req.body.productTags;
        const productTags = tags.trim().split(',');
        const id = req.body.id
        console.log(id);
        const offerRate = Math.round(100 - (req.body.priceAfter / (req.body.priceBefore / 100)));
        if (req.files) {
            console.log('req.files worked');
            let images = []
            req.files.forEach((element) => {
                images.push('/assets/images/productImage/' + element.filename)
                console.log('hi');
            })
            if (req.body.productImage) {
                console.log('req.files + req.body.productImage worked');
                let productImage = [...req.body.productImage, ...images]
                const editedProduct = await Product.updateOne({ _id: id }, {
                    $set: {
                        productName: productName,
                        productCategory: productCategory,
                        productImage: productImage,
                        productDescription: productDescription,
                        productStock: productStock,
                        productPrices: {
                            priceBefore: priceBefore,
                            priceAfter: priceAfter,
                            offerRate: offerRate
                        },
                        productTags: productTags,
                        isBlocked: isBlocked
                    }
                })
                console.log(editedProduct);
            } else {
                console.log('req.files else worked');
                const editedProduct = await Product.updateOne({ _id: id }, {
                    $set: {
                        productName: productName,
                        productCategory: productCategory,
                        productImage: images,
                        productDescription: productDescription,
                        productStock: productStock,
                        productPrices: {
                            priceBefore: priceBefore,
                            priceAfter: priceAfter,
                            offerRate: offerRate
                        },
                        productTags: productTags,
                        isBlocked: isBlocked
                    }
                })
                console.log(editedProduct);
            }
        } else {
            res.end("something went wrong")
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error.message);
    }
}
const productRestrict = async (req, res) => {
    try {
        const id = req.body.id
        const data = await Product.updateOne({ _id: id }, { $set: { isBlocked: true } })
        res.status(200).json({ data })
    } catch (error) {
        console.error(error.message);
    }
}
const productUnrestrict = async (req, res) => {
    try {
        const id = req.body.id
        const data = await Product.updateOne({ _id: id }, { $set: { isBlocked: false } })
        res.status(200).json({ data })

    } catch (error) {
        console.error(error.message);
    }
}
const deleteProduct = async (req, res) => {
    const id = req.body.id
    const data = await Product.deleteOne({ _id: id })
    res.status(200).json({ data })
}
const productDetails = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findById(id)
        res.render('productDetails', { product })
    } catch (error) {
        console.error(error.message);
    }
}
module.exports = {
    products, addProductsPage, addProduct, editProduct, updateProduct, productRestrict, productUnrestrict, deleteProduct,
    productDetails
}