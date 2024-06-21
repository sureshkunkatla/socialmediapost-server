const express = require("express");
const router = express.Router();
const { Comments } = require("../models");

router.post("/", async (req, res) => {
  const comment = req.body;
  const createComment = await Comments.create(comment);
  res.json(createComment);
});

router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  res.json(comments);
});

module.exports = router;
