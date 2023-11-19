const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config(); // Module to Load environment variables from .env file

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.USER_JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token,  process.env.USER_JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const isBlocked = async(req,res,next)=>{
  const user= await User.findOne(res.locals.user._id)
  if(user.is_blocked==true){
    await res.cookie('jwt', '', { maxAge: 1 })
    res.redirect("/")
  }else{
    next()
  }
}

module.exports = { requireAuth, checkUser,isBlocked};