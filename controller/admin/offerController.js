
const offerSchema = require('../../models/admin/offerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');
const categorySchema = require('../../models/admin/categoryModel');
const productSchema = require('../../models/admin/productModel');

const offer_managemnet = async (req, res)=>{
    try {
        const offers = await offerSchema.find().populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
          console.log(offers);
        return res.render('offer/offer_management',{offers});
    } catch (error) {
        console.log(error);
    }
}

const add = async (req, res)=>{
    try {
        const categories = await categorySchema.find({status: true});
        return res.render('offer/add_offer',{categories});
    } catch (error) {
        console.log(error);
    }
}

const get_Data = async (req, res) =>{
    try {
    const data = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        discountPercentage: req.body.discountPercentage,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };

      console.log(data);
        if(!data.title || !data.description || !data.category || !data.discountPercentage || !data.startDate || !data.endDate ){
            return res.json({error:'Fill in all fields!'});
        }

    const newOffer = await offerSchema.create(data);
    console.log(newOffer);
    res.json({newOffer})

    } catch (error) {
        console.log(error);
    }
}

const edit = async (req, res)=>{
    try {
        const offerId = req.params.id;
        const data = await offerSchema.findOne ({_id: offerId})
        .populate({
            path: 'category',
            model: 'category',
            localField: 'category',
            foreignField: 'categoryId'
          });
        console.log(data);
        const categories = await categorySchema.find({status: true});
        
        res.render('offer/edit',{data,categories });
    } catch (error) {
        console.log(error);
    }
}

const update = async (req, res)=>{
    try {
        const offerId = req.body.id;
        const data = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            discountPercentage: req.body.discountPercentage,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          };
    if(!data.title || !data.description || !data.category || !data.discountPercentage || !data.startDate || !data.endDate ){
        return res.json({error:'Fill in all fields!'});
    }
    let result = await offerSchema.updateOne({ _id: offerId}, data);
    console.log(result)
    return res.json({success:'success'})
    
    } catch (error) {
        console.log(error);
    }
}



/// product offer ...................
const productOffer_management = async (req, res)=>{
    try {
        const productOffers = await productOfferSchema.find()
        .populate({
            path: 'product_name',
            model: 'products',
            localField: 'product_name',
            foreignField: 'productId'
          });
        return res.render('offer/product_offer/productOffer_management',{ productOffers });
    } catch (error) {
        console.log(error);
    }
}

const add_product_offer = async (req, res)=>{
    try {
        const products = await productSchema.find({status: true});
        return res.render('offer/product_offer/add_product_offer',{ products });
    } catch (error) {
        console.log(error);
    }
}

const get_product_offer = async (req, res)=>{
    try {
        const data = {
            product_name: req.body.product_name,
            description: req.body.description,
            discountPercentage: req.body.discountPercentage,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          };
          if(!data.product_name || !data.description || !data.discountPercentage || !data.startDate || !data.endDate ){
            return res.json({error:'Fill in all fields!'});
          }
          const newOffer = await productOfferSchema.create(data);
          console.log(newOffer);
          res.json({newOffer})
    } catch (error) {
        console.log(error);
    }
}

const edit_product_offer = async (req, res)=>{
    try {
        const offerId = req.params.id;
        const data = await productOfferSchema.findOne ({_id: offerId})
        .populate({
            path: 'product_name',
            model: 'products',
            localField: 'product_name',
            foreignField: 'productId'
          });
          console.log(data,'kkkkkkkk');
          const products = await productSchema.find({status: true});

        return res.render('offer/product_offer/edit_product_offer', { data , products  })
    } catch (error) {
        console.log(error);
    }
}

const update_product_offer = async (req, res)=>{
    try {
        const offerId = req.body.id;
        const data = {
            product_name: req.body.product_name,
            description: req.body.description,
            discountPercentage: req.body.discountPercentage,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          };
          if(!data.product_name || !data.description || !data.discountPercentage || !data.startDate || !data.endDate ){
            return res.json({error:'Fill in all fields!'});
          }
    let result = await productOfferSchema.updateOne({ _id: offerId}, data);
    console.log(result)
    return res.json({success:'success'})

    } catch (error) {
        console.log(error);
    }
}
module.exports ={
    offer_managemnet,
    add,
    get_Data,
    edit,
    update,
    productOffer_management,
    add_product_offer,
    get_product_offer,
    edit_product_offer,
    update_product_offer,
}