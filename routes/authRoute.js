const express = require("express");
const {
  validateUser,
  verifyUser,
  updateUser,
  refreshToken,
  signOut,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const authRoutes = express.Router();

authRoutes.post("/validate", validateUser);
authRoutes.post("/verify", verifyUser);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/sign-out", authenticateToken, signOut);

module.exports = authRoutes;
