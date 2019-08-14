const express = require("express");
const xss = require("xss");
const { isWebUri } = require("valid-Url");
const logger = require("../logger");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  modified_date: note.modified_date,
  content: xss(note.content),
  folder: parseInt(note.folder)
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get("db"))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { note_name, content, folder } = req.body;
    const newNote = { note_name, content, folder };

    for (const field of ["note_name", "content", "folder"]) {
      if (!newNote[field]) {
        logger.error(`${field} is required`);
        return res
          .status(400)
          .send({ error: { message: `'${field}' is required` } });
      }
    }
    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        logger.info(`Note with id ${note.id} was added to list`);
        res
          .status(201)
          .location(`/api/notes/${note.id}`)
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/:note_id")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getById(knexInstance, req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const { note_id } = req.params;
    NotesService.deleteNote(req.app.get("db"), note_id)
      .then(numRowsAffected => {
        logger.info(`Note with id ${note_id} delete`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { note_name, content } = req.body;
    const noteToUpdate = { note_name, content };
    const numOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'note_name' and 'content'`
        }
      });
    }
    NotesService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
