const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./notes-fixtures");
const supertest = require("supertest");

describe(`Folders endpoints`, () => {
  let db;

  before(`make knex instance`, () => {
    db = knex({
      client: "pg",
      connection: process.env.DB_TEST_URL
    });
    app.set("db", db);
  });

  after(`disconnect from db`, () => db.destroy());

  before(`clean up folders`, () =>
    db.schema.raw("TRUNCATE TABLE notes, folders CASCADE")
  );

  afterEach(`clean up`, () =>
    db.schema.raw("TRUNCATE TABLE notes, folders CASCADE")
  );

  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /api/folders`, () => {
      return supertest(app)
        .get("/api/folders")
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for POST /api/bookmarks`, () => {
      return supertest(app)
        .post("/api/bookmarks")
        .send({ folder_name: "Tortoise" })
        .expect(401, { error: "Unauthorized request" });
    });
  });

  describe(`GET /api/folders`, () => {
    context(`Given no folders in the database`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/folders")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFolders = fixtures.makeFoldersArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });
      it(`it gets the folders from api`, () => {
        return supertest(app)
          .get("/api/folders")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testFolders);
      });
    });
  });

  describe(`POST /api/folders`, () => {
    it("adds a new folder to the database", () => {
      const newFolder = {
        folder_name: "GREAT"
      };
      return supertest(app)
        .post(`/api/folders`)
        .send(newFolder)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        );
    });
  });

  describe(`PATCH /api/folders/:folderId`, () => {
    context(`Given there is no folder of that id`, () => {
      it(`responds 404 when folder does not exist`, () => {
        return supertest(app)
          .patch(`/api/folders/123`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Folder not found` }
          });
      });
    });

    context(`Given the folder id exists`, () => {
      const testFolders = fixtures.makeFoldersArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it(`responds with 204 and updates the bookmark`, () => {
        const idToUpdate = 2;
        const updateFolder = {
          folder_name: "updated folder name"
        };
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        };

        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateFolder)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFolder)
          );
      });
    });
  });

  describe(`DELETE /api/folders/:folderId`, () => {
    context(`Given there is no folder of that id`, () => {
      it(`responds 404 when folder does not exist`, () => {
        return supertest(app)
          .delete(`/api/folders/123`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Folder not found` }
          });
      });
    });

    context(`Given there are folders`, () => {
      const testFolders = fixtures.makeFoldersArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it("removes the the folder by UD from the database", () => {
        const idToRemove = 1;
        const expectedFolders = testFolders.filter(
          folder => folder.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() => {
            supertest(app)
              .get(`/api/folders`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFolders);
          });
      });
    });
  });
});
