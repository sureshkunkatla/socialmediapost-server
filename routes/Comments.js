const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.post("/", validateToken, async (req, res) => {
  const comment = req.body;
  comment.username = req.username;
  const createComment = await Comments.create(comment);
  res.json(createComment);
});

router.get("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  res.json(comments);
});

module.exports = router;
