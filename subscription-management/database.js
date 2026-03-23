const Database = require('better-sqlite3');
const db = new Database('subscriptions.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER,
    type TEXT,
    status TEXT
  )
`).run();

module.exports = db;