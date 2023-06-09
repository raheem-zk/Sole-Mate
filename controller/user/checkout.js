
const userSchema = require('../../models/user/userModel');
const orderSchema = require('../../models/user/orderModel');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto')
const categorySchema = require('../../models/admin/categoryModel');
const couponSchema = require('../../models/admin/couponModel');
const productSchema = require('../../models/admin/productModel');
const bannerSchema = require('../../models/admin/bannerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');
const offerSchema = require('../../models/admin/offerModel');
require('dotenv').config()
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
var instance = new Razorpay({
  key_id: key_id,
  key_secret: key_secret,
});

const checkout = async (req, res) => {
  try {
    const category = await categorySchema.find();
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });

    let data = await userSchema
      .findOne({ userId: req.session.userId })
      .populate({
        path: 'cart.product',
        model: 'products',
        localField: 'cart.product',
        foreignField: 'productId'
      })
      .populate({
        path: 'cart.bannerproduct',
        model: 'banner',
        localField: 'cart.bannerproduct',
        foreignField: 'bannerId'
      });
    if (data.cart.length === 0) {
      return res.redirect('/');
    }
    const products = await productSchema.find({ status: true });
    let reload = false;
    const banners = await bannerSchema.find({ status: true })
    let totalPriceUpdate = 0;
    await userSchema.updateOne(
      { userId: req.session.userId },
      { $set: { cartTotalPrice: 0 } }
    );
    for (const item of data.cart) {
      {
        let productId = item.product ? item.product.productId : item.bannerproduct.bannerId;
        let productData = item.product
          ? await productSchema.findOne({ productId: productId })
          : await bannerSchema.findOne({ bannerId: productId });

        let quantity = item.quantity;
        if (quantity <= 0) {
          if (item.product) {
            await userSchema.updateOne({ userId: req.session.userId, 'cart.product': productId }, { $set: { 'cart.$.quantity': 1 } });
          } else if (item.bannerproduct) {
            await userSchema.updateOne({ userId: req.session.userId, 'cart.bannerproduct': productId }, { $set: { 'cart.$.quantity': 1 } });
          }
          return res.redirect('/cart');
        }
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));

        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else {
          totalPriceUpdate += quantity * productData.price;
        }
      }
      if (item.product) {
        if (item.product.status === false || item.product.block == true) {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $pull: { cart: { product: item.product.productId } } }
          );
          return res.redirect('/cart');
        }

        const productId = item.product.productId;
        for (const x of products) {
          if (x.productId.equals(productId)) {
            if (x.stock == 0) {
              await userSchema.updateOne(
                { userId: req.session.userId },
                { $pull: { cart: { product: item.product.productId } } }
              );
              return res.redirect('/cart');
            }
            if (x.stock > item.quantity) {
            } else {
              let total = x.price * item.quantity;
              let stockTotal = x.stock * x.price;
              total = total - stockTotal;
              await userSchema.updateOne(
                { userId: req.session.userId, 'cart.product': item.product.productId },
                {
                  $set: { 'cart.$.quantity': x.stock },
                  $inc: { cartTotalPrice: -total }
                }
              );
              reload = true;
              break;
            }
          }
        }

      } else if (item.bannerproduct) {
        if (item.bannerproduct.status === false || item.bannerproduct.block == true) {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $pull: { cart: { bannerproduct: item.bannerproduct.bannerId } } }
          );
          return res.redirect('/cart');
        }
        const bannerId = item.bannerproduct.bannerId;
        for (const x of banners) {
          if (x.bannerId.equals(bannerId)) {
            if (x.stock == 0) {
              await userSchema.updateOne(
                { userId: req.session.userId },
                { $pull: { cart: { bannerproduct: item.bannerproduct.bannerId } } }
              );
              return res.redirect('/cart');
            }
            if (x.stock > item.quantity) {
            } else {
              let total = x.price * item.quantity;
              let stockTotal = x.stock * x.price;
              total = total - stockTotal;
              await userSchema.updateOne(
                { userId: req.session.userId, 'cart.bannerproduct': item.bannerproduct.bannerId },
                {
                  $set: { 'cart.$.quantity': x.stock },
                  $inc: { cartTotalPrice: -total }
                }
              );
              reload = true;
              break;
            }
          }
        }
      }
    }
    await userSchema.updateOne(
      { userId: req.session.userId },
      { $inc: { cartTotalPrice: totalPriceUpdate } }
    );

    let couponCode;
    if (data.discount[0]) {
      couponCode = data.discount[0].couponCode;
    }

    if (reload) {
      data = await userSchema
        .findOne({ userId: req.session.userId })
        .populate({
          path: 'cart.product',
          model: 'products',
          localField: 'cart.product',
          foreignField: 'productId'
        })
        .populate({
          path: 'cart.bannerproduct',
          model: 'banner',
          localField: 'cart.bannerproduct',
          foreignField: 'bannerId'
        });
      return res.render('cart/checkout', { data, message: '', category, loged, offers, productOffer });
    }

    if (couponCode) {
      const currentDate = new Date();
      const coupon = await couponSchema.findOne({ couponName: couponCode });
      console.log(coupon);
      if (data.cartTotalPrice < coupon.minimumPrice || coupon.expiryDate <= currentDate) {
        let result = await userSchema.updateOne({ userId: req.session.userId }, { $set: { discount: {} } });
        if (result) {
          let data = await userSchema
            .findOne({ userId: req.session.userId })
            .populate({
              path: 'cart.product',
              model: 'products',
              localField: 'cart.product',
              foreignField: 'productId'
            })
            .populate({
              path: 'cart.bannerproduct',
              model: 'banner',
              localField: 'cart.bannerproduct',
              foreignField: 'bannerId'
            });
          return res.render('cart/checkout', { data, message: '', category, loged, offers, productOffer });
        }
      }
      return res.render('cart/checkout', { data, message: '', category, loged, offers, productOffer });
    }
    return res.render('cart/checkout', { data, message: '', category, loged, offers, productOffer });
  } catch (error) {
    console.log(error);
  }
};


const order = async (req, res) => {
  try {
    const category = await categorySchema.find();
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    const data = await userSchema.findOne({ userId: req.session.userId })
      .populate({
        path: 'cart.product',
        model: 'products',
        localField: 'cart.product',
        foreignField: 'productId'
      })
      .populate({
        path: 'cart.bannerproduct',
        model: 'banner',
        localField: 'cart.bannerproduct',
        foreignField: 'bannerId'
      });
    const name = req.body.name;
    const selectedAddressId = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const paymentMethod = req.body.paymentMethod;
    if (!selectedAddressId) {
      return res.json({ response: { wrong: 'Please Add Address' } });
    }
    if (!name || !phoneNumber || !paymentMethod) {
      return res.json({ response: { wrong: 'fill all fieald' } });
    }
    const address = await userSchema.findOne(
      { userId: req.session.userId },
      { address: { $elemMatch: { _id: selectedAddressId } } }
    );

    let newOrder = {
      userId: req.session.userId,
      orderId: new mongoose.Types.ObjectId(),
      deliveryAddress: address.address[0],
      date: new Date(),
      product: data.cart.map((item) => {
        let productId;
        let bannerId;
        let singlePrice;

        if (item.product) {
          productId = item.product.productId;
          singlePrice = item.product.price;
        } else if (item.bannerproduct) {
          bannerId = item.bannerproduct.bannerId;
          singlePrice = item.bannerproduct.price;
        }

        return {
          productId: productId,
          bannerId: bannerId,
          quantity: item.quantity,
          singleTotal: item.productTotalPrice,
          singlePrice: singlePrice,
        };
      }),
      total: data.cartTotalPrice,
      paymentType: paymentMethod,
      status: 'pending',
    };

    if (data.discount.length > 0) {
      newOrder.total = data.cartTotalPrice - data.discount[0].amount;
    }
    if (newOrder.paymentType == 'online') {

      var options = {
        amount: newOrder.total * 100,
        currency: "INR",
        receipt: "" + newOrder.orderId,
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          return res.json({ response: { wrong: 'erro for payment side' } })
        }

        res.json({ response: { viewRazorpay: true, order, newOrder, key_id } });
      });
    } else if (newOrder.paymentType == 'wallet') {
      if (newOrder.total <= data.wallet) {
        await userSchema.updateOne({ userId: req.session.userId }, { $inc: { wallet: -newOrder.total } });
        await orderSchema.insertMany(newOrder);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $unset: { cart: 1, cartTotalPrice: 1 } }
        )
        return res.json({ response: { wallet: true } });
      } else {
        return res.json({ response: { wrong: 'Insufficient wallet balance. Please add funds to your wallet' } })
      }
    } else {
      if (newOrder.total <= 0) {
        return res.json({ response: { wrong: 'Invalid order total. Please provide a positive value.' } })
      }
      await orderSchema.insertMany(newOrder);
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $unset: { cart: 1, cartTotalPrice: 1 } }
      )
      return res.json({ response: { COD: true } });
    }

  } catch (error) {
    console.log(error);
  }
}

const ordersuccess = async (req, res) => {
  try {
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });
    const category = await categorySchema.find();
    const orderData = await orderSchema.findOne({ userId: req.session.userId })
      .sort({ date: -1 })
      .populate({
        path: 'product.productId',
        model: 'products',
        localField: 'product.productId',
        foreignField: 'productId'
      })
      .populate({
        path: 'product.bannerId',
        model: 'banner',
        localField: 'product.bannerId',
        foreignField: 'bannerId'
      })

    orderData.product.forEach(async (item) => {
      if (item.productId) {
        const productId = item.productId._id;
        const quantity = item.quantity;

        // Update product stock
        const productUpdateResult = await productSchema.updateOne(
          { _id: productId },
          { $inc: { stock: -quantity } }
        );

      }

      if (item.bannerId) {
        const bannerId = item.bannerId._id;
        const quantity = item.quantity;
        const bannerUpdateResult = await bannerSchema.updateOne(
          { _id: bannerId },
          { $inc: { stock: -quantity } }
        );

      }
    });



    const product = orderData.product
    let products = [], banners = [];
    product.forEach((x) => {
      if (x.productId) {
        products.push(x);
      } else {
        banners.push(x);
      }
    })

    await userSchema.updateOne(
      { userId: req.session.userId },
      { $set: { discount: {} } }
    );

    return res.render('cart/confirmation', { orderData, products, banners, category, loged, productOffer, offers });
  } catch (error) {
    console.log(error);
  }
}


const verifyPayment = async (req, res) => {
  try {
    console.log(req.body);
    let data = req.body
    const newOrder = data.newOrder;

    const razorpay_payment_id = data.payment.razorpay_payment_id;
    const razorpay_order_id = data.payment.razorpay_order_id;
    const razorpay_signature = data.payment.razorpay_signature;
    const secret = instance.key_secret;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');
    if (generated_signature === razorpay_signature) {
      newOrder.status = 'processing';
      if (newOrder.total <= 0) {
        return res.json({ failed: true });
      }
      await orderSchema.insertMany(newOrder);
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $unset: { cart: 1, cartTotalPrice: 1 } }
      )
      return res.json({ status: true });
    } else {

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { discount: {} } }
      );

      return res.json({ failed: true });
    }
  } catch (error) {
    console.log(error);
  }
};


const confrmation = async (req, res) => {
  try {
    const category = await categorySchema.find();
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    res.render('cart/confrmation', { category, loged });
  } catch (error) {
    console.log(error);
  }
}

const add_address = async (req, res) => {
  try {
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    const category = await categorySchema.find();
    res.render('cart/add-address', { message: '', category, loged })
  } catch (error) {
    console.log(error);
  }
}


const get_address = async (req, res) => {
  try {
    const category = await categorySchema.find();
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    let data = {
      name: req.body.name.trim(),
      housename: req.body.housename.trim(),
      street: req.body.street.trim(),
      district: req.body.district.trim(),
      state: req.body.state.trim(),
      pincode: req.body.pincode.trim(),
      country: req.body.country.trim(),
      phone: req.body.number.trim()
    }

    if (!req.body.name || !req.body.street || !req.body.state || !req.body.pincode || !req.body.housename || !req.body.district || !req.body.country || !req.body.number) {
      return res.render('cart/add-address', { message: 'Please fill all the fields', category, loged });
    }
    if (data.phone.length != 10) {
      return res.render('cart/add-address', { message: 'Please fill all the fields', category, loged });
    }
    if (data.pincode.length != 6) {
      return res.render('cart/add-address', { message: 'Please enter the curect pincode', category, loged });
    }
    let userData = await userSchema.findOne({ userId: req.session.userId });
    if (userData.address && userData.address.length > 0) {
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $push: { address: data } }
      );
      return res.redirect('/cart/checkout');
    } else {
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { address: [data] } }
      );
      return res.redirect('/cart/checkout');
    }
  } catch (error) {
    console.log(error);
  }
}


const applay_coupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const total = req.body.Total;
    console.log(req.body)
    if (!couponCode || !total) {
      return res.json({ response: ' Enter coupon code' });
    }
    const couponData = await couponSchema.findOne({ couponName: couponCode, status: 'Active' });
    const currentDate = new Date();

    if (couponData && couponData.expiryDate <= currentDate) {
      await couponSchema.updateOne({ couponName: couponCode }, { $set: { status: 'Expired' } });
      return res.json({ response: 'Coupon expired' });
    }

    if (!couponData) {
      return res.json({ response: 'Invalied coupon' });
    }
    if (couponData.quantity === 0) {
      return res.json({ response: 'coupon expaired' });
    }
    if (total <= couponData.minimumPrice) {
      return res.json({ response: "Cannot use this coupon. Total is less than or equal to the minimum price." })
    }
    if (couponData.customerId.length > 0) {
      let userId = req.session.userId
      const used = couponData.customerId.find((x) => x == userId);
      if (used) {
        return res.json({ response: 'Already Used' });
      }
    }
    await couponSchema.updateOne(
      { couponName: couponCode },
      {
        $push: { customerId: req.session.userId },
        $inc: { quantity: -1 }
      }
    ).then((result) => {
      // console.log(result);
    }).catch((err) => {
      console.log(err);
    })
    const discount = (total * couponData.discount) / 100;
    const data = {
      amount: discount,
      couponCode: couponCode,
    };
    await userSchema.updateOne(
      { userId: req.session.userId },
      { $set: { 'discount.0': data } }
    )
      .then((result) => {
        console.log('discount added', result)
      })
      .catch((err) => {
        console.log(err);
      })

    res.json({ response: { success: true } });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  checkout,
  order,
  confrmation,
  add_address,
  get_address,
  verifyPayment,
  ordersuccess,
  applay_coupon
}