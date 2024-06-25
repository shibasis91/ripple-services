const mongoose = require("mongoose");
const { hashOtp } = require("../utils/authUtils");

const userSchema = new mongoose.Schema({
  phone: { type: String, min: 10, unique: true, required: true },
  otp: { type: String },
  username: { type: String, trim: true },
  about: { type: String, trim: true },
  avatar: { type: String },
  refreshTokens: {
    type: [{ token: { type: String, required: true } }],
    validate: [arrayLimitValidator],
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("otp") && !!this.otp) {
      this.otp = await hashOtp(this.otp);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.otp;
  delete obj.refreshTokens;
  return obj;
};

function arrayLimitValidator(val) {
  return val.length <= 3;
}

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
