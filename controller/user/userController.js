require('dotenv').config();

const User = require('../../models/user/userModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const referralCodes = require('referral-codes');
const userSchema = require('../../models/user/userModel');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFYSID;
const client = require("twilio")(accountSid, authToken);

// const client = require("twilio")(process.env.accountSid, process.env.authToken);
const mongoose = require('mongoose');
const productSchema = require('../../models/admin/productModel');
const bannerSchema = require('../../models/admin/bannerModel');
const categorySchema = require('../../models/admin/categoryModel')
const couponSchema = require('../../models/admin/couponModel');
const offerSchema = require('../../models/admin/offerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');

// home page
const home = async (req, res) => {
  try {
    let banner = await bannerSchema.find({ status: true });
    let products = await productSchema.find({ status: true }).limit(12);
    const category = await categorySchema.find({status: true});
    const coupon = await couponSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    res.render('home', { products, banner, category, coupon, loged, offers, productOffer });
  } catch (error) {
    console.log(error);
  }
}

//register
const loadRegister = async (req, res) => {
  try {
    res.render('registration', { message: '' })
    // res.render('register-otp')
  } catch (error) {
    console.log(error);
    res.render('404');

  }
}

const insertUser = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.mobile || !req.body.password) {
      return res.render('registration', { message: 'please fill the feald.' })
    }
    if (req.body.password.length < 6) {
      return res.render('registration', { message: 'enter Strong Password.' })
    }
    if (req.body.mobile.length != 10) {
      return res.render('registration', { message: 'Mobile number is incorect.' })
    }
    let existed = await User.exists({
      $or: [
        { email: req.body.email },
        { mobileNumber: req.body.mobile }
      ]
    });
    if (existed) {
      return res.render('registration', { message: 'User is already existed' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let userData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword
    }
    if (req.body.referral_code) {
      let referral_code = req.body.referral_code.trim();
      console.log(referral_code,'...refral')
      let result = await userSchema.findOne({ referral_code: referral_code });
      console.log(result)
      if (!result) {
        return res.render('registration', { message: 'Invalid referral code!' });
      } else {
        userData.parentReferral = referral_code;
      }
    }

    await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${userData.mobile}`, channel: "sms" });
    return res.render('register-otp', { userData });

  } catch (error) {
    console.log(error);
  }
}

const registerotp = async (req, res) => {
  let otpCode = req.body.otp;
  const userId = new mongoose.Types.ObjectId();
  const referral_code = referralCodes.generate(); // Generate a random referral code

  let userData = {
    userId: userId,
    name: req.body.name,
    mobileNumber: req.body.mobile,
    email: req.body.email,
    password: req.body.password,
    referral_code: referral_code[0],
  };
  if (req.body.parentReferral){
    var parentReferral = req.body.parentReferral;
    userData.wallet = 100;
  }

  client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: `+91${userData.mobileNumber}`, code: otpCode })
    .then((verification_check) => {
      if (verification_check.status === "approved") {
        // OTP verification successful
        console.log(verification_check.status);
        User.create(userData)
          .then(async () => {
            if(parentReferral){
              await userSchema.updateOne({referral_code: parentReferral}, {$inc : { wallet : 130 }});
            }
            return res.redirect('/login');
          })
          .catch((error) => {
            console.log(error);
            // Handle error during user creation
            return res.redirect('/register');
          });
      }
    })
    .catch((error) => {
      console.log(error);
      // Handle error during OTP verification
      res.render('404');

    });
};

//login page
const login = async (req, res) => {
  try {
    res.render('login', { message: '' })
  } catch (error) {
    console.log(error);
  }
}


const verifyLogin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.render('login', { message: 'Please fill in the fields.' });
    }
    let userData = {
      email: req.body.email,
      password: req.body.password,
    };

    let result = await User.findOne({ email: userData.email });

    if (result) {
      if (result.status) {
        const compare = await bcrypt.compare(req.body.password, result.password);

        if (compare) {
          req.session.userId = result.userId;
          console.log('user _id', result._id);
          console.log(req.session.userId, 'session id ');
          return res.redirect('/');
        } else {
          return res.render('login', { message: 'Incorrect password' });
        }
      } else {
        return res.render('login', { message: 'User is blocked' });
      }
    } else {
      return res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
};

const forgot_password = async (req, res) => {
  try {
    let loged = false;
    if (req.session.userId) {
      loged = true;
    }
    const category = await categorySchema.find({status: true});
    res.render('forgot-password', { message: '', loged, category });
  } catch (error) {
    console.log(error);
  }
}


const getNumber = async (req, res) => {
  try {
    const mobileNumber = req.body.mobileNumber;
    if (!mobileNumber) {
      return res.render('forgot-password', { message: 'Please Enter your mobile number' });
    }
    let userData = await userSchema.findOne({ mobileNumber: mobileNumber });
    console.log(userData);
    if (!userData) {
      return res.render('forgot-password', { message: 'Invalide Moble Number' });
    }
    await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${mobileNumber}`, channel: "sms" });
    return res.render('forgot-otp', { userData });
  } catch (error) {
    console.log(error);
  }
}

const verifyOtp = async (req, res) => {
  try {
    const otpCode = req.body.otp;
    const number = req.body.number;
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${number}`, code: otpCode })
      .then((verification_check) => {
        if (verification_check.status === "approved") {
          // OTP verification successful
          console.log(verification_check.status);
          return res.render('reset_password', { number, message: '' });
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle error during OTP verification
        res.render('404');

      });
  } catch (error) {
    console.log(error);
  }
}

const reset_password = async (req, res) => {
  try {
    const number = req.body.number;
    const newPassword = req.body.newPassword;
    const ConformPassword = req.body.ConformPassword;
    if (newPassword != ConformPassword) {
      return res.render('reset_password', { number, message: 'Passsword is not Match' })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userSchema.updateOne({ mobileNumber: number }, { $set: { password: hashedPassword } });
    return res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
}

const logout = async (req, res) => {
  try {
    // console.log(req.session)
    req.session.userId = null;
    // console.log(req.session);
    res.redirect('/')
  } catch (error) {
    console.log(error);
  }
}


const login_with_number = async (req, res) => {
  try {
    res.render('login_with_number', { message: '' });
  } catch (error) {
    console.log(error);
  }
}

const verify_number = async (req, res) => {
  try {
    const number = req.body.number;
    const userFind = await userSchema.findOne({ mobileNumber: number })
    if (!userFind) {
      return res.json({ response: { error: "User not found" } });
    }
    await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${number}`, channel: "sms" });
    console.log(number)
    return res.json({ response: { success: 'success' } })
  } catch (error) {
    console.log(error);
  }
}


// req.session.userId = result.userId;

const verify_otp = async (req, res) => {
  try {
    const otpCode = req.body.otp;
    const number = req.body.number;
    console.log(req.body);
    console.log(number, 'number.....')
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${number}`, code: otpCode })
      .then(async (verification_check) => {
        if (verification_check.status === "approved") {
          // OTP verification successful
          console.log(verification_check.status);
          const userId = await userSchema.findOne({ mobileNumber: number }, { userId: 1, _id: 0 });
          console.log(userId, 'dkl')
          req.session.userId = userId.userId;
          console.log(req.session.userId);
          return res.json({ response: { success: true } })
        } else {
          return res.json({ response: { error: true } });
        }
      })
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  home,
  loadRegister,
  insertUser,
  registerotp,
  login,
  verifyLogin,
  logout,
  forgot_password,
  getNumber,
  verifyOtp,
  reset_password,
  login_with_number,
  verify_number,
  verify_otp
}