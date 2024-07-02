const express = require("express");
const router = express.Router();
const { Likes } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.post("/", validateToken, async (req, res) => {
  const { PostId } = req.body;
  const userId = req.user.id;

  try {
    const alreadyLikes = await Likes.findOne({
      where: {
        PostId: PostId,
        UserId: userId,
      },
    });
    if (alreadyLikes?.id) {
      const deleteLike = await Likes.destroy({
        where: { id: alreadyLikes?.id },
      });
      if (deleteLike) {
        res.json({ liked: false });
      }
    } else {
      const insertLike = await Likes.create({ PostId: PostId, UserId: userId });
      if (insertLike?.id) {
        res.json({ liked: true, likedData: insertLike });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while liking or unliking the post." });
  }
});

module.exports = router;
