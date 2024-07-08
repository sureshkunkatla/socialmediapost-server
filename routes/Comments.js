const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.post("/", validateToken, async (req, res) => {
  const comment = req.body;
  comment.username = req.user.username;

  try {
    const createComment = await Comments.create(comment);
    res.status(201).json(createComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the comment" });
  }
});

router.get("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await Comments.findAll({ where: { PostId: postId } });

    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.json({ message: "No comments found for this post" });
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
});

router.delete("/:commentId", validateToken, async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const deleteComment = await Comments.destroy({
      where: {
        id: commentId,
      },
    });

    if (deleteComment) {
      res.json({
        message: "Comment deleted successfully",
        deleted: deleteComment,
      });
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the comment" });
  }
});

module.exports = router;
