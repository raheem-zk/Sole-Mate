const express = require('express');
const admin_route = express(); //

const nocache = require('nocache');


admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const auth = require('../middleware/adminAuth');
const adminController = require('../controller/admin/adminController');
const categoryController = require('../controller/admin/category_Controller');
const productController = require('../controller/admin/productController');
const orderController = require('../controller/admin/orderController');
const bannerController = require('../controller/admin/bannerController');
const couponController = require('../controller/admin/couponController');
const upload = require('../middleware/multer');
const offerController = require('../controller/admin/offerController');
const salesController = require('../controller/admin/salesController');

// dashgoard
admin_route.get('/dashboard',nocache(),auth.isLogin,adminController.dashboard);

// login 
admin_route.get('/login',auth.isLogout,adminController.login)
admin_route.post('/login',adminController.verifyLogin);
admin_route.post('/login/otp',adminController.otp);
admin_route.get('/logout',nocache(),auth.isLogin,adminController.logout)

// user_management 
admin_route.get('/dashboard/user',auth.isLogin,adminController.user_management);
admin_route.get('/dashboard/user/action',auth.isLogin,adminController.userBlock);
admin_route.get('/dashboard/user-detail:id',auth.isLogin,adminController.user_detail);

// catagory
admin_route.get('/dashboard/category',auth.isLogin,categoryController.category_management)
admin_route.post('/dashboard/add-category',categoryController.add_category);
admin_route.post('/dashboard/edit-category', categoryController.edit_category);
admin_route.get('/dashboard/category/action',auth.isLogin, categoryController.category_action);

// product 
admin_route.get('/dashboard/product',auth.isLogin,productController.product_management)
admin_route.get('/dashboard/product/add-product',auth.isLogin,productController.add_product)
admin_route.post('/dashboard/product/add-product',upload.array('images',6),productController.upload_product);
admin_route.get('/dashboard/product/action',auth.isLogin,productController.productBlock)
admin_route.get('/dashboard/product/edit-product:id',auth.isLogin,productController.edit_product)
admin_route.post('/dashboard/product/get-product',upload.array('images',6),productController.update_productData);
admin_route.get('/dashboard/product/edit-product/delete-img',auth.isLogin, productController.delete_img);


//banner
admin_route.get('/dashboard/banner',auth.isLogin,bannerController.banner_management)
admin_route.get('/dashboard/banner/add-banner',auth.isLogin,bannerController.add_banner)
admin_route.post('/dashboard/banner/add-banner',upload.array('images',6),bannerController.upload_banner);
admin_route.get('/dashboard/banner/action',auth.isLogin,bannerController.bannerBlock)
admin_route.get('/dashboard/banner/edit-banner:id',auth.isLogin,bannerController.edit_banner)
admin_route.post('/dashboard/banner/get-banner',upload.array('images',6),bannerController.update_bannerData);
admin_route.get('/dashboard/banner/edit-banner/delete-img',auth.isLogin, bannerController.delete_img);


// order 
admin_route.get('/dashboard/order',auth.isLogin,orderController.order_management);
admin_route.get('/dashboard/order/action/',auth.isLogin,orderController.oreder_action);
admin_route.get('/dashboard/order/detail/:id',auth.isLogin,orderController.order_info);

// coupon 
admin_route.get('/dashboard/coupon',auth.isLogin,couponController.coupon_management);
admin_route.get('/dashboard/coupon/add_coupon',auth.isLogin,couponController.add_coupon);
admin_route.post('/dashboard/coupon/add_coupon',couponController.get_coupon)

admin_route.get('/dashboard/coupon/edit_coupon/:id',auth.isLogin,couponController.edit_coupon);
admin_route.post('/dashboard/coupon/edit_coupon',couponController.update_coupon);

// category offer
admin_route.get('/dashboard/offer_managemnet',auth.isLogin,offerController.offer_managemnet)
admin_route.get('/dashboard/add_offer',auth.isLogin,offerController.add)
admin_route.post('/dashboard/add_offer',upload.single('image'),offerController.get_Data)

admin_route.get('/dashboard/edit/:id',auth.isLogin,offerController.edit)
admin_route.post('/dashboard/edit',offerController.update)

// product offer 
admin_route.get('/dashboard/product_offer_management',auth.isLogin,offerController.productOffer_management)
admin_route.get('/dashboard/add_product_offer',auth.isLogin,offerController.add_product_offer)
admin_route.post('/dashboard/add_product_offer',offerController.get_product_offer)
admin_route.get('/dashboard/edit_product_offer/:id',auth.isLogin,offerController.edit_product_offer)
admin_route.post('/dashboard/edit_product_offer',offerController.update_product_offer)

// sales 
admin_route.get('/dashboard/sales',auth.isLogin,salesController.sales)
admin_route.post('/dashboard/sales',salesController.get_date)
admin_route.get('/dashboard/sales_report',auth.isLogin,salesController.sales_report)

module.exports = admin_route;
