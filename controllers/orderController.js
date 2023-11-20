const ejs = require('ejs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const User=require("../models/userModel")
const Products=require("../models/product")
const Order=require("../models/order")
const Coupon=require("../models/coupon")


require('dotenv').config();

const Razorpay = require('razorpay');
const category = require("../models/category");
const instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET
});

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


//USER

const loadOrderDetails = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const user=await User.findOne({_id:user_id})
        const orderId = req.query.orderId;
        const quantity = await totalQuantity(req, res);
        const customer = await Order.findOne({ _id: orderId }).populate('customerId');
        const products = await Order.findOne({ _id: orderId }, { Items: 1 }).populate({
            path: 'Items.productId',
            model: 'product'
        });
        const order = await Order.findOne({ _id: orderId });

        if (!customer || !products || !order) {
            return res.status(404).render("error", { message: "Order not found." });
        }

        res.render("order-details", { order: order, customer: customer, products: products, address: order.Address, quantity: quantity,userData:user });
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};



const cancelOrder = async (req, res) => {
    try {
        const date = new Date();
        const orderId = req.query.orderId;
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id: user_id });
        const order = await Order.findOne({ _id: orderId });

        if (!user || !order) {
            return res.status(404).render("error", { message: "Order not found." });
        }

        const update = await Order.updateOne({ _id: orderId }, { $set: { status: "Cancelled" } });

        if (update) {
            const products = await Order.findOne({ _id: orderId }, { Items: 1 }).populate({
                path: 'Items.productId',
                model: 'product'
            });

            if (!products) {
                return res.status(404).render("error", { message: "Products not found." });
            }

            for (let i = 0; i < products.Items.length; i++) {
                let productId = products.Items[i].productId;
                let product = await Products.findById(productId);

                if (product) {
                    product.stock = product.stock + products.Items[i].quantity;
                    await product.save();
                }
            }

            if (order.paymentMethod === "Razorpay") {
                user.wallet = user.wallet + order.totalAmount;
                await user.transactionDetails.push({
                    transactionType: "Credit",
                    transactionAmount: order.totalAmount,
                    transactionDate: date,
                    orderId: order._id
                });
                await user.save();
            }

            res.redirect("/order-details?orderId=" + orderId);
        } else {
            return res.status(500).render("error", { message: "Internal Server Error" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};





const returnOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const returnReason = req.body.returnReason;
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id: user_id });
        const order = await Order.findOne({ _id: orderId });

        if (!user || !order) {
            return res.status(404).render("error", { message: "Order not found." });
        }

        const updateOrder = await Order.updateOne({ _id: orderId }, {
            $set: {
                return: true,
                returnReason: returnReason,
                returnStatus: "Return requested"
            }
        });


        if (updateOrder.modifiedCount > 0) {
            user.wallet = user.wallet + order.totalAmount;
            await user.save();
            res.redirect("/order-details?orderId=" + orderId);
        } else {
            return res.status(500).render("error", { message: "Failed to request return." });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render("error", { message: "Internal Server Error" });
    }
};

const downloadInvoice=async(req,res)=>{
    try{
        const orderId=req.query.orderId;
        const order = await Order.findById(orderId)
        
        let productName=[];
        for(let i=0;i<order.Items.length;i++){
            const id=order.Items[i].productId;
            const product=await Products.findOne({_id:id});
            productName.push(product.productName)
        }
        const html = await ejs.renderFile('views/user/invoice.ejs',{order:order,address:order.Address,items:order.Items,product:productName});
        const browser = await puppeteer.launch({headless: 'new'});
       const page = await browser.newPage();
       await page.setContent(html);
       const pdfBuffer = await page.pdf();
       await browser.close();
  
       res.setHeader('Content-Type', 'application/pdf');
       res.setHeader('Content-Disposition', `attachment; filename=invoice.pdf`);
       res.send(pdfBuffer);

    }catch(error){
        console.log(error.message);
    }
}

// const downloadInvoice = async(req,res)=>{
//     try {
//       const id = req.query.id
//       const order = await Order.findOne({ _id: id });
//       const addressData = order.Address;
//       const Orderr = await Order.findOne({ _id: id }).populate(
//         "Items.productId"
//       );
      
//       const productData = Orderr.Items.map((item) => {
//         return item.productId;
//       });
  
//       const templatePath = './views/user/invoice.ejs';
//       const templateContent = await fs.readFile(templatePath, 'utf-8');
//       const htmlTemplate = ejs.render(templateContent, { Orderr : Orderr , addressData:addressData , productData:productData ,  items: Orderr.Items });
  
//        // Generate PDF using Puppeteer
//        const browser = await puppeteer.launch();
//        const page = await browser.newPage();
//        await page.setContent(htmlTemplate);
//        const pdfBuffer = await page.pdf();
//        await browser.close();
  
//        res.setHeader('Content-Type', 'application/pdf');
//        res.setHeader('Content-Disposition', `attachment; filename=invoice-${ req.query.id}.pdf`);
//        res.send(pdfBuffer);
//     } catch (error) {
//       console.error('Error generating or sending PDF:', error);
//       res.status(500).send('Internal Server Error');
//     }
//   }



const loadverify = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const { payment, order } = req.body;
        let or = JSON.parse(order);
        let orderid = or.receipt;
        const success = await User.updateOne({ _id: user_id }, { $set: { cart: [] } });
        console.log(success);
        if (success.modifiedCount > 0) {
            res.json({ orderid: orderid });
        } else {
            res.json({ message: "Failed to update user cart." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};





const generateOrderID=async()=>{
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return randomNum.toString();
}


const orderconfirmation = async (req, res) => {
    try {
        var sumdiscount=0;
        const user_id = res.locals.user._id;
        const payment=req.body.paymentMethod
        const coupondiscount=req.body.discount
        const categorydiscount=req.body.categorydiscount
        if(coupondiscount>0){
            const coupon=await Coupon.findOne({_id:req.session.coupon});
            coupon.Customers.push(user_id);
            await coupon.save();
        }

        let paymentMethod
        if(payment=="cod"){
            paymentMethod="Cash On Delivery"
        }else{
            paymentMethod="Razorpay"
        }



        function generateRazorpay(orderid , totalamount){
            return new Promise((resolve,reject)=>{
                var options={
                    amount:totalamount*100,
                    currency:"INR",
                    receipt:orderid
                };
                instance.orders.create(options , function(error,order){
                    if(error){
                        console.log(error)
                    }else{
                        console.log("sending resolve")
                        resolve(order)
                    }
                });
            })
         }


        
        const userData = await User.findOne({ _id: user_id });
        const user = await User.findById({ _id: user_id }).populate('cart.productId');
        var sum=0,priceArr=[],quantityArr=[];
        for(let i=0;i<user.cart.length;i++){
            const cartItem=user.cart[i]
            const val=(user.cart[i].productId.salePrice)*(user.cart[i].quantity)
            priceArr.push(val);
            quantityArr.push(user.cart[i].quantity)
            sum+=val;
            if (cartItem.productId.category) {
                const checkCategory=await category.findOne({categoryName:cartItem.productId.category})
                if(checkCategory.categoryOffer){
                    const date=new Date()
                    var catdiscount=Math.ceil((val*checkCategory.categoryOffer)/100)
                    if(date<=checkCategory.expiry && val>=checkCategory.minAmount){
                       if(catdiscount<=checkCategory.maxDiscount){
                            sumdiscount=sumdiscount+catdiscount
                       }else{
                            continue;
                       }
                    }else{
                        continue;
                    }
                    offer=true;
                }
                
            }
        }
        sum-=sumdiscount;
        const address = await User.findOne(
            { _id: user_id, "address.active": true },
            { "address.$": 1 }
        );

        const products = await Products.find({ _id: { $in: userData.cart.map(item => item.productId) } });

        const itemsToAdd = userData.cart.map(cartItem => {
            const product = products.find(p => p._id.toString() === cartItem.productId.toString());

            if (product) {
                const subtotal = cartItem.quantity * product.salePrice;

                return {
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    size: cartItem.size,
                    subtotal: subtotal
                };
            } else {
               
                console.log(`Product with ID ${cartItem.productId} not found.`);
                return null;
            }
        });
      

        const validItems = itemsToAdd.filter(item => item !== null);
        const date=new Date();
        const orderId=await generateOrderID()
        const newOrder = new Order({
            customerId: user_id,
            Address: {
                name:address.address[0].name,
                mobile:address.address[0].mobile,
                housename:address.address[0].housename,
                area:address.address[0].area,
                city:address.address[0].city,
                state:address.address[0].state,
                pincode:address.address[0].pincode
            },
            paymentMethod: paymentMethod,
            Items: validItems,
            shippingcharge:0,
            coupondiscount:coupondiscount,
            categorydiscount:categorydiscount,
            totalAmount:sum-coupondiscount,
            createdOn:date,
            orderId:orderId

        });

        await newOrder.save();
        for (let i = 0; i < user.cart.length; i++) {
            let productId = user.cart[i].productId
            let product = await Products.findById(productId)
            product.stock = product.stock - user.cart[i].quantity
            await product.save()
        }
        
        if (paymentMethod ==="Cash On Delivery") {
            await User.updateOne({ _id: user_id }, { $set: { cart: [] } });
            console.log("user selected cash on delivery for order and products deleted from cart");
            res.json({ codsuccess: true });
        } else {
            generateRazorpay(newOrder.orderId, sum - coupondiscount).then((response) => {
                console.log("razor pay work started:", response);
                res.json(response);
            });
        }
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const loadConfirm = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const userData = await User.findOne({ _id: user_id });
        const orders=await Order.find({customerId:user_id})
        const orderId=orders[orders.length-1]._id;
        if (userData) {
            res.render("delivery",{orderId:orderId});
        } else {
            res.status(404).render("error", { message: "User not found" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};



const loadCheckout = async (req, res) => {
    try {
        var offer=false;
        var sumdiscount=0;
        const user_id = res.locals.user._id;
        const quantity = await totalQuantity(req, res);
        const userData = await User.find({ _id: user_id });
        const user = await User.findById({ _id: user_id }).populate('cart.productId');
        const productsInCart = user.cart.map(cartItem => cartItem.productId);
        let sum = 0, priceArr = [], quantityArr = [];
        for (let i = 0; i < user.cart.length; i++) {
            const cartItem = user.cart[i];
            const val = (user.cart[i].productId.salePrice) * (user.cart[i].quantity);
            priceArr.push(val);
            quantityArr.push(user.cart[i].quantity);
            sum += val;

             // Apply the offer to the product total
            if (cartItem.productId.category) {
                const checkCategory=await category.findOne({categoryName:cartItem.productId.category})
                if(checkCategory.categoryOffer){
                    const date=new Date()
                    var discount=Math.ceil((val*checkCategory.categoryOffer)/100)
                    if(date<=checkCategory.expiry && val>=checkCategory.minAmount){
                       if(discount<=checkCategory.maxDiscount){
                            sumdiscount=sumdiscount+discount
                       }else{
                            continue;
                       }
                    }else{
                        continue;
                    }
                    offer=true;
                }
                
            }
        }
        sum-=sumdiscount;
        if (userData[0].address.length > 0) {
            userData[0].address[0].active = true;
        }
        res.render("checkout", { productsInCart: productsInCart, userData: userData, total: sum, price: priceArr, quantityy: quantityArr, quantity: quantity,catDiscount:sumdiscount});
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




const selectAddress = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const selectedAddressId = req.body.selectedAddressId; 
        const user = await User.findById(user_id);
        if (user) {
            for (let i = 0; i < user.address.length; i++) {
                if (user.address[i]._id.toString() === selectedAddressId) {
                    user.address[i].active = true;
                } else {
                    user.address[i].active = false;
                }
            }
            await user.save();
            res.json({ message: "Address selected successfully" });
        } else {
            res.json({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};








const addCheckoutAddress=async(req,res)=>{
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
            res.redirect("/checkout");
        } else {
            res.status(500).render("error", { message: "Failed to add address" });
        }
    }catch(error){
        console.log(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}




//ADMIN

const loadOrders=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    try{
        const customer=await Order.find({}).populate('customerId');
        const orders=await Order.find({}).skip((page - 1) * 7).limit(7);
        const totalOrders = await Order.find({}).countDocuments();
        const totalPages = Math.ceil(totalOrders / 7);
        res.render("orders",{
            orders:orders,
            customer:customer,
            currentPage: page,
            totalPages: totalPages
        });
    }catch(error){
        console.log(error.message);
    }
}

const adminLoadOrderDetails=async(req,res)=>{
    try{
        const orderId=req.query.orderId;
        const customer = await Order.findOne({ _id: orderId }).populate('customerId')
        const products=await Order.findOne({_id:orderId},{Items:1}).populate({
            path: 'Items.productId',
            model: 'product' 
        });
        const order=await Order.findOne({_id:orderId});
       
        res.render("order-details",{order:order,customer:customer,products:products,address:order.Address})
    }catch(error){
        console.log(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}

const loadEditOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.find({ _id: orderId });
        if (!order) {
            res.status(404).render("error", { message: "Order not found" });
            return;
        }
        res.render("editOrder", { order: order });
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.body.id;
        const statusValue = req.body.status;
        const date = new Date();
        const order=await Order.findOne({_id:orderId});
        const customer=await User.findOne({_id:order.customerId});
        const products = await Order.findOne({ _id: orderId }, { Items: 1 }).populate({
            path: 'Items.productId',
            model: 'product'
        });

        if (statusValue === "Cancelled") {
            for (let i = 0; i < products.Items.length; i++) {
                let productId = products.Items[i].productId;
                let product = await Products.findById(productId);
                product.stock = product.stock + products.Items[i].quantity;
                await product.save();
            }
        }

        if (statusValue === "Delivered") {
            if(!customer.referralPurchase){
                customer.referralPurchase=true
        
                const userRef=await User.findOne({referral_code:customer.usedReferral})
                if(userRef){
                    userRef.wallet=parseInt(userRef.wallet+300)
                    userRef.transactionDetails.push({transactionType:"Referral",transactionAmount:300,transactionDate:new Date()})
                    await userRef.save()
                    customer.wallet=200
                    customer.transactionDetails.push({transactionType:"Referral",transactionAmount:200,transactionDate:new Date()})
                    await customer.save()
                }
            }
            await Order.updateOne({ _id: orderId }, {
                $set: {
                    status: statusValue,
                    deliveredOn: date
                }
            });
            return res.redirect("/admin/orders");
        }

        const update = await Order.updateOne({ _id: orderId }, { $set: { status: statusValue } });

        if (update.modifiedCount > 0) {
            res.redirect("/admin/orders");
        } else {
            res.status(404).render("error", { message: "Order not found or status updation failed." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};





const acceptReturn = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findOne({ _id: orderId });
        const user_id = order.customerId;
        const user = await User.findOne({ _id: user_id });

        if (order) {
            for (let i = 0; i < order.Items.length; i++) {
                const productId = order.Items[i].productId;
                const size = order.Items[i].size;
                const quantity = order.Items[i].quantity;
                const updateProduct = await Products.updateOne(
                    { 
                        _id: productId, 
                        "sizes": { 
                            $elemMatch: { 
                                "size": size
                            } 
                        } 
                    },
                    { 
                        $inc: { "sizes.$.stock": quantity } 
                    }
                );

                if (!updateProduct.modifiedCount>0) {
                    return res.status(500).render("error", { message: "Internal Server Error" });
                }
            }

            const updateOrder = await Order.updateOne({ _id: orderId }, {
                $set: {
                    returnStatus: "Return Accepted",
                    return: false
                }
            });

            if (updateOrder.modifiedCount > 0) {
                user.wallet = user.wallet + order.totalAmount;
                await user.save();
                return res.redirect("/admin/orders");
            } else {
                return res.status(500).render("error", { message: "Internal Server Error" });
            }
        } else {
            return res.status(404).render("error", { message: "Order not found." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};



const rejectReturn = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findOne({ _id: orderId });
        if (order) {
            const updateOrder = await Order.updateOne({ _id: orderId }, {
                $set: {
                    returnStatus: "Return Rejected",
                    return: false
                }
            });

            if (updateOrder.modifiedCount > 0) {
                return res.redirect("/admin/orders");
            } else {
                return res.status(500).render("error", { message: "Internal Server Error" });
            }
        } else {
            return res.status(404).render("error", { message: "Order not found." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




module.exports={
    loadOrderDetails,
    cancelOrder,
    returnOrder,
    downloadInvoice,
    orderconfirmation,
    loadverify,
    loadConfirm,
    loadCheckout,
    selectAddress,
    addCheckoutAddress,
    //admin
    loadOrders,
    adminLoadOrderDetails,
    loadEditOrder,
    updateOrderStatus,
    acceptReturn,
    rejectReturn
}