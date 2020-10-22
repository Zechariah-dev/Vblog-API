const router = require("express").Router();
const Blog = require("../models/Blog");
const { body, validationResult } = require("express-validator");

router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: "desc" }).exec();

    if (Object.keys(blogs).length === 0) {
      return res.status(404).json({ status: "failure", msg: "No Blog found" });
    }

    res.json({ status: "success", data: blogs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failure", msg: "Internal Server Error" });
  }
});

router.post(
  "/create",
  [body("content").not().isEmpty(), body("title").trim().not().isEmpty()],
  async (req, res) => {
    const { content, title } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newBlog = new Blog({
        content,
        title,
        author: req.user.id
      });

      await newBlog.save();

      res
        .status(201)
        .json({ status: "success", msg: ` ${newBlog.id} blog created` });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: "failure", msg: "Internal Server Error" });
    }
  }
);

router.delete("/delete/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(401).json({ msg: "Blog ID must be provided" });
  }

  try {
    const reqBlog = await Blog.findById(req.params.id);

    if (!reqBlog) {
      return res.status(404).json({ msg: `${req.params.id} blog not found` });
    }

    if (reqBlog.author !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await reqBlog.remove();

    res.status(201).json({ status: "success", msg: "Blog deleted" });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

router.patch(
  "/edit/:Id",
  [body("content").not().isEmpty(), body("title").trim().not().isEmpty()],
  async (req, res) => {
    const { content, title } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const reqBlog = await Blog.findById(req.params.Id);

      if (!reqBlog) {
        return res.status(404).json({ msg: `${req.params.Id} blog not found` });
      }

      reqBlog.content = content ? content : reqBlog.content;
      req.Blog.title = title ? title : reqBlog.title;

      await reqBlog.save();

      res.status(201).json({ msg: "blog updated" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

router.patch("/like/:Id", async (req, res) => {
  if (!req.params.Id) {
    return res.status(403).json({ msg: "Blog Id must be provided" });
  }

  try {
    const reqBlog = await Blog.findById(req.params.Id);

    if (!reqBlog) {
      return res.status(404).json({ msg: `${req.params.Id} blog not found` });
    }

    reqBlog.likes++;

    await reqBlog.save();

    res.status(201).json({ msg: "${req.params.Id} Blog liked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.patch("/unlike/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(403).json({ msg: "Blog Id must be provided" });
  }

  try {
    const reqBlog = await Blog.findById(req.params.id);

    if (!reqBlog) {
      return res.status(404).json({ msg: `${req.params.id} blog not found` });
    }

    reqBlog.likes--;

    await reqBlog.save();

    res.status(201).json({ msg: `${req.params.Id} Blog unliked` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
