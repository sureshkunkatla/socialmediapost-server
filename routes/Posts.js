const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.get("/", validateToken, async (req, res) => {
  const UserId = req.user.id; // Assuming you have access to the user ID from the token
  const getAllPosts = await Posts.findAll({ include: [Likes] });
  const postsWithUserLiked = getAllPosts.map((post) => ({
    ...post.toJSON(),
    userLiked: post.Likes.some((like) => like.UserId === UserId), // true if user liked, false otherwise
  }));

  res.json(postsWithUserLiked);
});

router.post("/", validateToken, async (req, res) => {
  try {
    const post = req.body;
    const createdPost = await Posts.create(post);
    res.json(createdPost);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

router.get("/byId/:id", validateToken, async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  res.json(post);
});

router.delete("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;

  try {
    const deletePost = await Posts.destroy({
      where: {
        id: postId,
      },
    });

    if (deletePost) {
      res.json({
        message: "Post deleted successfully",
        deleted: deletePost,
      });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error deleting Post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the posr" });
  }
});

module.exports = router;
