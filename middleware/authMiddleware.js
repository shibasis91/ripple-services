const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized request" });
  }
  const secretKey = process.env.JWT_ACCESS_SECRET_KEY;
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "Expired token" });
      }
      return res
        .status(403)
        .json({ status: "error", message: "Invalid token" });
    }
    req.body.user = user;
    next();
  });
};

module.exports = authenticateToken;
