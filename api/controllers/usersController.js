const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const responseHelpers = require("../utils/responseHelpers");

const removeFields = "-password -__v";

//  @desc Get all users
//  @route GET /users
//  @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(removeFields).lean();
  return responseHelpers.okWithContent(res, users);
});

//  @desc Get a single user
//  @route GET /users/:id
//  @access Private
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select(removeFields).lean();
  return responseHelpers.okWithContent(res, user);
});

//  @desc Create new user
//  @route POST /users
//  @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return responseHelpers.badRequest(res, "All fields are required.");
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return responseHelpers.conflict(res, "Username already taken.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userObject = { username, password: hashedPassword, roles };

  const user = await User.create(userObject);
  const result = await User.findById(user._id).select(removeFields).lean();
  responseHelpers.createdWithContent(res, result);
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
    return responseHelpers.badRequest(res, "All fields are required.");
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return responseHelpers.notFound(res, "User not found.");
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return responseHelpers.conflict(res, "Username already taken.");
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  const result = await User.findById(updatedUser._id)
    .select(removeFields)
    .lean();

  responseHelpers.okWithContent(res, result);
});

//  @desc Delete a user
//  @route DELETE /users
//  @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notes = await Note.findOne({ user: id }).lean().exec();

  if (notes) {
    return responseHelpers.conflict(
      res,
      "Cannot delete user because it has assigned notes."
    );
  }

  const user = await User.findById(id).exec();

  if (user) {
    await user.deleteOne();
  }

  responseHelpers.noContent(res);
});

module.exports = {
  getAllUsers,
  getUser,
  createNewUser,
  updateUser,
  deleteUser,
};
