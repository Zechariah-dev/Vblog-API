const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.types.ObjectId,
    ref: "users"
  },
  description: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  }
});

const blogModel = mongoose.model("blogs", blogSchema);

module.exportd = blogModel;
