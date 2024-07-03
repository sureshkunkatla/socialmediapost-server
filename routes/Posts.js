const express = require("express");
const router = express.Router();
const { Posts, Likes, Comments, Users } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.get("/", validateToken, async (req, res) => {
  try {
    const UserId = req.user.id; // Assuming you have access to the user ID from the token

    const { page } = req.query;
    const pageSize = 12;

    // Retrieve only necessary columns from Posts (excluding Likes and Comments)
    const getAllPosts = await Posts.findAll({
      attributes: [
        "id",
        "title",
        "postText",
        "username",
        "createdAt",
        "updatedAt",
        "UserId",
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
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
  const UserId = req.user.id;
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  const likesCount = await Likes.count({ where: { PostId: post.id } });
  const commentsCount = await Comments.count({ where: { PostId: post.id } });
  const userLiked =
    (await Likes.findOne({ where: { PostId: post.id, UserId } })) !== null;
  res.json({ ...post.toJSON(), likesCount, commentsCount, userLiked });
});

router.get("/getAllLikes/:id", validateToken, async (req, res) => {
  const id = req.params.id;

  try {
    const likes = await Likes.findAll({
      where: { PostId: id },
      attributes: [],
      include: [
        {
          model: Users,
          attributes: ["username", "id"],
        },
      ],
    });

    const response = likes.map((like) => ({
      username: like.User.username,
      userId: like.User.id,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

router.put("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  const post = req.body;

  try {
    const updatePost = await Posts.update(post, { where: { id: postId } });
    if (updatePost) {
      return res.status(200).json({ message: "Post is updated successfully" });
    }
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
