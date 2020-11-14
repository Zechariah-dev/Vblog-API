const express = require("express");
const router = express.Router();
const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/mailerUtils");
const {
  generateAuthToken,
  generateVerificationToken
} = require("../utils/tokenUtils");

router.post(
  "/signup",
  [
    body("email").isEmail().normalizeEmail().trim(),
    body("username").not().isEmpty().trim(),
    body("password").not().isEmpty().trim().isLength({ min: "8" })
  ],
  async (req, res) => {
    const { email, password, username } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user;
      let token = generateVerificationToken();

      const DbUser = await User.findOne({ $or: [{ email, username }] });

      if (DbUser) {
        return res.status(400).json({
          status: "failure",
          message:
            "User with your provided credentials already exists in the database"
        });
      }

      user = new User({ email, password, username });

      token = new VerificationToken({
        user: user.email,
        token
      });

      await user.save();
      await VerificationToken.save();

      res.status(201).json({
        user: {
          email: user.email,
          username: user.username
        }
      });

      await sendVerificationEmail(user.email, token);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: "Internal Server Error" });
    }
  }
);

router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(401).json({
        status: "failure",
        msg: "Incorrect credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        status: "failure",
        msg: "Unauthorized credentials, Please verify your registration"
      });
    }

    const isMatch = user.validatePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        status: "failure",
        msg: "Incorrect Password"
      });
    }

    const token = generateAuthToken(user);

    res.status(200).json({
      status: "success",
      user,
      token
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failure",
      msg: "Internal server error"
    });
  }
});

router.post(
  "/add-info",
  [
    body("fbLink").trim().not().isEmpty().isUrl(),
    body("twitterLink").trim().not().isEmpty().isUrl(),
    body("instagramLink").trim().not().isEmpty().isUrl()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fbLink, twitterLink, instagramLink } = req.body;

    try {
      const user = await User.findOne({ _id: req.user._id }).exec();

      if (!user) {
        return res
          .status(401)
          .json({ status: "failure", msg: "No user found" });
      }

      user.fbLink = fbLink;
      user.twitterLink = twitterLink;
      user.instagramLink = instagramLink;

      await user.save();
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "failure", msg: "Internal Server Error" });
    }
  }
);

router.get("/verify/:token", async (req, res) => {
  if (!req.params.token) {
    return res
      .status(401)
      .json({ status: "failure", msg: "Please token must be provided" });
  }

  try {
    const tokenDoc = await VerificationToken.findOne({
      token: req.params.token
    }).exec();

    const expiredToken = tokenDoc.findValidToken();

    if (expiredToken) {
      tokenDoc.remove();
      return res.status(403).json({
        status: "failure",
        message: "verification token has expired, please try again"
      });
    }

    if (!tokenDoc) {
      return res.status(401).json({ status: "failure", msg: "Invalid token" });
    }

    const user = await User.findById(tokenDoc.user).exec();

    if (!user) {
      return res.status(401).json({ status: "failure", msg: "No user found" });
    }

    user.isVerified = true;

    await user.save();

    res.send("User verified");
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "failure", msg: "Internal Server Error" });
  }
});

router.post("/resend", [], async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ msg: "Email is not associated with any account" });
    }

    if (user.isVerified) {
      return res.status(401).json({
        msg: "Account has already been verified please proceed to login"
      });
    }

    const existingVD = await VerificationToken.findOne({ email });

    if (existingVD) await existingVD.delete();

    const token = crypto.randdomBytes(20).toString("hex");

    const newVD = new VerificationToken({
      email,
      token
    });

    await newVD.save();

    await sendVerificationEmail(email, token);
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "failure", msg: "Internal Server Error" });
  }
});

module.exports = router;
