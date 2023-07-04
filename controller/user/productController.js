const productSchema = require('../../models/admin/productModel');
const bannerSchema = require('../../models/admin/bannerModel');
const categorySchema = require('../../models/admin/categoryModel')
const offerSchema = require('../../models/admin/offerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');


const product_detail = async (req, res)=>{
    try {
        let productId  = req.params.id;
        const category = await categorySchema.find();
        const productData = await productSchema.findOne({productId: productId,status: true ,block: false })
        .populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
          console.log(productId,'kjd',productData);
          let loged = false;
          if(req.session.userId){
            loged = true;
          }
          const productOffer = await productOfferSchema.find({ status: 'Active' });
          const offers = await offerSchema.find({status:'Active'})
          .populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
          res.render('product/product_detail',{ productData , category, loged, offers, productOffer});
        
    } catch (error) {
        console.log(error);
    }
}
const bannerproduct_detail = async (req, res)=>{
    try {
        let productId  = req.params.id;
        const category = await categorySchema.find();

        const productData = await bannerSchema.findOne({bannerId: productId ,status: true ,block: false}).populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
          const productOffer = await productOfferSchema.find({ status: 'Active' });
          const offers = await offerSchema.find({status:'Active'})
          .populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
          // console.log(productId,'kjd',productData);
          let loged = false;
          if(req.session.userId){
            loged = true;
          }
          console.log(productData,'productData .....',productOffer,'productOffer......',offers,'offers..........',)
          return res.render('product/product_detail',{ productData , category, loged, offers, productOffer});
        
    } catch (error) {
        console.log(error);
    }
}

module.exports= {
    product_detail,
    bannerproduct_detail
}