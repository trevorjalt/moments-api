require('dotenv').config();

if (process.env.NODE_ENV === "production") {
  const pg = require('pg');
  pg.defaults.ssl = { rejectUnauthorized: false }
}

module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DB_URL
    : process.env.DB_URL,
}
