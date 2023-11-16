const Banner=require("../models/banner");
const sharp=require("sharp")
const path=require("path");
const { findOne } = require("../models/order");


const loadBanner=async(req,res)=>{
    try{
        const banner=await Banner.find({})
        res.render("banner",{banner:banner})
    }catch(error){
        console.log(error.message);
    }
}

// const addBanner=async(req,res)=>{
//     try {
//         const description = req.body.description
//        let Imagefile = req.file ? req.file.filename : null;
//        const h1 = req.body.h1
//        const h2 = req.body.h2
//        const h3 = req.body.h3
//        const p1 = req.body.p1

//        if(req.file){
//         const randomInteger = Math.floor(Math.random() * 20000001)
//             const imageDirectory = path.join(__dirname,"../public/admin/assets/imgs/banner");
            
//             let imgFileName = "cropped" + randomInteger + ".png"
//             let imagePath = path.join(imageDirectory, imgFileName)
//             const croppedImage = await sharp(req.file.path)
//                 .resize(699, 620, {
//                     fit: "fill",
//                 })
//                 .png() // Ensure PNG format
//                 .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
//                 .toFile(imagePath)
//             if (croppedImage) {
//                 Imagefile= imgFileName
//             }
//         }

//        const banner = new Banner({
//         Description:description,
//         Status:1,
//         Image:Imagefile,
//         h1:h1,
//         h2:h2,
//         h3:h3,
//         p1:p1
//        })
       

//        const result =  await banner.save()
//        if(result){
//         res.redirect('/admin/banner')
//        }else{
//         res.json({error:"error updating banner , try again"})
//        }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Banner Adding failed")
//     }
// }
const addBanner = async (req, res) => {
    try {
        const description = req.body.description;
        let Imagefile = req.file ? req.file.filename : null;
        const h1 = req.body.h1;
        const h2 = req.body.h2;
        const h3 = req.body.h3;
        const p1 = req.body.p1;
        const status=req.body.status

        if (req.file) {
            const randomInteger = Math.floor(Math.random() * 20000001);
            const imageDirectory = path.join(__dirname, "../public/admin/assets/imgs/banner");

            let imgFileName = "cropped" + randomInteger + ".png"; // Use PNG for transparency
            let imagePath = path.join(imageDirectory, imgFileName);
            const croppedImage = await sharp(req.file.path)
                .resize(699, 620, {
                    fit: "fill",
                })
                .png({ quality: 100, alphaQuality: 100, force: true })
                .toFile(imagePath);

            if (croppedImage) {
                Imagefile = imgFileName;
            }
        }

        
        const banner = new Banner({
            Description: description,
            Status: 1,
            Image: Imagefile,
            h1: h1,
            h2: h2,
            h3: h3,
            p1: p1,
            Status:status==="Active"
        });

        const result = await banner.save();
        if (result) {
            res.redirect('/admin/banner');
        } else {
            res.json({ error: "Error updating banner, try again" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Banner Adding failed");
    }
};

const loadEditBanner=async(req,res)=>{
    try{
        const id=req.query.id;
        const banner=await Banner.findOne({_id:id});
        res.render("editBanner",{banner:banner})
    }catch(error){
        console.log(error);
    }
}

const updateBanner=async(req,res)=>{
    try{
        const id=req.body.id
        const banner=await Banner.findOne({_id:id});
        const description = req.body.description;
        let Imagefile = req.file ? req.file.filename : banner.Image;
        const h1 = req.body.h1;
        const h2 = req.body.h2;
        const h3 = req.body.h3;
        const p1 = req.body.p1;
        const status = req.body.status;

        if(!banner){
            return 
        }
        

        if (req.file) {
            const randomInteger = Math.floor(Math.random() * 20000001);
            const imageDirectory = path.join(__dirname, "../public/admin/assets/imgs/banner");

            let imgFileName = "cropped" + randomInteger + ".png"; // Use PNG for transparency
            let imagePath = path.join(imageDirectory, imgFileName);
            const croppedImage = await sharp(req.file.path)
                .resize(699, 620, {
                    fit: "fill",
                })
                .png({ quality: 100, alphaQuality: 100, force: true })
                .toFile(imagePath);

            if (croppedImage) {
                Imagefile = imgFileName;
            }
        }

        const updated=await Banner.updateOne({_id:id},{
            Description: description,
            Status: status==="Active",
            Image: Imagefile,
            h1: h1,
            h2: h2,
            h3: h3,
            p1: p1
        })
        if(updated.modifiedCount>0){
            return res.json({updated:updated});
        }

    }catch(error){
        console.log(error.message);
    }
}


const deleteBanner=async(req,res)=>{
    try {
        const bannerId = req.query.bannerId;
        const deletebanner = await Banner.deleteOne({ _id: bannerId });

        if (deletebanner.deletedCount > 0) {
            res.status(204).redirect("/admin/banner");
        } else {
            res.status(404).json({ message: "Banner not found." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports={
    loadBanner,
    addBanner,
    loadEditBanner,
    updateBanner,
    deleteBanner
}