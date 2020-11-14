const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const crypto = require("crypto");

const generateToken = (user) => {
  let token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

module.exports = {
  generateToken,
  generateVerificationToken
};
