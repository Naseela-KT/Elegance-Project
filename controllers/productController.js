const User=require("../models/userModel")
const Products=require("../models/product")
const Category=require("../models/category")
const Brand=require("../models/brands")
const sharp=require("sharp")
const path = require('path');

//ADMIN
const loadProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        
        const totalProducts = await Products.find({}).countDocuments();
        const totalPages = Math.ceil(totalProducts / 8);
        const products = await Products.find({}).skip((page - 1) * 8).limit(8);
        res.render("products", {
            products: products,
            currentPage: page,
            totalPages: totalPages,
            
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};



const loadAddProduct = async (req, res) => {
    try {
        const category = await Category.find({});
        const brands = await Brand.find({});
        res.render("addProduct", { category: category, brand: brands });
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};



const addProduct = async (req, res) => {
    try {
        const colors = req.body.prodcolor.split(",");
        const sizes = req.body.sizes;
        const stocks = req.body.stocks;
        const sizeObjects = [];
        for (let i = 0; i < sizes.length; i++) {
            const sizeObject = {
                size: sizes[i],
                stock: parseInt(stocks[i]) || 0 
            };
            sizeObjects.push(sizeObject);
        }
        const prodDate = new Date();
        let product = new Products({
            productName: req.body.prodname,
            description: req.body.proddesc,
            color: colors,
            sizes: sizeObjects,
            brand: req.body.prodbrand,
            category: req.body.prodcategory,
            regularPrice: req.body.prodregprice,
            salePrice: req.body.prodsprice,
            offerPrice:(req.body.prodregprice)-(req.body.prodsprice),
            images: [],
            gender: req.body.gender,
            createdOn: prodDate
        });
        for (let file of req.files) {
            const filepath=file.path
                const randomInteger = Math.floor(Math.random() * 20000001);
                const imageDirectory = path.join(__dirname,"../public/admin/assets/imgs/products");
                let imgFileName = "cropped" + randomInteger + ".jpg";
                let imagePath = path.join(imageDirectory, imgFileName);
                const croppedImage = await sharp(filepath)
                    .resize(780, 1000, {
                        fit: "fill",
                    })
                    .toFile(imagePath);
            if (croppedImage) {
                product.images.push({url:imgFileName})
            }
        }
        const category = await Category.find({});
        const brands = await Brand.find({});
        const productData = await product.save();
        if (productData) {
            res.status(200).render("addProduct", { success: "Product Added", category: category, brand: brands });
        } else {
            res.status(500).render("addProduct", { message: "Something went wrong", category: category, brand: brands });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




const loadEditProduct = async (req, res) => {
    try {
        const category = await Category.find({});
        const brands = await Brand.find({});
        const productId = req.query.productId;
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        res.render('editProduct', { product: product, category: category, brand: brands });
    } catch (error) {
        console.error(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};



const deleteImage = async (req, res) => {
    const imgId = req.params.imgId;

    try {
        const product = await Products.findOne({ "images._id": imgId });
        if (!product) {
            return res.status(404).render('error', { message: 'Image not found' });
        }
        product.images = product.images.filter(image => image._id.toString() !== imgId);
        await product.save();
        res.redirect(`/admin/products/edit/${product._id}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};





const updateProduct = async (req, res) => {
    try {
        const newimages = req.files.map(file => {
            return { url: file.filename };
        });
        const colors = req.body.prodcolor.split(",");
        const sizes = req.body.sizes;
        const stocks = req.body.stocks;
        const sizeObjects = [];
        for (let i = 0; i < sizes.length; i++) {
            const sizeObject = {
            size: sizes[i],
            stock: parseInt(stocks[i]) || 0 
            };
            sizeObjects.push(sizeObject);
        }
        const id = req.body.id;

        const existingProduct=await Products.findOne({_id:id})
        existingProduct.images=[...existingProduct.images,...newimages]
        const product = await Products.updateOne(
            { _id: id },
            {
                $set: {
                    productName: req.body.prodname,
                    description: req.body.proddesc,
                    color: colors,
                    sizes: sizeObjects,
                    brand: req.body.prodbrand,
                    category: req.body.prodcategory,
                    regularPrice: req.body.prodregprice,
                    salePrice: req.body.prodsprice,
                    images: existingProduct.images,
                    gender:req.body.gender,
                }
            }
        );

        if (product) {
            return res.redirect(`/admin/products/edit/${id}`);
        } else {
            return res.status(404).send('Product not found or not updated.');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};




const deleteProduct=async(req,res)=>{
    try {
        const prodId = req.params.productId;
        const product = await Products.findById(prodId);
    
        if (!product) {
          return res.status(404).send('User not found');
        }
    
        product.active = !product.active;
        await product.save();
    
        res.redirect('/admin/products');
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
}

var ITEMS_PER_PAGE=5;

const colors=async()=>{
    try{
        const products=await Products.distinct("color")
        return products
    }catch(error){
        console.log(error.message);
    }
}

const sizes=async()=>{
    try{
        const size=['S', 'M', 'L', 'XL', 'XXL'];
        let newarr=[]
        const uniqueSizes = await Products.distinct('sizes.size');
        for(let i=0;i<size.length;i++){
            if(uniqueSizes.includes(size[i])){
                newarr.push(size[i]);
            }
        }
        return newarr;
    }catch(error){
        console.log(error.message);
    }
}

const formatDate=async(date)=>{
    try{
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
    
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }catch(error){
        console.log(error.message);
    }
    
}

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

// const loadAllProducts=async(req,res)=>{
//     const page = parseInt(req.query.page) || 1;
//     try{
//         const user_id = res.locals.user._id;
//         const user=await User.findOne({_id:user_id})
//         const quantity=await totalQuantity(req,res)
//         const brand=await Brand.find({})
//         const category=await Category.find({})
//         const color=await colors();
//         const uniqueSizes = await sizes();
//         const totalProducts = await Products.find({}).countDocuments();
//         const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//         const products=await Products.find({}).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        
//         res.render("allProducts",{
//             products:products,
//             category:category,
//             brand:brand,
//             color:color,
//             size:uniqueSizes,
//             quantity:quantity,
//             currentPage: page,
//             totalPages: totalPages,
//             count:totalProducts,
//             userData:user
//         })
//     }catch(error){
//         console.log(error.message);
//         res.status(500).render('error', { message: 'Internal Server Error' });
//     }
// }
const loadAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || '';
    const sortOption = req.query.sort || 'default'; // Set a default sorting option
    const filterBrands = req.query.brands || [];
    const filterCategories = req.query.categories || [];
    const filterColors = req.query.colors || [];
    const filterSizes = req.query.sizes || [];

    try {
        const user_id = res.locals.user._id;
        const user = await User.findOne({ _id: user_id });
        const quantity = await totalQuantity(req, res);
        const brand = await Brand.find({});
        const category = await Category.find({});
        const color = await colors();
        const uniqueSizes = await sizes();

        let query = {};

        // Apply filters
        if (filterBrands.length > 0) query.brand = { $in: filterBrands };
        if (filterCategories.length > 0) query.category = { $in: filterCategories };
        if (filterColors.length > 0) query.color = { $in: filterColors };
        if (filterSizes.length > 0) query.size = { $in: filterSizes };

        if (searchQuery !== '') {
            query.productName = { $regex: new RegExp(`^${searchQuery}`, 'i') };
        }

        const totalProducts = await Products.find(query).countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        // Apply sorting
        let sortQuery = {};
        if (sortOption === 'priceLowToHigh') {
            sortQuery = { salePrice: 1 };
        } else if (sortOption === 'priceHighToLow') {
            sortQuery = { salePrice: -1 };
        } else {
            // Add more cases based on your sorting options
            // 'default' can be a case where you don't apply any specific sorting
        }

        const products = await Products.find(query)
            .sort(sortQuery)
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('allProducts', {
            products: products,
            category: category,
            brand: brand,
            color: color,
            size: uniqueSizes,
            quantity: quantity,
            currentPage: page,
            totalPages: totalPages,
            count: totalProducts,
            userData: user,
            searchQuery: searchQuery,
            sortOption: sortOption,
            filterBrands: filterBrands,
            filterCategories: filterCategories,
            filterColors: filterColors,
            filterSizes: filterSizes,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


const loadMenProducts=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    try{
        const user_id = res.locals.user._id;
        const user=await User.findOne({_id:user_id})
        const quantity=await totalQuantity(req,res)
        const brand=await Brand.find({})
        const category=await Category.find({})
        const color=await colors();
        const uniqueSizes = await sizes();
        const totalProducts = await Products.find({gender:"Male"}).countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const products=await Products.find({gender:"Male"}).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        res.render("men-products",{
            products:products,
            category:category,
            brand:brand,
            color:color,
            size:uniqueSizes,
            quantity:quantity,
            currentPage: page,
            totalPages: totalPages,
            count:totalProducts,
            userData:user
        })
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

const loadWomenProducts=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    try{
        const user_id = res.locals.user._id;
        const user=await User.findOne({_id:user_id})
        const quantity=await totalQuantity(req,res)
        const brand=await Brand.find({})
        const category=await Category.find({})
        const color=await colors();
        const uniqueSizes = await sizes();
        const totalProducts = await Products.find({gender:"Female"}).countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const products=await Products.find({gender:"Female"}).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        res.render("women-products",{
            products:products,
            category:category,
            brand:brand,
            color:color,
            size:uniqueSizes,
            quantity:quantity,
            currentPage: page,
            totalPages: totalPages,
            count:totalProducts,
            userData:user
        })
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

const loadProductDetails=async(req,res)=>{
    try{
        const user_id = res.locals.user._id;
        const quantity=await totalQuantity(req,res)
        const user = await User.findOne({ _id:user_id });
        const id=req.query.id;
        const product=await Products.findOne({_id:id})
        if(product){
            res.render("product-details",{product:product,userData:user,quantity:quantity})
        }else {
            res.redirect("/home");
        }
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

const submitReview=async(req,res)=>{
    try{
        const id=req.query.id;
        const rating=req.body.rating;
        const newrating=(rating/5)*100;
        const d=await formatDate(new Date())
        const product=await Products.find({_id:id});
        if(product){
            const review=await Products.findByIdAndUpdate(id, {
                $push: {
                    reviews: {
                        name: req.body.name,
                        rating: newrating,
                        comment: req.body.comment,
                        addedOn: d
                    }
                }
            });
            if(review){
                // const redirectUrl = '/products?' + new URLSearchParams(id).toString();
                res.redirect("/products?id="+id);
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const allProductsFilter=async(req,res)=>{
    try{
        const brands = req.body.brands;
        const categories = req.body.categories;
        const color = req.body.colors;
        const size = req.body.sizes;
        const query = {};

        // Check if brands, categories, colors, and sizes are arrays and add to the query if they exist
        if (Array.isArray(brands) && brands.length > 0) {
            query.brand = { $in: brands };
        }

        if (Array.isArray(categories) && categories.length > 0) {
            query.category = { $in: categories };
        }

        if (Array.isArray(color) && color.length > 0) {
            query.color = { $in: color };
        }

        if (Array.isArray(size) && size.length > 0) {
            query['sizes.size'] = { $in: size };
        }
        const products = await Products.find(query)
        res.json({products:products})
        
       
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

const menProductsFilter=async(req,res)=>{
    try{
        const brands = req.body.brands;
        const categories = req.body.categories;
        const color = req.body.colors;
        const size = req.body.sizes;

        const query = {};

        // Check if brands, categories, colors, and sizes are arrays and add to the query if they exist
        if (Array.isArray(brands) && brands.length > 0) {
            query.brand = { $in: brands };
        }

        if (Array.isArray(categories) && categories.length > 0) {
            query.category = { $in: categories };
        }

        if (Array.isArray(colors) && colors.length > 0) {
            query.color = { $in: color };
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            query['Sizes.size'] = { $in: size };
        }
        query.gender = 'Male';

        const products = await Products.find(query)
        res.json({products:products})
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}


const womenProductsFilter=async(req,res)=>{
    try{
        const brands = req.body.brands;
        const categories = req.body.categories;
        const color = req.body.colors;
        const size = req.body.sizes;

        const query = {};

        // Check if brands, categories, colors, and sizes are arrays and add to the query if they exist
        if (Array.isArray(brands) && brands.length > 0) {
            query.brand = { $in: brands };
        }

        if (Array.isArray(categories) && categories.length > 0) {
            query.category = { $in: categories };
        }

        if (Array.isArray(colors) && colors.length > 0) {
            query.color = { $in: color };
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            query['Sizes.size'] = { $in: size };
        }
        query.gender = 'Female';

        const products = await Products.find(query)
        res.json({products:products})
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}


const loadSearch=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    try{
        const user_id = res.locals.user._id;
        const user=await User.findOne({_id:user_id})
            const brand=await Brand.find({})
            const category=await Category.find({})
            const color=await colors();
            const uniqueSizes = await sizes();
            const searchQuery=req.body.searchCriteria
            const quantity=await totalQuantity(req,res)
            const searchResults =  await Products.find({ $or: [
                { productName: { $regex: new RegExp(searchQuery, 'i') } },
                { category: { $regex: new RegExp(searchQuery, 'i') } },
                { brand: { $regex: new RegExp(searchQuery, 'i') } }
              ]}).skip((page - 1) * 8).limit(8);
              const totalProducts = searchResults.length;
              const totalPages = Math.ceil(totalProducts / 8);
              
            res.render("search.ejs",{
                quantity:quantity,
                products:searchResults,
                category:category,
                brand:brand,
                color:color,
                size:uniqueSizes,
                currentPage: page,
                totalPages: totalPages,
                count:totalProducts,
                searchQuery:searchQuery,
            userData:user})
        
        
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}


const searchFilter=async(req,res)=>{
    try{
       console.log("hello");
        const searchQuery=req.query.search
        const searchResults =  await Products.find({ $or: [
            { productName: { $regex: new RegExp(searchQuery, 'i') } },
            { category: { $regex: new RegExp(searchQuery, 'i') } },
            { brand: { $regex: new RegExp(searchQuery, 'i') } }
          ]})

        const brands = req.body.brands;
        const categories = req.body.categories;
        const color = req.body.colors;
        const size = req.body.sizes;

        const query = {};

        // Check if brands, categories, colors, and sizes are arrays and add to the query if they exist
        if (Array.isArray(brands) && brands.length > 0) {
            query.brand = { $in: brands };
        }

        if (Array.isArray(categories) && categories.length > 0) {
            query.category = { $in: categories };
        }

        if (Array.isArray(colors) && colors.length > 0) {
            query.color = { $in: color };
        }

        if (Array.isArray(size) && size.length > 0) {
            query['Sizes.size'] = { $in: size };
        }
        const combinedQuery = {
            $and: [
                { $or: [
                    { productName: { $regex: new RegExp(searchQuery, 'i') } },
                    { category: { $regex: new RegExp(searchQuery, 'i') } },
                    { brand: { $regex: new RegExp(searchQuery, 'i') } }
                ]},
                query
            ]
        };

        const filteredProducts = await Products.find(combinedQuery);
        res.json({ products: filteredProducts });
    }catch(error){
        console.log(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}



module.exports={
    //ADMIN
    loadProducts,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    deleteImage,
    updateProduct,
    deleteProduct,
    //USER
    loadAllProducts,
    loadMenProducts,
    loadWomenProducts,
    loadProductDetails,
    submitReview,
    allProductsFilter,
    menProductsFilter,
    womenProductsFilter,
    loadSearch,
    searchFilter
}