const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//  @desc Get all users
//  @route GET /users
//  @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found." });
  }

  return res.json(users);
});

//  @desc Create new user
//  @route POST /users
//  @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Username already taken." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userObject = { username, password: hashedPassword, roles };

  const user = await User.create(userObject);

  if (user) {
    const result = await User.findById(user._id)
      .select("-password -__v")
      .lean();
    res.status(201).json(result);
  } else {
    res.status(400).json({ message: "Invalid user data received." });
  }
});

//  @desc Update a user
//  @route PATCH /users
//  @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, roles, active, password } = req.body;

  if (
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Username already taken." });
  }

  user.user = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  const result = await User.findById(updatedUser._id)
    .select("-password -__v")
    .lean();

  res.status(200).json(result);
});

//  @desc Delete a user
//  @route DELETE /users
//  @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notes = await Note.findOne({ user: id }).lean().exec();

  if (notes?.length) {
    return res
      .status(400)
      .json({ message: "Cannot delete user because it has assigned notes." });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: `User id ${id} not found.` });
  }

  await user.deleteOne();

  res.status(204).send();
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
