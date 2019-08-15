module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN || "6666",
  DB_URL: process.env.DATABASE_URL || "postgresql://notes@localhost/notes",
  DB_TEST_URL:
    process.env.TEST_DB_URL ||
    "postgres://postgres:B3Th3B3st@localhost/noted_test"
};
