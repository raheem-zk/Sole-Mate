
const userSchema = require('../../models/user/userModel');
const categorySchema = require('../../models/admin/categoryModel');

const wishlist = async (req, res) => {
    try {
        const category = await categorySchema.find();

        const wishlists = await userSchema.findOne({ userId: req.session.userId }).populate({
            path: 'wishlist.product',
            model: 'products',
            localField: 'wishlist.product',
            foreignField: 'productId',
        })
        .populate({
            path: 'wishlist.bannerproduct',
            model: 'banner',
            localField: 'wishlist.bannerproduct',
            foreignField: 'bannerId'
        })
        let loged = false;
        if(req.session.userId){
          loged = true;
        }
        res.render('wishlist/wishlist', { wishlists ,category, loged});
    } catch (error) {
        console.log(error);
    }
}


const add = async (req, res)=>{
    try {
        const productId = req.params.id;
        if (!req.session.userId){
            return res.json({response:'/login'});
        }
      const existed = await userSchema.findOne({ userId: req.session.userId, 'wishlist.product': productId });
      if (existed) {
        return res.json({response:'success'});
      }
      const result = await userSchema.updateOne(
        { userId: req.session.userId },
        { $push: { wishlist: { product: productId } } }
      );
        console.log(result,'wishlist result');
      return res.json({response:'success'});
    } catch (error) {
        console.log(error);
    }
}
const addBannerProduct = async (req, res)=>{
    try {
        const productId = req.params.id;
        if (!req.session.userId){
            return res.json({response:'/login'});
        }
      const existed = await userSchema.findOne({ userId: req.session.userId, 'wishlist.bannerproduct': productId });
      if (existed) {
        return res.json({response:'success'});
      }
      const result = await userSchema.updateOne(
        { userId: req.session.userId },
        { $push: { wishlist: { bannerproduct: productId } } }
      );
        console.log(result,'wishlist result');
      return res.json({response:'success'});
    } catch (error) {
        console.log(error);
    }
}


const remove = async (req, res) =>{
    try {
        const productId = req.params.id;
        await userSchema.updateOne({
            userId: req.session.userId
        },{
            $pull : { wishlist: {product : productId}}
        });
        let userData = await userSchema.findOne({userId: req.session.userId});
        if(userData.wishlist.length  == 0){
            return res.json({response:'zero'});
        }
        return res.json({response:'success'})
    } catch (error) {
        console.log(error);
    }
}
const remove_bannerItem = async (req, res) =>{
    try {
        const productId = req.params.id;
        await userSchema.updateOne({
            userId: req.session.userId
        },{
            $pull : { wishlist: { bannerproduct: productId}}
        }).then((result)=>{
            // console.log('jk',result,'remove banner product in wishlist')
        })
        .catch((err)=>{
            console.log(err);
        })
        let userData = await userSchema.findOne({userId: req.session.userId});
        if(userData.wishlist.length  == 0){
            return res.json({response:'zero'});
        }
        return res.json({response:'success'})
    } catch (error) {
        console.log(error);
    }
}

module.exports ={
    wishlist,
    add,
    remove,
    addBannerProduct,
    remove_bannerItem
}