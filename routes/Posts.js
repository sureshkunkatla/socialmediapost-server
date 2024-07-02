const express = require("express");
const router = express.Router();
const { Posts, Likes, Comments } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");
const { Sequelize } = require("sequelize");
// const Sequelize = require("sequelize");

// router.get("/", validateToken, async (req, res) => {
//   const UserId = req.user.id; // Assuming you have access to the user ID from the token
//   const getAllPosts = await Posts.findAll({ include: [Likes, Comments] });
//   const postsWithUserLiked = getAllPosts.map((post) => ({
//     ...post.toJSON(),
//     userLiked: post.Likes.some((like) => like.UserId === UserId), // true if user liked, false otherwise
//     likesCount: post.Likes.length,
//     commentsCount: post.Comments.length,
//   }));

//   res.json(postsWithUserLiked);
// });

router.get("/", validateToken, async (req, res) => {
  try {
    const UserId = req.user.id; // Assuming you have access to the user ID from the token

    // Retrieve only necessary columns from Posts (excluding Likes and Comments)
    const getAllPosts = await Posts.findAll({
      attributes: [
        "id",
        "title",
        "postText",
        "username",
        "createdAt",
        "updatedAt",
      ],
    });

    // Fetch likes count and comments count separately for each post
    const postsWithCounts = await Promise.all(
      getAllPosts.map(async (post) => {
        const likesCount = await Likes.count({ where: { PostId: post.id } });
        const commentsCount = await Comments.count({
          where: { PostId: post.id },
        });

        return {
          ...post.toJSON(),
          userLiked:
            (await Likes.findOne({ where: { PostId: post.id, UserId } })) !==
            null,
          likesCount,
          commentsCount,
        };
      })
    );

    res.json(postsWithCounts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
