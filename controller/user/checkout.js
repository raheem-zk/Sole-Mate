
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
      console.log( data.cart.length ,'cart length ....');
      if (data.cart.length ===0){
        return res.redirect('/');
      }
    const products = await productSchema.find({ status: true });
    let reload = false;
    const banners = await bannerSchema.find({status: true})
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

          // equals(productId))
        let quantity = item.quantity;
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
        if (item.product.status === false) {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $pull: { cart: { product: item.product.productId } } }
          );
          return res.redirect('/cart');
        }

        const productId = item.product.productId;
        for (const x of products) {
          if (x.productId.equals(productId)) {
            if(x.stock == 0){
              await userSchema.updateOne(
                { userId: req.session.userId },
                { $pull: { cart: { product: item.product.productId } } }
              );
              return res.redirect('/cart');
            }
            if (x.stock > item.quantity) {
              // console.log(x.stock, item.quantity);
            } else {
              let total = x.price * item.quantity;
              // console.log(total, 'x.price * item.quantity ==: x.price', x.price, '  ...item.quantity:=', item.quantity)
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
              console.log(reload, 'reload ......');
              break;
            }
            console.log(x.productId, 'matched product id ', item.product.productId);
          }
        }

      } else if(item.bannerproduct) {
        if (item.bannerproduct.status === false) {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $pull: { cart: { bannerproduct: item.bannerproduct.bannerId } } }
          );
          return res.redirect('/cart');
        }
        const bannerId = item.bannerproduct.bannerId;
        for (const x of banners) {
          if (x.bannerId.equals(bannerId)) {
            if(x.stock == 0){
              await userSchema.updateOne(
                { userId: req.session.userId },
                { $pull: { cart: { bannerproduct: item.bannerproduct.bannerId } } }
              );
              return res.redirect('/cart');
            }
            if (x.stock > item.quantity) {
              // console.log(x.stock, item.quantity);
            } else {
              let total = x.price * item.quantity;
              // console.log(total, 'x.price * item.quantity ==: x.price', x.price, '  ...item.quantity:=', item.quantity)
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
              // console.log(reload, 'reload ......');
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

    // console.log(reload, 'reload ......\\\\\\\\\\\\');
    let couponCode;
    if (data.discount[0]) {
      couponCode = data.discount[0].couponCode;
    }

    if (reload) {
      // console.log(reload, 'reload ......{{{{{{{\\\\\\\\');
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
      // console.log('..', data, 'dkkd');
      return res.render('cart/checkout', { data, message: '', category, loged , offers, productOffer});
    }

    if (couponCode) {
      const currentDate = new Date();
      const coupon = await couponSchema.findOne({ couponName: couponCode });
      // console.log('kkk', coupon, 'coupon details');
      
      if (data.cartTotalPrice < coupon.minimumPrice || coupon.expiryDate >= currentDate) {
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
          // console.log('coupon amount 0 set', result);
          // console.log(data);
          return res.render('cart/checkout', { data, message: '', category, loged , offers, productOffer});
        }
      }
      return res.render('cart/checkout', { data, message: '', category, loged , offers, productOffer });
    }
    return res.render('cart/checkout', { data, message: '', category, loged ,  offers, productOffer});
  } catch (error) {
    console.log(error);
  }
};


const order = async (req, res) =>{
    try {
        const category = await categorySchema.find();
        let loged = false;
        if(req.session.userId){
          loged = true;
        }
        const data = await userSchema.findOne({userId : req.session.userId})
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
        if(!selectedAddressId ){
          return res.json( {response: {wrong : 'Please Add Address'}});
        }
        if (!name  || !phoneNumber || !paymentMethod){
            // return res.render('cart/checkout',{ data, messagea: 'fill all fieald', category, loged});
          return res.json( {response: {wrong : 'fill all fieald'}});
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
      
console.log(data,'dkkkkk');
if (data.discount.length> 0) {
  newOrder.total = data.cartTotalPrice - data.discount[0].amount;
}
      if (newOrder.paymentType == 'online') {

        var options = {
          amount: newOrder.total * 100,  // amount in the smallest currency unit
          // amount: newOrder.total,  // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + newOrder.orderId,
        };   

        instance.orders.create(options, function(err, order) {
          console.log('oooooooooooo',order,'oooooooooo');
          if (err){
            return res.json({ response: {wrong : 'erro for payment side'}})
          }
          res.json({ response: { viewRazorpay: true, order ,newOrder} });
        });
      } else if (newOrder.paymentType =='wallet'){
        if (newOrder.total <= data.wallet ){
          await userSchema.updateOne({userId : req.session.userId},{$inc:{wallet: -newOrder.total}});
          await orderSchema.insertMany(newOrder);
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $unset: { cart: 1, cartTotalPrice: 1 } }
          )
          return res.json({ response: { wallet: true } });
        }else{ 
          return res.json({ response: {wrong : 'Insufficient wallet balance. Please add funds to your wallet'}})
          // return res.render('cart/checkout',{ data, message: 'Insufficient wallet balance. Please add funds to your wallet.', category});
        }
      } else {
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

const ordersuccess  = async (req, res)=>{
  try {
    let loged = false;
    if(req.session.userId){
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
    const orderData = await orderSchema.findOne({userId : req.session.userId})
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
      // orderData.product.forEach((item)=>{
      //   if (item.productId){
      //     await productSchema.updateOne({productId : item.productId},{$inc :{ stock : -item.quantity }})
      //   }
      // })
      orderData.product.forEach(async (item) => {
        if (item.productId) {
          const productId = item.productId._id;
          const quantity = item.quantity;
      
          // Update product stock
          const productUpdateResult = await productSchema.updateOne(
            { _id: productId },
            { $inc: { stock: -quantity } }
          );
      
          if (productUpdateResult.modifiedCount === 0) {
            console.log(`Product stock update failed for product ID: ${productId}`);
          } else {
            console.log(`Product stock updated successfully for product ID: ${productId}`);
          }
        }
      
        if (item.bannerId) {
          const bannerId = item.bannerId._id;
          const quantity = item.quantity;
      
          // Update banner stock
          const bannerUpdateResult = await bannerSchema.updateOne(
            { _id: bannerId },
            { $inc: { stock: -quantity } }
          );
      
          if (bannerUpdateResult.modifiedCount === 0) {
            console.log(`Banner stock update failed for banner ID: ${bannerId}`);
          } else {
            console.log(`Banner stock updated successfully for banner ID: ${bannerId}`);
          }
        }
      });
      


      const product = orderData.product
          // console.log('product dddddd',product,'end');
          let products =[], banners=[];
          product.forEach((x)=>{
              if (x.productId){
                  products.push(x);
              }else{
                  banners.push(x);
              }
          })

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { discount: {} } }
      );

    return res.render('cart/confirmation',{orderData , products, banners, category, loged, productOffer, offers});
  } catch (error) {
    console.log(error);
  }
}


const verifyPayment = async (req, res) => {
  try {
    // console.log('ldkfa;fkafa',req.body,'flkdd')
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
      await orderSchema.insertMany(newOrder);
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $unset: { cart: 1, cartTotalPrice: 1 } }
      )
      res.json({ status: true });
    } else {

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { discount: {} } }
      );

      res.json({ failed: true });
    }
  } catch (error) {
    console.log(error);
  }
};


const confrmation = async (req, res)=>{
    try {
      const category = await categorySchema.find();
      let loged = false;
      if(req.session.userId){
        loged = true;
      }
      res.render('cart/confrmation',{category, loged});
    } catch (error) {
        console.log(error);
    }
}

const add_address = async (req, res)=>{
    try {
      let loged = false;
      if(req.session.userId){
        loged = true;
      }
      const category = await categorySchema.find();
        res.render('cart/add-address',{  message:'', category, loged})
      } catch (error) {
        console.log(error);
      }
}


const get_address = async (req, res) => {
    try {
      const category = await categorySchema.find();
      let loged = false;
      if(req.session.userId){
        loged = true;
      }
      let data = {
        name: req.body.name,
        housename: req.body.housename,
        street: req.body.street,
        district: req.body.district,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
        phone: req.body.number
      }

      if (!req.body.name || !req.body.street || !req.body.state || !req.body.pincode || !req.body.housename || !req.body.district || !req.body.country || !req.body.number) {
        return res.render('cart/add-address', { message: 'Please fill all the fields' , category, loged});
      }
      if (data.phone.length != 10) {
        return res.render('cart/add-address', { message: 'Please fill all the fields' ,category, loged});
      }
      let userData = await userSchema.findOne({userId : req.session.userId});
      if (userData.address && userData.address.length > 0 ) {
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
  

  const applay_coupon = async (req, res)=>{
    try {
      const couponCode = req.body.couponCode;
      const total = req.body.Total;
      console.log(req.body)
      if (!couponCode || !total){
        return res.json({response:' Enter coupon code'});
      }
      const couponData = await couponSchema.findOne({couponName : couponCode, status:'Active' })
      if (!couponData){
        return res.json({response:'Invalied coupon'});
      }
      if (couponData.quantity === 0){
        return res.json({response:'coupon expaired'});
      }
      if (total <= couponData.minimumPrice){
        return res.json({ response :"Cannot use this coupon. Total is less than or equal to the minimum price."})
      }
      if (couponData.customerId.length > 0) {
        console.log(couponData.customerId, 'customerId .....');
        let userId = req.session.userId
        const used = couponData.customerId.find((x) => x == userId );
        console.log(used, 'result..', req.session.userId, 'userId');
        if (used) {
          return res.json({ response: 'Already Used' });
        }
      }
      // await couponSchema.updateOne({couponName: couponCode},{$push: {customer: req.session.userId}, {$inc: quantity: -1 }})
      await couponSchema.updateOne(
        { couponName : couponCode },
        {
          $push: { customerId: req.session.userId },
          $inc: { quantity: -1 }
        }
      ).then((result)=>{
        console.log(result);
      }).catch((err)=>{
        console.log(err);
      })
      const discount = (total * couponData.discount)/100;
      // await userSchema.updateOne({userId : req.session.userId},{$set: {`discount.$.amount` :discount}})
      const data ={
        amount: discount,
        couponCode: couponCode,
      };
      console.log(data);
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { 'discount.0': data } }
      )
      .then((result)=>{
        console.log('discount added', result)
      })
      .catch((err)=>{
        console.log(err);
      })
      
      res.json({response:{success:true }});
    } catch (error) {
      console.log(error);
    }
  }

module.exports ={
    checkout,
    order,
    confrmation,
    add_address,
    get_address,
    verifyPayment,
    ordersuccess,
    applay_coupon
}