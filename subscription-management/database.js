const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./subscriptions.db");


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberId INTEGER,
      type TEXT,
      status TEXT
    )
  `);
});

module.exports = db;