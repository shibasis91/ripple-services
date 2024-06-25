const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { otpGen } = require("otp-gen-agent");

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(otp, salt);
};

const generateOtp = async () => await otpGen();

const generateAuthToken = async (phone) => {
  const secretKey = process.env.JWT_ACCESS_SECRET_KEY;
  return await jwt.sign({ phone }, secretKey, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = async (phone) => {
  const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
  return await jwt.sign({ phone }, secretKey, {
    expiresIn: "15d",
  });
};

module.exports = {
  hashOtp,
  generateOtp,
  generateAuthToken,
  generateRefreshToken,
};
