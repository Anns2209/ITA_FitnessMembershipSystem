const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/subscriptiondb",
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      member_id INTEGER NOT NULL,
      type TEXT,
      status TEXT NOT NULL
    )
  `);
}

module.exports = {
  pool,
  initializeDatabase,
};
