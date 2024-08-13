const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const adminDashboard = async (req, res) => {
    try {
        const data = await User.find({})
        const order = await Order.aggregate([
            { $unwind: "$product" },
            { $match: { $nor: [{ "product.productDetails.status": 'cancelled' }, { "product.productDetails.status": 'returned' }] } },
            { $count: "count" }
        ])
        const orderCount = order.length > 0 ? order[0].count : 0;
        const sale = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $count: 'count' }
        ])
        const salesCount = sale.length > 0 ? sale[0].count : 0;
        const totalProductSales = await Product.aggregate([
            { $match: {} },
            { $group: { _id: null, count: { $sum: "$productSales" } } }
        ])
        const products = await Product.find({})
        const sales = await Order.aggregate([
            { $unwind: '$product' },
            { $match: { "product.productDetails.status": 'delivered' } }])
        const orders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 })
        const salesEarnings = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $facet: {
                    daily: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" },
                                    day: { $dayOfMonth: "$createdAt" }
                                },
                                earnings: { $avg: '$grandTotalPrice' }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                    ],
                    weekly: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    week: { $week: "$createdAt" }
                                },
                                earnings: { $avg: '$grandTotalPrice' }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.week": 1 } }
                    ],
                    monthly: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" }
                                },
                                earnings: { $avg: '$grandTotalPrice' }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1 } }
                    ]
                }
            }
        ]);
        const salesAvgEarnings = []
        const earningsData = salesEarnings[0];
        for (let key in earningsData) {
            if (earningsData.hasOwnProperty(key)) {
                const earningsArray = earningsData[key];
                const totalEarnings = earningsArray.reduce((acc, item) => {
                    return acc += item.earnings;
                }, 0);
                const averageEarnings = totalEarnings / earningsArray.length;
                salesAvgEarnings.push({ [key]: averageEarnings.toFixed(1) });
            }
        }
        const totalIncome = await Order.aggregate([
            { $unwind: "$product" },
            { $match: { $nor: [{ "product.productDetails.status": 'cancelled' }, { "product.productDetails.status": 'returned' }] } },
            { $group:{_id:null,income:{$sum:'$grandTotalPrice'}}}
        ])
        res.render('dashboard', { data, orderCount, salesCount, sales, orders, totalProductSales, products, salesAvgEarnings,totalIncome })
    } catch (err) {
        console.log(err);
    }
}


const signIn = async (req, res) => {
    try {
        res.render('signIn')
    } catch (err) {
        console.log(err);
    }
}
const verifyAdmin = async (req, res) => {
    try {
        const { adminLogAddress, adminPassword } = req.body
        console.log(adminLogAddress, adminPassword);
        if (adminLogAddress == "ajmal.aju.340711@gmail.com") {
            if (adminPassword === '40711') {
                req.session.admin_id = adminLogAddress
                res.redirect('admin/dashboard')
            } else {
                res.render('signIn', { message: 'email or password is incorrect' })
            }
        } else {
            res.render('signIn', { message: 'email or password is incorrect' })
        }
    } catch (error) {
        console.error(error.message);
    }
}
const usersPage = async (req, res) => {
    try {
        const userData = await User.find({})
        res.render('users', { userData })
    } catch (err) {
        console.log(err);
    }
}
const unblockUser = async (req, res) => {
    try {
        const { id } = req.body
        const uid = id.trim()
        const userData = await User.updateOne({ _id: uid }, { $set: { isBlocked: false } })
        res.json({ message: `User with id ${id} unblocked successfully` });
    } catch (err) {
        console.log(err);
    }
}
const blockUser = async (req, res) => {
    try {
        const { id } = req.body
        const uid = id.trim()
        console.log("blocked");
        const userData = await User.updateOne({ _id: uid }, { $set: { isBlocked: true } })
        res.json({ message: `User with id ${id} blocked successfully` });
    } catch (err) {
        console.log(err);
    }
}
const lineChartData = async (req, res) => {
    try {
        console.log('hello');
        const sortBy = req.body.sortBy
        const products = await Product.find({})
        const last30Days = new Date();
        let lastDates = []
        let lastSales = []
        let barLabel = []
        let barData = []
        if (sortBy == 'daily') {
            const salesWithDate = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        salesCount: { $sum: 1 }
                    }
                }
            ])
            const last30DaysSales = [];
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - i);
                const foundSale = salesWithDate.find(sale =>
                    sale._id.year === pastDate.getFullYear() &&
                    sale._id.month === pastDate.getMonth() + 1 &&
                    sale._id.day === pastDate.getDate()
                );
                last30DaysSales.push({
                    date: pastDate.toISOString().split('T')[0],
                    salesCount: foundSale ? foundSale.salesCount : 0
                });
            }
            console.log(last30DaysSales.reverse());
            last30DaysSales.forEach((sales, i) => {
                lastDates.push(last30DaysSales[i].date)
                lastSales.push(last30DaysSales[i].salesCount)
            })
            const salesEarnings = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {$group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                            },
                            earnings: { $avg: '$grandTotalPrice' }
                        }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }      
                }
            ]);
            console.log(salesEarnings);
            salesEarnings.forEach(item =>{
                barLabel.push(`${item._id.day}-${item._id.month}-${item._id.year}`)
                barData.push(item.earnings.toFixed(1))
            })
        } else if (sortBy == 'weekly') {
            const salesWithDate = await Order.aggregate([
                {
                    $match: { status: { $ne: 'cancelled' } }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        salesCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            console.log(salesWithDate);
            const dates = salesWithDate.map(item => new Date(item._id));
            const smallestDate = new Date(Math.min(...dates));
            let totalWeekSales = [];
            const today = new Date();
            let weekCount = 0;
            const totalWeeks = Math.ceil(salesWithDate.length / 7);
            for (let i = 0; i < 20; i++) {
                const endDay = new Date(today);
                endDay.setDate(today.getDate() - 7 * i);
                const startDay = new Date(endDay);
                startDay.setDate(endDay.getDate() - 6);
                weekCount = 0;
                if (endDay >= smallestDate) {
                    for (let j = 0; j < salesWithDate.length; j++) {
                        const saleDate = new Date(salesWithDate[j]._id);
                        if (saleDate <= endDay && saleDate >= startDay) {
                            weekCount += salesWithDate[j].salesCount;
                        }
                    }
                } else {
                    weekCount += 0
                }
                const startDateFormatted = `${startDay.getDate()}/${startDay.getMonth() + 1}`;
                const endDateFormatted = `${endDay.getDate()}/${endDay.getMonth() + 1}`;

                totalWeekSales.push({
                    date: `${startDateFormatted} - ${endDateFormatted}`,
                    salesCount: weekCount
                });
            }
            const salesEarnings = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" }
                        },
                        earnings: { $avg: '$grandTotalPrice' }
                    }
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } }
            ]);
            totalWeekSales.reverse()
            totalWeekSales.forEach(item => {
                lastDates.push(item.date)
                lastSales.push(item.salesCount)
            })
            salesEarnings.forEach(item =>{
                barLabel.push(`${item._id.week}-${item._id.year}`)
                barData.push(item.earnings.toFixed(1))
            })

        } else if (sortBy == 'monthly') {
            const salesWithDate = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        salesCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);
            const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const salesChartData = [];
            const currentDate = new Date();
            for (let i = 0; i < 12; i++) {
                const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i);
                const month = monthNames[currentMonth.getMonth()];
                const year = currentMonth.getFullYear();
                const formattedDate = `${month} - ${year}`;
                const foundItem = salesWithDate.find(item =>
                    item._id.year === year && item._id.month === (currentMonth.getMonth() + 1)
                );
                salesChartData.push({
                    date: formattedDate,
                    salesCount: foundItem ? foundItem.salesCount : 0
                });
            }
            salesChartData.reverse();
            salesChartData.forEach(item => {
                lastDates.push(item.date);
                lastSales.push(item.salesCount);
            });
            const salesEarnings = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        earnings: { $avg: '$grandTotalPrice' }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
            salesEarnings.forEach(item =>{
                barLabel.push(`${item._id.month}-${item._id.year}`)
                barData.push(item.earnings.toFixed(1))
            })
        }
        
        res.status(200).json({ status: true, products, lastDates, lastSales, barLabel,barData })
    } catch (error) {
        res.status(500).json({ Error: `Error occured while fetching data to line chart ${error}` })
    }
}
const topCategory = async(req,res)=>{
    try{
        const topCategory = await Product.aggregate([
            {
              $group: {
                _id: "$productCategory",
                sales: { $sum: "$productSales" } 
              }
            },
            {
              $sort: { sales: -1 } 
            },
            {
              $limit: 10 
            }
          ]);
        res.status(200).json({topCategory})
    }catch(error){
        res.status(500).json({error:'Error occured while fetching topCategory'})
    }
}
const topProducts = async(req,res)=>{
    try{
        const topProducts = await Product.aggregate([
            {
              $group: {
                _id: "$productName",
                sales: { $sum: "$productSales" } 
              }
            },
            {
              $sort: { sales: -1 } 
            },
            {
              $limit: 10 
            }
          ]);
        console.log(topProducts,'toh');
        res.status(200).json({topProducts})
    }catch(error){
        res.status(500).json({error:'Error occured while fetching topProducts'})
    }
}
const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/')
    } catch (error) {
        res.status(500).json({ error: error })
    }
}
module.exports = {
    adminDashboard, signIn, verifyAdmin, usersPage, unblockUser, blockUser, lineChartData,topCategory,topProducts,logout
}