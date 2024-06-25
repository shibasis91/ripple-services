const User = require("../model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generateOtp,
  hashOtp,
  generateAuthToken,
  generateRefreshToken,
} = require("../utils/authUtils");

const validateUser = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({
      status: "error",
      data: { phone, isValid: false },
      message: "Phone number is required",
    });
  }
  try {
    const user = await User.findOne({ phone: phone });
    const isNewUser = user ? false : true;
    const otp = await generateOtp();
    console.log(`OTP for ${phone} is ${otp}`);
    let updatedUser = null;
    if (isNewUser) {
      updatedUser = await new User({ phone: phone, otp: otp }).save();
    } else {
      const hashedOtp = await hashOtp(otp);
      updatedUser = await User.findOneAndUpdate({ phone }, { otp: hashedOtp });
    }
    return res.status(200).json({
      status: "success",
      data: { phone, user: updatedUser, isNewUser },
      message: isNewUser ? "New User" : "Existing user",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const verifyUser = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({
      status: "error",
      data: { phone, isValid: false },
      message: "Phone number and otp are required",
    });
  }
  try {
    let user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(404).json({
        status: "error",
        data: { phone, isUser: false },
        message: "User not found",
      });
    }
    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return res.status(401).json({
        status: "error",
        data: { phone, isValidOtp: false },
        message: "Invalid Otp",
      });
    }
    const authToken = await generateAuthToken(phone);
    const refreshToken = await generateRefreshToken(phone);
    user.refreshTokens.push({ token: refreshToken });
    user.otp = undefined;
    const updatedUser = await user.save();
    return res.status(200).json({
      status: "success",
      data: {
        phone,
        isValidOtp: true,
        isUserAuth: true,
        authToken,
        refreshToken,
        user: updatedUser,
      },
      message: "Authentication successful",
    });
  } catch (error) {
    if (error._message === "User validation failed") {
      return res.status(400).json({
        status: "error",
        data: { deviceLimitExceeded: true },
        message: "Maximum device limit exceeded",
      });
    }
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      status: "error",
      data: { isValid: false },
      message: "Valid refresh token is required",
    });
  }
  try {
    const secretRefreshKey = process.env.JWT_REFRESH_SECRET_KEY;
    const decodedUser = jwt.verify(refreshToken, secretRefreshKey);
    const user = await User.findOne({ phone: decodedUser.phone });
    if (!user) {
      return res.status(403).json({
        status: "error",
        data: { isUserAuth: false },
        message: "User not authorized",
      });
    }
    const tokenIndex = user.refreshTokens.findIndex(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (tokenIndex === -1) {
      return res.status(403).json({
        status: "error",
        data: { isUserAuth: false },
        message: "Invalid refresh token",
      });
    }
    const newAuthToken = await generateAuthToken(decodedUser.phone);
    const newRefreshToken = await generateRefreshToken(decodedUser.phone);
    user.refreshTokens[tokenIndex] = { token: newRefreshToken };
    await user.save();
    return res.status(200).json({
      status: "success",
      data: {
        phone: user.phone,
        authToken: newAuthToken,
        refreshToken: newRefreshToken,
      },
      message: "Refresh token creation successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const signOut = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      status: "error",
      data: { isValid: false },
      message: "Valid refresh token is required",
    });
  }
  try {
    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    console.log("User found", user);
    if (!user) {
      return res.status(404).json({
        status: "error",
        data: { isUser: false },
        message: "User not found",
      });
    }
    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken
    );
    await user.save();

    res.status(200).json({
      status: "error",
      data: { isUserAuth: false },
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = { validateUser, verifyUser, refreshToken, signOut };
