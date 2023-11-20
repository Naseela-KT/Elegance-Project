const User=require("../models/userModel")
const Category=require("../models/category")
const Brands=require("../models/brands");
const Products=require("../models/product")
const Admin=require("../models/admin")
const bcrypt=require("bcrypt")
const jwt = require('jsonwebtoken');
const Order=require("../models/order");
const Coupon=require("../models/coupon")
const pdfMake = require('pdfmake');
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const vfsFonts = require('pdfmake/build/vfs_fonts');
const fs = require('fs');
require('dotenv').config();
const path=require("path")




pdfMake.vfs = vfsFonts.pdfMake.vfs;


const generatePDF = async (salesData) => {
    const fonts = {
        Roboto: {
            normal: path.resolve(__dirname, '../public/admin/assets/fonts/Roboto/Roboto-Regular.ttf'),
        bold: path.resolve(__dirname, '../public/admin/assets/fonts/Roboto/Roboto-Bold.ttf'),
        italics: path.resolve(__dirname, '../public/admin/assets/fonts/Roboto/Roboto-Italic.ttf'),
        bolditalics: path.resolve(__dirname, '../public/admin/assets/fonts/Roboto/Roboto-BoldItalic.ttf')
        }
    };

    const printer = new pdfMake(fonts);
    const docDefinition = {
        content: [
            { text: 'Sales Report', style: 'header' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        ['OrderId', 'Name', 'Email', 'Date', 'Order Status', 'Amount', 'Payment Type'],
                        ...salesData.map(sale => [
                            sale.orderId,
                            sale.userName,
                            sale.userEmail,
                            new Date(sale.orderDate).toLocaleDateString('en-GB'),
                            sale.status,
                            `₹${sale.totalAmount}`,
                            sale.paymentMethod
                        ])
                    ]
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            }
        }
    };



    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks = [];
            
            pdfDoc.on('data', chunk => {
                chunks.push(chunk);
            });

            pdfDoc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });

            pdfDoc.on('error', error => {
                reject(error);
            });

            pdfDoc.end();
        } catch (error) {
            reject(error);
        }
    });
};



const getSalesData=async(date)=>{
    if(date){
        const startDate = new Date(`${date}T00:00:00.000Z`); 
            const endDate = new Date();
            const salesReport = await Order.aggregate([
                {
                    $match: {
                        $or: [
                            { createdOn: { $gte: startDate, $lte: endDate } },
                            { deliveredOn: { $gte: startDate, $lte: endDate } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            ]);
            return salesReport
    }
    const salesReport = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'customerId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                orderId: '$orderId',
                userName: '$userDetails.Name',
                userEmail: '$userDetails.email',
                orderDate: '$createdOn',
                deliveredOn: '$deliveredOn',
                status: '$status',
                totalAmount: '$totalAmount',
                paymentMethod: '$paymentMethod'
            }
        }
    
    ]);
    return salesReport
}



const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SECRET_KEY, {
    expiresIn: maxAge
  });
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


const titleCase=async(categoryName)=>{
    try{
        const noSpecialCharacters = categoryName.replace(/[^a-zA-Z]/g, '');
        const newName=noSpecialCharacters.charAt(0).toUpperCase() +
        noSpecialCharacters.substr(1).toLowerCase();
        return newName;
    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard=async(req,res)=>{
    try{
        res.render("index")
    }catch(error){
        console.error("Error loading dashboard:", error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}


const loadUsers=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    try{
        const userList=await User.find({is_admin:0}).skip((page - 1) * 7).limit(7);
        const totalUsers = await User.find({is_admin:0}).countDocuments();
        const totalPages = Math.ceil(totalUsers / 7);
        res.render("page-users",{
            users:userList,
            currentPage: page,
            totalPages: totalPages
        })
    }catch(error){
        console.error("Error loading users:", error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}

const blockUser=async(req,res)=>{
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).send('User not found');
        }
    
        user.is_blocked = !user.is_blocked;
        await user.save();
    
        res.redirect('/admin/user_management');
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
}

const loadLogin=async(req,res)=>{
    try{
        if(res.locals.admin!=null){
            res.redirect('/admin/dashboard')
        }else{
            res.render("admin-login")
        }
       
    }catch(error){
        console.error("Error loading login page:", error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}


const verifyLogin=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const adminData=await Admin.findOne({email:email})
        if(adminData){
            const passwordMatch=await bcrypt.compare(password,adminData.password);
            if(passwordMatch){
                const token = createToken(adminData._id);
                res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.redirect("/admin/dashboard");
            }else{
                return res.status(401).render("admin-login", { message: "Invalid credentials!" });
            }
        }else{
            return res.status(401).render("admin-login", { message: "Invalid credentials!" });
        }
    }catch(err){
        console.error("Error during login:", err.message);
        return res.status(500).render("error", { message: "Internal Server Error" }); 
    }
}




const changeStatus = async (req, res) => {
    try {
        const email = req.body.email; 
        const userData = await User.findOne({ email: email });

        if (userData) {
            await User.updateOne({ email: email }, { $set: { active: false } });
            res.status(200).send("User status changed successfully");
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error changing user status:", error.message);
        res.status(500).send("Internal Server Error");
    }
};


const loadSales = async (req, res) => {
    try {
        
            const salesReport = await Order.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            
            ]);
            return res.render("salesReport", { sales: salesReport });
        }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }}



const sortSales = async (req, res) => {
    try {
        const date = req.body.selectedDate;
        if (date) {
            const startDate = new Date(`${date}T00:00:00.000Z`); 
            const endDate = new Date();
            const salesReport = await Order.aggregate([
                {
                    $match: {
                        $or: [
                            { createdOn: { $gte: startDate, $lte: endDate } },
                            { deliveredOn: { $gte: startDate, $lte: endDate } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            ]);
            return res.json(salesReport);
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
};


const downloadPdf=async(req,res)=>{
    try {
        const date=req.query.date;
        const salesData = await getSalesData(date); 
        const pdfBuffer = await generatePDF(salesData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const fetchGraphData= async (req, res) => {
    try {
        const time = req.params.time;
        if (time === 'month') {
            const currentYear = new Date().getFullYear();
            const data = await Order.aggregate([
                {
                    $match: {
                        createdOn: {
                            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                            $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdOn' }, 
                        ordersCount: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' } 
                    }
                }
            ]);
            // console.log("data"+data);

            const allMonths =  {
                'January': { ordersCount: 0, revenue: 0 },
                'February': { ordersCount: 0, revenue: 0 },
                'March': { ordersCount: 0, revenue: 0 },
                'April': { ordersCount: 0, revenue: 0 },
                'May': { ordersCount: 0, revenue: 0 },
                'June': { ordersCount: 0, revenue: 0 },
                'July': { ordersCount: 0, revenue: 0 },
                'August': { ordersCount: 0, revenue: 0 },
                'September': { ordersCount: 0, revenue: 0 },
                'October': { ordersCount: 0, revenue: 0 },
                'November': { ordersCount: 0, revenue: 0 },
                'December': { ordersCount: 0, revenue: 0 }
            };
            data.forEach(item => {
                const month = new Date(`2023-${item._id}-01`).toLocaleString('default', { month: 'long' });
                allMonths[month] = {
                    ordersCount: item.ordersCount,
                    revenue: item.revenue
                };
            });
            // console.log(allMonths);

            res.json(allMonths);
        }

        if (time === 'year') {
            
            const startYear = 2019;
            const endYear = 2024;
        
           
            const ordersByYear = {};
        
           
            for (let year = startYear; year <= endYear; year++) {
                const data = await Order.aggregate([
                    {
                        $match: {
                            createdOn: {
                                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                                $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            ordersCount: { $sum: 1 },
                            revenue: { $sum: '$totalAmount' } 
                        }
                    }
                ]);
        
                
                const orderCount = data.length > 0 ? data[0].ordersCount : 0;
                const revenue = data.length > 0 ? data[0].revenue : 0;

                ordersByYear[year] = { ordersCount: orderCount, revenue: revenue };
                // ordersByYear[year] = orderCount;
            }
            // console.log(ordersByYear);
        
            res.json(ordersByYear);
        }



        if (time === 'week') {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();
            
            
            
            const dayOfWeek = currentDate.getDay();
            
            
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            
            const startDate = new Date(currentYear, currentMonth, currentDay - dayOfWeek);
            
            
            const ordersByDayOfWeek = {};

            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + day);
             
                
                const data = await Order.aggregate([
                    {
                        $match: {
                            createdOn: {
                                $gte: new Date(date.setHours(0, 0, 0, 0)),
                                $lt: new Date(date.setHours(23, 59, 59, 999))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            ordersCount: { $sum: 1 },
                            revenue: { $sum: '$totalAmount' } 
                        }
                    }
                ]);
                
                const orderCount = data.length > 0 ? data[0].ordersCount : 0;

                const revenue = data.length > 0 ? data[0].revenue : 0;

                ordersByDayOfWeek[dayNames[day]] = { ordersCount: orderCount, revenue: revenue };
            }
            
            // console.log(ordersByDayOfWeek);
            
            res.json(ordersByDayOfWeek);
        }
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while fetching data.");
    }
};



const salesData = async (req, res) => {
    try {
        var salesReport
        const time = req.params.time;

        if (time === 'week') {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();

            const startDate = new Date(currentYear, currentMonth, currentDay - 6); // Adjusted the start date for the last 7 days
            const endDate = new Date(currentYear, currentMonth, currentDay); // Adjusted the end date for the current day

            salesReport = await Order.aggregate([
                {
                    $match: {
                        
                        createdOn: { $gte: startDate, $lte: endDate } 
                           
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            ]);
            
         
            
        } 
        else if (time === 'month') {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();

            const startDate = new Date(currentYear, currentMonth, 1);


            const endDate = new Date(currentYear, currentMonth, currentDay); 

            salesReport = await Order.aggregate([
                {
                    $match: {
                        
                        createdOn: { $gte: startDate, $lte: endDate } 
                           
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            ]);
            
        } 
        else if (time === 'year') {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, currentMonth, currentDay);

            salesReport = await Order.aggregate([
                {
                    $match: {
                        
                        createdOn: { $gte: startDate, $lte: endDate } 
                           
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderId: '$orderId',
                        userName: '$userDetails.Name',
                        userEmail: '$userDetails.email',
                        orderDate: '$createdOn',
                        deliveredOn: '$deliveredOn',
                        status: '$status',
                        totalAmount: '$totalAmount',
                        paymentMethod: '$paymentMethod'
                    }
                }
            ]);
            
        } 
        res.json({ salesReport:salesReport})
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while fetching data.");
    }
};





const adminLogout = async (req, res) => {
    try {
        res.cookie('jwtAdmin', '', { maxAge: 1 });
        res.status(200).redirect("/admin/login");
    } catch (err) {
        console.error("Error during logout:", err.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};





module.exports={
    loadDashboard,
    loadUsers,
    loadLogin,
    verifyLogin,
    changeStatus,
    blockUser,
    loadSales,
    sortSales,
    downloadPdf,
    fetchGraphData,
    salesData,
    adminLogout
}