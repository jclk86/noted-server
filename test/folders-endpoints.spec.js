const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./notes-fixtures");

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
    const testFolders = fixtures.makeFoldersArray();
    beforeEach("insert folders", () => {
      return db.into("folders").insert(testFolders);
    });

    it(`responds with 401 Unauthorized for GET /api/folders`, () => {
      return supertest(app)
        .get("/api/folders")
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for GET /api/notes`, () => {
      return supertest(app)
        .get("/api/notes")
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

  describe(`GET /api/notes`, () => {
    context(`Given no notes in the database`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/notes")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context(`GET /api/notes`, () => {
      const testNotes = fixtures.makeNotesArray();
      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });
      it(`it gets the notes from api`, () => {
        return supertest(app)
          .get("/api/notes")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testNotes);
      });
    });
  });
});
