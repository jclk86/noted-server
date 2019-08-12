const express = require("express");
const xss = require("xss");
const { isWebUri } = require("valid-Url");
const logger = require("../logger");
const FoldersService = require("./folders-service");
const foldersRouter = express.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get("db"))
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };
    for (const field of ["folder_name"]) {
      if (!newFolder[field]) {
        logger.error(`${field} is required`);
        return res
          .status(400)
          .send({ error: { message: `'${field}' is required` } });
      }
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        logger.info(`Folder with id ${folder.id} was added to list`);
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/:folder_id")
  .all((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.getById(req.app.get("db"), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found`);
          return res.status(404).json({
            error: { message: `Folder not found` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.deleteFolder(req.app.get("db"), folder_id)
      .then(numRowsAffected => {
        logger.info(`Folder with id ${folder_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };
    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must container folder_name`
        }
      });
    }

    FoldersService.updateFolder(
      req.app.get("db"),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });
module.exports = foldersRouter;
