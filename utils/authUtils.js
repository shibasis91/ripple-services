const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { otpGen } = require("otp-gen-agent");

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(otp, salt);
};

const generateOtp = async () => await otpGen();

const generateAuthToken = async (phone) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  return await jwt.sign({ phone }, SECRET_KEY, {
    expiresIn: "1h",
  });
};

module.exports = { hashOtp, generateOtp, generateAuthToken };
