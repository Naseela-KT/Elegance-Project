const mongoose=require("mongoose")
const User=require("../models/userModel")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const Products=require("../models/product")
const Brand=require("../models/brands")
const Order=require("../models/order")
const Coupon=require("../models/coupon")
const jwt = require('jsonwebtoken');
require('dotenv').config();



const totalQuantity=async(req,res)=>{
    try{
        const user_id=res.locals.user._id
        const user=await User.findOne({_id:user_id})
        let sum=0;
        for(let i=0;i<user.cart.length;i++){
            sum+=user.cart[i].quantity
        } 
        return sum;
    }catch(error){
        console.log(error.message);
    }
}

function generateUniqueOrderId() {
    const prefix = 'ORDER'; // Prefix for the order ID
    const timestamp = new Date().getTime(); // Current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 10000); // Random number between 0 and 9999

    const orderId = `${prefix}_${timestamp}_${randomNum}`;
    return orderId;
}


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.USER_JWT_SECRET_KEY, {
    expiresIn: maxAge
  });
};


var otpCode;
const sendOTP = async (req, res) => {
    try {
        const email = req.body.email;
        otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.USER_NAME,
                pass: process.env.USER_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.USER_NAME,
            to: email,
            subject: "Verification Code",
            text: `Your OTP code is: ${otpCode}`
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error("Error sending email: ", err);
                return res.status(500).json({ message: "Failed to send OTP email" });
            } else {
                console.log("Email sent: " + info.response);
                res.json({ message: "Email sent successfully", otpCode: otpCode });
            }
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Failed to send OTP email" });
    }
};

var verified=false;
const verifyOTP = async (req, res) => {
    try {
        const enteredOTP = req.body.otp;
        if (enteredOTP === otpCode) {
            verified=true;
            res.send("Success");
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const verifyEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const enteredOTP = req.body.otp;
        
        if (otpCode === enteredOTP) {
            res.render("reset-password", { email: email });
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};





const loadReset = async (req, res) => {
    try {
        res.render("reset-password");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};




const createDate=async(req,res)=>{
    try{
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth()+1).toString().padStart(2,'0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const newDate=`${day}.${month}.${year}`
        return newDate
    }catch(error){
        console.log(error.message);
    }
}


const securePassword=async(password)=>{
    try{
        if(password){
            const passwordHash=await bcrypt.hash(password,10)
            return passwordHash
        }
    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

const loadLogin=async(req,res)=>{
    try{
        if(res.locals.user!=null){
            res.redirect('/home')
        }else{
            res.render('user-login')
        }
        
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const loadRegister=async(req,res)=>{
    try{
        res.render("user-register")
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const loadForgotPwd=async(req,res)=>{
    try{
        res.render("forgot-password");
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const insertUser=async(req,res)=>{
    try{
        const referral=req.body.referral
        const code=Math.floor(1000 + Math.random() * 900000).toString();
        const email=req.body.email;
        const phone=req.body.phone;
        const checkEmail=await User.findOne({email:email});
        const checkPhone=await User.findOne({phone:phone});
        if(checkEmail){
            return res.render("user-register",{message:"Email already exist!"})
        }else if(checkPhone){
            return res.render("user-register",{message:"Phone already exist!"})
        }
        const spassword=await securePassword(req.body.password)
        const userDate=await createDate();
        if(referral){
            if(verified){
            const checkUser=await User.findOne({referral_code:referral});
            if(checkUser){
                checkUser.wallet=checkUser.wallet+500;
                await checkUser.save();
                const user=new User({
                    Name:req.body.name,
                    email:email,
                    phone:phone,
                    password:spassword,
                    is_admin:0,
                    createdOn:userDate,
                    is_verified:true,
                    referral_code:code,
                    wallet:200
                })
                const userData=await user.save();
                if(userData){
                    const token = createToken(userData._id);
                    
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    res.redirect("/home");
                }else{
                res.redirect("/register")
                }

            }else{
                return res.render("user-register",{message:"Invalid referral Code!"})
            }
        }
        }else{
        if(verified){
            const user=new User({
                Name:req.body.name,
                email:email,
                phone:phone,
                password:spassword,
                is_admin:0,
                createdOn:userDate,
                is_verified:true,
                referral_code:code
            })
            const userData=await user.save();
           
            if(userData){
                const token = createToken(userData._id);
                
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.redirect("/home");
            }else{
            res.redirect("/register")
            }
        }else{
            res.redirect("/register")

        }
    }
        
    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

const resetpwd=async(req,res)=>{
    try{
        const email=req.body.email;
        const pwd=req.body.newpassword
        const userData=await User.findOne({email:email});
        if(userData){
            const spassword=await securePassword(pwd)
            const updatepwd=await User.updateOne({email:email},{$set:{password:spassword}});
            if(updatepwd){
                res.redirect("/login");
            }else{
                res.redirect("/register");
            }
           
        }
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const verifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (!userData.is_blocked) {
                    const token = createToken(userData._id);
                    req.session.user = userData._id;
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    return res.redirect("/home");
                } else {
                    res.status(403).render("user-login", { message: "Your account has been blocked by the admin." });
                }
            } else {
                res.status(401).render("user-login", { message: "Invalid Credentials" });
            }
        } else {
            res.status(401).render("user-login", { message: "Invalid Credentials" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};



const loadHome=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const user=await User.findOne({_id:user_id})
        const menProducts=await Products.find({gender:"Male"})
        const womenProducts=await Products.find({gender:"Female"})
        const quantity=await totalQuantity(req,res)
        const brands=await Brand.find({})
        const products=await Products.find({})
        if(products){
            res.render("index",{products:products,brands:brands,quantity:quantity,men:menProducts,women:womenProducts,userData:user})
        }
    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

const logoutUser=async(req,res)=>{
    try{
        res.cookie('jwt', '' ,{maxAge : 1})
        res.redirect('/login')
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


//WISHLIST

// const loadWishlist=async(req,res)=>{
//     try{
//         const user_id = res.locals.user._id;
//         const quantity=await totalQuantity(req,res)
//         const userwishlist = await User.findById({ _id: user_id }).populate('wishlist.productId');
//         const productsInWishlist = userwishlist.wishlist.map(wishItem => wishItem.productId);
//         const user = await User.findOne({ _id:user_id });
//         res.render("wishlist",{userData:user,products:productsInWishlist,quantity:quantity})
//     }catch(error){
//         console.log(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// }
const loadWishlist = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const quantity = await totalQuantity(req, res);

        const userWishlist = await User.aggregate([
            { $match: { _id:user_id } },
            {
                $lookup: {
                    from: 'products', 
                    localField: 'wishlist.productId',
                    foreignField: '_id',
                    as: 'wishlistProducts'
                }
            },
            // {
            //     $unwind: {
            //         path: '$wishlistProducts',
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            {
                $project: {
                    _id: 0,
                    wishlistProducts: 1
                }
            }
        ]);
        const productsInWishlist = userWishlist[0].wishlistProducts;
        
        const user = await User.findOne({ _id: user_id });

        res.render("wishlist", { userData: user, products: productsInWishlist, quantity: quantity });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};





const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user_id = res.locals.user._id;
        const productExists = await Products.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' }); // Status Code 404: Not Found
        }

        const isAdded = await User.findOne({
            _id: user_id,
            'wishlist.productId': productId
        });

        if (isAdded) {
            return res.status(200).json({ message: 'Product is already in the wishlist' }); // Status Code 200: OK
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: user_id },
            {
                $push: {
                    wishlist: {
                        productId: productId,
                    }
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: 'Product successfully added to wishlist', user: updatedUser }); // Status Code 200: OK
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' }); // Status Code 500: Internal Server Error
    }
};


// const moveToBag = async (req, res) => {
//     try {
//         const prodId = req.query.id;
//         console.log(prodId);
//         const user_id = res.locals.user._id;
//         const existingProduct = await User.findOne({
//             _id: user_id,
//             'cart.productId': prodId,
//         });

//         if (existingProduct) {
//             await User.updateOne(
//                 { _id: user_id },
//                 { $pull: { wishlist: { productId: prodId } } }
//             );
//             return res.status(200).redirect("/wishlist"); // Status Code 200: OK
//         } else {
//             const product = await Products.findOne({ _id: prodId });
//             if (!product) {
//                 return res.status(404).json({ message: 'Product not found' }); // Status Code 404: Not Found
//             }
//             const size = product.sizes[0].size;
//             await User.updateOne(
//                 {
//                     _id: user_id
//                 },
//                 {
//                     $push: {
//                         cart: {
//                             productId: prodId,
//                             quantity: 1,
//                             size: size
//                         }
//                     }
//                 }
//             );
//             await User.updateOne(
//                 { _id: user_id },
//                 { $pull: { wishlist: { productId: prodId } } }
//             );
//             await Products.updateOne({_id:prodId,"Sizes.size":size},{$inc:{stock:-1}})
//             return res.status(200).redirect("/wishlist"); // Status Code 200: OK
//         }

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' }); // Status Code 500: Internal Server Error
//     }
// };
const moveToBag = async (req, res) => {
    try {
        const prodId = req.query.id;
        const user_id = res.locals.user._id;
        const existingProduct = await User.findOne({
            _id: user_id,
            'cart.productId': prodId,
        });

        if (existingProduct) {
            await User.updateOne(
                { _id: user_id },
                { $pull: { wishlist: { productId: prodId } } }
            );
            console.log('Product removed from wishlist');
            return res.status(200).redirect("/wishlist");
        } else {
            const product = await Products.findOne({ _id: prodId });
            if (!product) {
                console.log('Product not found');
                return res.status(404).json({ message: 'Product not found' });
            }

            const size = product.sizes[0].size;
            

            await User.updateOne(
                {
                    _id: user_id
                },
                {
                    $push: {
                        cart: {
                            productId: prodId,
                            quantity: 1,
                            size: size
                        }
                    }
                }
            );
            await User.updateOne(
                { _id: user_id },
                { $pull: { wishlist: { productId: prodId } } }
            );
            
            await Products.updateOne({ _id: prodId, "sizes.size": size }, { $inc: { "sizes.$.stock": -1 } });
            console.log('Product moved to cart and stock decremented');
            return res.status(200).redirect("/wishlist");
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};




const deleteWishlistItem=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id:user_id });
        if (user) {
            user.wishlist.pull(req.query.itemId);
            await user.save();
            res.redirect("/wishlist");
        } else {
            res.status(404).send("User not found"); // Handle the case where the user is not found
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}


//PROFILE
const loadProfile=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const quantity=await totalQuantity(req,res)
        const user=await User.find({_id:user_id})
        const orders=await Order.find({customerId:user_id})
        const coupons=await Coupon.find({})
        const transactionDetails=user[0].transactionDetails
        if(user){
            res.render("profile",{userData:user,orders:orders,quantity:quantity,coupons:coupons,transaction:transactionDetails})
        }
        
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const updateProfile=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const userData=await User.find({_id:user_id})
        if(userData){
            const updateData=await User.updateOne({_id:user_id},{$set:{
                Name:req.body.profilename,
                phone:req.body.profilemobile
            }});
            if(updateData){
                res.redirect("/profile");
            }
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}


const changePassword=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const newpassword=await securePassword(req.body.upassword)
        const updatePwd=await User.updateOne({_id:user_id},{$set:{
            password:newpassword
        }})
        if(updatePwd){
            res.redirect("/profile");
        }
        
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const addAddress=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const address=await User.updateOne({_id:user_id},{$push:{
            "address":{
                name:req.body.adname,
                mobile:req.body.admobile,
                housename:req.body.adhname,
                area:req.body.adarea,
                city:req.body.adcity,
                state:req.body.adstate,
                pincode:req.body.adpin
            }
        }})
        if(address){
            res.redirect("/profile");
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const editAddress=async(req,res)=>{
    try{
        const quantity=await totalQuantity(req,res)
        const userData=await User.find({"address._id":req.query.addressid})
        res.render("editAddress",{user:userData,quantity:quantity})
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const updateAddress=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        console.log(req.body.addressId);
            const user = await User.findOneAndUpdate(
                { _id: user_id, 'address._id': req.body.addressId },
                {
                    $set: {
                        "address.$.name":req.body.adname,
                        "address.$.mobile":req.body.admobile,
                        "address.$.housename":req.body.adhname,
                        "address.$.area":req.body.adarea,
                        "address.$.city":req.body.adcity,
                        "address.$.state":req.body.adstate,
                        "address.$.pincode":req.body.adpin
                    },
                },
                { new: true }
            );
    
            if (user) {
                res.redirect('/profile')
            }else{
                res.redirect('/profile')
            }
    
            
            }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const deleteAddress=async(req,res)=>{
    try {
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id:user_id });
        if (user) {
            user.address.pull(req.query.addressid);
            await user.save();
            res.redirect("/profile");
        } else {
            res.status(404).send("User not found"); // Handle the case where the user is not found
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error"); // Handle other errors
    }
    
}

const loadChangeEmail=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id:user_id });
        const quantity=await totalQuantity(req,res)
        res.render("changeEmail",{quantity:quantity,userData:user})
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const updateEmail=async(req,res)=>{
    try{
        const email=req.body.editemail;
        const user_id=res.locals.user._id
        const checkEmail=await User.findOne({email:email});
        if(checkEmail){
            return res.render("changeEmail",{message:"Email already exist!"})
        }
        if(verified){
            const updateEmail=await User.findOneAndUpdate({_id:user_id},{$set:{email:email}});
            if(updateEmail){
                res.redirect("/profile");
            }
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

//cart
const loadCart=async(req,res)=>{
    try {
        const user_id = res.locals.user._id;
        const quantity=await totalQuantity(req,res)
        const userData = await User.findById({ _id: user_id });
        const user = await User.findById({ _id: user_id }).populate('cart.productId');
        const productsInCart = user.cart.map(cartItem => cartItem.productId);
        let sum=0;
        for(let i=0;i<user.cart.length;i++){
            const val=(user.cart[i].productId.salePrice)*(user.cart[i].quantity)
            sum+=val;
        }
        if (userData) {
            res.render('cart', { productsInCart: productsInCart, userData: userData,total:sum,quantity:quantity})

        }
        else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}


const deleteCartItem = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id: user_id });
        const itemId = req.query.itemId;

        if (user) {
            const item = user.cart.find(cartItem => cartItem._id == itemId);
            if (item) {
                const { size, quantity, productId } = item;

                await Products.updateOne(
                    { _id: productId, "sizes.size": size, "sizes.stock": { $gte: quantity } },
                    { $inc: { "sizes.$.stock": quantity } }
                );
                user.cart.pull(itemId);
                await user.save();
                res.redirect("/cart");
            } else {
                res.status(404).send("Item not found in the cart");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const updateQuantity = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const itemId = req.body.itemId;
        const operation = req.body.operation;
        const size=req.body.size;

        const user = await User.findOne({ _id: user_id, "cart._id": itemId });
        
            if (user) {
            const cartItem = user.cart.find(item => item._id.toString() === itemId);
            if (cartItem) {
                const productId = cartItem.productId; // Assuming the productId is stored in the cartItem
                const product = await Products.findById(productId);
                const getStock = await Products.findOne(
                    { 
                        _id: productId, 
                        "sizes": { 
                            $elemMatch: { 
                                size: size, 
                                stock: 0 
                            } 
                        } 
                    }
                );
                
                if(getStock && operation==1){
                    return res.json({ error: "No more Stocks",newQuantity:cartItem.quantity});
                }
                if (product) {
                    // Update quantity and calculate new subtotal
                    cartItem.quantity = parseInt(cartItem.quantity);
                    cartItem.quantity += parseInt(operation);
                    cartItem.quantity = Math.max(1, cartItem.quantity);
                    if(operation==1){
                        await Products.updateOne(
                            { _id: productId, "sizes.size": size, "sizes.stock": { $gt: 0 } },
                            { $inc: { "sizes.$.stock": -1 } }
                          );
                    }else{
                        await Products.updateOne(
                            { _id: productId, "sizes.size": size, "sizes.stock": { $gt: 0 } },
                            { $inc: { "sizes.$.stock": 1 } }
                          );
                    }
                    // Calculate new subtotal
                    const newSubtotal = cartItem.quantity * product.salePrice;

                    await user.save();
                    return res.status(200).json({ message: "Quantity updated successfully", newQuantity: cartItem.quantity, newSubtotal: newSubtotal,salePrice:product.salePrice });
            } else {
                res.status(404).json({ error: "Cart item not found" });
            }
        } else {
            res.status(404).json({ error: "User not found" });
        }
        
        
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}};

const addToCart = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const { productId, size } = req.body;

        // Check if the product with the given productId and size exists in the user's cart
        const existingProduct = await User.findOne({
            _id: user_id,
            'cart.productId': productId,
            'cart.size': size
        });

        if (existingProduct) {
            // If the product with the given productId and size already exists, increase the quantity
            const updatedUser = await User.updateOne(
                {
                    _id: user_id,
                    'cart.productId': productId,
                    'cart.size': size
                },
                {
                    $inc: {
                        'cart.$.quantity': 1
                    }
                }
            );
            await Products.updateOne(
                { _id: productId, "sizes.size": size, "sizes.stock": { $gt: 0 } },
                { $inc: { "sizes.$.stock": -1 } }
            );

            if (updatedUser.modifiedCount > 0) {
                // Successfully increased the quantity of the existing product in the cart
                res.redirect("/cart");
            } else {
                // Error occurred during the update, handle the situation accordingly
                res.status(500).json({ error: 'Error updating the cart' });
            }
        } else {
            // If the product with the given productId and size doesn't exist, add a new product to the cart
            const updatedUser = await User.updateOne(
                {
                    _id: user_id
                },
                {
                    $push: {
                        cart: {
                            productId: productId,
                            quantity: 1,
                            size: size
                        }
                    }
                }
            );
            await Products.updateOne(
                { _id: productId, "sizes.size": size, "sizes.stock": { $gt: 0 } },
                { $inc: { "sizes.$.stock": -1 } }
            );

            if (updatedUser.modifiedCount > 0) {
                // Successfully added the new product to the cart
                res.redirect("/cart");
            } else {
                // Error occurred during the update, handle the situation accordingly
                res.status(500).json({ error: 'Error updating the cart' });
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const moveToWishlist=async(req,res)=>{
    try{
        const itemId=req.query.itemId;
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id: user_id });
        const item = user.cart.find(cartItem => cartItem._id == itemId);
        const { size, quantity, productId } = item;
        const productExists = await Products.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const isAdded=await User.findOne({
            _id: user_id,
            'wishlist.productId': productId
        })
        if(isAdded){
                await Products.updateOne(
                    { _id: productId, "sizes.size": size, "sizes.stock": { $gte: quantity } },
                    { $inc: { "sizes.$.stock": quantity } }
                );
                user.cart.pull(itemId);
                await user.save();
                res.redirect("/wishlist");
        }else{
            await User.findOneAndUpdate(
                { _id: user_id },
                {
                    $push: {
                        wishlist: {
                            productId: productId,
                        }
                    }
                }, 
                { new: true }
            );
            await Products.updateOne(
                { _id: productId, "sizes.size": size, "sizes.stock": { $gte: quantity } },
                { $inc: { "sizes.$.stock": quantity } }
            );
            user.cart.pull(itemId);
            res.redirect("/wishlist")
        }
        

        return res.status(200).json({ message: 'Product added to wishlist successfully'});

    }catch(error){
        console.log(error.message);
    }
}



module.exports={
    loadLogin,
    verifyUser,
    loadRegister,
    insertUser,
    loadHome,
    sendOTP,
    verifyOTP,
    loadForgotPwd,
    verifyEmail,
    loadReset,
    resetpwd,
    logoutUser,
    //wishlist
    loadWishlist,
    addToWishlist,
    moveToBag,
    deleteWishlistItem,
    //PROFILE
    loadProfile,
    updateProfile,
    changePassword,
    addAddress,
    editAddress,
    updateAddress,
    deleteAddress,
    loadChangeEmail,
    updateEmail,

    //cart
    addToCart,
    loadCart,
    updateQuantity,
    moveToWishlist,
    deleteCartItem
}