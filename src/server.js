require('dotenv').config()

const knex = require('knex')
const app = require('./app');
const { PORT, DB_URL } = require('./config');

if (process.env.NODE_ENV === "production") {
    const pg = require('pg');
    pg.defaults.ssl = { rejectUnauthorized: false }
}

const db = knex({
    client: 'pg',
    connection: DB_URL,
})

app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})