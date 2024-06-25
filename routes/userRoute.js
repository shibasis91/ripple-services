const express = require("express");
const { updateUserDetails } = require("../controllers/userController");

const userRoute = express.Router();

userRoute.put("/update", updateUserDetails);

module.exports = userRoute;
