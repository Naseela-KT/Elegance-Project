const express=require("express");
const multer=require("multer");
const path=require("path")
const cookieparser = require('cookie-parser')
require('dotenv').config(); 
const admin_route=express();
const validate = require('../middleware/adminAuth');
const methodOverride = require('method-override');

admin_route.use(methodOverride('_method'));



const adminController=require("../controllers/adminController")
const brandController=require("../controllers/brandController")
const categoryController=require("../controllers/categoryController")
const couponController=require("../controllers/couponController")
const orderController=require("../controllers/orderController")
const productController=require("../controllers/productController")
const bannerController=require("../controllers/bannerController")


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin")


admin_route.use(express.static(path.join(__dirname,"public")));
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(express.json());
admin_route.use('/fonts', express.static(path.join(__dirname, 'assets/fonts')));
// admin_route.use("/styles",express.static(path.join(__dirname,"public/admin/assets/css")))
// admin_route.use("/imgs",express.static(path.join(__dirname,"public/admin/assets/imgs")))
// admin_route.use("/js",express.static(path.join(__dirname,"public/admin/assets/js")))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,"../public/admin/assets/imgs/brands"));
    },
    filename: function (req, file, cb) {
      // cb(null, Date.now() + '-' + file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });


const prodstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"../public/admin/assets/imgs/products"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


const bannerstorage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"../public/admin/assets/imgs/banner"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const produpload = multer({ storage: prodstorage });
const bannerupload=multer({ storage: bannerstorage });
admin_route.use(cookieparser())
const nocache = require('nocache')
admin_route.use(nocache())
admin_route.get('*',validate.checkUser)

admin_route.use(express.urlencoded({ extended: true }));


//Admin-Login
admin_route.get("/login",adminController.loadLogin)
admin_route.post("/login",adminController.verifyLogin)


//Dashboard
admin_route.get("/dashboard",validate.requireAuth,adminController.loadDashboard)


//Users
admin_route.get("/user_management",validate.requireAuth,adminController.loadUsers)
admin_route.post("/change-status",adminController.changeStatus)
admin_route.post("/block/:userId",adminController.blockUser)


//Admin-Brands
admin_route.get("/brands",validate.requireAuth,brandController.loadBrand)
admin_route.post("/brands",upload.single('file'),brandController.addBrand)
admin_route.get("/brands/edit",validate.requireAuth,brandController.loadEditBrand)
admin_route.put("/brands/edit",upload.single('file'),brandController.updateBrand)
admin_route.delete("/brands/delete/:brandId",brandController.deleteBrand)


//Categories
admin_route.get("/categories",validate.requireAuth,categoryController.loadCategory)
admin_route.post("/categories",categoryController.addCategory)
admin_route.get("/categories/edit",validate.requireAuth,categoryController.loadEditCategory)
admin_route.put("/categories/edit",categoryController.updateCategory)
admin_route.delete("/categories/delete/:categoryId",categoryController.deleteCategory)

//Admin-Products
admin_route.get("/products",validate.requireAuth,productController.loadProducts)
admin_route.get("/addproduct",validate.requireAuth,productController.loadAddProduct)
admin_route.post("/addproduct",produpload.array('images', 3),productController.addProduct)
admin_route.get("/products/edit",validate.requireAuth,productController.loadEditProduct)
admin_route.post("/products/edit/deleteImg/:imgId",productController.deleteImage)
admin_route.put("/products/edit",produpload.array('images', 3),productController.updateProduct)
admin_route.post("/products/delete/:productId",productController.deleteProduct)

//Admin-Orders
admin_route.get("/orders",validate.requireAuth,orderController.loadOrders);
admin_route.get("/order-details",validate.requireAuth,orderController.adminLoadOrderDetails)
admin_route.get("/edit-order",validate.requireAuth,orderController.loadEditOrder)
admin_route.post("/edit-order",validate.requireAuth,orderController.updateOrderStatus)
admin_route.get("/acceptReturn",validate.requireAuth,orderController.acceptReturn)
admin_route.get("/rejectReturn",validate.requireAuth,orderController.rejectReturn)



//Admin-Coupons
admin_route.get("/coupons",validate.requireAuth,couponController.loadCoupons)
admin_route.post("/coupons",validate.requireAuth,couponController.addCoupons)
admin_route.get("/coupons/edit",validate.requireAuth,couponController.loadEditCoupon)
admin_route.put("/coupons/edit",validate.requireAuth,couponController.updateCoupon)
admin_route.delete("/coupons/delete",validate.requireAuth,couponController.deletecoupon)

//logout
admin_route.post("/logout",adminController.adminLogout)

//Sales Report
admin_route.get("/sales-report",validate.requireAuth,adminController.loadSales)
admin_route.post("/sales-report",validate.requireAuth,adminController.sortSales)
admin_route.get("/download-pdf",validate.requireAuth,adminController.downloadPdf)
admin_route.post("/sales-report/:time",validate.requireAuth,adminController.salesData)

//Dashboard
admin_route.post("/fetchData/:time",validate.requireAuth,adminController.fetchGraphData)


//banner
admin_route.get("/banner",validate.requireAuth,bannerController.loadBanner)
admin_route.post("/banner",upload.single('image'),validate.requireAuth,bannerController.addBanner)
admin_route.get("/editBanner",validate.requireAuth,bannerController.loadEditBanner)
admin_route.put("/editBanner",upload.single('image'),validate.requireAuth,bannerController.updateBanner)
admin_route.delete("/deleteBanner",validate.requireAuth,bannerController.deleteBanner)

module.exports=admin_route