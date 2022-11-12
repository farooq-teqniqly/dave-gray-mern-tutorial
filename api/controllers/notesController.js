const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const responseHelpers = require("../utils/responseHelpers");

const removeFields = "-user -__v";

//  @desc Get all notes for user
//  @route GET users/:id/notes
//  @access Private
const getUserNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    responseHelpers.badRequest(res, "User not found.");
  }

  const notes = await Note.find({ user: id }).select(removeFields).lean();

  return responseHelpers.okWithContent(res, notes);
});

//  @desc Create a note for a user.
//  @route POST users/:id/notes
//  @access Private
const createUserNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, text, completed } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return responseHelpers.notFound(res, "User not found.");
  }

  if (!title || !text) {
    return responseHelpers.badRequest(
      res,
      "Title and text fields are required."
    );
  }

  const note = await Note.create({ user: id, title, text, completed });

  if (!note) {
    return responseHelpers.badRequest(res, "Invalid note data received.");
  }

  const result = await Note.findById(note._id).select(removeFields).lean();
  return responseHelpers.createdWithContent(res, result);
});

//  @desc Update a user's note.
//  @route PATCH users/:userId/notes/:noteId
//  @access Private
const updateUserNote = asyncHandler(async (req, res) => {
  const { userId, noteId } = req.params;
  const { title, text, completed } = req.body;

  const user = await User.findById(userId).exec();

  if (!user) {
    return responseHelpers.notFound(res, "User not found.");
  }

  if (!title || !text || !completed) {
    return responseHelpers.badRequest(res, "All fields are required.");
  }

  const note = await Note.findById(noteId);

  if (!note) {
    return responseHelpers.notFound(res, "Note not found.");
  }

  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();
  const result = await Note.findById(updatedNote._id)
    .select(removeFields)
    .lean();

  return responseHelpers.okWithContent(res, result);
});

//  @desc Delete a user note.
//  @route DELETE users/:userId/notes/:noteId
//  @access Private
const deleteUserNotes = asyncHandler(async (req, res) => {
  const { userId, noteId } = req.params;

  const user = await User.findById(userId).exec();

  if (!user) {
    return responseHelpers.notFound(res, "User not found.");
  }

  const note = await Note.findById(noteId);

  if (!note) {
    return responseHelpers.badRequest(res, "Note not found.");
  }

  await note.deleteOne();

  return responseHelpers.noContent(res);
});

module.exports = {
  getUserNotes,
  createUserNote,
  updateUserNote,
  deleteUserNotes,
};
