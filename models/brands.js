const mongoose=require("mongoose");

const brandSchema=mongoose.Schema({
    brandName:{
        type:String
    },
    image:{
        type:String
    },
    active:{
        type:Boolean
    }
})


module.exports=mongoose.model('brands',brandSchema);