const User = require("../model/UserModel");
const bcrypt = require("bcrypt");
const {
  generateOtp,
  hashOtp,
  generateAuthToken,
} = require("../utils/authUtils");
const e = require("express");

const validateUser = async (req, res) => {
  const { phone } = req.body;
  try {
    if (phone) {
      const user = await User.findOne({ phone: phone });
      const isNewUser = user ? false : true;
      const otp = await generateOtp();
      console.log(`OTP for ${phone} is ${otp}`);
      let updatedUser = null;
      if (isNewUser) {
        updatedUser = await new User({ phone: phone, otp: otp }).save();
      } else {
        const hashedOtp = await hashOtp(otp);
        updatedUser = await User.findOneAndUpdate(
          { phone },
          { otp: hashedOtp }
        );
      }
      return res.status(200).json({
        status: "success",
        data: { phone, user: updatedUser, isNewUser },
        message: isNewUser ? "New User" : "Existing user",
      });
    } else {
      return res.status(400).json({
        status: "error",
        data: { phone, isValid: false },
        message: "Phone number is required",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const authenticateUser = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    if (phone && otp) {
      const user = await User.findOne({ phone: phone }).select("otp");
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
      const updatedUser = await User.findOneAndUpdate(
        { phone },
        { $unset: { otp: "" } },
        { new: true }
      );
      return res.status(200).json({
        status: "success",
        data: { phone, isValidOtp: true, authToken, user: updatedUser },
        message: "Authentication successful",
      });
    } else {
      return res.status(400).json({
        status: "error",
        data: { phone, isValid: false },
        message: "Phone number and Otp are required",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: { phone }, message: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { user, name, about, avatar } = req.body;
  const { phone } = user;
  try {
    if (name) {
      const user = await User.findOneAndUpdate(
        { phone },
        { name, about, avatar },
        { new: true }
      );
      return res.status(200).json({
        status: "success",
        data: { phone, user },
        message: "User updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "error",
        data: { phone, isValid: false },
        message: "Name is required",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: { phone }, message: error.message });
  }
};

module.exports = { validateUser, authenticateUser, updateUserDetails };
