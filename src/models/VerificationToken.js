const mongoose = require("mongoose");
const moment = require("moment");
const { TOKEN_EXPIRES_IN, TOKEN_TIME_FORMAT } = require("../config/config");

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
    default: Date.now
  }
});

verificationTokenSchema.methods.findValidToken = async function () {
  const { createdAt } = this;

  let currentTime = moment(Date.now);

  let momentTime = moment(createdAt).add(TOKEN_EXPIRES_IN, TOKEN_TIME_FORMAT);

  return currentTime > momentTime;
};

const userModel = mongoose.model("verificationTokens", verificationTokenSchema);

module.exports = userModel;
