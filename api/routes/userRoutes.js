const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const notesController = require("../controllers/notesController");

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser);

router
  .route("/:id")
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router
  .route("/:id/notes")
  .get(notesController.getUserNotes)
  .post(notesController.createUserNote);

router
  .route("/:userId/notes/:noteId")
  .patch(notesController.updateUserNote)
  .delete(notesController.deleteUserNotes);

module.exports = router;
