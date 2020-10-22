const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const MongoStore = require("connect-mongo")(session);
require("dotenv").config({ path: "./config/config.env" });

const app = express();

mongoose
  .connect(
    "mongodb+srv://user:userpass123@cluster0.mvxzn.mongodb.net/VBlog?retryWrites=true&w=majority",
    {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    throw new Error(err);
  });

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "session secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 7200000
    },
    store: new MongoStore({
      autoRemove: "disabled"
    })
  })
);

const authRouter = require("./routes/authRoute");
const blogRouter = require("./routes/blogRoute");

app.use("/auth", authRouter);
app.use("/blog", blogRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
