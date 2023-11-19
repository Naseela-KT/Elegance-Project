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
user_route.get("/",userController.loadHome)



//Products--filter--search
user_route.get("/allproducts",productController.loadAllProducts)
user_route.get("/men",productController.loadMenProducts)
user_route.get("/women",productController.loadWomenProducts)
user_route.get("/products",productController.loadProductDetails)
user_route.post("/productReview",validate.requireAuth,productController.submitReview)



user_route.post("/search",productController.loadSearch);
user_route.post("/search/:filter",productController.searchFilter)


//Add Product to Cart
user_route.post("/add-to-cart",userController.addToCart)


//Account
user_route.get("/my/profile",validate.requireAuth,validate.isBlocked,userController.loadAccount)
user_route.get("/my/edit-profile",validate.requireAuth,userController.loadEditProfile)
user_route.get("/my/orders",validate.requireAuth,userController.loadOrders)
user_route.get("/my/address",validate.requireAuth,userController.loadAddress)
user_route.get("/my/add-address",validate.requireAuth,userController.loadAddAddress)
user_route.get("/my/change-pwd",validate.requireAuth,userController.loadChangePwd)
user_route.get("/my/wallet",validate.requireAuth,userController.loadWallet)
user_route.get("/my/coupons",validate.requireAuth,userController.loadCoupons)
user_route.get("/my/referrals",validate.requireAuth,userController.loadReferrals)
user_route.post("/profile/updateData",userController.updateProfile)
user_route.post("/profile/change-pwd",userController.changePassword)
user_route.post("/profile/add-address",userController.addAddress)

user_route.get("/editAddress",validate.requireAuth,userController.editAddress)
user_route.post("/editAddress",userController.updateAddress)
user_route.get("/deleteAddress",validate.requireAuth,userController.deleteAddress)

user_route.get("/change-email",validate.requireAuth,userController.loadChangeEmail)
user_route.post("/change-email",userController.updateEmail)

//Orders
user_route.get("/order-details",validate.isBlocked,validate.requireAuth,orderController.loadOrderDetails)
user_route.get("/cancel-order",validate.isBlocked,validate.requireAuth,orderController.cancelOrder)
user_route.post("/requestReturn",orderController.returnOrder)
user_route.get("/download-invoice",validate.isBlocked,validate.requireAuth,orderController.downloadInvoice)


//Cart
user_route.get("/cart",validate.requireAuth,validate.isBlocked,userController.loadCart)
user_route.get("/cart/deleteItem",validate.isBlocked,validate.requireAuth,userController.deleteCartItem)
user_route.post("/cart/updateQuantity",userController.updateQuantity)
user_route.get("/cart/toWishlist",validate.isBlocked,validate.requireAuth,userController.moveToWishlist)


//Checkout
user_route.get("/checkout",validate.isBlocked,validate.requireAuth,orderController.loadCheckout)
user_route.post("/selectAddress",orderController.selectAddress)
user_route.post("/checkout/add-address",orderController.addCheckoutAddress)


//Wishlist
user_route.get("/wishlist",validate.requireAuth,validate.isBlocked,userController.loadWishlist)
user_route.post("/wishlist-add",userController.addToWishlist)
user_route.get("/wishlist/deleteItem",validate.isBlocked,validate.requireAuth,userController.deleteWishlistItem)
user_route.get("/wishlist-to-bag",validate.isBlocked,validate.requireAuth,userController.moveToBag)


//place-order
user_route.post("/orderconfirm",orderController.orderconfirmation)
user_route.post("/verify-payment",orderController.loadverify)
user_route.get("/orderconfirmation",validate.requireAuth,validate.isBlocked,orderController.loadConfirm)


//Coupon
user_route.post("/applycoupon",couponController.applycoupon)


//Logout
user_route.post("/logout",userController.logoutUser)
user_route.get("/logout",validate.requireAuth,validate.isBlocked,userController.logoutUser)




module.exports=user_route
