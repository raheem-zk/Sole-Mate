const categorySchema = require('../../models/admin/categoryModel');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const productSchema = require('../../models/admin/productModel')
const bannerModel = require('../../models/admin/bannerModel')

const category_management = async ( req, res) =>{
    try {
        const category = await categorySchema.find();
        res.render('category/category_management',{ category });
    } catch (error) {
        console.log('error');
    }
}
const add_category = async (req, res) => {
  try {
    let categoryName = req.body.data;
    let trimmedCategoryName = categoryName.trim();
    let existingCategory = await categorySchema.findOne({ categoryName: trimmedCategoryName });
    if (existingCategory) {
      return res.json({success: true});
      // return res.redirect('/dashboard/category');
    }

    const categoryId = new mongoose.Types.ObjectId(); // Generate a new ObjectId

    let data = {
      categoryName: trimmedCategoryName,
      categoryId: categoryId,
    };

    await categorySchema.create(data);
    return res.json({success:'success'});
    // return res.redirect('/admin/dashboard/category');
  } catch (error) {
    console.log(error);
    res.render('404');
  }
};

const edit_category = async (req, res) => {
  try {
    let categoryId = req.body.id; // Corrected variable name
    let categoryName = req.body.categoryName;
    console.log(categoryId, categoryName)
    
    if (!categoryId || !categoryName) {
      return res.redirect('/admin/dashboard/category');
    }
    let result = await categorySchema.updateOne({ categoryId: categoryId }, { $set: { categoryName: categoryName } });
    console.log(result);
      return res.redirect('/admin/dashboard/category');
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

const category_action = async (req, res) => {
  try {
    let categoryId = req.query.id;
    let status = req.query.status;
    let userData = await categorySchema.findOne({ categoryId: categoryId });
    if (!userData) {
      return res.redirect('/admin/dashboard/product');
    }
    if (status === 'false') {
      await categorySchema.updateOne({ categoryId: categoryId }, {$set:{ status: true }});
      await productSchema.updateMany({ category: categoryId }, { $set: { status: true } });
      await bannerModel.updateMany({ category: categoryId }, { $set: { status: true } });

      res.json({ response: 'success' });
    } else {
      await categorySchema.updateOne({ categoryId: categoryId }, {$set:{ status: false }});
      await productSchema.updateMany({category:categoryId}, {$set:{ status: false }});
      await bannerModel.updateMany({category:categoryId},{$set:{ status: false }});
      res.json({ response: 'success' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


module.exports={
    category_management,
    add_category,
    edit_category,
    category_action
}