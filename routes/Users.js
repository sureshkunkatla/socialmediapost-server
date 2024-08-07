const express = require("express");
const router = express.Router();
const { Users, Posts, Likes, Comments } = require("../models");
const bycrpt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middlewares/authMiddleware");

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (user)
    return res.json({
      error: "User already exists, Please register with unique username",
    });
  bycrpt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json({ code: 200, message: "Registration Succesful" });
  });
});

router.put("/userInfo/:id/bio", validateToken, async (req, res) => {
  const userId = req.params.id;
  const { userBio } = req.body;

  try {
    const updateUserBio = await Users.update(
      { userBio: userBio },
      { where: { id: userId } }
    );
    if (updateUserBio) {
      return res.status(200).json({ message: "User bio updated successfully" });
    }
  } catch (error) {
    console.error("Error updating user bio:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/userInfo/:id", validateToken, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const user = await Users.findOne({
    where: { id: id },
    attributes: { exclude: ["password"] }, // Exclude the password column
  });
  const userRelatedPosts = await Posts.findAll({
    where: { UserId: id },
    order: [["createdAt", "DESC"]],
  });

  const postsWithUserLiked = await Promise.all(
    userRelatedPosts.map(async (post) => {
      const likesCount = await Likes.count({ where: { PostId: post.id } });
      const commentsCount = await Comments.count({
        where: { PostId: post.id },
      });
      return {
        ...post.toJSON(),
        userLiked:
          (await Likes.findOne({
            where: { PostId: post.id, UserId: userId },
          })) !== null, // true if user liked, false otherwise
        likesCount,
        commentsCount,
      };
    })
  );
  return res.json({ user: user, userRelatedPosts: postsWithUserLiked });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (!user) {
    return res.json({ error: "User Doesn't exists" });
  }

  bycrpt.compare(password, user.password).then((match) => {
    if (!match) {
      return res.json({ error: "Wrong username and password combination" });
    } else {
      const accessToken = sign(
        { username: user.username, id: user.id },
        "importantsecret"
      );
      return res.status(200).json({
        code: 200,
        token: accessToken,
        username: user.username,
        userId: user.id,
        message: "You logged in!",
      });
    }
  });
});

module.exports = router;
