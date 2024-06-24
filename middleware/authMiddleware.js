const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized request" });
  }
  const secretKey = process.env.SECRET_KEY;
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ status: "error", message: "Invalid or expired token" });
    }
    req.body.user = user;
    next();
  });
};

module.exports = authenticateToken;
