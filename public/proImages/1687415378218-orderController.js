const orderData = require('../../models/user/orderData')
const userData = require('../../models/user/userData')
const categoryData = require('../../models/categoryData')
const { v4: uuidv4 } = require('uuid');
const productData = require('../../models/productData');
const couponData = require('../../models/couponData')
const brandData = require('../../models/brandData')

const crypto = require('crypto')
require('dotenv').config();
const Razorpay = require('razorpay');
const { log } = require('console');



var instance = new Razorpay({
    key_id: process.env.YOUR_KEY_ID,
    key_secret: process.env.YOUR_KEY_SECRET
});



const loadCheckout = async (req, res) => {

    try {
        if (req.session.user) {
            const user = req.session.user
            const userdata = await userData.findOne({ _id: user._id }).populate('cart.product')
            const productdata = await productData.find({ status: true }).populate('category')
            const branddata = await brandData.find({})

            const categorydata = await categoryData.find({})
            const coupon = await couponData.find({ $nor: [{ userUsed: user._id }] })
            console.log(coupon);
            if (userdata.cart[0] == null) {
                res.render('allProducts', { user: userdata, Product: productdata, brand: branddata, category: categorydata, Coupon: coupon })

            } else {


                res.render('checkout', { user: userdata, category: categorydata, Coupon: coupon })
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}



const loadOrderSuccess = async (req, res) => {
    try {


        const user = req.session.user

        const userdata = await userData.findOne({ _id: user._id })
        const categorydata = await categoryData.find({})

        const product = []
        console.log(req.body);

        const orderdata = req.body
       
        if (!Array.isArray(orderdata.productId)) {
            orderdata.productId = [orderdata.productId]
        }
        if (!Array.isArray(orderdata.quantity)) {
            orderdata.quantity = [orderdata.quantity]
        }
        if (!Array.isArray(orderdata.singleTotal)) {
            orderdata.singleTotal = [orderdata.singleTotal]
        }
        if (!Array.isArray(orderdata.singlePrice)) {
            orderdata.singlePrice = [orderdata.singlePrice]
        }

        for (let i = 0; i < orderdata.productId.length; i++) {
            let productId = orderdata.productId[i]
            let quantity = orderdata.quantity[i]
            let singleTotal = orderdata.singleTotal[i]
            let singlePrice = orderdata.singlePrice[i]
            product.push({ productId: productId, quantity: quantity, singleTotal: singleTotal, singlePrice: singlePrice })
        }

        if (req.body.paymentType == 'COD') {
            const status = req.body.paymentType == 'COD' ? 'confirmed' : 'pending'
            const total = req.body.total - req.body.discount1

            const order = new orderData({
                userId: req.body.userId,
                deliveryAddress: req.body.address,
                product: product,
                total: total,
                paymentType: req.body.paymentType,
                orderId: `order_Id_${uuidv4()}`,
                status: status,
                discount: req.body.discount1,
                coupon: req.body.code,
                date: Date.now()


            })
            const productdata = await order.save()
            if (productdata) {

                const deleteCart = await userData.updateOne({ _id: user._id }, {
                    $pull: { cart: { product: { $in: orderdata.productId } } },
                    $set: { cartTotalPrice: 0 }
                })
                for (let i = 0; i < product.length; i++) {
                    const productStock = await productData.findById(product[i].productId)
                    productStock.stock -= product[i].quantity
                    await productStock.save()
                }
                const coupon = await couponData.updateOne({ code: req.body.code },
                    { $push: { userUsed: req.body.userId } })
                console.log(coupon);

                res.json({ success: true })
            }


        } else if (req.body.paymentType == 'ONLINE') {

            const total = req.body.total - req.body.discount1
            console.log(total);
            const order = new orderData({
                userId: req.body.userId,
                deliveryAddress: req.body.address,
                product: product,
                total: total,
                paymentType: req.body.paymentType,
                orderId: `order_Id_${uuidv4()}`,
                status: "Payment failed",
                discount: req.body.discount1,
                coupon: req.body.code,
                date: Date.now()


            })
            const productdata = await order.save()
            if (productdata) {

                const coupon = await couponData.updateOne({ code: req.body.code },
                    { $push: { userUsed: req.body.userId } })

                const latestOrder = await orderData.findOne({})
                    .sort({ date: -1 })

                if (latestOrder) {
                    let options = {
                        amount: total * 100,
                        currency: "INR",
                        receipt: "" + latestOrder._id
                    };
                    instance.orders.create(options, function (err, order) {
                        res.json({ viewRazorpay: true, order })
                    });

                }
            }
        } else if (req.body.paymentType == 'WALLET') {
            const data = await userData.findOne({ _id: user._id })

            if (req.body.total > data.wallet) {

                res.json({ inSufficient: true })
            } else {

                const total = req.body.total - req.body.discount1
                const order = new orderData({
                    userId: req.body.userId,
                    deliveryAddress: req.body.address,
                    product: product,
                    total: total,
                    paymentType: req.body.paymentType,
                    orderId: `order_Id_${uuidv4()}`,
                    status: "processing",
                    discount: req.body.discount1,
                    coupon: req.body.code,
                    date: Date.now()


                })
                const productdata = await order.save()
                if (productdata) {

                    const deleteCart = await userData.updateOne({ _id: user._id }, {
                        $pull: { cart: { product: { $in: orderdata.productId } } },
                        $set: { cartTotalPrice: 0 }
                    })
                    for (let i = 0; i < product.length; i++) {
                        const productStock = await productData.findById(product[i].productId)
                        productStock.stock -= product[i].quantity
                        await productStock.save()
                    }
                    const coupon = await couponData.updateOne({ code: req.body.code },
                        { $push: { userUsed: req.body.userId } })
                    console.log(coupon);
                    const wallet = await userData.updateOne({ _id: user._id }, { $inc: { wallet: -req.body.total } })
                    res.json({ success: true })

                }
            }
        }
    } catch (error) {
        console.log(error.message);

    }
}





const verifPpayment = async (req, res) => {
    try {
        const details = req.body
        let hmac = crypto.createHmac('sha256', process.env.YOUR_KEY_SECRET)
        hmac.update(
            details.payment.razorpay_order_id +
            "|" +
            details.payment.razorpay_payment_id
        );
        hmac = hmac.digest("hex");
        if (hmac == details.payment.razorpay_signature) {
            const latestOrder = await orderData.findOne({})
                .sort({ date: -1 }).lean();
            const change = await orderData.updateOne({ _id: latestOrder._id },
                { $set: { status: "confirmed" } })
            console.log("here it is");
            console.log(change);
            res.json({ status: true })
        } else {
            console.log("Fail");
            res.json({ failed: true })
        }

    } catch (error) {
        console.log(error.message);
    }
}




const ordersuccess = async (req, res) => {
    try {

        const user = req.session.user
        const userdata = await userData.findOne({ _id: user._id })
        const categorydata = await categoryData.find({})
        const coupondata = await couponData.findOne({})
        console.log(couponData);
        const orderdata = await orderData.findOne({ userId: user._id })
            .sort({ date: -1 })
            .populate('product.productId')
            .lean()

        //stock deletion and cart clear of Online order
        if (orderdata.paymentType === 'ONLINE') {
            for (let i = 0; i < orderdata.product.length; i++) {
                const deleteCart = await userData.updateOne({ _id: user._id }, {
                    $pull: { cart: { product: { $in: orderdata.product[i].productId } } },
                    $set: { cartTotalPrice: 0 }

                })
                const productStock = await productData.findById(orderdata.product[i].productId)
                productStock.stock -= orderdata.product[i].quantity
                await productStock.save()
            }
        }

        res.render('ordersuccess', { user: userdata, category: categorydata, order: orderdata })
    } catch (error) {
        console.log(error.message);
        res.render("404", { errorMessage: "An error occurred." });

    }
}


const vieworders = async (req, res) => {
    try {
        const user = req.session.user
        const categorydata = await categoryData.find({})
        const userdata = await userData.findOne({ _id: user._id })
        const orderdata = await orderData.find({ userId: user._id })
            .sort({ date: -1 }).populate('product.productId')

        res.render('orderlist', { user: userdata, category: categorydata, order: orderdata })


    } catch (error) {
        console.log(error.message);
    }
}



const cancellOrder = async (req, res) => {
    try {
        const user = req.session.user
        const ordId = req.body.orderId
        const status = 'cancelled'

        const cancell = await orderData.updateOne({ _id: ordId },
            { $set: { status: status, } });

        if (cancell) {
            const orderdata = await orderData.findOne({ _id: ordId })

            if (orderdata.paymentType === 'ONLINE' || orderdata.paymentType === 'WALLET') {
                const refund = await userData.updateOne({ _id: orderdata.userId },
                    { $inc: { wallet: orderdata.total } })
            }

            for (let i = 0; i < orderdata.product.length; i++) {
                const data = await productData.updateOne({ _id: orderdata.product[i].productId },
                    { $inc: { stock: orderdata.product[i].quantity } })

                res.json({ success: true })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


//order retun
const returnOrder = async (req, res) => {
    try {
        const id = req.body.orderId
        const status = "Return requested"
        const retun = await orderData.updateOne({ _id: id },
            { $set: { status: status } })
        if (retun) {

            const orderdata = await orderData.findOne({ _id: id })

            const refund = await userData.updateOne({ _id: orderdata.userId },
                { $inc: { wallet: orderdata.total } })

            for (let i = 0; i < orderdata.product.length; i++) {

                const update = await productData.updateOne({ _id: orderdata.product[i].productId },
                    { $inc: { stock: orderdata.product[i].quantity } })

                res.json({ success: true })

            }
        }
    } catch (error) {
        console.log(error.message);
    }
}



const orderDetails = async (req, res) => {
    try {
        const id = req.params.id
        const user = req.session.user
        const categorydata = await categoryData.find({})
        const userdata = await userData.findOne({ _id: user._id })
        const orderdata = await orderData.findOne({ _id: id }).populate('product.productId').populate('orderId').populate('coupon')
        res.render('orderDetails', { category: categorydata, order: orderdata, user: userdata })
    } catch (error) {
        console.log(error.message);
        res.render("errorPage", { errorMessage: "An error occurred." });
    }
}




module.exports = {
    loadCheckout,
    loadOrderSuccess,
    ordersuccess,
    vieworders,
    cancellOrder,
    returnOrder,
    verifPpayment,
    orderDetails
}