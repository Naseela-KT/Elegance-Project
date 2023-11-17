const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ecom")

require('dotenv').config(); 
const express=require("express")
const morgan=require("morgan")
const app=express()


const PORT = process.env.PORT || 3000; // Use port from .env file or default to 3000

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
    console.log(`Server Started on http://localhost:${PORT}/home\nhttp://localhost:${PORT}/admin/dashboard`);
});


