const bannerSchema = require('../../models/admin/bannerModel');
const categorySchema = require('../../models/admin/categoryModel');
const { default: mongoose } = require('mongoose');
const { category_management } = require('./category_Controller');
const path = require('path');
const fs = require('fs');

const banner_management = async (req, res) =>{
    try {
        const banner = await bannerSchema.find().populate({
          path: 'category',
          model: 'category',
          localField: 'category',
          foreignField: 'categoryId'
        });
        res.render('banner/banner_management',{banner});
    } catch (error) {
        console.log(error);
    }
}

const add_banner = async (req, res) =>{
    try {
        let category = await categorySchema.find({status: true});
        console.log(category);
        if (category.length > 0) {
            res.render('banner/add_banner', { message: '', category });
          } else {
            res.redirect('/admin/dashboard/category');
          }
    } catch (error) {
        console.log(error);
        res.render('404');
    }
}

const upload_banner = async (req, res) => {
  try {
    let category = await categorySchema.find({ status: true });
    console.log(req.body.category);

    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.brand ||
      !req.body.price ||
      !req.body.stock ||
      !req.files
    ) {
      console.log(req.body);
      return res.render('banner/add_banner', { message: 'Please fill all the fields', category });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);

    if (isNaN(price) || price <= 0) {
      return res.render('banner/add_banner', { message: 'Invalid price', category });
    }

    if (isNaN(stock) || stock <= 0) {
      return res.render('banner/add_banner', { message: 'Invalid stock', category });
    }

    const bannerId = new mongoose.Types.ObjectId(); // Generate a new ObjectId

    const ProImages = [];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    let data = {
      bannerId: bannerId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: price,
      stock: stock,
      images: req.files,
    };

    for (const file of req.files) {
      const fileExtension = file.filename.substring(file.filename.lastIndexOf('.')).toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        ProImages.push(file.filename);
      } else {
        return res.render('banner/add_banner', { message: "invalid file format (not an image)", category });
      }
    }

    data.images = ProImages;
    let result = await bannerSchema.create(data);
    return res.render('banner/add_banner', { message: "Banner Added successfully", category });
  } catch (error) {
    console.log(error);
    res.render('404');
  }
};


const bannerBlock = async ( req, res) =>{
  try {
    let bannerId = req.query.id; 
    let status = req.query.status; 
    let userData = await bannerSchema.findOne({ bannerId: bannerId });
    if (!userData) {
      return res.redirect('/admin/dashboard/banner');
    }
    if (status == 'false') { 
      await bannerSchema.updateOne({ bannerId: bannerId }, { status: true });
    } else {
      await bannerSchema.updateOne({ bannerId: bannerId }, { status: false });
    }
    res.json({ response: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

const edit_banner = async (req, res) => {
  try {
    let bannerId = req.params.id;

    let bannerData = await bannerSchema.findOne({ bannerId: bannerId }).populate({
      path: 'category',
      model: 'category',
      localField: 'category',
      foreignField: 'categoryId'
    });
    const category = await categorySchema.find({ status: true });
    console.log(bannerData )
    res.render('banner/edit_banner', { bannerData, message: '', category });
  } catch (error) {
    console.log(error);
  }
}

const delete_img = async (req, res) => {
  try {
    console.log('111111')
    const bannerId = req.query.id; 
    const imageId = req.query.img;
    console.log(bannerId, imageId)
    if (!bannerId || !imageId) {
      // res.status(400).json({ response: 'error' });
      return res.render('404');
    }
    let filePath = 'public/proImages/';
    console.log(filePath)
    fs.unlink(path.resolve(filePath,imageId), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File successfully deleted');
    });
    await bannerSchema.updateOne({ bannerId: bannerId }, { $pull: { images: {$in:imageId} } });
    // res.json({ response: 'success' });
    return res.redirect(`/admin/dashboard/banner/edit-banner${bannerId}`);
  } catch (error) {
    console.error(error);
    res.render('404');
  }
};



const update_bannerData = async (req, res) =>{
  try {
    let bannerId = req.body.bannerId;
    console.log(req.body)
    const category = await categorySchema.find({status:true});
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.brand ||
      !req.body.price ||
      !req.body.stock 
    ) {
      console.log(req.body);
      return res.render('banner/add_banner', { message: 'Please fill all the fields', category });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);

    if (isNaN(price) || price <= 0) {
      return res.render('banner/add_banner', { message: 'Invalid price', category });
    }

    if (isNaN(stock) || stock <= 0) {
      return res.render('banner/add_banner', { message: 'Invalid stock', category });
    }
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: price,
      stock: stock,
    };
    if(req.files){
      const ProImages = [];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      for (const file of req.files) {
        const fileExtension = file.filename.substring(file.filename.lastIndexOf('.')).toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {
          ProImages.push(file.filename);
        } else {
          return res.render('banner/add_banner', { message: "invalid file format (not an image)", category });
        }
      }

      let oldImg = await bannerSchema.findOne({bannerId: bannerId});
      console.log(oldImg);
      oldImg = oldImg.images;
      let newImages = [...oldImg,...ProImages];
      updateData.images = newImages;
    }
    
    
await bannerSchema.updateOne({ bannerId: bannerId }, { $set: updateData });
    res.redirect('/admin/dashboard/banner');

  } catch (error) {
    console.log(error);
    res.render('404');
  }
}

module.exports ={
    banner_management,
    add_banner,
    upload_banner,
    bannerBlock,
    edit_banner,
    delete_img,
    update_bannerData
}