
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
        const orders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 })
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const ordersDaily = await Order.find({
            status: 'delivered',
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ createdAt: -1 });
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const ordersWeekly = await Order.find({
            status: 'delivered',
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        }).sort({ createdAt: -1 });
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);


        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const monthlyOrders = await Order.find({
            status: 'delivered',
            createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }).sort({ createdAt: -1 });

        res.render('sales', { sales, orders, ordersDaily, ordersWeekly, monthlyOrders })
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