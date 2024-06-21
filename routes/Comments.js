const express = require("express");
const router = express.Router();
const { Comments } = require("../models");

// router.get("/", async (req, res) => {
//   const getAllPosts = await Posts.findAll();
//   res.json(getAllPosts);
// });

router.post("/", async (req, res) => {
  const comment = req.body;
  await Comments.create(comment);
  res.json(comment);
});

router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  res.json(comments);
});

module.exports = router;
