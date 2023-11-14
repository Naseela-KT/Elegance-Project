const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwtAdmin;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/admin/login');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/admin/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwtAdmin;
  if (token) {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        next();
      } else {
        const admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };