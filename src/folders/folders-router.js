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

foldersRouter.route("/").get((req, res, next) => {
  FoldersService.getAllFolders(req.app.get("db"))
    .then(folders => {
      res.json(folders.map(serializeFolder));
    })
    .catch(next);
});

module.exports = foldersRouter;
