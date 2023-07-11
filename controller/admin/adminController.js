const Admin = require('../../models/admin/adminModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFYSID;
const client = require("twilio")(accountSid, authToken);

const userSchema = require('../../models/user/userModel');
const orderSchema = require('../../models/user/orderModel');

// login page

const login = async (req, res) => {
  try {
    res.render('login', { message: '' });
  } catch (error) {
    console.log(error);
  }
}
const logout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect('/admin/login');
  } catch (error) {
    console.log(error);
  }
}


const verifyLogin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.mobile || !req.body.password) {
      return res.render('login', { message: 'please fill the fieald.' })
    }
    if (req.body.mobile.length != 10) {
      return res.render('login', { message: 'Mobile Number is incorect' })
    }
    let check = await Admin.findOne({ email: req.body.email, mobileNumber: req.body.mobile })
    if (!check) {
      return res.render('login', { message: 'Wrong!' });
    }
    const compare = await bcrypt.compare(req.body.password, check.password);
    if (!compare) {
      return res.render('login', { message: 'password is incorect' })
    }
    await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${req.body.mobile}`, channel: "sms" });
    return res.render('otp', { mobile: req.body.mobile });
  } catch (error) {
    console.log(error);
  }
}

const otp = async (req, res) => {
  try {
    let otpCode = req.body.otp;
    let mobile = req.body.mobile;
    if (!otpCode || !mobile) {
      return res.redirect('/admin/login');
    }

    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mobile}`, code: otpCode })
      .then((verification_check) => {
        if (verification_check.status === 'approved') {
          // OTP verification successful
          console.log(verification_check.status);
          req.session.admin = otpCode;
          return res.json({ success: true });
        } else {
          // OTP verification failed
          return res.json({ error: 'OTP is wrong please enter curect otp' })
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle error during OTP verification
        // res.redirect('/admin/login');
        return res.json({ error: ' Somthing is wrong wrong please enter curect otp' })
      });
  } catch (error) {
    console.log(error);
    res.redirect('/admin/login');
  }
};


// dashboard
const dashboard = async (req, res) => {
  try {
    const newOrderCount = await orderSchema.count({ status: 'pending' });
    let totalSales = await orderSchema.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' }
        }
      }
    ]).exec();

    if (totalSales && totalSales.length > 0 && totalSales[0].totalAmount) {
      totalSales = totalSales[0].totalAmount;
    } else {
      totalSales = 0;
    }


    let customer = await userSchema.count()
    const refund = await orderSchema.count({ status: 'Returned' });

    let paymentType = await orderSchema.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: { _id: '$paymentType', totalSales: { $sum: 1 } }
      }
    ]);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Get the first day of the week (Sunday)

    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Get the last day of the week (Saturday)
    const weekSales = await orderSchema.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek, $lte: endOfWeek } // Filter documents within the current week
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by formatted date
          totalSales: { $sum: 1 } // Sum the number of sales for each date
        }
      }
    ]);

    // const weekSalesReport = await orderSchema.find({$gte: startOfWeek , $lte: endOfWeek , statusbar : 'delivered'})
    const weekSalesReport = await orderSchema.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek, $lte: endOfWeek },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' }
        }
      }
    ]);
    let thisWeeksales;

    if (weekSalesReport && weekSalesReport[0] && weekSalesReport[0].totalSales) {
      thisWeeksales = weekSalesReport[0].totalSales;
    } else {
      thisWeeksales = 0;
    }
    const weekSalesJSON = JSON.stringify(weekSales);

    let ship = await orderSchema.find({ status: 'pending' }).count();
    return res.render('dashboard', { newOrderCount, totalSales, refund, customer, paymentType, weekSalesJSON, weekSales, thisWeeksales, ship });
  } catch (error) {
    console.log(error);
  }
}

const user_management = async (req, res) => {
  try {
    const users = await userSchema.find();
    res.render('user/user_management', { users });
  } catch (error) {
    console.log(error);
  }
};

const userBlock = async (req, res) => {
  try {
    let userId = req.query.id;
    let status = req.query.status;
    let userData = await userSchema.findOne({ userId: userId });
    if (!userData) {
      return res.redirect('/admin/dashboard/user');
    }
    if (status == 'false') {
      await userSchema.updateOne({ userId }, { status: true });
    } else {
      await userSchema.updateOne({ userId }, { status: false });
    }
    res.json({ response: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const user_detail = async (req, res) => {
  try {
    let userId = req.params.id;
    let userData = await userSchema.findOne({ userId: userId })
    if (!userData) {
      return res.redirect('/admin/dashboard/user');
    }
    return res.render('user/user_detail', { userData });
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  login,
  verifyLogin,
  otp,
  dashboard,
  user_management,
  userBlock,
  user_detail,
  logout
}