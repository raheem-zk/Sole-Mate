
const userSchema = require('../../models/user/userModel');
const productSchema = require('../../models/admin/productModel');
const bannerSchema = require('../../models/admin/bannerModel');
const categorySchema = require('../../models/admin/categoryModel');
const gest_userSchema = require('../../models/gest/gestModel');
const mongoose = require('mongoose');
const offerSchema = require('../../models/admin/offerModel');
const productOfferSchema = require('../../models/admin/product_offerModel');

const add = async (req, res) => {
  try {

    const productId = req.params.id;
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });
    if (!req.session.userId) {
      const productData = await productSchema.findOne({ productId: productId });

      if (!req.session.gest_user) {
        let gestUserId = new mongoose.Types.ObjectId();
        const newGuestUser = {
          gestId: gestUserId,
          address: [],
          cart: [],
          cartTotalPrice: 0,
        };
        await gest_userSchema.create(newGuestUser);
        req.session.gest_user = gestUserId;

        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $push: { cart: { product: productId } } }
        );
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }

        return res.json({ response: 'success' });
      } else {
        const existed = await gest_userSchema.findOne(
          { gestId: req.session.gest_user, 'cart.product': productId }
        );

        if (existed) {
          return res.json({ response: 'success' });
        }

        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $push: { cart: { product: productId } } }
        );

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }

        // if (offerMatch) { 
        //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
        //  await gest_userSchema.updateOne(
        //   { gestId: req.session.gest_user },
        //   { $inc: { cartTotalPrice: offerPrice } }
        // );
        // } else{ 
        //   await gest_userSchema.updateOne(
        //     { gestId: req.session.gest_user },
        //     { $inc: { cartTotalPrice: productData.price } }
        //   );
        // } 



        return res.json({ response: 'success' });
      }
    }


    if (req.session.userId) {
      const existed = await userSchema.findOne({ userId: req.session.userId, 'cart.product': productId });
      if (existed) {
        return res.json({ response: 'success' });
      }


      const result = await userSchema.updateOne(
        { userId: req.session.userId },
        { $push: { cart: { product: productId } } }
      );

      const productData = await productSchema.findOne({ productId: productId });
      const userData = await userSchema.findOne({ userId: req.session.userId });


      let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
      let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
      if (proOfferMatch && offerMatch) {
        let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else if (proOfferMatch && !offerMatch) {
        let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else if (offerMatch && !proOfferMatch) {
        let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else {
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: productData.price } }
        );
      }

      //offer checking and add the off incom 
      // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
      // if (offerMatch) { 
      //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
      //  await userSchema.updateOne(
      //   { userId: req.session.userId },
      //   { $inc: { cartTotalPrice:  offerPrice } }
      // );
      // } else{ 
      //   await userSchema.updateOne(
      //     { userId: req.session.userId },
      //     { $inc: { cartTotalPrice:  productData.price } }
      //   );
      // } 

      if (result.nModified === 1) {
        return res.json({ response: 'success' });
      } else {
        return res.json({ response: 'success' });
      }
    } else {
      return res.json({ response: 'login' });
    }
  } catch (error) {
    console.log(error);
    // return res.json({ response: 'An error occurred' });
  }
};

const bannerproduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });

    if (!req.session.userId) {
      const productData = await bannerSchema.findOne({ bannerId: productId });

      if (!req.session.gest_user) {
        let gestUserId = new mongoose.Types.ObjectId();
        const newGuestUser = {
          gestId: gestUserId,
          address: [],
          cart: [],
          cartTotalPrice: 0,
        };
        await gest_userSchema.create(newGuestUser);
        req.session.gest_user = gestUserId;

        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $push: { cart: { bannerproduct: productId } } }
        );

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }

        // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
        // if (offerMatch) { 
        //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
        //  await gest_userSchema.updateOne(
        //   { gestId: req.session.gest_user },
        //   { $inc: { cartTotalPrice: offerPrice } }
        // );
        // } else{ 
        //  await gest_userSchema.updateOne(
        //    { gestId: req.session.gest_user },
        //    { $inc: { cartTotalPrice: productData.price } }
        //  );
        // } 

        return res.json({ response: 'success' });
      } else {
        const existed = await gest_userSchema.findOne(
          { gestId: req.session.gest_user, 'cart.bannerproduct': productId }
        );

        if (existed) {
          return res.json({ response: 'success' });
        }

        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $push: { cart: { bannerproduct: productId } } }
        );

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }

        // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
        // if (offerMatch) { 
        //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
        //  await gest_userSchema.updateOne(
        //   { gestId: req.session.gest_user },
        //   { $inc: { cartTotalPrice: offerPrice } }
        // );
        // } else{ 
        //  await gest_userSchema.updateOne(
        //    { gestId: req.session.gest_user },
        //    { $inc: { cartTotalPrice: productData.price } }
        //  );
        // } 

        return res.json({ response: 'success' });
      }
    }



    if (req.session.userId) {
      const existed = await userSchema.findOne({ userId: req.session.userId, 'cart.bannerproduct': productId });
      if (existed) {
        // return res.redirect('/');
        return res.json({ response: 'success' });
      }
      const result = await userSchema.updateOne(
        { userId: req.session.userId },
        { $push: { cart: { bannerproduct: productId } } }
      );
      const productData = await bannerSchema.findOne({ bannerId: productId });
      const userData = await userSchema.findOne({ userId: req.session.userId });
      // const total = userData.cartTotalPrice + productData.price;

      let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
      let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
      if (proOfferMatch && offerMatch) {
        let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else if (proOfferMatch && !offerMatch) {
        let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else if (offerMatch && !proOfferMatch) {
        let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: offerPrice } }
        );
      } else {
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: productData.price } }
        );
      }


      // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
      // if (offerMatch) { 
      //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
      //  await userSchema.updateOne(
      //   { userId: req.session.userId },
      //   { $inc : { cartTotalPrice: offerPrice } }
      // );
      // } else{ 
      //   await userSchema.updateOne(
      //     { userId: req.session.userId },
      //     { $inc : { cartTotalPrice: productData.price } }
      //   );
      // } 


      console.log('pushed result ', result);

      if (result.nModified === 1) {
        return res.json({ response: 'success' });
      } else {
        return res.json({ response: 'success' });
      }
    } else {
      return res.json({ response: 'login' });
    }
  } catch (error) {
    console.log(error);
  }
}

const remove = async (req, res) => {
  try {
    let productId = req.params.id;
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });
    if (!req.session.userId) {
      if (req.session.gest_user) {
        let gest = await gest_userSchema.findOne({ gestId: req.session.gest_user });
        let quantity = gest.cart.find(item => item.product == productId);
        if (quantity) {
          quantity = quantity.quantity;
        } else {
          quantity = 0;
        }


        const productData = await productSchema.findOne({ productId: productId });
        const result = await gest_userSchema.findOne({ gestId: req.session.gest_user });

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else {
          let totalPrice = (quantity * productData.price);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          )
          console.log(result, productData.price);
        }
        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $pull: { cart: { product: productId } } }
        );
        const total = result.cartTotalPrice;
        if (result.cart.length == 0) {
          return res.json({ response: 'reload' });
        }
        res.json({ response: { total } });

      }
    }


    if (req.session.userId) {
      let user = await userSchema.findOne({ userId: req.session.userId });
      let quantity = user.cart.find(item => item.product == productId);
      if (quantity) {
        quantity = quantity.quantity;
      } else {
        quantity = 0;
      }
      console.log('the remove product quantity is ::', quantity);
      const productData = await productSchema.findOne({ productId: productId });
      const result = await userSchema.findOne({ userId: req.session.userId });

      let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
      let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
      if (proOfferMatch && offerMatch) {
        let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else if (proOfferMatch && !offerMatch) {
        let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else if (offerMatch && !proOfferMatch) {
        let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else {
        let totalPrice = (quantity * productData.price);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      }

      // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
      // if (offerMatch) { 
      //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
      // let totalPrice = (quantity*offerPrice);
      // console.log('loged user offer total ==',totalPrice)
      //  await userSchema.updateOne(
      //   { userId: req.session.userId },
      //   { $inc: { cartTotalPrice: -totalPrice } }
      // );
      // } else{ 
      //   let totalPrice = (quantity*productData.price);
      //   await userSchema.updateOne(
      //     { userId: req.session.userId },
      //     { $inc: { cartTotalPrice: -totalPrice } }
      //   );
      // } 

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $pull: { cart: { product: productId } } }
      );

      const total = result.cartTotalPrice;

      if (result.cart.length == 0) {
        return res.json({ response: 'reload' });
      }
      res.json({ response: { total } });
    }

  } catch (error) {
    console.log(error);
  }
};

const removebanner = async (req, res) => {
  try {
    let productId = req.params.id;
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });

    if (!req.session.userId) {
      if (req.session.gest_user) {
        let gest = await gest_userSchema.findOne({ gestId: req.session.gest_user });
        let quantity = gest.cart.find(item => item.bannerproduct == productId);
        console.log(quantity, 'banner quantity......');
        if (quantity) {
          quantity = quantity.quantity;
        } else {
          quantity = 0;
        }
        const productData = await bannerSchema.findOne({ bannerId: productId });
        const result = await gest_userSchema.findOne({ gestId: req.session.gest_user });

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          let totalPrice = (quantity * offerPrice);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        } else {
          let totalPrice = (quantity * productData.price);
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -totalPrice } }
          );
        }

        // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
        // if (offerMatch) { 
        //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
        // let totalPrice = (quantity*offerPrice);
        //   await gest_userSchema.updateOne(
        //     { gestId: req.session.gest_user },
        //     { $inc: { cartTotalPrice: -totalPrice } }
        //   );
        // } else{ 
        //   let totalPrice = (quantity*productData.price);
        //   await gest_userSchema.updateOne(
        //     { gestId: req.session.gest_user },
        //     { $inc: { cartTotalPrice: -totalPrice } }
        //   );
        // }

        await gest_userSchema.updateOne(
          { gestId: req.session.gest_user },
          { $pull: { cart: { bannerproduct: productId } } }
        );
        if (result.cart.length == 0) {
          return res.json({ response: { message: 'reload' } });
        }
        res.json({ response: 'success' });
      }
    }


    if (req.session.userId) {
      let user = await userSchema.findOne({ userId: req.session.userId });
      let quantity = user.cart.find(item => item.bannerproduct == productId);
      if (quantity) {
        quantity = quantity.quantity;
      } else {
        quantity = 0;
      }
      const productData = await bannerSchema.findOne({ bannerId: productId });
      let result = await userSchema.findOne({ userId: req.session.userId });

      let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
      let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
      if (proOfferMatch && offerMatch) {
        let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else if (proOfferMatch && !offerMatch) {
        let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else if (offerMatch && !proOfferMatch) {
        let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
        let totalPrice = (quantity * offerPrice);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      } else {
        let totalPrice = (quantity * productData.price);
        await userSchema.updateOne(
          { userId: req.session.userId },
          { $inc: { cartTotalPrice: -totalPrice } }
        );
      }

      // let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category)); 
      // if (offerMatch) { 
      //  let offerPrice = (productData.price* offerMatch.discountPercentage)/100
      // let totalPrice = (quantity*offerPrice);
      //  await userSchema.updateOne(
      //   { userId : req.session.userId },
      //   { $inc: { cartTotalPrice: -totalPrice } }
      // );
      // } else{ 
      //   let totalPrice = (quantity*productData.price);
      //   await userSchema.updateOne(
      //     {userId: req.session.userId},
      //     {$inc : {cartTotalPrice : -totalPrice}}
      //     );
      // } 

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $pull: { cart: { bannerproduct: productId } } }
      );
      if (result.cart.length == 0) {
        return res.json({ response: { message: 'reload' } });
      }

      const total = result.cartTotalPrice;
      res.json({ response: 'success' });
    }
  } catch (error) {
    console.log(error);
  }
};

const cart = async (req, res) => {
  try {
    const category = await categorySchema.find();
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });

    if (req.session.gest_user && req.session.userId) {
      const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user });

      if (gestData.cart && gestData.cart.length > 0) {
        const userData = await userSchema.findOneAndUpdate(
          { userId: req.session.userId },
          {
            $push: { cart: { $each: gestData.cart } },
            $inc: { cartTotalPrice: gestData.cartTotalPrice }
          },
          { new: true }
        );
      }

      const deletedUser = await gest_userSchema.findOneAndDelete({ gestId: req.session.gest_user });
      req.session.gest_user = null;
    }

    if (req.session.gest_user && !req.session.userId) {
      const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user }).populate({
        path: 'cart.product',
        model: 'products',
        localField: 'cart.product',
        foreignField: 'productId'
      })
        .populate({
          path: 'cart.bannerproduct',
          model: 'banner',
          localField: 'cart.bannerproduct',
          foreignField: 'bannerId'
        });

      let cart = gestData.cart;
      await gest_userSchema.updateOne(
        { gestId: req.session.gest_user },
        { $set: { cartTotalPrice: 0 } }
      );

      let totalPriceUpdate = 0;

      for (const item of cart) {
        let productId = item.product ? item.product.productId : item.bannerproduct.bannerId;
        let productData = item.product
          ? await productSchema.findOne({ productId: productId })
          : await bannerSchema.findOne({ bannerId: productId });

        let quantity = item.quantity;
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));

        if (proOfferMatch && offerMatch) {
          console.log('2')
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else {
          totalPriceUpdate += quantity * productData.price;
        }
      }

      await gest_userSchema.updateOne(
        { gestId: req.session.gest_user },
        { $inc: { cartTotalPrice: totalPriceUpdate } }
      );

      let cartTotalPrice = gestData.cartTotalPrice;
      let loged = Boolean(req.session.userId);

      return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers, productOffer });
    }

    if (req.session.userId) {
      const userData = await userSchema.findOne({ userId: req.session.userId }).populate({
        path: 'cart.product',
        model: 'products',
        localField: 'cart.product',
        foreignField: 'productId'
      })
        .populate({
          path: 'cart.bannerproduct',
          model: 'banner',
          localField: 'cart.bannerproduct',
          foreignField: 'bannerId'
        });

      let cart = userData.cart;
      await userSchema.updateOne(
        { userId: req.session.userId },
        { $set: { cartTotalPrice: 0 } }
      );

      let totalPriceUpdate = 0;

      for (const item of cart) {
        let productId = item.product ? item.product.productId : item.bannerproduct.bannerId;
        let productData = item.product
          ? await productSchema.findOne({ productId: productId })
          : await bannerSchema.findOne({ bannerId: productId });

          // equals(productId))
        let quantity = item.quantity;
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));

        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100);
          totalPriceUpdate += quantity * offerPrice;
        } else {
          totalPriceUpdate += quantity * productData.price;
        }
      }

      await userSchema.updateOne(
        { userId: req.session.userId },
        { $inc: { cartTotalPrice: totalPriceUpdate } }
      );

      let cartTotalPrice = userData.cartTotalPrice;
      let loged = Boolean(req.session.userId);

      return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers, productOffer });
    }

    return res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
}


// const cart = async (req, res) => {
//   try {
//     const category = await categorySchema.find();
//     const productOffer = await productOfferSchema.find({ status: 'Active' });
//     const offers = await offerSchema.find({ status: 'Active' })
//       .populate({
//         path: 'category',
//         model: 'category',
//         localField: 'category',
//         foreignField: 'categoryId'
//       });
//     if (req.session.gest_user && req.session.userId) {
//       const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user });
//       if (gestData.cart && gestData.cart.length > 0) {
//         const userData = await userSchema.findOneAndUpdate(
//           { userId: req.session.userId },
//           {
//             $push: { cart: { $each: gestData.cart } },
//             $inc: { cartTotalPrice: gestData.cartTotalPrice }
//           },
//           { new: true }
//         );
//       }
//       const deletedUser = await gest_userSchema.findOneAndDelete({ gestId: req.session.gest_user });
//       req.session.gest_user = null;
//     }
//     if (req.session.gest_user && !req.session.userId) {
//       const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user }).populate({
//         path: 'cart.product',
//         model: 'products',
//         localField: 'cart.product',
//         foreignField: 'productId'
//       })
//         .populate({
//           path: 'cart.bannerproduct',
//           model: 'banner',
//           localField: 'cart.bannerproduct',
//           foreignField: 'bannerId'
//         })

//       let cart = '';
//       cart = gestData.cart;
//       await gest_userSchema.updateOne(
//         { gestId: req.session.gest_user },
//         { $set: { cartTotalPrice: 0 } }
//       );
//       for (const item of cart) {
//         if (item.product) {
//           let productId = item.product.productId;
//           let productData = await productSchema.findOne({ productId: productId });
//           var quantity = item.quantity;
//           let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
//           let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
//           if (proOfferMatch && offerMatch) {
//             let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (proOfferMatch && !offerMatch) {
//             let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (offerMatch && !proOfferMatch) {
//             let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else {
//             let totalPrice = (quantity * productData.price);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           }
//         } else if(item.bannerproduct){
//           let productId = item.bannerproduct.bannerId;
//           let productData = await bannerSchema.findOne({ bannerId: productId });
//           var quantity = item.quantity;
//           let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
//           let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
//           if (proOfferMatch && offerMatch) {
//             let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (proOfferMatch && !offerMatch) {
//             let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (offerMatch && !proOfferMatch) {
//             let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else {
//             let totalPrice = (quantity * productData.price);
//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           }
//         }
//       }
//       let cartTotalPrice = gestData.cartTotalPrice;
//       let loged = false;
//       if (req.session.userId) {
//         loged = true;
//       }
//       return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers, productOffer });
//     }

//     if (req.session.userId) {
//       const userData = await userSchema.findOne({ userId: req.session.userId }).populate({
//         path: 'cart.product',
//         model: 'products',
//         localField: 'cart.product',
//         foreignField: 'productId'
//       })
//         .populate({
//           path: 'cart.bannerproduct',
//           model: 'banner',
//           localField: 'cart.bannerproduct',
//           foreignField: 'bannerId'
//         })


//       // console.log(userData);

//       let cart = '';
//       cart = userData.cart;
//       // res.send(cart)
//       await userSchema.updateOne(
//         { userId: req.session.userId },
//         { $set: { cartTotalPrice: 0 } }
//       );
//       for (const item of cart) {
//         if (item.product) {
//           let productId = item.product.productId;
//           let productData = await productSchema.findOne({ productId: productId });
//           var quantity = item.quantity;
//           let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
//           let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
//           if (proOfferMatch && offerMatch) {
//             let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (proOfferMatch && !offerMatch) {
//             let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (offerMatch && !proOfferMatch) {
//             let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else {
//             let totalPrice = (quantity * productData.price);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           }
//         } else if(item.bannerproduct){
//           let productId = item.bannerproduct.bannerId;
//           let productData = await bannerSchema.findOne({ bannerId: productId });
//           var quantity = item.quantity;
//           let proOfferMatch = productOffer.find((x) => x.product_name.equals(productId));
//           let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
//           if (proOfferMatch && offerMatch) {
//             let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (proOfferMatch && !offerMatch) {
//             let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else if (offerMatch && !proOfferMatch) {
//             let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
//             let totalPrice = (quantity * offerPrice);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           } else {
//             let totalPrice = (quantity * productData.price);
//             await userSchema.updateOne(
//               { userId: req.session.userId },
//               { $inc: { cartTotalPrice: totalPrice } }
//             );
//           }
//         }
//       }
//       let cartTotalPrice = userData.cartTotalPrice;
//       let loged = false;
//       if (req.session.userId) {
//         loged = true;
//       }
//       return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers, productOffer });
//     }
//     return res.redirect('/login')
//   } catch (error) {
//     console.log(error);
//   }
// }


// const cart = async (req, res) => {
//   try {
//     const category = await categorySchema.find();
//     const productOffer = await productOfferSchema.find({ status: 'Active' });
//     const offers = await offerSchema.find({ status: 'Active' })
//       .populate({
//         path: 'category',
//         model: 'category',
//         localField: 'category',
//         foreignField: 'categoryId'
//       });
//     if (req.session.gest_user && req.session.userId) {
//       const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user });
//       if (gestData.cart && gestData.cart.length > 0) {
//         const userData = await userSchema.findOneAndUpdate(
//           { userId: req.session.userId },
//           {
//             $push: { cart: { $each: gestData.cart } },
//             $inc: { cartTotalPrice: gestData.cartTotalPrice }
//           },
//           { new: true }
//         );
//       }
//       const deletedUser = await gest_userSchema.findOneAndDelete({ gestId: req.session.gest_user });
//       req.session.gest_user = null;
//     }
//     if (req.session.gest_user && !req.session.userId) {
//       const gestData = await gest_userSchema.findOne({ gestId: req.session.gest_user }).populate({
//         path: 'cart.product',
//         model: 'products',
//         localField: 'cart.product',
//         foreignField: 'productId'
//       })
//         .populate({
//           path: 'cart.bannerproduct',
//           model: 'banner',
//           localField: 'cart.bannerproduct',
//           foreignField: 'bannerId'
//         })

//       let cart = '';
//       cart = gestData.cart;
//        var totalTotal= 0 ;
//        await gest_userSchema.updateOne(
//         { gestId: req.session.gest_user },
//         { $set: { cartTotalPrice: totalTotal } }
//       );
//       cart.forEach( async (item)=>{
//         if(item.product){
//           let productId = item.product.productId;
//           let proOfferMatch = productOffer.find((x)=>{ x.product_name.equals(productId)})
//           let offerMatch = offers.find((x) => x.category.categoryId.equals( item.product.category));
//           let productData = await productSchema.findOne({productId : productId });

//           if (!proOfferMatch && !offerMatch){  
//             let total = item.quantity * productData.price;
//             console.log('new total price ... the offer not then the total price is hear ==', total );
//             totalTotal += total;

//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalTotal } }
//             );

//           }else if (productOffer && offerMatch){
//             let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
//             let total = (item.quantity * offerPrice);
//             totalTotal += total;

//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalTotal } }
//             );

//           } else if (!productOffer && offerMatch){
//             let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
//             let total = (item.quantity * offerPrice);
//             totalTotal += total;

//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalTotal } }
//             );

//           } else if (productOffer && !offerMatch){
//             let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
//             let total = (item.quantity * offerPrice);
//             totalTotal += total;

//             await gest_userSchema.updateOne(
//               { gestId: req.session.gest_user },
//               { $inc: { cartTotalPrice: totalTotal } }
//             );
//           }

//         console.log(totalTotal,' ites new total price ')
//         }else if (item.bannerproduct){

//         }
//       })
//       // await gest_userSchema.updateOne(
//       //   { gestId: req.session.gest_user },
//       //   { $set: { cartTotalPrice: totalTotal } }
//       // );
//       let cartTotalPrice = gestData.cartTotalPrice;
//       let loged = false;
//       if (req.session.userId) {
//         loged = true;
//       }
//       return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers, productOffer });
//     }

//     if (req.session.userId) {
//       const userData = await userSchema.findOne({ userId: req.session.userId }).populate({
//         path: 'cart.product',
//         model: 'products',
//         localField: 'cart.product',
//         foreignField: 'productId'
//       })
//         .populate({
//           path: 'cart.bannerproduct',
//           model: 'banner',
//           localField: 'cart.bannerproduct',
//           foreignField: 'bannerId'
//         })


//       // console.log(userData);

//       let cart = '';
//       cart = userData.cart;
//       // res.send(cart)
//       let cartTotalPrice = userData.cartTotalPrice;
//       let loged = false;
//       if (req.session.userId) {
//         loged = true;
//       }
//       return res.render('cart/cart', { cart, cartTotalPrice, category, loged, offers,productOffer });
//     }
//     return res.redirect('/login')
//   } catch (error) {
//     console.log(error);
//   }
// }

const quntity = async (req, res) => {
  try {
    const bannerId = req.query.bannerId;
    const count = req.query.count;
    const curentquantity = req.query.curentquantity;
    const max = parseInt(req.query.max);
    // const limit = mx;
    if (curentquantity <= 1 && count == -1) {
      return res.json({ response: 'not' });
    }
    if (max <= curentquantity && count == 1) {
      // console.log(max, curentquantity);
      // alert(max)
      return res.json({ response: 'not' });
    }
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });

    if (!req.session.userId && req.session.gest_user) {

      await gest_userSchema.updateOne(
        { gestId: req.session.gest_user, 'cart.bannerproduct': bannerId },
        { $inc: { 'cart.$.quantity': count } }
      );

      const productData = await bannerSchema.findOne({ bannerId: bannerId });


      if (count == -1) {
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -productData.price } }
          );
        }
 
      } else {
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }
        
      }
    }

    if (req.session.userId) {
      await userSchema.updateOne(
        { userId: req.session.userId, 'cart.bannerproduct': bannerId },
        { $inc: { 'cart.$.quantity': count } }
      );

      // cart total amount seting 
      const productData = await bannerSchema.findOne({ bannerId: bannerId });

      if (count == -1) {

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -productData.price } }
          );
        }
      } else {

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }
      }
    }

    res.json({ response: 'success' });
  } catch (error) {
    console.log(error);
  }
}

const productquntity = async (req, res) => {
  try {
    const product = req.query.productId;
    const count = req.query.count;
    const curentquantity = req.query.curentquantity;
    const max = parseInt(req.query.max);
    // const limit = mx;
    if (curentquantity <= 1 && count == -1) {
      return res.json({ response: 'not' });
    }
    if (max <= curentquantity && count == 1) {
      // console.log(max, curentquantity);
      // alert(max)
      return res.json({ response: 'not' });
    }
    const productOffer = await productOfferSchema.find({ status: 'Active' });
    const offers = await offerSchema.find({ status: 'Active' })
      .populate({
        path: 'category',
        model: 'category',
        localField: 'category',
        foreignField: 'categoryId'
      });
    if (!req.session.userId && req.session.gest_user) {
      await gest_userSchema.updateOne(
        { gestId: req.session.gest_user, 'cart.product': product },
        { $inc: { 'cart.$.quantity': count } }
      );
      const productData = await productSchema.findOne({ productId: product });
      if (count == -1) {
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: -productData.price } }
          );
        }
      } else {

        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await gest_userSchema.updateOne(
            { gestId: req.session.gest_user },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }
      }
    }

    if (req.session.userId) {
      await userSchema.updateOne(
        { userId: req.session.userId, 'cart.product': product },
        { $inc: { 'cart.$.quantity': count } }
      );

      // cart total amount seting 
      const productData = await productSchema.findOne({ productId: product });

      if (count == -1) {
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -offerPrice } }
          );
        } else {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: -productData.price } }
          );
        }

      } else {
        let proOfferMatch = productOffer.find((x) => x.product_name.equals(productData.productId));
        let offerMatch = offers.find((x) => x.category.categoryId.equals(productData.category));
        if (proOfferMatch && offerMatch) {
          let offerPrice = productData.price - ((productData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage)) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (proOfferMatch && !offerMatch) {
          let offerPrice = productData.price - ((productData.price * proOfferMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else if (offerMatch && !proOfferMatch) {
          let offerPrice = productData.price - ((productData.price * offerMatch.discountPercentage) / 100)
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: offerPrice } }
          );
        } else {
          await userSchema.updateOne(
            { userId: req.session.userId },
            { $inc: { cartTotalPrice: productData.price } }
          );
        }
      }
    }


    res.json({ response: 'success' });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  add,
  cart,
  remove,
  bannerproduct,
  removebanner,
  quntity,
  productquntity
}