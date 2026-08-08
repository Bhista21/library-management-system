require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function get(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows[0];
}

async function all(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

async function run(sql, args = []) {
  const result = await db.execute({ sql, args });
  return {
    // Turso returns this as a BigInt — JSON.stringify cannot
    // serialize BigInt, so convert it to a plain Number here.
    lastInsertRowid:
      result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,
    changes: result.rowsAffected,
  };
}

// Schema init is async now (network call), so we run it once and cache
// the promise. Every request awaits this before touching the DB — this
// matters on serverless (Vercel) where a "cold start" could otherwise
// race a query against table creation.
let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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

      await db.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT,
          genre TEXT,
          isbn TEXT,
          stock INTEGER NOT NULL DEFAULT 0,
          cover_image TEXT,
          Description TEXt,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS borrow_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          due_date DATETIME,
          return_date DATETIME,
          status TEXT NOT NULL DEFAULT 'issued',
          FOREIGN KEY (book_id) REFERENCES books(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      console.log("💾 Turso schema ready");
    })();
  }
  return schemaReady;
}

module.exports = { db, get, all, run, ensureSchema };
