const mongoose=require("mongoose");

const productSchema=mongoose.Schema({
    productName:{
        type:String
    },
    description:{
        type:String
    },
    color:{
        type:Array
    },
    sizes: [
        {
            size: {
                type: String
            },
            stock: {
                type: Number,
                default: 0
            }
        }
    ],
    brand:{
        type:String
    },
    category:{
        type:String
    },
    regularPrice:{
        type:Number
    },
    salePrice:{
        type:Number
    },
    offerPrice:{
        type:Number
    },
    images:[
        {
            url:{
                type:String
            }
        }
    ],
    active:{
        type:Boolean,
        default:true
    },
    gender:{
        type:String
    },
    createdOn:{
        type:String
    },
    reviews:[
        {
        name:{
                type:String

        },rating:{
            type:Number
        },
        comment:{
            type:String
        },
        addedOn:{
            type:String
        }
    }
    ]
});

module.exports=mongoose.model("product",productSchema);