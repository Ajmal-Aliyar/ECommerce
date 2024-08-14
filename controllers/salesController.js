
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const Order = require('../model/orderModel')
const PDFDocument = require('pdfkit');


const salesPage = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            { $unwind: '$product' },
            { $match: { "product.productDetails.status": 'delivered' } }])
        let orders;
        let val;
        if (req.query.id) {
            val = req.query.id
            const today = new Date()
            let startDate
            if (val == 'day') {
                startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            } else if (val == 'week') {
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            } else if (val == 'month') {
                startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            orders = await Order.aggregate([
                { $match: { status: 'delivered', createdAt: { $gte: startDate } } },
                { $sort: { createdAt: -1 } }
            ])
        } else if (req.query.start) {
            const startDate = new Date(`${req.query.start}T23:59:59.999Z`);
            const endDate = new Date(`${req.query.end}T23:59:59.999Z`);
            orders = await Order.aggregate([
                {
                    $match: { $and: [{ createdAt: { $gte: startDate } }, { createdAt: { $lte: endDate } }],status:'delivered' }
                }
            ])
            console.log(orders);
        } else {
            val = 'all'
            orders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 })
        }
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));



        res.render('sales', { sales, orders, val })
    } catch (error) {
        console.error(error.message);
    }
}
const excelDownload = async (req, res) => {
    const orders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 })
    const data = [];
    const headers = ['Order Date', 'User Id', 'Products', 'Order Status', 'Payment Method', 'Old Total Price', 'Total Price', 'Grand Price', 'Delivery Charge', 'Coupon Discount', 'Offer Applied'];
    data.push(headers);

    orders.forEach(order => {
        const dateObject = new Date(order.createdAt);
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        const formattedDate = dateObject.toLocaleDateString('en-US', options);

        const products = order.product.map(product => product.productDetails.status !== 'cancelled' ? product.productDetails.productTags[0] : '').join(', ');

        let totalOldPrice = 0;
        order.product.forEach(item => {
            if (item.productDetails.status === 'delivered') {
                totalOldPrice += item.productDetails.productPrices.priceBefore * item.quantity;
            }
        });

        const row = [
            formattedDate,
            order.userId,
            products,
            order.status,
            order.payment.paymentMethod,
            totalOldPrice,
            order.totalPrice,
            order.grandTotalPrice,
            order.shippingCharge.shippingCharge,
            order.appliedCoupon.couponDiscount,
            `${parseFloat((100 - (order.grandTotalPrice - order.shippingCharge.shippingCharge) / (totalOldPrice / 100)).toFixed(1))}%`
        ];

        data.push(row);
    });


    const ws = XLSX.utils.aoa_to_sheet(data);


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');


    const filePath = path.join(__dirname, 'sales_report.xlsx');
    XLSX.writeFile(wb, filePath);
    res.download(filePath, 'sales_report.xlsx', err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error generating file');
        } else {
            fs.unlink(filePath, err => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
    });
};
const pdfDownload = async (req, res) => {
    const orders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 })

    const doc = new PDFDocument();

    const filePath = path.join(__dirname, 'sales_report.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);


    doc.fontSize(18).text('Sales Report', { align: 'center' });


    doc.moveDown().fontSize(12);
    const headers = ['Order Date', 'User Id', 'Products', 'Order Status', 'Payment Method', 'Old Total Price', 'Total Price', 'Grand Price', 'Delivery Charge', 'Coupon Discount', 'Offer Applied'];
    headers.forEach(header => {
        doc.text(header, { continued: true, width: 80 });
    });

    doc.moveDown();


    orders.forEach(order => {
        const dateObject = new Date(order.createdAt);
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        const formattedDate = dateObject.toLocaleDateString('en-US', options);

        const products = order.product.map(product => product.productDetails.status !== 'cancelled' ? product.productDetails.productTags[0] : '').join(', ');

        let totalOldPrice = 0;
        order.product.forEach(item => {
            if (item.productDetails.status === 'delivered') {
                totalOldPrice += item.productDetails.productPrices.priceBefore * item.quantity;
            }
        });

        const row = [
            formattedDate,
            order.userId,
            products,
            order.status,
            order.payment.paymentMethod,
            totalOldPrice,
            order.totalPrice,
            order.grandTotalPrice,
            order.shippingCharge.shippingCharge,
            order.appliedCoupon.couponDiscount,
            `${parseFloat((100 - (order.grandTotalPrice - order.shippingCharge.shippingCharge) / (totalOldPrice / 100)).toFixed(1))}%`
        ];

        row.forEach(col => {
            doc.text(col, { continued: true, width: 80 });
        });
        doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => {
        res.download(filePath, 'sales_report.pdf', err => {
            if (err) {
                console.error(err);
                res.status(500).send('Error generating file');
            } else {

                fs.unlink(filePath, err => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
        });
    });
};



module.exports = {
    salesPage, excelDownload, pdfDownload
}