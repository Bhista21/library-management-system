require("dotenv").config();
const path = require("path");
const Database = require("better-sqlite3");

const dbFile = process.env.DB_FILE || "database.db";
const db = new Database(path.join(__dirname, dbFile));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    first_name TEXT,
    last_name TEXT,
    age INTEGER,
    gender TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`💾 Database connected successfully (${dbFile})`);

module.exports = db;
