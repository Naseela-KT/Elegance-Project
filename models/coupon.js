// const { padNumber } = require("@ng-bootstrap/ng-bootstrap/util/util");
const mongoose=require("mongoose");

const couponSchema=mongoose.Schema({
    Code:{
        type:String
    },
    Description:{
        type:String
    },
    Discount:{
        type:Number
    },
    MaximumAmount:{
        type:Number
    },
    MinimumAmount:{
        type:Number
    },
    Expiry:{
        type:Date
    },
    Customers:[{
        type:String
    }]
})


module.exports=mongoose.model("coupon",couponSchema);