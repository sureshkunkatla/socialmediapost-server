const express = require("express");
const app = express();
const db = require("./models");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//Routes
const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);
const commentsRouter = require("./routes/Comments");
app.use("/comments", commentsRouter);
const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);
const likesRouter = require("./routes/Likes");
app.use("/likes", likesRouter);

db.sequelize.sync().then(() => {
  app.listen(3001, (req, res) => {
    console.log("server is running on port 3001");
  });
});
