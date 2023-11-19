const mongoose=require("mongoose");
require('dotenv').config(); 
const express=require("express")
// const morgan=require("morgan")
const app=express()

mongoose.connect("mongodb+srv://naslalellu:IjEHbIdAYLgcPeJW@elegance-db.37x8mgx.mongodb.net/ecom?retryWrites=true&w=majority")




const PORT = process.env.PORT

const adminRoute=require("./routes/adminRoute")
const userRoute = require("./routes/userRoute")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(morgan("dev"))

app.use("/admin",adminRoute)
app.use("/",userRoute)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}\nhttp://localhost:${PORT}/admin/dashboard`);
});


