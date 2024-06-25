const mongoose=require("mongoose");
require('dotenv').config(); 
const express=require("express")
// const morgan=require("morgan")
const app=express()
const cron=require("node-cron");
const axios=require("axios")



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

const SERVER = process.env.SERVER || `http://localhost:${process.env.PORT}`;

const start = () => {
  cron.schedule('* * * * *', () => {
    console.log('Running a task every minute');
    // Replace the URL below with a request to your own server
    axios.get(SERVER)
     .then(response => console.log('Health check successful'))
     .catch(error => console.error('Health check failed:', error));
  });

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}...`);
    mongoose.connect(process.env.MONGO_URI)
  });

};

start();


