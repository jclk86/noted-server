const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./notes-fixtures");

describe(`Notes endpoints`, () => {
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
    it(`responds with 401 Unauthorized for GET /api/notes`, () => {
      return supertest(app)
        .get("/api/notes")
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for GET /api/notes`, () => {
      return supertest(app)
        .get("/api/notes")
        .expect(401, { error: "Unauthorized request" });
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

    context(`Given there are notes in the database`, () => {
      const testFolders = fixtures.makeFoldersArray();
      const testNotes = fixtures.makeNotesArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });
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

  describe(`POST /api/notes/`, () => {
    it(`adds a new note to the database`, () => {
      const newNote = {
        note_name: "PATCHED NOTE",
        content: "NEW PATCHED NOTE CONTENT",
        folder: 3
      };
      return supertest(app)
        .post(`/api/notes`)
        .send(newNote)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.note_name).to.eql(newNote.note_name);
          expect(res.body.content).to.eql(newNote.content);
          expect(res.body.folder).to.eql(newNote.folder);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        );
    });
  });

  describe(`DELETE /api/notes/:noteId`, () => {
    context(`Given there is no note of that id`, () => {
      it(`responds 404 when folder does not exist`, () => {
        return supertest(app)
          .delete(`/api/notes/123`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Note doesn't exist` }
          });
      });
    });

    context(`Given there is a note of that id`, () => {
      const testFolders = fixtures.makeFoldersArray();
      const testNotes = fixtures.makeNotesArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });
      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });
      it(`removes the note by ID from the store`, () => {
        const idToRemove = 2;
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove);
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() => {
            supertest(app)
              .get(`/api/notes`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedNotes);
          });
      });
    });
  });

  describe(`PATCH /api/notes/:noteId`, () => {
    context(`Given there is no note of that id`, () => {
      it(`responds 404 when folder does not exist`, () => {
        return supertest(app)
          .patch(`/api/notes/123`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Note doesn't exist` }
          });
      });
    });

    context(`Given the note id exists`, () => {
      const testFolders = fixtures.makeFoldersArray();
      const testNotes = fixtures.makeNotesArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });
      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });

      it(`responds with 204 and updates the note`, () => {
        const idToUpdate = 2;
        const updateNote = {
          note_name: "updated note name",
          content: "changed content via patch request",
          folder: 3
        };
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote
        };

        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateNote)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedNote)
          );
      });
    });
  });
});
