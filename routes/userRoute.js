const express = require('express');
const user_route = express();

const nocache = require('nocache');

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');

const auth = require('../middleware/userAuth');
const userController = require('../controller/user/userController');
const cartController = require('../controller/user/cartController');
const productController = require('../controller/user/productController');
const wishlistController = require('../controller/user/wishlistController');
const profileController = require('../controller/user/profileController');
const checkoutCotroller = require('../controller/user/checkout');
const filterController = require('../controller/user/filterController');

// home page
user_route.get('/', userController.home);

// register
user_route.get('/register', auth.isLogout, userController.loadRegister);
user_route.post('/register', userController.insertUser)
user_route.post('/register-otp', userController.registerotp)

// login with phone number 
user_route.get('/login_with_number', nocache(), auth.isLogout, userController.login_with_number)
user_route.post('/login_with_number', userController.verify_number)
user_route.post('/login_with_number_otp', userController.verify_otp)

// login
user_route.get('/login', nocache(), auth.isLogout, userController.login);
user_route.post('/login', userController.verifyLogin);
user_route.get('/logout', auth.isLogin, userController.logout);

// forgot password 
user_route.get('/forgot-password', auth.isLogout, userController.forgot_password)
user_route.post('/forgot-password', userController.getNumber)
user_route.post('/forgot-otp', userController.verifyOtp)
user_route.post('/reset-password', userController.reset_password)


// user_prifile
user_route.get('/profile', auth.isLogin, profileController.profile);
user_route.get('/profile/edit', auth.isLogin, profileController.edit);
user_route.post('/profile/edit', profileController.getData);
user_route.post('/profile/edit/otp', profileController.otpVerification);
user_route.get('/profile/manage-address', auth.isLogin, profileController.manage_address);
user_route.get('/profile/manage-address/add-address', auth.isLogin, profileController.add_address);
user_route.post('/profile/manage-address/add-address', profileController.get_address);
user_route.get('/profile/manage-address/edit/:id', auth.isLogin, profileController.edit_address);
user_route.post('/profile/manage-address/edit-address', auth.isLogin, profileController.update_address);
user_route.get('/profile/manage-address/remove/:id', auth.isLogin, profileController.remove);

user_route.get('/profile/my-orders', auth.isLogin, profileController.my_orders)
user_route.get('/profile/my-orders/order-detail/:id', auth.isLogin, profileController.order_detail)
user_route.get('/profile/my-orders/action/', auth.isLogin, profileController.order_action)

// cart 
user_route.get('/cart/add/:id', cartController.add);
user_route.get('/cart/AddbannerToCart/:id', cartController.bannerproduct);
user_route.get('/cart/remove/:id', auth.isLogin, cartController.remove);
user_route.get('/cart/removebanner/:id', auth.isLogin, cartController.removebanner);
user_route.get('/cart', cartController.cart);
user_route.get('/cart/banner-quantity/', auth.isLogin, cartController.quntity)
user_route.get('/cart/product-quantity/', auth.isLogin, cartController.productquntity)


// product 
user_route.get('/product-detail/:id', productController.product_detail);
user_route.get('/banner-product-detail/:id', productController.bannerproduct_detail);


// whish list 
user_route.get('/wihshlist', auth.isLogin, wishlistController.wishlist);
user_route.get('/add-wishlist/:id', wishlistController.add);
user_route.get('/add-wishlist-bannerproduct/:id', wishlistController.addBannerProduct);
user_route.get('/wihshlist/remove/:id', wishlistController.remove);
user_route.get('/wihshlist/remove-banner/:id', wishlistController.remove_bannerItem);

// checkout 
user_route.get('/cart/checkout', auth.isLogin, checkoutCotroller.checkout)
user_route.post('/cart/checkout', checkoutCotroller.order)
user_route.post('/verifyPayment', checkoutCotroller.verifyPayment)
user_route.get('/ordersuccess', auth.isLogin, checkoutCotroller.ordersuccess)


user_route.get('/cart/checkout/conformation', auth.isLogin, checkoutCotroller.confrmation)
user_route.get('/cart/checkout/add-address', auth.isLogin, checkoutCotroller.add_address)
user_route.post('/cart/checkout/add-address', checkoutCotroller.get_address)

user_route.post('/cart/checkout/apply_coupon', checkoutCotroller.applay_coupon)


// category fillter
user_route.get('/all_products', filterController.all_products)
user_route.get('/category/:id', filterController.category_filter);
user_route.post('/search', filterController.search);

module.exports = user_route;
