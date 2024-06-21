const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bycrpt = require("bcrypt");
const { sign } = require("jsonwebtoken");

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
      return res
        .status(200)
        .json({ code: 200, token: accessToken, message: "You logged in!" });
    }
  });
});

module.exports = router;
