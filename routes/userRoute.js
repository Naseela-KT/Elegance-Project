const express=require("express");
const path=require("path");
const user_route = express();
const session=require("express-session");
const cookieparser = require('cookie-parser')
require('dotenv').config(); 
const validate = require('../middleware/userAuth');
const cors = require('cors');
user_route.use(cors());

const userController=require("../controllers/userController")
const productController=require("../controllers/productController")
const orderController=require("../controllers/orderController")
const couponController=require("../controllers/couponController")


user_route.set("view engine","ejs");
user_route.set("views","./views/user");

user_route.use(express.static(path.join(__dirname,"../public")));
user_route.use(express.urlencoded({ extended: true }));
user_route.use(express.json());
user_route.use("/styles",express.static(path.join(__dirname,"/public/assets/css")))
user_route.use("/js",express.static(path.join(__dirname,"/public/assets/js")))
user_route.use("/imgs",express.static(path.join(__dirname,"/public/assets/imgs")))



user_route.use(cookieparser())
const nocache = require('nocache')
user_route.use(nocache())
user_route.get('*',validate.checkUser)
user_route.post('*',validate.checkUser)


user_route.use(session({
    secret: process.env.SESSION_SECRET, // Secret key used to sign the session ID cookie
    resave: false,
    saveUninitialized: true
}));

//Register
user_route.get("/register",userController.loadRegister)
user_route.post("/register",userController.insertUser)

//OTP
user_route.post("/send-otp",userController.sendOTP)
user_route.post("/verify-otp",userController.verifyOTP)

//Login
user_route.get("/login",userController.loadLogin)
user_route.post("/login",userController.verifyUser)

//Forgot Password
user_route.get("/forgot-password",userController.loadForgotPwd)
user_route.post("/forgot-password",userController.verifyEmail)

//reset Password
user_route.get("/reset-password",userController.loadReset)
user_route.post("/reset-password",userController.resetpwd)

//home
user_route.get("/",validate.requireAuth,userController.loadHome)



//Products--filter--search
user_route.get("/allproducts",validate.requireAuth,productController.loadAllProducts)
user_route.get("/men",validate.requireAuth,productController.loadMenProducts)
user_route.get("/women",validate.requireAuth,productController.loadWomenProducts)
user_route.get("/products",validate.requireAuth,productController.loadProductDetails)
user_route.post("/productReview",validate.requireAuth,productController.submitReview)


user_route.post("/allproducts",validate.requireAuth,productController.allProductsFilter)
user_route.post("/men",validate.requireAuth,productController.menProductsFilter)
user_route.post("/women",validate.requireAuth,productController.womenProductsFilter)

user_route.post("/search",productController.loadSearch);
user_route.post("/search/:filter",productController.searchFilter)


//Add Product to Cart
user_route.post("/add-to-cart",validate.requireAuth,userController.addToCart)


//Account
user_route.get("/profile",validate.requireAuth,userController.loadProfile)
user_route.get("/my/profile",validate.requireAuth,userController.loadAccount)
user_route.get("/my/edit-profile",validate.requireAuth,userController.loadEditProfile)
user_route.get("/my/orders",validate.requireAuth,userController.loadOrders)
user_route.get("/my/address",validate.requireAuth,userController.loadAddress)
user_route.get("/my/add-address",validate.requireAuth,userController.loadAddAddress)
user_route.get("/my/change-pwd",validate.requireAuth,userController.loadChangePwd)
user_route.get("/my/wallet",validate.requireAuth,userController.loadWallet)
user_route.get("/my/coupons",validate.requireAuth,userController.loadCoupons)
user_route.get("/my/referrals",validate.requireAuth,userController.loadReferrals)
user_route.post("/profile/updateData",validate.requireAuth,userController.updateProfile)
user_route.post("/profile/change-pwd",validate.requireAuth,userController.changePassword)
user_route.post("/profile/add-address",validate.requireAuth,userController.addAddress)

user_route.get("/editAddress",validate.requireAuth,userController.editAddress)
user_route.post("/editAddress",validate.requireAuth,userController.updateAddress)
user_route.get("/deleteAddress",validate.requireAuth,userController.deleteAddress)

user_route.get("/change-email",validate.requireAuth,userController.loadChangeEmail)
user_route.post("/change-email",validate.requireAuth,userController.updateEmail)

//Orders
user_route.get("/order-details",validate.requireAuth,orderController.loadOrderDetails)
user_route.get("/cancel-order",validate.requireAuth,orderController.cancelOrder)
user_route.post("/requestReturn",validate.requireAuth,orderController.returnOrder)


//Cart
user_route.get("/cart",validate.requireAuth,userController.loadCart)
user_route.get("/cart/deleteItem",validate.requireAuth,userController.deleteCartItem)
user_route.post("/cart/updateQuantity",validate.requireAuth,userController.updateQuantity)
user_route.get("/cart/toWishlist",validate.requireAuth,userController.moveToWishlist)


//Checkout
user_route.get("/checkout",validate.requireAuth,orderController.loadCheckout)
user_route.post("/selectAddress",validate.requireAuth,orderController.selectAddress)
user_route.post("/checkout/add-address",validate.requireAuth,orderController.addCheckoutAddress)


//Wishlist
user_route.get("/wishlist",validate.requireAuth,userController.loadWishlist)
user_route.post("/wishlist-add",validate.requireAuth,userController.addToWishlist)
user_route.get("/wishlist/deleteItem",validate.requireAuth,userController.deleteWishlistItem)
user_route.get("/wishlist-to-bag",validate.requireAuth,userController.moveToBag)


//place-order
user_route.post("/orderconfirm",validate.requireAuth,orderController.orderconfirmation)
user_route.post("/verify-payment",validate.requireAuth,orderController.loadverify)
user_route.get("/orderconfirmation",validate.requireAuth,orderController.loadConfirm)


//Coupon
user_route.post("/applycoupon",validate.requireAuth,couponController.applycoupon)


//Logout
user_route.post("/logout",userController.logoutUser)
user_route.get("/logout",userController.logoutUser)



module.exports=user_route
