module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN || "6666",
  DB_URL: process.env.DB_URL || "postgresql://notes@localhost/notes"
};