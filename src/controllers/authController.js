const confirmationToken = require("../models/confirmationToken");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/User");

module.exports.jwtVerify = function (token) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = jwt.verify(token, process.env.JWT_SECRET).id;
      const user = await User.findOne({ _id: id });

      if (user) {
        resolve(user);
      } else {
        reject("Not Authorized");
      }
    } catch (err) {
      return reject("Not Authorized");
    }
  });
};

module.exports.optionalAuth = async function (req, res, next) {
  const { authorization } = req.headers;

  if (authorization) {
    try {
      const user = await this.jwtVerify(authorization);

      res.session.userId = user;
    } catch (err) {
      return res.status(401).send({ error: err });
    }
  }
  return next();
};
