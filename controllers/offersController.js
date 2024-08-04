const Offer = require('../model/offerModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const { ObjectId } = require('mongodb')
const offerPage = async (req, res) => {
    try {
        const offer = await Offer.find({}).sort({ updatedAt: -1 })
        res.render('offerPage', { offer })
    } catch (error) {
        console.error(error.message);
    }
}
const addOfferPage = async (req, res) => {
    try {
        const categoryNames = await Category.find({}, { _id: 1, categoryName: 1 })
        res.render('addCategoryOffer', { categoryNames })
    } catch (error) {
        console.error(error.message);
    }
}
const addProductOffer = async (req, res) => {
    try {
        const productNames = await Product.find({}, { _id: 1, productName: 1 })
        res.render('addProductOffer', { productNames })
    } catch (error) {
        console.error(error.message);
    }
}
const addOffer = async (req, res) => {
    try {
        console.log(req.body);
        const { offerName, offerType, offerItem, offerPercentage, isActive } = req.body;

        const offers = await Offer.find({});
        const exist = offers.some(offer => offer.offerItem === offerItem && offer.offerType === offerType);

        if (!exist) {
            const offerInput = new Offer({
                offerName,
                offerType,
                offerItem,
                offerPercentage,
                isActive
            });
            const offer = await offerInput.save();
            console.log(`${offer} - offer`);

            if (offer.isActive && offer.offerType === 'product') {
                console.log('Applying offer to product');
                const product = await Product.findOne({ productName: offer.offerItem });
                if (product) {
                    const productUpdate = await Product.updateOne(
                        { productName: offer.offerItem },
                        {
                            $set: {
                                'productPrices.priceAfter': product.productPrices.priceBefore * (1 - (offerPercentage / 100)),
                                'productPrices.offerRate': offerPercentage,
                                'productPrices.offerName': offerName
                            }
                        }
                    );
                    console.log(productUpdate);
                } else {
                    console.log('Product not found');
                }
            } else if (offer.isActive && offer.offerType === 'category') {
                console.log('Applying offer to category');
                const categoryProducts = await Product.find({ productCategory: offer.offerItem });
                if (categoryProducts.length) {
                    for (const product of categoryProducts) {
                        product.productPrices.priceAfter = product.productPrices.priceBefore * (1 - (offerPercentage / 100));
                        product.productPrices.offerName = offerName;
                        product.productPrices.offerRate = offerPercentage;
                        await product.save();
                        console.log(`${product} - updated`);
                    }
                } else {
                    console.log('No products found for this category');
                }
            }

            res.status(200).json({ status: true });
        } else {
            res.status(400).json({ message: 'Offer already exists' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const editOfferPage = async (req, res) => {
    try {
        const offerId = req.query.id
        const offer = await Offer.findById(offerId)
        const categoryNames = await Category.find({}, { _id: 1, categoryName: 1 })
        const productNames = await Product.find({}, { _id: 1, productName: 1 })

        res.render('editOffer', { offer, categoryNames, productNames })
    } catch (error) {
        console.error(error.message);
    }
}
const editOffer = async (req, res) => {
    try {
        console.log(req.body);
        let { offerName, offerType, offerItem, offerPercentage, isActive, offerId } = req.body
        offerPercentage = parseInt(offerPercentage)
        const offers = await Offer.find({});
        let exist = offers.some(offer => offer.offerItem === offerItem && offer.offerType === offerType && offer._id.toString() != offerId.toString());
        console.log(exist);
        if (!exist) {

            const offer = await Offer.findOne(new ObjectId(offerId))
            console.log(offer+":offer")
            if (offer.isActive) {
                console.log('its active');
                if (offer.offerType == 'product') {
                    const product = await Product.findOne({ productName: offer.offerItem })
                    product.productPrices.priceAfter = product.productPrices.priceBefore
                    product.productPrices.offerRate = 0
                    product.productPrices.offerName = null
                    const productSave = await product.save()
                    console.log(productSave);
                    const offerUpdate = await Offer.updateOne({ _id: new ObjectId(offerId) }, {
                        $set: { offerName, offerType, offerItem, offerPercentage }
                    })

                    const productUpdate = await Product.updateOne(
                        { productName: offerItem },
                        {
                            $set: {
                                'productPrices.priceAfter': product.productPrices.priceBefore * (1 - (offerPercentage / 100)),
                                'productPrices.offerRate': offerPercentage,
                                'productPrices.offerName': offerName
                            }
                        }
                    );


                } else if (offer.offerType == 'category') {
                    const categoryProducts = await Product.find({ productCategory: offer.offerItem });
                    console.log('products in old category : ',categoryProducts);
                    if (categoryProducts.length) {
                        for (const product of categoryProducts) {
                            product.productPrices.priceAfter = product.productPrices.priceBefore;
                            product.productPrices.offerName = null;
                            product.productPrices.offerRate = 0;
                            console.log('updated product before saving : ',product);
                            try {
                                let check = await product.save();
                                console.log('updated product after saving : ',check);
                            } catch (error) {
                                console.error('Error saving product:', error);
                            }
                        }
                    }else {
                        console.log('No products found for this category');
                    }
                    const offerUpdate = await Offer.updateOne({ _id: new ObjectId(offerId) }, {
                        $set: { offerName, offerType, offerItem, offerPercentage }
                    })
                    const categoryProduct = await Product.find({ productCategory: offerItem });
                    console.log('products in new category : ',categoryProduct);
                    if (categoryProduct.length) {
                        for (const product of categoryProduct) {
                            product.productPrices.priceAfter = product.productPrices.priceBefore * (1 - (offerPercentage / 100));
                            product.productPrices.offerName = offerName;
                            product.productPrices.offerRate = offerPercentage;
                            console.log('updated product before saving : ',product);
                            try {
                                let check = await product.save();
                                console.log('updated product after saving : ',check);
                            } catch (error) {
                                console.error('Error saving product:', error);
                            }

                        }
                    } else {
                        console.log('No products found for this category');
                    }
                }

            }

            res.status(200).json({ status: true })
        } else {
            console.log('offer already exists');
            res.status(200).json({ message: 'Offer already exists', status: false });

        }

    } catch (error) {
        console.error(error.message);
    }
}


const activateOffer = async (req, res) => {
    try {
        const id = req.body.id
        console.log(req.body);
        const offer = await Offer.findById(new ObjectId(id))
        console.log((offer));
        const offerType = offer.offerType
        const offerItem = offer.offerItem
        const offerPercentage = offer.offerPercentage
        const offerName = offer.offerName
        if (offer.isActive) {
            if (offerType == 'product') {
                const product = await Product.findOne({ productName: offerItem })
                product.productPrices.priceAfter = product.productPrices.priceBefore
                product.productPrices.offerRate = 0
                product.productPrices.offerName = null
                await product.save()
            } else if (offerType == 'category') {
                const category = await Product.find({ productCategory: offerItem })
                for (const product of category) {
                    product.productPrices.priceAfter = product.productPrices.priceBefore;
                    product.productPrices.offerName = null;
                    product.productPrices.offerRate = 0;
                    await product.save();
                }
            }
            const offer = await Offer.updateOne({ _id: id }, { isActive: false })
            res.status(200).json({ status: true, activated: false, id })
        } else {
            if (offerType == 'product') {
                const product = await Product.findOne({ productName: offerItem })
                console.log(product + ",product")
                const productUpdate = await Product.updateOne({ productName: offerItem },
                    {
                        $set: {
                            'productPrices.priceAfter': product.productPrices.priceBefore * (1 - (offerPercentage / 100)),
                            'productPrices.offerRate': offerPercentage, 'productPrices.offerName': offerName
                        }
                    })

                console.log(productUpdate);
            } else if (offerType == 'category') {
                console.log('hello');
                const category = await Product.find({ productCategory: offerItem })
                console.log(category + ",catetgory")
                for (const product of category) {
                    product.productPrices.priceAfter = product.productPrices.priceBefore * (1 - (offerPercentage / 100));
                    product.productPrices.offerName = offerName;
                    product.productPrices.offerRate = offerPercentage;
                    console.log(product + ",product")

                    await product.save();

                }


            }
            const offer = await Offer.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: true } })
            res.status(200).json({ status: true, activated: true, id })
        }
    } catch (error) {
        console.error(error.message);
    }
}
module.exports = {
    offerPage, addOfferPage, addProductOffer, addOffer, editOffer, editOfferPage, activateOffer
}