const { Pool } = require("pg");

const db = new Pool({
    host: "localhost",
    user: "postgres",
    password: "123321", // mật khẩu PostgreSQL
    database: "wnc",
    port: 5432
});

module.exports = db;