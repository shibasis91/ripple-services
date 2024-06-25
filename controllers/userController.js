const User = require("../model/UserModel");

const updateUserDetails = async (req, res) => {
  const { phone, name, avatar, about } = req.body;
  if (!phone || !name) {
    return res.status(400).json({
      status: "error",
      data: { phone, isValid: false },
      message: "Phone number and name are required",
    });
  }
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { username: name, about, avatar },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      data: { phone, user },
      message: "User updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: { phone }, message: error.message });
  }
};

module.exports = { updateUserDetails };
