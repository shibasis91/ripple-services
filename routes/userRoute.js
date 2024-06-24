const express = require("express");
const {
  validateUser,
  authenticateUser,
  updateUserDetails,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const userRoutes = express.Router();

userRoutes.post("/", validateUser);
userRoutes.post("/auth", authenticateUser);
userRoutes.put("/update", authenticateToken, updateUserDetails);

module.exports = userRoutes;
