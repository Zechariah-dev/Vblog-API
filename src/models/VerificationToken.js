const mongoose = require("mongoose");

const verificationTokenSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  token: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200
  }
});

const userModel = mongoose.model("verificationTokens", verificationTokenSchema);

module.exports = userModel;
