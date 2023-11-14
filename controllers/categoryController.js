const Category=require("../models/category")

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


const loadCategory=async(req,res)=>{
    try{
        const categoryData=await Category.find({})
        res.status(200).render("category",{category:categoryData})
    }catch(error){
        console.error("Error loading category data:", error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
}



// const addCategory = async (req, res) => {
//     try {
//         const cname = await titleCase(req.body.categoryName);
//         const status = req.body.status;
//         const offer=req.body.category_offer
//         const min=req.body.min_amount
//         const max=req.body.max_discount
//         const date=req.body.category_expiry
//         const checkCategory = await Category.findOne({ categoryName: cname });

//         if (checkCategory) {
//             return res.status(409).render("category", { message: "Category already exists.", category: categoryData });
//         }
//         if(offer){
//             const newCategory = new Category({
//                 categoryName: cname,
//                 categoryOffer:offer,
//                 minAmount:min,
//                 maxDiscount:max,
//                 expiry:date,
//                 active: status === "Active"
//             });
    
//             await newCategory.save();
//         }else{
//             const newCategory = new Category({
//                 categoryName: cname,
//                 active: status === "Active"
//             });
    
//             await newCategory.save();
//         }

        

//         if (newdata) {
//             return res.status(201).redirect("/admin/categories");
//         } else {
//             return res.status(500).render("error", { message: "Internal Server Error" });
//         }
//     } catch (error) {
//         console.error("Error adding category:", error.message);
//         return res.status(500).render("error", { message: "Internal Server Error" });
//     }
// };
const addCategory = async (req, res) => {
    try {
        const cname = await titleCase(req.body.categoryName);
        const status = req.body.status;
        const offer = req.body.category_offer;
        const min = req.body.min_amount;
        const max = req.body.max_discount;
        const date = req.body.category_expiry;
        const checkCategory = await Category.findOne({ categoryName: cname });

        if (checkCategory) {
            return res.status(409).render("category", { message: "Category already exists.", category: checkCategory });
        }

        let newCategory;

        if (offer || min || max || date) {
            newCategory = new Category({
                categoryName: cname,
                categoryOffer: offer,
                minAmount: min,
                maxDiscount: max,
                expiry: date,
                active: status === "Active"
            });
        } else {
            newCategory = new Category({
                categoryName: cname,
                active: status === "Active"
            });
        }

        const savedCategory = await newCategory.save();

        if (savedCategory) {
            return res.status(201).redirect("/admin/categories");
        } else {
            return res.status(500).render("error", { message: "Internal Server Error" });
        }
    } catch (error) {
        console.error("Error adding category:", error.message);
        return res.status(500).render("error", { message: "Internal Server Error" });
    }
};






const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).render("error", { message: "Category not found" });
        }
        return res.status(204).redirect("/admin/categories");
    } catch (error) {
        console.error("Error deleting category:", error.message);
        return res.status(500).render("error", { message: "Internal Server Error" });
    }
};





const loadEditCategory=async(req,res)=>{
    const categoryId = req.query.categoryId;
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).send('Category not found');
      }
      res.render('editCategory',{category});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
}


const updateCategory = async (req, res) => {
    try {
        const id= req.body.id;
        const categoryName=req.body.categoryName
        const status = req.body.status;
        const offer = req.body.category_offer;
        const min = req.body.min_amount;
        const max = req.body.max_discount;
        const date = req.body.category_expiry;
        const active = status === "Active";
        const cname = await titleCase(categoryName);
        const categoryData = await Category.findById(id);

        if (categoryData) {
            const checkData = await Category.findOne({ categoryName: cname, _id: { $ne: id } });

            if (!checkData) {
                let newCategory
                if (offer || min || max || date) {
                    newCategory =await Category.updateOne({_id:id},{
                        categoryName: cname,
                        categoryOffer: offer,
                        minAmount: min,
                        maxDiscount: max,
                        expiry: date,
                        active: active
                    });
                } else {
                    newCategory = await Category.updateOne({_id:id},{
                        categoryName: cname,
                        active: active
                    });
                }

                if (newCategory) {
                    // return res.status(200).redirect("/admin/categories");
                    return res.status(200).json({newCategory});
                } else {
                    return res.status(500).render("error", { message: "Internal Server Error" });
                }
            } else {
                return res.status(409).render("editCategory", { message: "Category already exists.", category: categoryData });
            }
        } else {
            return res.status(404).redirect(`/admin/categories/edit/${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




module.exports={
    loadCategory,
    addCategory,
    loadEditCategory,
    deleteCategory,
    updateCategory
}