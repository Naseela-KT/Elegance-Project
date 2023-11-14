const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const orderSchema = new mongoose.Schema({
    customerId:{
        type:Types.ObjectId,
        ref: 'user',
        required:true
    },
    Items:[
        {
            productId: {
                type: Types.ObjectId,
                ref: 'product'
            },
            quantity: {
                type: Number
            },
            size:{
                type:String
            },
            subtotal:{
                type:Number,
            }
        }
    ],
    // Address: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'user'
    // },
    Address:{
        
            name:{
                type:String
            },
            mobile:{
                type:Number
            },
            housename:{
                type:String
            },
            area:{
                type:String
            },
            city:{
                type:String
            },
            state:{
                type:String
            },
            pincode:{
                type:Number
            }
        
    },
    paymentMethod:{
        type:String,
        // required:true
    },
    shippingcharge:{
        type:Number 
    },
    coupondiscount:{
        type:Number 
    },
    categorydiscount:{
        type:Number 
    },
    totalAmount:{
        type:Number 
    },
    createdOn:{
        type:Date
    },
    status: {
        type: String,
        required: true,
        default: "Pending"
    },
    deliveredOn:{
        type:Date
    },
    orderId:{
        type:String,
    },
    return:{
        type:Boolean
    },
    returnStatus:{
        type:String
    },
    returnReason:{
        type:String
    }

})

module.exports = mongoose.model('Order', orderSchema , 'Order')