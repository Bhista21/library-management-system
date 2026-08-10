require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// =====================================================
// GET ONE ROW
// =====================================================

async function get(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows[0];
}

// =====================================================
// GET MULTIPLE ROWS
// =====================================================

async function all(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows;
}

// =====================================================
// INSERT / UPDATE / DELETE
// =====================================================

async function run(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return {
    // Turso returns this as a BigInt.
    // Convert it to Number so JSON.stringify works.
    lastInsertRowid:
      result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,

    changes: result.rowsAffected,
  };
}

// =====================================================
// DATABASE SCHEMA
// =====================================================

// Schema initialization is async because Turso is a
// remote database. Cache the promise so the schema is
// initialized only once per server instance.

let schemaReady = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      // =========================
      // USERS
      // =========================

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

      // =========================
      // BOOKS
      // =========================

      await db.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT,
          genre TEXT,
          isbn TEXT,
          stock INTEGER NOT NULL DEFAULT 0,
          cover_image TEXT,
          Description TEXT,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        );
      `);

      // =========================
      // BORROW RECORDS
      // =========================

      await db.execute(`
        CREATE TABLE IF NOT EXISTS borrow_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
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

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  db,
  get,
  all,
  run,
  ensureSchema,
};
