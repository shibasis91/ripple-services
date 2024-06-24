const mongoose = require("mongoose");
const { hashOtp } = require("../utils/authUtils");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    min: 10,
    required: true,
  },
  otp: { type: String, required: true },
  name: { type: String, trim: true },
  about: { type: String, trim: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("otp")) {
      this.otp = await hashOtp(this.otp);
    }
    next();
  } catch (error) {
    console.log("Error while hashing", error);
    next(error);
  }
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.otp;
  return obj;
};

userSchema.methods.updateOtp = async function (otp) {
  try {
    this.otp = hashOtp(otp);
    await this.save();
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
