const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

//  @desc Get all notes for user
//  @route GET users/:id/notes
//  @access Private
const getUserNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const notes = await Note.find({ user: id }).select("-user -__v").lean();

  return res.json(notes);
});

//  @desc Create a note for a user.
//  @route POST users/:id/notes
//  @access Private
const createUserNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, text, completed } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!title || !text) {
    return res
      .status(400)
      .json({ message: "Title and text fields are required." });
  }

  const note = await Note.create({ user: id, title, text, completed });

  if (!note) {
    res.status(400).json({ message: "Invalid note data received." });
    return;
  }

  const result = await Note.findById(note._id).select("-user -__v").lean();
  return res.status(201).json(result);
});

//  @desc Update a user's note.
//  @route PATCH users/:userId/notes/:noteId
//  @access Private
const updateUserNote = asyncHandler(async (req, res) => {
  const { userId, noteId } = req.params;
  const { title, text, completed } = req.body;

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!title || !text || !completed) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const note = await Note.findById(noteId);

  if (!note) {
    res.status(404).json({ message: "Note not found." });
    return;
  }

  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();
  const result = await Note.findById(updatedNote._id)
    .select("-user -__v")
    .lean();

  return res.status(200).json(result);
});

//  @desc Delete a user note.
//  @route DELETE users/:userId/notes/:noteId
//  @access Private
const deleteUserNotes = asyncHandler(async (req, res) => {
  const { userId, noteId } = req.params;

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const note = await Note.findById(noteId);

  if (!note) {
    return res.status(400).json({ message: `Note id ${noteId} not found.` });
  }

  await note.deleteOne();

  res.status(204).send();
});

module.exports = {
  getUserNotes,
  createUserNote,
  updateUserNote,
  deleteUserNotes,
};
