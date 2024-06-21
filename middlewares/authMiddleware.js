const { verify } = require("jsonwebtoken");

const secretKey = "defaultsecret"; // Use environment variable or default value

const validateToken = (req, res, next) => {
  const authorizationHeader = req.header("Authorization");
  if (!authorizationHeader) {
    return res.status(401).json({ error: "User not logged in!" });
  }

  const [bearer, accessToken] = authorizationHeader.split(" ");
  if (bearer !== "Bearer" || !accessToken) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const validToken = verify(accessToken, secretKey);

    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { validateToken };
