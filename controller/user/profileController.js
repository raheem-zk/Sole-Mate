
const { validateRequestWithBody } = require('twilio/lib/webhooks/webhooks');
const userSchema = require('../../models/user/userModel');
const orderSchema = require('../../models/user/orderModel');
const categorySchema = require('../../models/admin/categoryModel');
const productSchema = require('../../models/admin/productModel');
const bannerSchema = require('../../models/admin/bannerModel');

require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFYSID;
const client = require("twilio")(accountSid, authToken);


const bcrypt = require('bcrypt');

const profile = async (req, res)=>{
    try {
      const category = await categorySchema.find({status: true});
        const userData = await userSchema.findOne({userId : req.session.userId});
        let loged=false;
        if(req.session.userId){
          loged = true;
        }
        res.render('profile/profile',{ userData , category , loged});
    } catch (error) {
        console.log(error);
    }
}

const edit = async (req, res) =>{
    try {
      const category = await categorySchema.find({status: true});

        const userData = await userSchema.findOne({userId : req.session.userId});
        let loged=false;
        if(req.session.userId){
          loged = true;
        }
        res.render('profile/edit_profile',{ userData , message:'', category, loged});
    } catch (error) {
        console.log(error);
    }
}

const getData = async (req, res) =>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobileNumber = req.body.mobileNumber;
        const category = await categorySchema.find({status: true});
        
        const userData = await userSchema.findOne({ userId: req.session.userId });
        
        const data = {};
        let loged=false;
        if(req.session.userId){
          loged = true;
        }
        if (!name) {
          return res.render('profile/edit_profile', { userData, message: 'Please enter your name' , category, loged});
        }
        data.name = name;
        
        if (!email) {
          return res.render('profile/edit_profile', { userData, message: 'Please enter your email' ,category ,loged});
        }
        data.email = email;
        
        if (!mobileNumber) {
          return res.render('profile/edit_profile', { userData, message: 'Please enter your mobile number' , category ,loged});
        }
        data.mobileNumber = mobileNumber;
        
        let currentPassword;
        let newPassword;
        let confirmPassword;


        if (req.body.current_password) {
            if (!req.body.new_password && !req.body.confirm_password) {
              return res.render('profile/edit_profile', { userData, message: 'Please enter your new password' , category, loged});
            } else if (!req.body.new_password) {
              return res.render('profile/edit_profile', { userData, message: 'Please enter your new password' ,category, loged});
            } else if (!req.body.confirm_password) {
              return res.render('profile/edit_profile', { userData, message: 'Please confirm your new password' ,category, loged});
            }
        //   return res.send(req.body);
          currentPassword = req.body.current_password;
          newPassword = req.body.new_password;
          confirmPassword = req.body.confirm_password;
          const compare = await bcrypt.compare(currentPassword, userData.password);
          if (!compare) {
            return res.render('profile/edit_profile', { message: 'Incorrect password', category, loged });
          }
    
          if (newPassword.length < 6 || confirmPassword.length < 6) {
            return res.render('profile/edit_profile', { message: 'Enter a strong password.' , category, loged});
          }
    
          if (newPassword !== confirmPassword) {
            return res.render('profile/edit_profile', { message: 'Passwords do not match' ,category, loged});
          }
    
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          data.newPassword = hashedPassword;
        }
        
        await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${data.mobileNumber}`, channel: "sms" });
        return res.render('profile/edit_otp',{ data , category, loged});
    } catch (error) {
        console.log(error);
    }
}

const otpVerification = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
    };

    if (req.body.newPassword) {
      userData.password = req.body.newPassword;
    }

    const otpCode = req.body.otp;

    client.verify
      .services(verifySid)
      .verificationChecks.create({ to: `+91${userData.mobileNumber}`, code: otpCode })
      .then((verification_check) => {
        if (verification_check.status === "approved") {
          // OTP verification successful
          userSchema
            .updateOne({ userId: req.session.userId }, userData)
            .then(() => {
              return res.json({ success: true });
            })
            .catch((error) => {
              return res.json({ success: true });
            });
        } else {
          return res.json({ error: 'wrong otp' });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.json({ error: 'Please try later' });
      });
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
};


const manage_address = async (req, res)=>{
  try {
    const category = await categorySchema.find({status: true});
    const data = await userSchema.findOne({userId : req.session.userId});
    return res.render('profile/manage_address',{data : data.address, category, loged:true});
    
  } catch (error) {
    console.log(error);
  }
}

const add_address = async (req, res)=>{
  try {
    const category = await categorySchema.find({status: true});
    res.render('profile/add_address',{  message:'', category, loged:true})
  } catch (error) {
    console.log(error);
  }
}


const get_address = async (req, res) => {
  try {
    const category = await categorySchema.find({status: true});
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
      return res.render('profile/add_address', { message: 'Please fill all the fields' ,category, loged:true});
    }
    if (data.phone.length != 10) {
      return res.render('profile/add_address', { message: 'Mobile Number is incurect' ,category, loged:true});
    }
    if(data.pincode.length !=6){
      return res.render('profile/add_address', { message: 'Please enter the curect pincode' ,category, loged:true});
    }
    await userSchema.updateOne({ userId: req.session.userId }, { $push: { address: [data] } });
    return res.redirect('/profile/manage-address');
  } catch (error) {
    console.log(error);
  }
}

const edit_address = async (req, res) =>{
  try {
    const addressId = req.params.id;
    const userId = req.session.userId;
    const category = await categorySchema.find({status: true});
  
    const user = await userSchema.findOne({ userId: userId, 'address._id': addressId });

    if (user) {
      const address = user.address.find((addr) => addr._id.toString() === addressId);
      res.render('profile/edit_address',{address , message:'', category, loged:true});
    } else {
      res.status(404).render('404');
    }
  } catch (error) {
    console.log(error);
  }
}

const update_address = async (req, res)=>{
  try {
    const category = await categorySchema.find({status: true});
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

    const addressId = req.body.addressId;
    if (!req.body.name || !req.body.street || !req.body.state || !req.body.pincode || !req.body.housename || !req.body.district || !req.body.country || !req.body.number) {
      return res.json({message:'Please fill all the fields'});
    }
    if (data.phone.length != 10) {
      return res.json({message:'Mobile Number is incurect'});
    }
    if(data.pincode.length !=6){
      return res.json({message:'Please enter the curect pincode'});
    }
    let result = await userSchema.updateOne(
      { userId: req.session.userId, 'address._id': addressId },
      { $set: { 'address.$': data } }
    );
    return res.json({success:true});
  } catch (error) {
    console.log(error);
  }
}

const remove = async (req, res)=>{
  try {
    const addressId = req.params.id;
    let result = await userSchema.updateOne(
      { userId: req.session.userId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log(result);
    return res.redirect('/profile/manage-address');
  } catch (error) {
    console.log(error);
  }
}

const my_orders = async (req, res)=>{
  try {
    const category = await categorySchema.find({status: true});

    const orderData = await orderSchema.find({userId : req.session.userId}).sort({date: -1});
    let loged=false;
    if(req.session.userId){
      loged = true;
    }
    res.render('profile/order_history',{orderData, category, loged});
  } catch (error) {
    console.log(error);
  }
}

const order_detail = async (req, res) =>{
  try {
    const category = await categorySchema.find({status: true});

    const orderId = req.params.id;
    const data = await orderSchema.findOne({orderId: orderId})
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
  });
    let product =[], banner=[];
    if (data.product.length> 0 ){
      data.product.forEach((x)=>{
        if (x.bannerId){
          banner.push(x);
        }else if (x.productId){
          product.push(x);
        }
      })
    }
    let loged=false;
    if(req.session.userId){
      loged = true;
    }
    res.render('profile/order_detail',{ banner, product , data, category, loged});
  } catch (error) {
    console.log(error);
  }
}

const order_action = async (req, res)=>{
  try {
    const orderId = req.query.orderId;
    const action = req.query.action;
    const paymentType = req.query.paymentType;

    const order = await orderSchema.findOne({ orderId: orderId })
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
    const total = order.total;
  
    if (paymentType !== 'COD' && action === 'cancel') {
      var result = await userSchema.updateOne(
        { userId: req.session.userId },
        { $inc: { wallet: total } }
      );
    }


    order.product.forEach(async (item) => {
      if (item.productId) {
        const productId = item.productId._id;
        const quantity = item.quantity;
    
        const productUpdateResult = await productSchema.updateOne(
          { _id: productId },
          { $inc: { stock: quantity } }
        );
      }
    
      if (item.bannerId) {
        const bannerId = item.bannerId._id;
        const quantity = item.quantity;
    
        const bannerUpdateResult = await bannerSchema.updateOne(
          { _id: bannerId },
          { $inc: { stock: quantity } }
        );
      }
    });

  const updateResult = await orderSchema.updateOne(
    { userId: req.session.userId, orderId: orderId },
    { $set: { status: action } }
  );
    res.redirect('/profile/my-orders')   
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
    profile,
    edit,
    otpVerification,
    getData,
    manage_address,
    add_address,
    get_address,
    edit_address,
    remove,
    update_address,
    my_orders,
    order_detail,
    order_action,
}