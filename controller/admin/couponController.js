
const couponSchema = require('../../models/admin/couponModel');

const  coupon_management = async (req, res) =>{
    try {
        const data = await couponSchema.find();
        res.render('coupon/couponManagement',{ data});
    } catch (error) {
        console.log(error);
    }
}

const add_coupon = async (req, res)=>{
    try {
        res.render('coupon/add_coupon', {message:''});
    } catch (error) {
        console.log(error);
    }
}

const get_coupon = async (req, res) => {
    try {
      const data = {
        couponName: req.body.couponName,
        expiryDate: req.body.expiryDate,
        discount: req.body.discount,
        minimumPrice: req.body.minimumPrice,
        quantity: req.body.quantity,
      };
  
      if (!data.couponName || !data.expiryDate || !data.discount || !data.minimumPrice || !data.quantity) {
        return res.render('coupon/add_coupon', { message: 'Please fill in all the fields.' });
      }
  
      const existingCoupon = await couponSchema.findOne({ couponName: data.couponName });
  
      if (existingCoupon) {
        return res.render('coupon/add_coupon', { message: 'Coupon with the same name already exists.' });
      }
  
      if (data.discount < 0 || data.discount > 100) {
        return res.render('coupon/add_coupon', { message: 'Invalid discount percentage. Please provide a value between 0 and 100.' });
      }
  
      await couponSchema.create(data)
      .then(()=>{
        console.log(data.expiryDate);
      })
      .catch((err)=>{
        console.log(err);
      })
      return res.render('coupon/add_coupon', { message: 'Coupon Added' });
    } catch (error) {
      console.log(error);
    }
  };
  
  const edit_coupon = async (req, res)=>{
    try {
      const id = req.params.id;
      const data = await couponSchema.findOne({_id : id});
      res.render('coupon/edit_coupon',{data,message:''});
    } catch (error) {
      console.log(error);
    }
  }

  const update_coupon = async (req, res)=>{
    try {
      const data = {
        couponName: req.body.couponName,
        expiryDate: req.body.expiryDate,
        discount: req.body.discount,
        minimumPrice: req.body.minimumPrice,
        quantity: req.body.quantity,
      };

      if (!data.couponName || !data.expiryDate || !data.discount || !data.minimumPrice || !data.quantity) {
        return res.render('coupon/edit_coupon',{data, message: 'Please fill in all the fields.' });
      }
  
      if (data.discount < 0 || data.discount > 100) {
        return res.render('coupon/edit_coupon',{data, message: 'Invalid discount percentage. Please provide a value between 0 and 100.' });
      }
      const couponDate = new Date(req.body.expiryDate);
      const currentDate = new Date();
      
      if (couponDate < currentDate) {
          data.status = "Expired";
      } else {
          data.status = "Active";
      }
      await couponSchema.updateOne({_id : req.body.id}, data)
      .then(()=>{
        console.log(data.expiryDate);
      })
      .catch((err)=>{
        console.log(err);
      })

    } catch (error) {
      console.log(error);
    }
    res.redirect('/admin/dashboard/coupon');
  }

module.exports ={
    coupon_management,
    get_coupon,
    add_coupon,
    edit_coupon,
    update_coupon
}