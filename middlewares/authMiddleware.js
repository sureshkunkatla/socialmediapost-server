const { verify } = require("jsonwebtoken");

const secretKey = "importantsecret"; // Use environment variable or default value

const validateToken = (req, res, next) => {
  const authorizationHeader = req.header("authorization");
  if (!authorizationHeader) {
    return res.status(401).json({ error: "User not logged in!" });
  }

  const [bearer, accessToken] = authorizationHeader.split(" ");
  if (bearer !== "Bearer" || !accessToken) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const validToken = verify(accessToken, secretKey);
    req.username = validToken.username;
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { validateToken };
