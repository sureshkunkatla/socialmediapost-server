const express = require("express");
const router = express.Router();
const { Posts } = require("../models");
const { validateToken } = require("../middlewares/authMiddleware");

router.get("/", async (req, res) => {
  const getAllPosts = await Posts.findAll();
  res.json(getAllPosts);
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

router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  res.json(post);
});

module.exports = router;
