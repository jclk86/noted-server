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
          expect(res.headers.location).to.eql(
            `http://localhost:8000/api/folders/${res.body.id}`
          );
        })
        .then(res =>
          supertest(app)
            .get(`http://localhost:8000/api/folders/${res.body.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        );
    });
  });
});
