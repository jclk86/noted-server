const express = require("express");
const xss = require("xss");
const { isWebUri } = require("valid-Url");
const logger = require("../logger");
const NotesService = require("./notes-service");
const notesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  notes_name: xss(note.notes_name),
  modified_date: note.modified_date,
  content: xss(note.content),
  folder: Number(note.folder)
});

notesRouter.route("/").get((req, res, next) => {
  NotesService.getAllNotes(req.app.get("db"))
    .then(notes => {
      res.json(notes.map(serializeNote));
    })
    .catch(next);
});

module.exports = notesRouter;
