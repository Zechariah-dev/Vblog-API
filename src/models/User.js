const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 4
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },

    fbLink: {
      type: String
    },
    twitterLink: {
      type: String
    },
    instagramLink: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const SALT_WORK_FACTOR = 10;

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password);
};

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
