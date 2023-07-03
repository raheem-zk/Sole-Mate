
const productSchema = require('../../models/admin/productModel');
const categorySchema = require('../../models/admin/categoryModel');
const bannerSchema = require('../../models/admin/bannerModel');
const couponSchema = require('../../models/admin/couponModel');
const offerSchema = require('../../models/admin/offerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');

const all_products = async (req, res)=>{
    try {
      let loged = false;
      if(req.session.userId){
        loged = true;
      }
        var page = 1;
        if (req.query.page) {
          page = req.query.page;
        }
        const limit = 8;
        const skip = (page - 1) * limit;
        const category = await categorySchema.find();
        const coupon = await couponSchema.find({ status: 'Active' });
        const productOffer = await productOfferSchema.find({status:'Active'});
        const offers = await offerSchema.find({status:'Active'})
        .populate({
          path: 'category',
          model: 'category',
          localField: 'category',
          foreignField: 'categoryId'
        });

        if (req.query.low && req.query.high) {
          let low = req.query.low.trim();
          let high = req.query.high.trim();
          let products = await productSchema.find({ price: { $gte: low, $lt: high }, status: true })
            .skip(skip)
            .limit(limit);
          let productsSize = await productSchema.countDocuments({ price: { $gte: low, $lt: high }, status: true });
          const size = Math.ceil(productsSize / limit);
          return res.render('filter/all_products', { products, category, coupon, size, page, loged,offers,productOffer });
        }
        if(req.query.priceLow){
          let num = req.query.priceLow;
          const products = await productSchema.find({ status: true }).sort({ price: num })
          .skip(skip)
          .limit(limit);
          const productsSize = await productSchema.countDocuments({ status: true });
          const size = Math.ceil(productsSize / limit);
          return res.render('filter/all_products', { products, category, coupon, size, page, loged, offers ,productOffer});
        }
        console.log(page)
        console.log(req.query);
        if(req.query.search){
          let value = req.query.search.trim();
          const limit = 8;
          const skip = (page - 1) * limit;
          let productsSize = await productSchema.countDocuments({ name: { $regex: value, $options: 'i' } });
          const size = Math.ceil(productsSize / limit);
      
          const products = await productSchema
            .find({ name: { $regex: value, $options: 'i' } })
            .skip(skip)
            .limit(limit);
          return res.render('filter/all_products', { products, category, coupon, size, page ,loged, offers, productOffer});
        }

        if (req.query.category){
            const categoryId = req.query.category;
            const products = await productSchema.find({ category: categoryId ,status:true})
            // .populate({
            //     path: 'category',
            //     model: 'category',
            //     localField: 'category',
            //     foreignField: 'categoryId',
            //   })
              .skip(skip)
              .limit(limit);
              let productsSize = await productSchema.countDocuments({ category: categoryId ,status:true})
              const size = Math.ceil(productsSize / limit);
            return res.render('filter/all_products', { products, category, coupon, size, page ,loged, offers, productOffer});
        }
        let products = await productSchema.find({ status: true })
          .skip(skip)
          .limit(limit);
        let productsSize = await productSchema.countDocuments({ status: true });
        const size = Math.ceil(productsSize / limit);
        
        
        return res.render('filter/all_products', { products, category, coupon, size ,page, loged , offers, productOffer});
        
    } catch (error) {
        console.log(error);
    }
}



const category_filter = async (req, res)=>{
    try {
        const categoryId = req.params.id;
        let loged = false;
        if(req.session.userId){
          loged = true;
        }
        const productOffer = await productOfferSchema.find({status:'Active'});

        const products = await productSchema.find({ category: categoryId ,status:true})
        // .populate({
        //     path: 'category',
        //     model: 'category',
        //     localField: 'category',
        //     foreignField: 'categoryId'
        //   });
          const offers = await offerSchema.find({status:'Active'})
          .populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
        const category = await categorySchema.find();
        
        return res.render('filter/category',{ products , category, loged, offers, productOffer})
    } catch (error) {
        console.log(error);
    }
}

const search = async (req, res) => {
    try {
      console.log(req.body.search);
      let payload = req.body.search.trim();
      let searchResults = await productSchema.find({ name: { $regex: new RegExp('^'+payload+'.*', 'i') } }).limit(10).exec();
      console.log(searchResults);
      res.json({ payload: searchResults });
    } catch (error) {
      console.log(error);
    }
  };

module.exports ={
    category_filter,
    search,
    all_products,
}