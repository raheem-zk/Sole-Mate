const productSchema = require('../../models/admin/productModel');
const categorySchema = require('../../models/admin/categoryModel');
const { default: mongoose } = require('mongoose');
const { category_management } = require('./category_Controller');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const product_management = async (req, res) => {
  try {
    const product = await productSchema.find().populate({
      path: 'category',
      model: 'category',
      localField: 'category',
      foreignField: 'categoryId'
    })
    return res.render('product/product_management', { product });
  } catch (error) {
    console.log(error);
  }
}

const add_product = async (req, res) => {
  try {
    let category = await categorySchema.find({ status: true });
    if (category.length > 0) {
      return res.render('product/add_product', { message: '', category });
    } else {
      return res.redirect('/admin/dashboard/category');
    }
  } catch (error) {
    console.log(error);
    res.render('404');
  }
}

const upload_product = async (req, res) => {
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
      return res.render('product/add_product', { message: 'Please fill all the fields', category });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);

    if (isNaN(price) || price <= 0) {
      return res.render('product/add_product', { message: 'Invalid price', category });
    }

    if (isNaN(stock) || stock <= 0) {
      return res.render('product/add_product', { message: 'Invalid stock', category });
    }

    const productId = new mongoose.Types.ObjectId(); // Generate a new ObjectId

    const ProImages = [];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    let data = {
      productId: productId,
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
        return res.render('product/add_product', { message: "invalid file format (not an image)", category });
      }
    }
    data.images = ProImages;
    let result = await productSchema.create(data);
    return res.render('product/add_product', { message: "Product Added successfully", category });
  } catch (error) {
    console.log(error);
    res.render('404');
  }
};

const productBlock = async (req, res) => {
  try {
    let productId = req.query.id;
    let block = req.query.status;
    console.log(block);
    let productData = await productSchema.findOne({ productId: productId });
    if (!productData) {
      return res.redirect('/admin/dashboard/product');
    }
    if (block == 'false') {
      await productSchema.updateOne({ productId: productId }, { $set: { block: true } })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        })
    } else {
      await productSchema.updateOne({ productId: productId }, { $set: { block: false } })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        })
    }
    return res.json({ response: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

const edit_product = async (req, res) => {
  try {
    let productId = req.params.id;

    let productData = await productSchema.findOne({ productId: productId }).populate({
      path: 'category',
      model: 'category',
      localField: 'category',
      foreignField: 'categoryId'
    });
    const category = await categorySchema.find({ status: true });
    console.log(productData)
    return res.render('product/edit_product', { productData, message: '', category });
  } catch (error) {
    console.log(error);
  }
}

const delete_img = async (req, res) => {
  try {
    const productId = req.query.id;
    const imageId = req.query.img;
    console.log(productId, imageId)
    if (!productId || !imageId) {
      // res.status(400).json({ response: 'error' });
      return res.render('404');
    }
    let filePath = 'public/proImages/';
    console.log(filePath)
    fs.unlink(path.resolve(filePath, imageId), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File successfully deleted');
    });
    await productSchema.updateOne({ productId: productId }, { $pull: { images: { $in: imageId } } });
    // res.json({ response: 'success' });
    return res.redirect(`/admin/dashboard/product/edit-product${productId}`);
  } catch (error) {
    console.error(error);
    res.render('404');
  }
};



const update_productData = async (req, res) => {
  try {
    let productId = req.body.productId;
    let productData = await productSchema.findOne({ productId: productId }).populate({
      path: 'category',
      model: 'category',
      localField: 'category',
      foreignField: 'categoryId'
    });
    const category = await categorySchema.find({ status: true });
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.brand ||
      !req.body.price ||
      !req.body.stock
    ) {
      return res.render('product/edit_product', { productData, message: 'Please fill all the fields', category });
    }
    if (req.files.length > 6) {
      return res.render('product/edit_product', { productData, message: 'Image limit is 6', category });

    }
    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);

    if (isNaN(price) || price <= 0) {
      return res.render('product/edit_product', { productData, message: 'Invalid price', category });
    }

    if (isNaN(stock) || stock <= 0) {
      return res.render('product/edit_product', { productData, message: 'Invalid stock', category });
    }
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: price,
      stock: stock,
    };
    if (req.files) {
      const ProImages = [];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      for (const file of req.files) {
        const fileExtension = file.filename.substring(file.filename.lastIndexOf('.')).toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {
          ProImages.push(file.filename);
        } else {
          return res.render('product/edit_product', { productData, message: "invalid file format (not an image)", category });
        }
      }

      let oldImg = await productSchema.findOne({ productId: productId });
      console.log(oldImg);
      oldImg = oldImg.images;
      let newImages = [...oldImg, ...ProImages];
      updateData.images = newImages;
    }


    await productSchema.updateOne({ productId: productId }, { $set: updateData });
    res.redirect('/admin/dashboard/product');

  } catch (error) {
    console.log(error);
    res.render('404');
  }
}

module.exports = {
  product_management,
  add_product,
  upload_product,
  productBlock,
  edit_product,
  delete_img,
  update_productData
}